# Compatibility

Translator API support is browser-specific and rollout-sensitive. Treat browser support, preview flags, and environment constraints as explicit product dependencies.

## Baseline support notes

* The specification defines `Translator` as a secure-context `Window` API.
* The primary specification is a W3C Community Group draft, not a standards-track recommendation.
* The API is not exposed in Web Workers.
* Same-origin frames are covered by the default `self` permissions-policy allowlist. Cross-origin frames need explicit delegation.

## Chrome notes

* Chrome documents support beginning with milestone `138`.
* Chrome documents the API as part of its built-in AI platform family.
* Chrome's Translator API works on **desktop Chrome only** (Windows, macOS, Linux, ChromeOS). It is not available on mobile devices (Android Chrome, iOS Chrome).
* Chrome guidance notes that translation models are downloaded on demand.
* Chrome recommends checking support with `'Translator' in self` and using `availability()` before `create()`.
* Chrome guidance notes that browser privacy protections report all language pairs as `downloadable` until a site first creates a translator for a specific pair; the actual download state for a given pair is not revealed before that first creation attempt.
* Chrome documents cross-origin iframe delegation through `allow="translator"` and states that Web Workers are unsupported due to the complexity of checking permissions-policy status without a responsible document.
* Chrome guidance says translation requests are processed sequentially, so large jobs should surface explicit loading state.
* Chrome points to `@types/dom-chromium-ai` for TypeScript typings when local DOM libs do not yet include the API.
* Chrome publishes a list of supported language codes; the list is implementation-specific and may change. Use `availability()` at runtime to determine whether a specific language pair is supported rather than hard-coding the list.
* Chrome deletes the downloaded model from the device if free storage on the Chrome profile volume falls below approximately 10 GB after the download; the model is re-downloaded automatically when the storage requirement is met again.

## Microsoft Edge notes

* Chrome's browser-support table lists Microsoft Edge `148` as the supported milestone; Edge's own documentation no longer describes the API as a developer preview or lists required flags.
* Earlier Edge Dev or Canary builds (from `143.0.3636.0`) required enabling `#edge-translation-api` and `#edge-translation-api-streaming-by-sentence` at `edge://flags`. Apply this flag workflow only when targeting those pre-148 preview builds.
* Edge documents the API for websites and browser extensions; the Window-only and secure-context rules still apply to web pages.
* When `#edge-translation-api-streaming-by-sentence` is enabled, the translation API splits text by sentence and streams each translated sentence as it completes, providing better responsiveness for long texts.
* Edge documents an on-device model download on first use and supports `monitor` for surfacing download progress.
* Edge documentation emphasizes that downloaded models are shared across websites in the browser after download.

## Secure context and frame rules

* Secure context is required.
* The API is available to top-level windows and same-origin frames by default.
* Cross-origin frames need explicit permissions-policy delegation through `allow="translator"`.
* If the feature must run inside an embedded frame the app does not control, make iframe delegation a hard prerequisite.

## Creation and download behavior

* `availability()` can report `downloadable`, `downloading`, or `available` depending on model state.
* A first successful `create()` can require user activation if it needs to initiate a download.
* The initial download can take noticeable time and should be surfaced in the UI when the feature depends on immediate readiness.
* Browsers can continue or preserve model download state independently from any one page.
* After the initial model download, translation operates entirely on-device with no network requests, so translation can succeed even when the device is offline.
* If a model download fails, the `downloadprogress` events stop and the promise returned by `create()` rejects.

## TypeScript and typings

* Browser DOM typings for this API are not guaranteed in every TypeScript version.
* Preserve local declaration files or project typings when a codebase already has them.
* Add narrow, feature-specific typings instead of widening the global namespace with speculative fields.
* `@types/dom-chromium-ai` can help for Chromium-targeted projects.

## Product guidance

* Do not ship this API as the only path for critical workflows unless the supported browser matrix is intentionally narrow.
* Keep a visible fallback for unsupported browsers, blocked frames, and preview-only environments.
* Re-check compatibility when browser milestones, flags, or bundled model requirements change.