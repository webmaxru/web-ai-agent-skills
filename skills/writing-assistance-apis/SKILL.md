---
name: writing-assistance-apis
description: Implements and debugs browser Summarizer, Writer, and Rewriter integrations in JavaScript or TypeScript web apps. Use when adding availability checks, model download UX, session creation, summarize or write or rewrite flows, streaming output, abort handling, or permissions-policy constraints for built-in writing assistance APIs. Don't use for generic prompt engineering, server-side LLM SDKs, or cloud AI services.
license: MIT
metadata:
  author: webmaxru
  version: "1.4"
---

# Writing Assistance APIs

## Procedures

**Step 1: Identify the browser integration surface**
1. Inspect the workspace for browser entry points, UI handlers, and any existing AI abstraction layer.
2. Execute `node scripts/find-writing-assistance-targets.mjs .` to inventory likely frontend files and existing Summarizer, Writer, or Rewriter usage when a Node runtime is available.
3. If a Node runtime is unavailable, inspect the nearest `package.json`, HTML entry point, and framework bootstrap files manually to identify the browser app boundary.
4. If the workspace contains multiple frontend apps, prefer the app that contains the active route, component, or user-requested feature surface.
5. If the inventory still leaves multiple plausible frontend targets, stop and ask which app should receive the Writing Assistance API integration.
6. If the project is not a browser web app, stop and explain that this skill does not apply.

**Step 2: Confirm API viability and choose the right surface**
1. Read `references/writing-assistance-reference.md` before writing code.
2. Read `references/examples.md` when the feature needs a session shape for monitoring downloads, batch output, streaming output, or cancellation.
3. Read `references/compatibility.md` when preview flags, browser channels, hardware requirements, or iframe constraints matter.
4. Read `references/troubleshooting.md` when availability checks, creation, streaming, or session cleanup fail.
5. Verify that the feature runs in a secure `Window` context and that the relevant permissions-policy feature allows access from the current frame.
6. Choose the narrowest surface that matches the task:
   - `Summarizer` for article, document, or conversation summaries.
   - `Writer` for generating new text from a short prompt or writing task.
   - `Rewriter` for transforming existing text while preserving its intent.
7. If the feature must run in a worker, on the server, or against a remote model provider, stop and explain the platform mismatch.
8. If the project uses TypeScript, add or preserve typings that cover the specific browser APIs used by the feature.

**Step 3: Implement a guarded session wrapper**
1. Read `assets/writing-assistance-session.template.ts` and adapt it to the framework, state model, and file layout in the workspace.
2. Gate session creation behind the API's `availability()` method using the same create options that will be used at runtime.
3. Treat `availability()` as a capability check, not a guarantee that creation will succeed without user interaction or download time.
4. Create sessions only after user activation when creation may initiate a download.
5. Use the `monitor` option during `create()` when the UI needs download progress.
6. Use `AbortController` for cancelable create and run calls, and call `destroy()` when the session is no longer needed.
7. Recreate the session instead of mutating options after creation; session options are fixed per instance.
8. If the feature lives in a cross-origin iframe, require explicit delegation for each API that the frame needs.

**Step 4: Wire UX and fallback behavior**
1. Surface distinct states for missing APIs, unavailable devices, downloadable or downloading models, ready sessions, in-flight generation, and aborted work.
2. Keep a non-AI fallback for unsupported browsers, blocked frames, or devices that do not meet the current preview requirements.
3. Strip or normalize HTML before summarization or rewriting when the source text comes from rendered page content.
4. Use the batch methods when the feature needs the full result before continuing, and use the streaming methods when the UI should reveal output incrementally.
5. Pass `sharedContext` only for persistent session-wide guidance, and pass per-call `context` only for request-specific background detail.
6. Keep language options explicit when the feature depends on supported input, context, or output languages.
7. Do not route generic chatbot, tool-calling, or open-ended assistant tasks through these APIs; switch to the Prompt API or another approved capability when the task is not summarization, writing, or rewriting.

**Step 5: Validate behavior**
1. Execute `node scripts/find-writing-assistance-targets.mjs .` to confirm that the intended app boundary and API markers still resolve to the edited integration surface.
2. Verify feature detection, secure-context checks, and `availability()` behavior before debugging deeper runtime failures.
3. Test at least one batch call and one streaming call when the feature exposes both modes.
4. Confirm that cancellation stops generation cleanly and that destroyed sessions are not reused.
5. If the target environment depends on preview browser flags or channel-specific behavior, confirm the required browser state from `references/compatibility.md` before treating failures as application bugs.
6. Run the workspace build, typecheck, or tests after editing.

## Error Handling
* If `Summarizer`, `Writer`, or `Rewriter` is missing, keep a non-AI fallback and confirm that the environment satisfies the browser and preview requirements before changing product logic.
* If `availability()` returns `downloadable` or `downloading`, require user-driven session creation before promising that generation is ready.
* If `create()` throws `NotAllowedError`, check permissions-policy constraints, missing user activation for downloads, browser policy restrictions, or user rejection.
* If `create()` or a run call throws `NotSupportedError`, align the requested languages, output format, summary type, tone, or length with the browser's supported combinations.
* If a call throws `QuotaExceededError`, shrink `sharedContext`, per-call `context`, or the user input before retrying.
* If the feature must run in a worker or server context, stop and explain that the Writing Assistance APIs are window-only browser APIs.