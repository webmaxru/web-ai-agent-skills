---
name: proofreader-api
description: Implements and debugs browser Proofreader API integrations in JavaScript or TypeScript web apps. Use when adding Proofreader availability checks, monitored model downloads, proofread flows, correction metadata handling, or permissions-policy checks for built-in proofreading. Don't use for generic prompt engineering, server-side LLM SDKs, or cloud AI services.
license: MIT
metadata:
  author: webmaxru
  version: "1.4"
---

# Proofreader API

## Procedures

**Step 1: Identify the browser integration surface**
1. Inspect the workspace for browser entry points, editor or form UI handlers, and any existing built-in AI abstraction layer.
2. Execute `node scripts/find-proofreader-targets.mjs .` to inventory likely frontend files and existing Proofreader API markers when a Node runtime is available.
3. If a Node runtime is unavailable, inspect the nearest `package.json`, HTML entry point, and framework bootstrap files manually to identify the browser app boundary.
4. If the workspace contains multiple frontend apps, prefer the app that contains the active text-entry route, editor component, or user-requested proofreading surface.
5. If the inventory still leaves multiple plausible frontend targets, stop and ask which app should receive the Proofreader API integration.
6. If the project is not a browser web app, stop and explain that this skill does not apply.

**Step 2: Confirm API viability and option shape**
1. Read `references/proofreader-reference.md` before writing code.
2. Read `references/examples.md` when the feature needs session creation, download monitoring, result rendering, or quota-aware preflight.
3. Read `references/compatibility.md` when preview flags, browser channels, hardware requirements, iframe constraints, or browser-specific option gaps matter.
4. Read `references/troubleshooting.md` when feature detection, availability, creation, or proofreading fails.
5. Verify that the feature runs in a secure `Window` context and that the current frame is allowed to use the `proofreader` permissions-policy feature.
6. Match `availability()` and `create()` option shapes exactly, especially for `expectedInputLanguages`, `includeCorrectionTypes`, `includeCorrectionExplanations`, and `correctionExplanationLanguage` when the target browser supports them.
7. If the feature must run in a worker, on the server, or through a generic text-generation interface, stop and explain the platform mismatch.
8. If the project uses TypeScript, add or preserve typings that cover only the Proofreader API surface actually used by the feature.

**Step 3: Implement a guarded proofreader wrapper**
1. Read `assets/proofreader-session.template.ts` and adapt it to the framework, state model, and file layout in the workspace.
2. Gate session creation behind `Proofreader.availability()` using the same non-transient create options that the runtime session will use.
3. Treat `availability()` as a capability check, not a guarantee that creation will succeed without user activation, download time, or policy approval.
4. Create sessions only after user activation when the target browser may need to start a model download.
5. Use the `monitor` option during `create()` when the UI needs download progress.
6. Use `AbortController` for cancelable create or proofread calls, and call `destroy()` when the proofreading UI no longer needs the session.
7. Recreate the session instead of mutating option-dependent behavior after creation; session options are fixed per instance.
8. If the task requires correction labels or explanations, keep browser-specific fallbacks explicit instead of assuming every preview implements the full specification option set.

**Step 4: Wire UX and result handling**
1. Surface distinct states for missing APIs, unavailable devices, downloadable or downloading models, ready sessions, in-flight proofreading, canceled work, and hard failures.
2. Keep a non-AI fallback for unsupported browsers, blocked frames, or devices that do not meet the current preview requirements.
3. Render both `correctedInput` and the structured `corrections` array when the product needs visible diffs or selective acceptance.
4. Use `measureInputUsage()` before expensive proofreading only when the feature needs quota-aware behavior or large-input preflight.
5. Keep expected input languages explicit when the feature depends on supported language routing.
6. Do not use Proofreader as a general chat, summarization, or rewriting surface; switch to the correct built-in API when the task is not proofreading.

**Step 5: Validate behavior**
1. Execute `node scripts/find-proofreader-targets.mjs .` to confirm that the intended app boundary and Proofreader markers still resolve to the edited integration surface.
2. Verify feature detection, secure-context checks, permissions-policy access, and `availability()` behavior before debugging deeper runtime failures.
3. Test session creation with the exact options used in production, including download progress handling when the environment needs an initial model download.
4. Confirm that `proofread()` returns the expected `correctedInput` and correction ranges for representative user text.
5. If the integration uses `measureInputUsage()`, confirm that large inputs are rejected or trimmed before the browser throws quota-related failures.
6. Confirm that cancellation stops work cleanly and that destroyed sessions are not reused.
7. If the target environment depends on preview flags, origin trials, or channel-specific behavior, confirm the required browser state from `references/compatibility.md` before treating failures as application bugs.
8. Run the workspace build, typecheck, or tests after editing.

## Error Handling
* If `Proofreader` is missing, keep a non-AI fallback and confirm that the environment satisfies the secure-context, browser, and preview requirements before changing product logic.
* If `availability()` returns `downloadable` or `downloading`, require user-driven session creation before promising that proofreading is ready.
* If `create()` or `proofread()` throws `NotAllowedError`, check permissions-policy constraints, missing user activation for downloads, browser policy restrictions, or user rejection.
* If `create()` or `proofread()` throws `NotSupportedError`, align the requested languages and option set with the browser's supported combinations and remove unsupported preview-only assumptions.
* If creation fails with `OperationError`, `UnknownError`, or another runtime exception, retry once only after confirming that device eligibility, storage, and browser flags still match `references/compatibility.md`.
* If the feature must run in a worker or server context, stop and explain that the Proofreader API is a window-only browser API.