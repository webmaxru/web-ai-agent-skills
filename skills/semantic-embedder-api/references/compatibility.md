# Compatibility

Semantic Embedder API support is Early Preview Program (EPP)-only and rollout-sensitive. Treat browser channel, flag state, and platform constraints as explicit product dependencies, and re-check this file more often than for other Built-in AI APIs because the feature is actively iterating.

## Baseline support notes

* The API is defined by an early-stage design explainer (`explainers-by-googlers/semantic-embedder-api`) that explicitly states it "has not been approved to ship in Chrome." There is no standards-track specification yet.
* The concrete implementation available to Early Preview Program testers can differ from, and lag behind, the design explainer's proposed surface (for example, the explainer's proposed `statistics` and `metadata` result fields are not present in the shipped developer guide).
* The API targets desktop only: Linux, macOS, and Windows. It is not available on Chrome for Android, iOS, or any mobile platform.
* The backing model is based on `embeddinggemma-300m` (a LiteRT Community build of Google's `embeddinggemma-300m`).

## Chrome notes

* Requires Chrome Canary version `153.0.7979.0` or later.
* Requires manually enabling `chrome://flags/#semantic-embedder-api`; this is not enabled by default and is not tied to a general Chrome release milestone.
* Only visible and functional for participants of the Early Preview Program; general Chrome users on stable, beta, or dev channels should not be expected to have this feature.
* Model download progress via the `monitor` option and `downloadprogress` events is only supported starting with Chrome `153.0.7979.0`. Earlier EPP builds did not support progress events at all, and `create()` would fail outright unless the model happened to already be fully downloaded.
* Recommend checking support with `'SemanticEmbedder' in self` before calling `availability()`.
* The EPP developer guide's `downloadprogress` sample treats `event.loaded` as a `0-1` fraction (`e.loaded * 100` for a percentage), matching the convention Chrome uses for other Built-in AI APIs in this repository (Language Detector, Translator).

## Microsoft Edge and other browsers

* No Edge, Firefox, or Safari support has been documented for this API. Treat it as a single-vendor, single-channel EPP feature until further notice.

## Secure context and frame rules

* Secure context is required.
* The design explainer proposes gating access behind an embedding-scoped permissions policy, restricted to top-level frames and same-origin iframes by default, with cross-origin frames requiring explicit delegation. This has not been confirmed against the shipped EPP build; do not hardcode a specific `allow="..."` token without verifying it empirically against the current Canary build.

## Creation, download, and versioning behavior

* `availability()` and `create()` behavior is documented in the EPP guide primarily through an `"available"` / not-`"available"` check; do not assume the full `unavailable` / `downloadable` / `downloading` / `available` enum used by sibling APIs is guaranteed here without empirical verification.
* The first trial on a user profile can require a multi-second model download; only surface this without a `monitor` callback if the product can tolerate an unexplained delay.
* Embeddings are only comparable within the same embedding space (the same model version). The API does not expose a version or embedding-space identifier on results, so treat any persisted vector as potentially stale after a browser update and re-embed when in doubt.
* The changelog for the developer guide shows the surface changing multiple times within the same month (clarifying that `taskType` belongs on `embed()`, not `create()`; adding download-progress support at a specific milestone), which is strong evidence this API is still in active flux.

## TypeScript and typings

* Browser DOM typings for this API are not guaranteed in any TypeScript version and are not part of `@types/dom-chromium-ai` at the time of writing.
* Add narrow, feature-specific typings scoped to the surface actually used (`availability()`, `create()`, `embed()`, `destroy()`) instead of widening the global namespace with speculative fields from the design explainer that are not yet shipped.

## Product guidance

* Do not ship this API as the only path for a production feature; it is EPP-gated behind a manual flag and a specific Canary build, so the addressable user population is effectively zero outside of internal testing and EPP participants.
* Keep a visible, fully functional fallback (server-side embeddings, keyword search, or a disabled feature state) for every browser and platform this API does not cover.
* Re-check this file against the current EPP developer guide and the `explainers-by-googlers/semantic-embedder-api` repository before treating any behavior here as stable, since both sources are being revised frequently.
