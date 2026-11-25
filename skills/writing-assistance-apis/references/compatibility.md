# Compatibility

Writing Assistance APIs remain browser-specific and rollout-sensitive. Treat support as an explicit product dependency.

## Baseline support notes

* The specification defines `Summarizer`, `Writer`, and `Rewriter` as secure-context `Window` APIs.
* The primary specification is a W3C Community Group draft, not a standards-track recommendation.
* Firefox and Safari do not currently document support for these APIs.
* Worker contexts are not part of the current exposed surface.

## Microsoft Edge preview notes

* Microsoft Edge documents the Writing Assistance APIs as a developer preview starting with version 158. Earlier Edge builds (138–157) used the Phi-4-mini model and different flag names; treat those as legacy and re-verify behavior on them.
* In Edge 158 and later, enable the **Summarizer API**, **Writer API**, and **Rewriter API** flags in `edge://flags` as needed, then restart. In Canary, Dev, and Beta, enabling a flag also turns on **On-device AI** under **Settings** > **Copilot and AI**, which is otherwise disabled by default in those channels.
* Edge uses the built-in Aion Instruct model (2.3B parameters).
* Edge preview guidance currently targets Windows 10 or 11, macOS 13.3+, and 64-bit (x64) Linux with Vulkan GPU drivers on Edge 159 or later.
* Edge preview guidance currently requires at least 20 GB free storage, at least 3 GB VRAM, and an unmetered connection for the initial model download. The model is not downloaded on metered connections.
* If available storage drops below 5 GB, Edge deletes the model.
* The model is unavailable when **On-device AI** is disabled, when the `GenAILocalFoundationalModelSettings` or `ComponentUpdatesEnabled` enterprise policies block the download, or when the device fails hardware, disk, or network requirements.
* Edge exposes device-readiness details through `edge://on-device-internals`. A **Device performance class** of Medium or greater indicates support.
* Edge 158 and later inserts an invisible watermark into generated text. Account for it when rendering, parsing, or converting output, and keep any AI-content marking obligations in mind before stripping it.

## Chrome notes

* The supplied Chrome documentation explicitly covers `Summarizer` and points to the same built-in AI platform family for Writer and Rewriter.
* Chrome documents stable support for built-in AI APIs on supported desktop platforms beginning in milestone 138 for the covered rollout.
* Chrome documents desktop support on Windows 10 or 11, macOS 13+, Linux, and Chromebook Plus devices, but not on mobile browsers.
* Chrome documents minimum hardware requirements of strictly more than 4 GB VRAM, or a CPU path with at least 16 GB RAM and 4 CPU cores, plus at least 22 GB of free storage and an unmetered network for the initial download.
* Validate the exact Chrome rollout status for Writer and Rewriter against current browser docs before promising stable availability in product requirements.
* Chrome's built-in AI family now also includes a `Proofreader API` listed alongside `Summarizer`, `Writer`, and `Rewriter` in hardware requirement documentation. The Proofreader API is out of scope for this skill; route Proofreader tasks to a separate skill or the raw browser API directly.

## Secure context and frame rules

* Secure context is required.
* The APIs are intended for top-level windows and same-origin frames by default.
* Cross-origin frames need explicit permissions-policy delegation for each API they use.
* If the feature must run inside an embedded frame the app does not control, make iframe delegation a hard prerequisite.

## Creation and download behavior

* `availability()` can report `downloadable`, `downloading`, or `available` depending on model state and browser privacy masking.
* A first successful `create()` can require user activation if it needs to initiate a download.
* The initial model download can take noticeable time and should be surfaced in the UI when the feature depends on immediate readiness.
* Browsers can preserve download progress even if a create call is aborted.
* If available storage drops below 10 GB after a model download, the browser removes the model; a subsequent `create()` will require another download when storage is available again.

## Known browser-spec discrepancies

* Microsoft Edge documentation (as of version 158) uses `"tl;dr"` (with semicolon) for the Summarizer `type` option while the W3C Community Group specification uses `"tldr"` (no semicolon). The spec value `"tldr"` is authoritative for cross-browser code; test against the target browser when targeting Edge.

## TypeScript and typings

* Browser DOM typings for these APIs are not guaranteed in every TypeScript version.
* The [`@types/dom-chromium-ai`](https://www.npmjs.com/package/@types/dom-chromium-ai) npm package provides TypeScript typings for the Summarizer, Writer, Rewriter, and Prompt APIs; install it when working in a TypeScript project that targets Chrome's built-in AI APIs.
* Preserve local declaration files or project typings when a codebase already has them.
* Add narrow, feature-specific typings instead of widening the whole global namespace with speculative fields.

## Product guidance

* Do not ship these APIs as the only path for critical workflows unless the supported browser matrix is intentionally narrow.
* Keep a visible fallback for unsupported browsers, blocked frames, and devices that fail the preview hardware requirements.
* Re-check compatibility when browser milestones, preview flags, or bundled model requirements change.