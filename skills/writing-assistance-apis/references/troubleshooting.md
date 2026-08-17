# Troubleshooting

## Missing globals

Symptoms:

* `Summarizer is not defined`
* `Writer is not defined`
* `Rewriter is not defined`

Checks:

1. Confirm a secure context.
2. Confirm the target browser and channel support the needed API.
3. Confirm preview flags or browser settings are enabled where required.
4. Confirm the code is running in a window, not in a worker or server runtime.

## `availability()` returns `unavailable`

Checks:

1. Retry with the same option shape the product will actually use.
2. Remove optional language, tone, format, length, or summary-type constraints one by one to isolate the unsupported dimension.
3. Confirm device and storage requirements from `references/compatibility.md`.
4. Keep the fallback path instead of forcing `create()`.

## `create()` throws `NotAllowedError`

Likely causes:

* the frame is blocked by permissions policy
* the browser requires user activation to start a download
* the user agent or user rejected model download or use

Checks:

1. Confirm the action is user initiated.
2. Confirm iframe delegation for `summarizer`, `writer`, or `rewriter`.
3. Confirm browser policy or enterprise restrictions are not blocking access.

## `create()` throws `QuotaExceededError`

Likely causes:

* `sharedContext` is too large
* the chosen options consume more session quota than expected

Remediation:

1. Shorten `sharedContext`.
2. Move volatile request detail into per-call `context`.
3. Create a new session with a smaller base context.

## Run call throws `NotSupportedError`

Likely causes:

* unsupported input, context, or output language
* unsupported option combination
* ambiguous language detection when no output language was set

Remediation:

1. Set `outputLanguage` explicitly when the output language matters.
2. Canonicalize and reduce language constraints.
3. Align the API choice with the task: summary, new writing, or rewrite.

## Run call throws `InvalidStateError`

Likely causes:

* the document stopped being fully active
* the page navigated, backgrounded, or was restored through a lifecycle transition at the wrong time

Remediation:

1. Retry only after the document is active again.
2. Recreate the session after a major route or lifecycle transition if needed.

## Run call throws `NotReadableError`

Likely causes:

* the output was filtered by the user agent because it was detected to be harmful, inaccurate, offensive, or nonsensical

Remediation:

1. Do not retry the same input automatically; the same input is likely to produce the same filtered result.
2. Surface a user-visible message that the request could not be completed.
3. Optionally, offer the user a way to rephrase or shorten the input before trying again.

## Streaming stops unexpectedly

Likely causes:

* the abort signal fired
* the session was destroyed
* the browser hit an internal runtime issue and surfaced `UnknownError`

Checks:

1. Confirm whether the UI stop path triggered `abort()`.
2. Confirm the session was not reused after cleanup.
3. Fall back to a batch call only if the product can tolerate waiting for the full result.

## `UnknownError` or `NetworkError`

Likely causes:

* browser download failure
* transient runtime failure
* browser resource pressure or internal model management failure

Remediation:

1. Retry once after confirming the browser is still eligible to run the API.
2. If creation is still failing, surface the fallback path and avoid repeated automatic retries.
3. Check browser-specific internal pages or debug logging when the environment permits it.