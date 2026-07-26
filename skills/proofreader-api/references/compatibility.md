# Compatibility

Proofreader API support remains browser-specific, preview-sensitive, and hardware-gated. Treat support as an explicit product dependency.

## Baseline support notes

* The specification defines `Proofreader` as a secure-context `Window` API.
* The primary specification is a W3C Community Group draft, not a standards-track recommendation.
* Firefox and Safari do not currently document support for this API.
* Worker contexts are not part of the current exposed surface.

## Specification versus preview implementations

* The W3C Community Group specification defines `includeCorrectionTypes`, `includeCorrectionExplanations`, and `correctionExplanationLanguage` as part of the option surface.
* Chrome's current documentation explicitly says the explainer's correction-type and correction-explanation options are not supported in the present preview.
* Edge documentation focuses on core session creation, availability, and proofreading flows and does not currently document the full specification option set as a stable preview contract.
* Keep the skill aligned to the specification for API semantics, but treat correction labels and explanations as browser-specific preview capabilities that require verification before use.

## Microsoft Edge preview notes

* Microsoft Edge documents the Proofreader API as a developer preview in Canary or Dev starting with version `142`.
* Edge uses the Phi-4-mini model (Microsoft) for the Proofreader API preview.
* Edge currently documents preview enablement through the `Proofreader API for Phi mini` flag.
* Edge preview guidance currently targets Windows 10 or 11 and macOS 13.3+.
* Edge preview guidance currently requires at least 20 GB free storage, at least 5.5 GB VRAM, and an unmetered connection for the initial model download.
* If available storage drops below 10 GB after the initial download, Edge deletes the model to free space for other browser features; the model must be re-downloaded when space is restored.
* Edge exposes device-readiness details through `edge://on-device-internals`, where `Device performance class` should be `High` or greater.

## Chrome notes

* Chrome documents the Proofreader API as part of its built-in AI platform.
* Chrome currently documents access through an origin trial running in milestones `141` through `145`, plus local testing on `localhost` with preview flags enabled.
* Chrome's localhost guidance is to enable the single flag `chrome://flags/#proofreader-api`.
* Chrome documents desktop support on Windows 10 or 11, macOS 13+, Linux, and ChromeOS on Chromebook Plus devices (from ChromeOS Platform 16389.0.0 onwards), but not on Chrome for Android, iOS, or ChromeOS on non-Chromebook Plus devices.
* Chrome documents minimum hardware requirements of strictly more than 4 GB VRAM or a CPU path with at least 16 GB RAM and 4 CPU cores, plus at least 22 GB of free storage and an unmetered network for the initial download.
* If available storage drops below 10 GB after the initial download, Chrome removes the model; it redownloads automatically once the requirements are met.

## Secure context and frame rules

* Secure context is required.
* The API is intended for top-level windows and same-origin frames by default.
* Cross-origin frames need explicit permissions-policy delegation with `allow="proofreader"`.
* The API is not available in Web Workers.

## Creation and download behavior

* `availability()` can report `downloadable`, `downloading`, or `available` depending on model state and browser privacy masking.
* A first successful `create()` can require user activation if it needs to initiate a download.
* The initial model download can take noticeable time and should be surfaced in the UI when the feature depends on immediate readiness.
* Browsers can preserve download progress even if a create call is aborted.

## TypeScript and typings

* Browser DOM typings for `Proofreader` are not guaranteed in every TypeScript version.
* Chrome documentation points to `@types/dom-chromium-ai` for current built-in AI typings.
* Preserve existing local declaration files when a codebase already maintains its own built-in AI types.
* Add narrow feature-specific typings instead of widening the whole global namespace with speculative browser fields.

## Product guidance

* Do not ship this API as the only path for critical proofreading workflows unless the supported browser matrix is intentionally narrow.
* Keep a visible fallback for unsupported browsers, blocked frames, and devices that fail the preview hardware requirements.
* Re-check compatibility whenever browser milestones, flags, origin-trial terms, or bundled model requirements change.