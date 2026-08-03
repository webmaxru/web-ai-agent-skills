# Browser Prompt API Troubleshooting

## `LanguageModel` is undefined

1. Confirm the code runs in a secure browser window context rather than on the server or in a worker.
2. Confirm the target browser build exposes the Prompt API.
3. For Chrome localhost testing, confirm the required built-in AI flags are enabled.
4. For Edge preview testing, confirm the browser is Canary or Dev on a supported version and that the preview flag is enabled.
5. Confirm that the current frame is allowed by the `language-model` permissions-policy.
6. If broader support is required, progressively load the project's maintained Prompt API polyfill.
7. Fall back to a non-AI experience when neither native support nor the approved polyfill path is available.

## `availability()` returns `unavailable`

1. Compare the requested modalities and languages with the feature requirements.
2. Remove unsupported tools or modalities before retrying.
3. Confirm that the browser implementation supports the Prompt API features the app is requesting.
4. Confirm that the device meets the current browser's hardware and storage requirements.
5. If `expectedInputs` includes `{ type: "audio" }` on Chrome, confirm the device has a GPU with strictly more than 4 GB of VRAM; Chrome does not support audio input on CPU-only configurations.
6. On Edge, if the device performance class is Medium or Low and Phi-4-mini is unavailable, test whether enabling the **Enable prerelease on-device language model** flag (Edge 150.0.4070+) makes Aion-1.0-Instruct available; that model supports CPU-only inferencing on lower-class hardware.

## `availability()` returns `downloadable`

1. Ask the user for an activation path such as a button click before calling `LanguageModel.create()`.
2. Attach a `monitor` callback during `create()` so the UI can expose download progress.
3. Avoid sending prompts until the model download completes.

## `availability()` returns `downloading`

1. Treat this as browser-reported state, not proof that the current page already started a download.
2. Create the session only after user activation.
3. Pass a `monitor` callback to `LanguageModel.create()` and surface progress only for the create flow the page actually started.
4. Do not freeze the UI in a page-owned busy state before user interaction unless your code has already called `LanguageModel.create()`.
5. Delay prompt submission only when the app itself has entered a create or prompt flow that is waiting on model readiness.

## `SyntaxError`

1. Check whether `prefix: true` is applied to anything other than the final `assistant` message.
2. Check whether `initialPrompts` or prompt message arrays are empty after app logic transforms them.
3. Check whether a `system` message appears after any non-system message inside `initialPrompts`.

## `NotSupportedError`

1. Check whether `expectedInputs`, `expectedOutputs`, or `tools` declare combinations unsupported by the current implementation.
2. Keep the options passed to `availability()` and the options used for actual prompts aligned.
3. Check whether a normal prompt input contains a `system` role or whether an `assistant` message carries non-text content.
4. Reduce the integration to a text-only flow first, then reintroduce image, audio, or tools if needed.

## `TypeError`

1. Check that text content uses strings.
2. Check that image content uses `ImageBitmapSource` or `BufferSource` values.
3. Check that audio content uses `AudioBuffer`, `BufferSource`, or `Blob` values.
4. If an implementation reports `TypeError` for `system` prompt placement in `initialPrompts`, move the `system` message to the first position and keep the broader skill guidance aligned to the spec's ordering rules.

## iframe failures

1. Same-origin iframes inherit access from the top-level page.
2. Cross-origin iframes require `allow="language-model"` on the embedding iframe.
3. If the embedding page cannot grant that permission, move the Prompt API call to the top-level window.

## Session leaks or stale context

1. Reuse sessions intentionally instead of creating one per keystroke.
2. Call `destroy()` when leaving the feature, route, or component.
3. Reset or clone sessions when the app needs a fresh conversation branch.
4. Use the compatibility helpers from the wrapper template to read context metrics and register overflow handlers across browser versions.

## `QuotaExceededError`

1. Chrome throws `QuotaExceededError` when the new prompt is too large to process even after the browser removes as many earlier conversation turns as possible.
2. The error carries a `requested` property (token count of the rejected input) and a `contextWindow` property (maximum token count the session can hold).
3. To avoid this error, call `session.measureContextUsage()` before prompting and compare the result against `session.contextWindow`.
4. If the prompt is too large, reduce the input, summarize earlier conversation history, or start a fresh session with only the needed context.

## Removed model parameters

1. The spec now officially marks `LanguageModel.params()` as EXPERIMENTAL: extension and experimental contexts only. Remove any dependence on it entirely for web page integrations.
2. The spec now officially marks `topK` and `temperature` in `create()` and as session attributes as EXPERIMENTAL: extension and experimental contexts only. Remove any feature logic that expects these to affect session behavior in web page contexts.
3. Chrome docs confirm these are "Only available when using the Prompt API for Chrome Extensions." Edge still documents them as web page options, but the spec-normative EXPERIMENTAL/extension-only classification takes precedence for portable code.
4. Keep app-level behavior aligned to the portable API surface even if a browser preview page or extension build still documents these fields.

## Polyfill and extension mismatches

1. If a web page lacks `LanguageModel` but an extension page or offscreen page exposes it, keep the page integration on progressive enhancement instead of assuming extension-only behavior is portable.
2. If Task APIs are polyfilled but Prompt API is native in the current execution context, preserve the native Prompt API and only load the missing Task API polyfills.
3. If the polyfill backend needs production credentials, prefer the approved backend posture instead of embedding raw provider secrets in page code.
4. Chrome extension developers should remove the now-expired `"aiLanguageModelOriginTrial"` entry from the `"permissions"` array in their extension manifest if it is still present.