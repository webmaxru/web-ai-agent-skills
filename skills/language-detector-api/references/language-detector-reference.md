# Language Detector API Reference

Use this file for core API shape and rules before writing or reviewing browser integrations.

## API surface

`LanguageDetector` is a secure-context `Window` API.

Core members:

* `LanguageDetector.availability(options?)`
* `LanguageDetector.create(options?)`
* `session.detect(input, options?)`
* `session.measureInputUsage(input, options?)`
* `session.destroy()`
* `session.expectedInputLanguages` — `FrozenArray<DOMString>` or `null`; `null` when `expectedInputLanguages` was not supplied or was empty at creation time
* `session.inputQuota`

## Create options

`LanguageDetectorCreateCoreOptions`:

* `expectedInputLanguages?: string[]`

`LanguageDetectorCreateOptions` extends the core options with:

* `signal?: AbortSignal`
* `monitor?: (monitor: EventTarget) => void`

Rules:

* `expectedInputLanguages` uses BCP 47 language tags.
* The browser canonicalizes supplied language tags during availability and create flows.
* Use the same `expectedInputLanguages` shape for `availability()` and `create()` so the readiness check reflects the actual runtime path.
* Constrain `expectedInputLanguages` only when the product benefits from a known language set. An unnecessary constraint can make support look narrower than it really is.

## Availability states

`availability()` resolves to one of:

* `unavailable`
* `downloadable`
* `downloading`
* `available`

Interpretation:

* `unavailable` means the current browser or model state cannot satisfy the requested language-detection shape.
* `downloadable` means the browser can satisfy the request after downloading model resources.
* `downloading` means download is already in progress.
* `available` means the browser believes the session can be created now.

The spec also allows a transient internal failure while computing availability. Treat unexpected failures as environment issues, not as proof that the API is permanently unsupported.

## Detection results

`detect()` resolves to an ordered array of:

* `detectedLanguage: string`
* `confidence: number`

Behavior guarantees:

* Results are sorted by confidence in descending order.
* Returned confidence values are between `0` and `1`.
* Languages are omitted from the returned list if their confidence value is `0`, or if their confidence value is lower than the confidence assigned to `und` (the undetermined result), or once cumulative confidence reaches or exceeds `0.99`.
* The final result is always `und`, representing confidence that the text is not in any supported language strongly enough to return more specific candidates.
* The total confidence of returned results can be less than `1` because low-probability results are filtered out.

Product guidance:

* Do not assume only one language will be returned.
* Do not strip `und` unless the product has a deliberate replacement for uncertainty.
* Short text and single-word inputs can be materially less reliable.
* For multilingual input the browser apportions confidence values proportionate to how much of the input is in each detected language; treat the resulting distribution as meaningful, not as an error.

## Quota and measurement

Use `measureInputUsage()` when the feature needs to estimate quota cost before calling `detect()`.

Rules:

* `inputQuota` is implementation-defined and can be `Infinity`.
* When `inputQuota` is `Infinity`, `measureInputUsage()` returns `0`; do not treat a `0` return as empty input in that case.
* `measureInputUsage()` and `detect()` can reject when quota is exceeded.
* If the product accepts arbitrarily large text, add truncation, chunking, or explicit failure UI instead of retrying blindly.

## Lifecycle and cancellation

Rules:

* `create()` can take a `signal` for aborting session creation.
* `detect()` and `measureInputUsage()` can take a per-call `signal`.
* `destroy()` releases the session when the feature no longer needs the model loaded.
* Aborting a call and destroying a session are different actions; do not conflate them unless the product truly wants both.

## Permissions policy and context limits

Rules:

* The API is gated behind the `language-detector` permissions-policy feature.
* Default allowlist is `self`, which covers the top-level page and same-origin frames.
* Cross-origin iframes need explicit delegation through `allow="language-detector"`.
* The API is not exposed in Web Workers.
* Detection rejects with `InvalidStateError` when the document is no longer fully active.

## Common exception names

The spec explicitly calls out:

* `NotAllowedError` when language detection is blocked by user choice or browser policy.
* `OperationError` when model initialization fails after a download (thrown by `create()`).
* `UnknownError` for other implementation-defined failures.

Other failures can still surface through shared infrastructure, including lifecycle, quota, and abort-related exceptions.