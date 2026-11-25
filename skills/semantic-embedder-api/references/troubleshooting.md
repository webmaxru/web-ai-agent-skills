# Troubleshooting

## Missing `SemanticEmbedder`

Symptoms:

* `ReferenceError: SemanticEmbedder is not defined`
* feature detection fails

Checks:

1. Confirm a secure context.
2. Confirm the browser is Chrome Canary at or above the version documented in `references/compatibility.md`.
3. Confirm `chrome://flags/#semantic-embedder-api` is manually enabled; this flag is not on by default and is not enabled by joining the Early Preview Program alone.
4. Confirm the code is running in a window, not in a worker or server runtime.
5. Confirm the platform is desktop (Linux, macOS, Windows); the API is not available on mobile.

## `availability()` does not resolve to `available`

Checks:

1. Retry after the model has had time to download; the first trial on a profile can take several seconds.
2. Confirm the flag and Canary-version requirements from `references/compatibility.md` are met.
3. Do not branch on a specific non-`available` state name; the developer guide only confirms `"available"` explicitly, so treat every other value as "not ready" rather than assuming a specific downloadable/downloading semantics.
4. Keep the fallback path instead of forcing `create()`.

## `create()` fails with no download-progress events

Likely cause:

* the Canary build predates the milestone where `monitor`/`downloadprogress` support was added

Checks:

1. Confirm the build meets the minimum Canary version in `references/compatibility.md`.
2. On earlier builds, `create()` can fail outright unless the model is already fully downloaded; there is no progress signal to wait on in that case.
3. Retry `create()` after a delay or prompt the user to update Chrome Canary.

## `taskType` seems to have no effect

Likely cause:

* `taskType` was passed to `create()` instead of `embed()`

Remediation:

1. Move the `taskType` option to the `embed()` call.
2. Confirm the value is one of `"semantic-similarity"`, `"retrieval-query"`, `"retrieval-document"`, `"classification"`, or `"clustering"`.
3. Remember that `taskType` is a hint the underlying model can ignore; if quality does not visibly change, this can be expected model behavior rather than an integration bug.

## Similarity or retrieval scores look wrong

Likely causes:

* `taskType` was omitted, producing an unoptimized raw embedding
* the query side and the document side used mismatched `taskType` values
* the compared vectors came from different embedding spaces (different model or browser versions)
* the input text was truncated by an upstream chunking step in a way that changed its meaning

Remediation:

1. Set an explicit `taskType` matched to the use case instead of relying on the unset default.
2. Use `retrieval-document` for indexed content and `retrieval-query` for the search query; do not mix them.
3. Re-embed instead of trusting old persisted vectors if there is any chance the model changed since they were stored.
4. Review chunking logic for documents that exceed the model's input limit.

## Large input fails or is silently truncated

Likely cause:

* the input exceeds the model's token limit and the API does not auto-chunk

Remediation:

1. Pre-chunk large documents before calling `embed()`.
2. Treat chunk-size limits as approximate and re-verify against current Chrome documentation, since the exact limit is sourced from the design explainer rather than the shipped developer guide.

## Worker or server integration fails

Likely cause:

* the API is a `Window`-scoped, desktop-only browser API

Remediation:

1. Move the embedding boundary to a window-owned module or UI controller.
2. Stop and explain the platform mismatch if the feature contract requires worker-only, server-side, or mobile execution.

## Unrecognized exception during `create()` or `embed()`

Likely cause:

* neither the developer guide nor the design explainer enumerates a stable exception list for this API yet

Remediation:

1. Log `error.name` and `error.message` for diagnosis instead of matching against a hardcoded exception list.
2. Treat unrecognized failures as environment or EPP-build issues, and confirm flag, Canary-version, and platform requirements before assuming an application bug.
