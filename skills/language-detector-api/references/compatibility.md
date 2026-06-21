# Compatibility

Language Detector API support is rollout-sensitive. Treat browser support, preview flags, and environment constraints as explicit product dependencies.

## Baseline support notes

* The specification defines `LanguageDetector` as a secure-context `Window` API.
* The primary specification is a W3C Community Group draft, not a standards-track recommendation.
* The API is not exposed in Web Workers.
* Same-origin frames are covered by the default `self` permissions-policy allowlist. Cross-origin frames need explicit delegation.

## Chrome notes

* The Language Detector API works in Chrome on desktop only. Chrome for Android and iOS are not supported.
* Chrome documents support beginning with milestone `138`.
* The Language Detector and Translator APIs are desktop-only in Chrome; they are not supported on Chrome for Android, iOS, or any mobile platform.
* Chrome documents per-language availability checking via `availability()` starting with Chrome `132`.
* The Language Detector API works in Chrome on desktop only. Chrome for Android and iOS are not supported.
* Chrome documents the API as part of its built-in AI platform family.
* Chrome guidance notes that the model is downloaded on demand and might already be present because other browser features can use it.
* Chrome recommends checking support with `'LanguageDetector' in self` and using `availability()` before `create()`.
* Chrome guidance explicitly calls out that very short phrases and single words can yield low-accuracy results.
* Chrome documents cross-origin iframe delegation through `allow="language-detector"` and states that Web Workers are unsupported.
* Chrome points to `@types/dom-chromium-ai` for TypeScript typings when local DOM libs do not yet include the API.

## Microsoft Edge notes

* Microsoft Edge supports the Language Detector API starting with version `148`, without requiring any flags.
* Edge documents an on-device model download on first use and supports `monitor` for surfacing download progress.
* Edge documentation emphasizes that the model is shared across websites in the browser after download.
* Edge warns that results can be inaccurate or unreliable for certain inputs, especially short text.

## Secure context and frame rules

* Secure context is required.
* The API is available to top-level windows and same-origin frames by default.
* Cross-origin frames need explicit permissions-policy delegation through `allow="language-detector"`.
* If the feature must run inside an embedded frame the app does not control, make iframe delegation a hard prerequisite.

## Creation and download behavior

* `availability()` can report `downloadable`, `downloading`, or `available` depending on model state.
* A first successful `create()` can require user activation if it needs to initiate a model download.
* The initial download can take noticeable time and should be surfaced in the UI when the feature depends on immediate readiness.
* Browsers can continue or preserve model download state independently from any one page.

## TypeScript and typings

* Browser DOM typings for this API are not guaranteed in every TypeScript version.
* Preserve local declaration files or project typings when a codebase already has them.
* Add narrow, feature-specific typings instead of widening the global namespace with speculative fields.
* `@types/dom-chromium-ai` can help for Chromium-targeted projects.

## Product guidance

* Do not ship this API as the only path for critical workflows unless the supported browser matrix is intentionally narrow.
* Keep a visible fallback for unsupported browsers, blocked frames, and preview-only environments.
* Re-check compatibility when browser milestones, flags, or bundled model requirements change.