# Browser Prompt API Reference

Use this reference when planning or implementing browser-side Prompt API integrations.

## Core API Surface

1. Check support with `LanguageModel.availability(options)` before creating a session.
2. Create a session with `LanguageModel.create(options)`.
3. Use `session.prompt(input, options)` for request-response flows.
4. Use `session.promptStreaming(input, options)` for incremental rendering.
5. Use `session.append(messages)` to preload context after the session already exists.
6. Use `session.measureContextUsage(input, options)` to estimate context cost before appending or prompting. The current spec requires this method; older browser builds may not expose it.
7. Use `session.clone()` to fork an existing session while preserving its setup context and current conversation state.
8. Use `session.destroy()` to release resources when the feature is done.
9. Track context metrics through `session.contextUsage` (required by current spec) and `session.contextWindow` (required by current spec). Use compatibility helpers when also supporting older browser builds that expose earlier names.
10. Treat `LanguageModel.params()`, `topK`, and `temperature` as unavailable to current portable integrations for this skill, per the higher-priority skill-update override.

## Create And Prompt Options

1. Treat the spec split between `LanguageModelCreateCoreOptions` and `LanguageModelCreateOptions` as canonical: `availability()` accepts the core options, while `create()` adds `initialPrompts`, `monitor`, and `signal`.
2. Pass the same `expectedInputs` and `expectedOutputs` options to `availability()` that the feature will use when creating the session. Do not pass `tools` to `availability()` in portable page code since `tools` is EXPERIMENTAL.
3. Use `initialPrompts` for durable setup context, such as system instructions, restored chat state, or n-shot examples.
4. Use `expectedInputs` and `expectedOutputs` to declare modalities and optional BCP 47 language tags. The spec is browser-neutral; implementation docs may support only a subset of languages.
5. Use `responseConstraint` when the feature needs structured output or strict classification results.
6. Use `omitResponseConstraintInput` only when the prompt itself already instructs the model about the required structure.
7. `signal` is supported on create, prompt, append, and clone flows.
8. `tools` can be provided during session creation as named tool definitions with descriptions, JSON-schema `inputSchema`, and async `execute` handlers that return strings. The spec marks `tools` as EXPERIMENTAL (only available in experimental contexts); gate tool-calling with feature detection or limit to origin-trial and extension contexts.
9. Keep browser-page code independent of sampling parameters (`topK`, `temperature`, `samplingMode`) even if a preview browser, origin trial, or extension context still exposes them.

## Prompt Validation Rules

1. `LanguageModelPrompt` accepts either a string or a sequence of messages.
2. A string prompt is shorthand for a single `user` message with text content.
3. `system` messages are only valid in `initialPrompts`, and all `system` messages must appear before any non-system message.
4. Using a `system` message in normal `prompt()`, `promptStreaming()`, `append()`, or `measureContextUsage()` input throws `NotSupportedError`.
5. `prefix: true` is only valid on the final `assistant` message.
6. `assistant` messages must remain text-only; any non-`"text"` content type in an `assistant` message throws `NotSupportedError`.
7. Empty message arrays are invalid.
8. Image content must use `ImageBitmapSource` or `BufferSource` values.
9. Audio content must use `AudioBuffer`, `BufferSource`, or `Blob` values.
10. Adjacent text content items are canonicalized together, so application code should not depend on separate contiguous text fragments remaining separate after validation.
11. `"tool-call"` and `"tool-response"` are valid `LanguageModelMessageType` values for non-assistant messages and for `expectedInputs`/`expectedOutputs` declarations; their `value` field is a `DOMString` (typically JSON-encoded).

## Platform Constraints

1. Treat the Prompt API as experimental and verify current browser availability before shipping a hard dependency.
2. The API is exposed only in secure window contexts.
3. Access is gated by the `language-model` permissions-policy feature, whose default allowlist is `self`.
4. Top-level windows and same-origin iframes are allowed by default.
5. Cross-origin iframes require the embedding page to grant `allow="language-model"`.
6. Non-window contexts such as workers are outside the spec exposure surface.
7. Browser-extension pages or offscreen pages can have browser-specific support characteristics that differ from ordinary page integrations; keep those differences isolated to compatibility or troubleshooting logic.

## Implementation Notes

1. Prefer a small wrapper around `LanguageModel` so the rest of the app does not duplicate capability checks or session lifecycle code.
2. TypeScript projects should keep their local Prompt API type declarations aligned with the implementation they target.
3. Use `AbortController` for prompt cancellation and teardown.
4. Keep a non-AI fallback path for unsupported browsers or blocked execution contexts.
5. The spec marks `params()` as EXPERIMENTAL (extension and experimental contexts only) and `topK`/`temperature` as DEPRECATED (extension contexts only). Do not depend on them for portable web page integrations. The spec marks `tools` as EXPERIMENTAL (experimental contexts only); gate tool-calling with feature detection or limit to origin-trial and extension contexts.
6. The spec now requires `measureContextUsage()`, `contextUsage`, and `contextWindow` as non-optional interface members. Older browsers may not yet expose them; use the wrapper helpers to handle both old and current implementations.
7. Reuse `references/examples.md` when the feature needs a known-good prompt shape or tool-enabled session pattern.
8. An `availability()` result of `downloading` is still a passive state check. Browser-page code should not infer that its own UI has started the download until it actually calls `LanguageModel.create()`.

## Compatibility Notes

1. The spec marks `params()` as EXPERIMENTAL (extension and experimental contexts only). The spec marks `topK` and `temperature` (in create options and as session attributes) as DEPRECATED (extension contexts only), reclassified from the earlier EXPERIMENTAL status. The spec marks `measureInputUsage()`, `inputUsage`, `inputQuota`, and `onquotaoverflow` as DEPRECATED (extension contexts only). Application code targeting web pages must not use any of these members.
2. The spec marks `tools` as EXPERIMENTAL (only available in experimental contexts). Do not depend on tool-calling in portable page integrations; gate it with feature detection or limit to origin-trial and extension contexts.
3. The current spec requires `measureContextUsage()`, `contextUsage`, and `contextWindow` as non-optional members of `LanguageModel`. Older browser builds may not yet expose them; probe for existence before use when supporting older implementations.
4. A new EXPERIMENTAL `samplingMode` attribute (values: `"most-predictable"` through `"most-creative"`) replaces `topK`/`temperature` for experimental sampling control. It is available in `LanguageModelCreateCoreOptions` and as a readonly session attribute. Do not depend on it for portable page code.
5. Chrome docs confirm that `params()`, `topK`, and `temperature` are available "only when using the Prompt API for Chrome Extensions." Chrome 148 ships the web Prompt API and includes a separate origin trial for sampling parameters.
6. Browser implementation docs may document only a subset of languages even though the spec models languages as BCP 47 tags.
7. Both Chrome and Edge document a regular-expression form for `responseConstraint` alongside JSON Schema. The spec IDL defines `responseConstraint` as `object`-typed, which accommodates `RegExp` values; regex constraints are a browser-implemented extension. Prefer JSON Schema when targeting cross-browser structured output.
8. Context-related naming has changed over time, and the current spec uses `contextWindow` and `oncontextoverflow`; compatibility code should check those alongside the user-supplied `contextWindowMeasure` and `contextOverflow` aliases before older quota-era fallbacks.
9. Prompt API polyfills are a valid progressive-enhancement strategy when native support is missing. The current npm package is `prompt-api-polyfill`.
10. Built-in AI Task API polyfills are available as `built-in-ai-task-apis-polyfills`, with subpath imports such as `built-in-ai-task-apis-polyfills/summarizer` and `built-in-ai-task-apis-polyfills/writer`.
11. If a polyfill requires a cloud backend, use the project-approved backend and security posture for production; the latest guidance favors secure backend-backed configurations over embedding raw secrets in client code.
12. Reuse `references/compatibility.md` for package installation and browser-preview guidance.