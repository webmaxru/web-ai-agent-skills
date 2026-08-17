# Browser Prompt API Compatibility Matrix

Use this reference when the feature must support multiple Prompt API generations or mix native support with polyfills.

## Source Priority

1. The current Prompt API specification explicitly marks `params()`, `topK`, and `temperature` as EXPERIMENTAL (extension and experimental contexts only), making the spec the source of authority for treating them as unavailable for portable web page code.
2. Treat Chrome and Edge documentation as implementation guidance for availability, flags, preview status, typings, and device requirements.
3. Where browser docs diverge from the spec on extension-only APIs, keep application logic aligned to the spec.
4. If browser docs differ on core semantics, keep application logic aligned to the spec and isolate the divergence behind compatibility code or troubleshooting notes unless an explicit override for this skill update says otherwise.

## Browser Availability Snapshot

1. Chrome documents the web Prompt API as available in Chrome on supported desktop hardware. Only sampling parameters (`topK`, `temperature`) have a separate origin trial (Chrome 148); the core API does not require an origin trial.
2. Chrome page integrations use Gemini Nano and currently document support on Windows 10 or 11, macOS 13+, Linux, and Chromebook Plus devices on supported ChromeOS builds.
3. Chrome hardware requirements: at least 22 GB of free storage on the Chrome profile volume, and either a GPU with strictly more than 4 GB of VRAM or a CPU with 16 GB or more of RAM and 4 or more CPU cores. Chrome note: Prompt API with audio input requires a GPU; the CPU fallback does not apply when `expectedInputs` includes `{ type: "audio" }`.
4. Edge documents the Prompt API as a developer preview in Canary or Dev starting with version `138.0.3309.2`.
5. Edge page integrations default to the built-in Phi-4-mini model and require Windows 10 or 11 or macOS 13.3 or later, at least 20 GB of free storage on the Edge profile volume (model deleted if drops below 10 GB), and at least 5.5 GB of VRAM.
6. Starting with Edge version 150.0.4070, the prerelease Aion-1.0-Instruct model is also available. Aion-1.0-Instruct is smaller and faster than Phi-4-mini and supports CPU-only inferencing, making the Prompt API accessible on devices with a Medium or Low performance class that cannot run Phi-4-mini.
7. Both browser docs treat model download as a separate readiness step that can require significant disk space and an unmetered network for the initial download.

## Browser Setup Notes

1. Chrome documents `chrome://flags/#optimization-guide-on-device-model` and `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` for localhost testing.
2. Chrome documents `chrome://on-device-internals` for checking the current downloaded model size.
3. Edge documents enabling the `Prompt API for on-device language model` flag in `edge://flags/` and checking `edge://on-device-internals` for a device performance class of `High` or greater.
4. On Edge, devices with a Medium or Low performance class can access the Prompt API using the prerelease Aion-1.0-Instruct model (Edge 150.0.4070+). To enable Aion-1.0-Instruct, set the **Enable prerelease on-device language model** flag in `edge://flags/`. Confirm the model is active by checking **Model Status** in `edge://on-device-internals`.
5. Chrome and Edge both document download progress monitoring through the `monitor` callback on `LanguageModel.create()`.
6. The Prompt API remains unavailable in workers, and cross-origin iframes still require `allow="language-model"`.
7. User-supplied update for this skill: extension pages and offscreen pages can expose the native Prompt API even when a page integration still needs polyfill or preview handling.

## Typings

1. Chrome documentation recommends `@types/dom-chromium-ai` for TypeScript projects targeting Chromium's built-in AI APIs.
2. Treat Chromium typings as implementation-specific, and keep any local wrappers aligned with the actual browser targets the app supports.

## Polyfill Packages

1. Prompt API polyfill package: `prompt-api-polyfill`
2. Built-in AI Task API polyfill package: `built-in-ai-task-apis-polyfills`
3. Common Task API subpath imports:
   `built-in-ai-task-apis-polyfills/summarizer`
   `built-in-ai-task-apis-polyfills/writer`
   `built-in-ai-task-apis-polyfills/rewriter`
   `built-in-ai-task-apis-polyfills/language-detector`
   `built-in-ai-task-apis-polyfills/translator`
   `built-in-ai-task-apis-polyfills/classifier`

## Installation

```bash
npm install prompt-api-polyfill built-in-ai-task-apis-polyfills
```

## Backend Support In `prompt-api-polyfill`

1. Firebase AI Logic via `window.FIREBASE_CONFIG`
2. Gemini Developer API via `window.GEMINI_CONFIG`
3. OpenAI API via `window.OPENAI_CONFIG`
4. Transformers.js via `window.TRANSFORMERS_CONFIG`

## Breaking-Change Mapping

| Older or non-portable surface | Current guidance |
| --- | --- |
| `LanguageModel.params()` | Spec-normatively marked EXPERIMENTAL: extension and experimental contexts only. Chrome docs confirm it is extension-only. Do not use for web page integrations. |
| `topK` in `create()` | Spec-normatively marked EXPERIMENTAL: extension and experimental contexts only. Chrome docs confirm it is extension-only. Edge still documents it for web pages, but spec takes precedence for portable cross-browser code. Never require it for product behavior. |
| `temperature` in `create()` | Spec-normatively marked EXPERIMENTAL: extension and experimental contexts only. Chrome docs confirm it is extension-only. Edge still documents it for web pages, but spec takes precedence for portable cross-browser code. Never require it for product behavior. |
| `measureInputUsage()` | Spec-normatively marked DEPRECATED: extension contexts only. Prefer `measureContextUsage()`; fall back only for very old implementations. |
| `inputUsage` | Spec-normatively marked DEPRECATED: extension contexts only. Prefer `contextUsage`; fall back only for very old implementations. |
| `inputQuota` | Spec-normatively marked DEPRECATED: extension contexts only. Current spec uses `contextWindow`; probe both before falling back to `inputQuota`. |
| `onquotaoverflow` | Spec-normatively marked DEPRECATED: extension contexts only. Current spec uses `oncontextoverflow`; probe both before falling back to `onquotaoverflow`. |

## Compatibility Strategy

1. Prefer native APIs when they exist.
2. Dynamically import `prompt-api-polyfill` only when `LanguageModel` is missing.
3. Dynamically import individual Task API polyfills only for the globals the browser does not expose.
4. Wrap context measurement and overflow handling behind compatibility helpers instead of sprinkling version checks across app code.
5. Do not build product behavior that depends on `params()`, `topK`, or `temperature` in web page contexts; the spec marks them EXPERIMENTAL and extension-only.
6. Pass the same modalities, languages, and tools to `availability()` that the feature will use when creating the session.
7. Treat documented browser language support as an implementation subset layered on top of the spec's BCP 47 language model.
8. When supporting older preview builds, check `measureContextUsage`, `contextUsage`, `contextWindow`, `oncontextoverflow`, the user-supplied `contextWindowMeasure` and `contextOverflow` aliases, and only then the quota-era fallbacks instead of assuming a single generation of names.
9. Treat extension or offscreen-page behavior as browser-specific capability guidance, not as the portable baseline for page code.

## Production Guidance

1. Prefer backend-backed production configurations with the project-approved security posture.
2. Firebase AI Logic is the safest documented production backend among the shipped prompt polyfill backends because it supports App Check.
3. Do not hardcode real Gemini or OpenAI production secrets in client source.