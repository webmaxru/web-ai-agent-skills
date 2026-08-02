---
name: semantic-embedder-api
description: Implements and debugs browser Semantic Embedder API integrations in JavaScript or TypeScript web apps. Use when adding SemanticEmbedder support checks, availability and model download flows, session creation, embed() calls for single or batched text, taskType selection for similarity, retrieval, classification, or clustering, embedding-space versioning, or Early Preview Program flag handling for on-device text embeddings. Don't use for server-side or cloud embedding APIs, vector database implementations, generic NLP pipelines, or translation, summarization, and generation tasks.
license: MIT
metadata:
  author: webmaxru
  version: "1.0"
---

# Semantic Embedder API

## Procedures

**Step 1: Identify the browser integration surface**
1. Inspect the workspace for browser entry points, search or recommendation UI, retrieval-augmented-generation (RAG) flows, and any existing AI abstraction layer.
2. Execute `node scripts/find-semantic-embedder-targets.mjs .` to inventory likely frontend files and existing Semantic Embedder API markers when a Node runtime is available.
3. If a Node runtime is unavailable, inspect the nearest `package.json`, HTML entry point, and framework bootstrap files manually to identify the browser app boundary.
4. If the workspace contains multiple frontend apps, prefer the app that contains the active route, component, or user-requested feature surface.
5. If the inventory still leaves multiple plausible frontend targets, stop and ask which app should receive the Semantic Embedder API integration.
6. If the project is not a browser web app, stop and explain that this skill does not apply.

**Step 2: Confirm API viability and choose the integration shape**
1. Read `references/semantic-embedder-reference.md` before writing code.
2. Read `references/examples.md` when the feature needs a session wrapper, download-progress UI, batched retrieval indexing, or similarity scoring.
3. Read `references/compatibility.md` when Early Preview Program (EPP) requirements, preview flags, Canary version gates, or platform limits matter.
4. Read `references/troubleshooting.md` when support checks, creation, embedding, or comparison behavior fail.
5. Verify that the feature runs in a secure `Window` context on a desktop platform; the API does not currently target mobile.
6. Verify that the target browser is Chrome Canary at or above the milestone documented in `references/compatibility.md`, with the Semantic Embedder EPP flag enabled. Do not assume general Chrome availability.
7. Choose the narrowest embedding shape that matches the task:
   - single-string `embed()` for one-off similarity checks or real-time query embedding
   - batched `embed(stringArray)` for indexing a document collection
   - `monitor` when the UI must surface model download progress
8. Choose a `taskType` per call based on the product use case (`semantic-similarity`, `retrieval-query`, `retrieval-document`, `classification`, `clustering`); do not omit it for production similarity or retrieval logic, because an omitted `taskType` produces an unoptimized raw-string embedding rather than a sensible default.
9. If the feature must run in a worker, on the server, or through a cloud-only contract, stop and explain the platform mismatch.
10. If the project uses TypeScript, add or preserve narrow typings for the Semantic Embedder API surface used by the feature.

**Step 3: Implement a guarded session wrapper**
1. Read `assets/semantic-embedder-session.template.ts` and adapt it to the framework, state model, and file layout in the workspace.
2. Centralize support checks around `globalThis.isSecureContext` and `SemanticEmbedder`.
3. Gate session creation behind `SemanticEmbedder.availability()` before calling `SemanticEmbedder.create()`.
4. Treat `availability()` as a capability check, not a guarantee that creation will succeed without download time, flag state, or Canary-version drift.
5. Create sessions only after user activation when creation may trigger a model download.
6. Use the `monitor` option during `create()` when the product needs download progress; do not assume progress events fire on every Canary build, only on the milestone documented in `references/compatibility.md`.
7. Pass `taskType` on each `embed()` call, never on `create()`; the create-time options for this API do not accept `taskType`.
8. Call `destroy()` when the session is no longer needed; the API does not currently document a per-call `AbortSignal` for `embed()`, so cancellation must be handled in product logic instead of assumed from the platform.

**Step 4: Wire UX, task selection, and embedding-space versioning**
1. Surface distinct states for missing APIs, insecure or non-desktop contexts, disabled EPP flags, downloading or unready models, ready sessions, in-flight embedding calls, and fallback behavior.
2. Keep a non-AI fallback (server-side embeddings, keyword search, or a disabled feature state) for unsupported browsers, non-desktop platforms, or environments that do not meet current EPP requirements.
3. Use `retrieval-document` when embedding a collection to index and `retrieval-query` when embedding a live user search; do not reuse the same `taskType` for both sides of a retrieval flow.
4. Use `semantic-similarity` only for general text-similarity comparisons, not for retrieval ranking.
5. Tag every stored vector with a local schema or model-version marker before persisting it in IndexedDB, OPFS, or another store; the API does not currently expose a model or embedding-space identifier, so the application is responsible for detecting stale vectors after a browser or model update.
6. Never compare or mix `Float32Array` vectors that may have been produced by different underlying model versions; when versioning cannot be proven, prefer re-embedding over trusting a cached vector.
7. Do not route translation, summarization, generation, or generic chat tasks through this API; switch to Translator, Writing Assistance APIs, Prompt API, or another approved capability when the task is not text embedding.
8. Pre-chunk large documents before calling `embed()`; the API does not auto-chunk oversized input.

**Step 5: Validate behavior**
1. Execute `node scripts/find-semantic-embedder-targets.mjs .` to confirm that the intended app boundary and Semantic Embedder API markers still resolve to the edited integration surface.
2. Verify secure-context checks, desktop-platform assumptions, `SemanticEmbedder` feature detection, and `availability()` behavior before debugging deeper runtime failures.
3. Test at least one single-string `embed()` call and one batched `embed()` call with representative product text.
4. Confirm similarity scoring behaves as expected using a known similar pair and a known dissimilar pair of inputs.
5. Confirm that `destroy()` releases the session and that a destroyed session is not reused.
6. Re-check `references/compatibility.md` before treating a failure as an application bug; this API is an actively-changing Early Preview Program feature and its shipped behavior can move between Canary milestones.
7. Run the workspace build, typecheck, or tests after editing.

## Error Handling
* If `SemanticEmbedder` is missing, keep a non-AI fallback and confirm secure-context, desktop-platform, Canary-version, and EPP flag requirements before changing product logic.
* If `availability()` resolves to anything other than `available`, treat the session as not ready; the developer-facing guide only confirms `available` and `unavailable` explicitly, so do not assume the full four-state enum used by sibling Built-in AI APIs is guaranteed for this feature without re-checking `references/compatibility.md`.
* If `create()` fails outright with no download-progress events, confirm the browser build meets the minimum Canary milestone in `references/compatibility.md`; earlier builds can require the model to be fully downloaded before `create()` succeeds at all.
* If a `taskType` passed to `create()` appears to have no effect, move it to the `embed()` call options; `taskType` is an `embed()`-time parameter only.
* If embeddings compared across sessions produce nonsensical similarity scores, confirm both vectors came from the same embedding space (the same browser and model version) instead of assuming persisted vectors remain valid indefinitely.
* If the feature must run in a worker, on a mobile platform, or on the server, stop and explain that the Semantic Embedder API is a desktop, window-only browser API.
