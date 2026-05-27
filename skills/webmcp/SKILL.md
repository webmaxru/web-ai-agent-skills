---
name: webmcp
description: Implements and debugs browser WebMCP integrations in JavaScript or TypeScript web apps. Use when exposing imperative tools through document.modelContext (with a navigator.modelContext fallback), annotating HTML forms for declarative tools, handling agent-invoked form flows, or validating WebMCP behavior in the current Chrome preview. Don't use for server-side MCP servers, REST tool backends, or non-browser providers.
license: MIT
metadata:
  author: webmaxru
  version: "1.3"
---

# WebMCP

## Procedures

**Step 1: Identify the browser integration surface**
1. Inspect the workspace for browser entry points, UI handlers, and any existing app state or form handling layer.
2. Execute `node scripts/find-webmcp-targets.mjs .` to inventory likely frontend files and existing WebMCP markers when a Node runtime is available.
3. If a Node runtime is unavailable, inspect the nearest `package.json`, HTML entry point, and framework bootstrap files manually to identify the browser app boundary.
4. If the workspace contains multiple frontend apps, prefer the app that contains the active route, component, or user-requested feature surface.
5. If the inventory still leaves multiple plausible frontend targets, stop and ask the user which app should receive the WebMCP integration.
6. If the project is not a browser web app, stop and explain that this skill does not apply.

**Step 2: Choose the WebMCP shape**
1. Read `references/webmcp-reference.md` before writing code.
2. Read `references/declarative-api.md` when the feature can be expressed as an HTML form flow or needs agent-invoked submit handling.
3. Read `references/compatibility.md` when native availability, Chrome preview setup, or draft-versus-preview behavior matters.
4. Read `references/troubleshooting.md` when registration, schema serialization, or agent-driven form execution fails.
5. Verify that the integration runs in a secure window browsing context.
6. If the feature must run on the server, in a worker, or headlessly without a visible browsing context, stop and explain the platform limitation.
7. Choose the imperative API when the tool wraps existing JavaScript logic, requires dynamic registration, or needs `ModelContextClient.requestUserInteraction()`.
8. Choose the declarative API when the user flow already maps cleanly to a form submission and the page can keep the human-visible form in sync with agent activity.
9. Keep tool names, descriptions, and parameters explicit and positive, and prefer atomic tools over overlapping variants.

**Step 3: Implement tool registration**
1. Read `assets/model-context-registry.template.ts` and adapt it to the framework, state model, and file layout in the workspace when using the imperative API.
2. Resolve the model context with the feature-detection pattern `const modelContext = document.modelContext || navigator.modelContext;` and guard subsequent registration on its presence. Prefer `document.modelContext` (the current surface) and keep `navigator.modelContext` only as a fallback for older Chrome 146–149 builds.
3. Register imperative tools with `modelContext.registerTool()` using a stable `name` (1–128 ASCII alphanumeric/`_`/`-`/`.` characters), a positive `description`, an object `inputSchema`, and an `execute` callback.
4. Set `annotations.readOnlyHint` to `true` only for tools that do not modify state.
5. Set `annotations.untrustedContentHint` to `true` when the tool's output may contain data from untrusted sources.
6. Validate business rules inside the tool implementation even when the schema is strict, and return descriptive errors that help the agent retry with corrected input.
7. Return tool results only after the UI and application state reflect the tool's effect.
8. If tool availability depends on route, selection, or page state, register tools only while they are valid and unregister stale tools by aborting the `AbortController` whose signal was passed to `registerTool()`; during the Chrome 148 transition window, also call `modelContext.unregisterTool?.()` with optional chaining before aborting.
9. For declarative tools, annotate the target `<form>` with `toolname` and `tooldescription`, and let form controls define the parameter surface.
10. Use labels or `toolparamdescription` to produce clear parameter descriptions for declarative fields.
11. Use `toolautosubmit` only when the page should submit automatically after the agent populates the form.

**Step 4: Wire agent-driven UX safely**
1. Preserve the normal human interaction path even when the page supports agent invocation.
2. When an imperative tool needs explicit confirmation or a user-facing step, call `client.requestUserInteraction()` instead of bypassing the UI.
3. When customizing declarative submit handling, call `preventDefault()` before `respondWith()` and return structured validation errors for agent-invoked submits.
4. Use preview-only events such as `toolactivated`, `toolcancel`, `agentInvoked`, and WebMCP form pseudo-classes only behind compatibility-aware UI logic.
5. Keep destructive or sensitive actions gated behind visible user confirmation, even if the agent can prepare the input.
6. Keep UI state synchronized so the same page accurately reflects changes caused by human input and tool calls.

**Step 5: Validate behavior**
1. Test the register and unregister lifecycle, including duplicate-name protection and cleanup on route or state changes.
2. Test invalid or incomplete inputs to confirm the tool returns corrective errors instead of silently failing.
3. For declarative tools, verify generated parameter descriptions, required fields, submit behavior, and any custom `respondWith()` handling.
4. If the target environment is the current Chrome preview, confirm the required version and flag state from `references/compatibility.md` before treating runtime failures as application bugs.
5. Use the Model Context Tool Inspector or equivalent preview tooling only as a validation aid, not as a runtime dependency.
6. Validate deterministic execution first by inspecting the registered tool set and manually invoking the tool with representative arguments when preview tooling is available.
7. After deterministic execution is correct, validate natural-language routing so descriptions and parameter shapes guide the agent toward the correct tool.
8. Run the workspace build, typecheck, or tests after editing.

## Error Handling
* If both `document.modelContext` and `navigator.modelContext` are missing, confirm the code is running in a secure browser window context and then check the preview requirements in `references/compatibility.md`.
* If only `navigator.modelContext` is present, the page is running on an older Chrome 146–149 preview build; keep the `document.modelContext || navigator.modelContext` fallback in place but plan to drop `navigator.modelContext` once the deprecation window closes.
* If `registerTool()` throws `InvalidStateError`, check for duplicate names, empty `name` or `description` values, or tool names that exceed 128 characters or contain disallowed characters (only ASCII alphanumeric, `_`, `-`, `.` are allowed).
* If `registerTool()` throws `NotAllowedError`, check whether the `tools` Permissions Policy feature is denied; cross-origin iframes need `allow="tools"` from the embedding document.
* If `registerTool()` throws `TypeError` or JSON serialization errors, replace non-serializable or circular `inputSchema` values with plain JSON-compatible objects.
* If an older demo or article references `provideContext`, `clearContext`, or `toolparamtitle`, treat those surfaces as obsolete for current implementations.
* If declarative execution does not update the page correctly, read `references/declarative-api.md` and `references/troubleshooting.md` before changing the tool contract.