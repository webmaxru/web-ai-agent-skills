# Built-in AI Do And Don't

Use this reference when the feature needs performance, session-lifecycle, or UX decisions rather than raw API shape. Source: Chrome for Developers, [Built-in AI APIs: Do and don't](https://developer.chrome.com/docs/ai/built-in-ai-dos-donts).

## Session Timing

1. Do create the session as soon as user intent is clear, such as opening the AI panel, focusing the input, or hovering the entry point, so model warm-up overlaps with the user preparing the task.
2. Don't wait for the final "Generate" click to start creation; that turns cold start into visible latency.
3. Do keep creation behind user activation whenever it can start a model download, and reconcile the two rules by pre-warming only after an activation-bearing interaction.
4. Prompt API caution: `initialPrompts` can only be set at creation, so call `LanguageModel.create()` only once the system instructions and any seed context are known.

## Session Reuse

1. Do pass system instructions through `initialPrompts` at creation instead of sending them as the first `prompt()` call, which slows down the first real response.
2. Do use `session.clone()` for repeated tasks that share the same setup context but must not share conversation history.
3. Don't recreate a fresh session per action when a clone of a warm session gives the same isolation.
4. Do call `destroy()` on sessions the feature no longer needs so device resources and quota are released.
5. Don't hold sessions open across unrelated views or after the owning UI is unmounted.

## Output Handling

1. Do render streaming output incrementally with `promptStreaming()` so the user sees progress instead of a blocked UI.
2. Do keep the page interactive during generation and expose a stop control backed by `AbortController`.
3. Do request structured output through `responseConstraint` when downstream logic parses the result, instead of string-matching free-form prose.
4. Do trim, chunk, or pre-summarize oversized input before prompting, and use `measureInputUsage()` or `measureContextUsage()` when quota pressure is likely.
5. Don't tie generation to a fixed length or a hard timeout budget; treat long outputs as a streaming or paginated flow.

## User Experience

1. Do keep the user informed with explicit states for download, warm-up, generation, and failure, including `monitor` download progress.
2. Do align the interaction with the user's existing mental model of the task instead of introducing an unfamiliar AI-only workflow.
3. Do make AI edits reviewable and reversible with undo, and let the user override or discard model output.
4. Do cache results for repeated identical inputs so the same request is not recomputed.
5. Don't apply model output irreversibly or without a visible signal that the content was AI-generated.
