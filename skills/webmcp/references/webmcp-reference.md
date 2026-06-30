# WebMCP Reference

Use this file for the core contract before editing code.

## Precedence

1. Prefer current preview implementation behavior over the broader specification when they differ.
2. Use the broader specification to fill gaps where preview materials or implementations are silent.
3. Record implementation-specific differences in `references/compatibility.md` instead of flattening them into the generic API contract.

## What WebMCP Is

1. WebMCP is a proposed web standard for exposing structured browser-side tools to AI agents on existing websites.
2. It is inspired by MCP, but it runs inside the page rather than requiring a separate server-hosted MCP service.
3. The goal is to replace fragile screen-scraping with explicit tool declarations, structured input schemas, and shared page context.

## Interaction Contract

1. WebMCP gives agents a discovery surface for the tools a page currently supports.
2. WebMCP uses structured schemas so the page can declare expected inputs explicitly.
3. WebMCP depends on current page state so agents act against the visible resources and workflows that the user can also inspect.

## Core Exposure Model

1. WebMCP is exposed through `document.modelContext`.
2. `document.modelContext` is a secure-context, window-only API and is scoped per-`Document`.
3. `Document` exposes a `modelContext` getter that returns a `ModelContext` instance for that document.
4. The earlier `navigator.modelContext` getter is deprecated as of Chrome `150.0.7861.0` and will be removed in a future Chrome release; it remains available for now so older preview builds keep working.
5. Use the feature-detection pattern `const modelContext = document.modelContext || navigator.modelContext;` so the same code works on Chrome 150+ and on older 146–149 builds during the transition window. Background: WebML CG [issue 173](https://github.com/webmachinelearning/webmcp/issues/173), spec [PR #184](https://github.com/webmachinelearning/webmcp/pull/184), and demo migration in [GoogleChromeLabs/webmcp-tools PR #189](https://github.com/GoogleChromeLabs/webmcp-tools/pull/189/changes).

## Imperative API

1. Resolve the context once per document with `const modelContext = document.modelContext || navigator.modelContext;` and then call `modelContext.registerTool(tool)` to add one tool without clearing the existing set. Starting in Chrome 148, `registerTool()` accepts an optional `{ signal: AbortSignal }` second argument; aborting the signal unregisters the tool. Starting in Chrome `151.0.7922.0`, `registerTool()` returns a `Promise<void>`; `await` it inside a `try`/`catch` (`await modelContext.registerTool(tool)`). `await` keeps the same code working on older builds that registered synchronously, and the Promise resolves only once the tool is actually available to `getTools()` in other documents across the frame tree.
2. To unregister a tool, first call `modelContext.unregisterTool?.(name)` with optional chaining (for browsers that still support it), then abort the `AbortController` whose signal was passed to `registerTool()`. This order ensures cleanup across both old and new browsers during the transition period.
3. The `ModelContextTool` contract includes:
   `name`: unique tool identifier (required). Must be 1–128 characters using only ASCII alphanumeric characters, `_`, `-`, and `.`.
   `title`: optional `USVString` human-readable label shown in user-agent UI; should be localized; does not affect agent routing.
   `description`: natural-language description of what the tool does and when to use it (required).
   `inputSchema`: optional JSON Schema object describing the expected input; omit when the tool takes no structured input.
   `execute`: callback invoked with the input object and a `ModelContextClient` (required).
   `annotations.readOnlyHint`: optional boolean, defaulting to false, indicating that the tool does not modify state.
   `annotations.untrustedContentHint`: optional boolean, defaulting to false, indicating that the tool's output contains data untrusted by the registering author.
4. The `ToolExecuteCallback` signature is `(input: object, client: ModelContextClient) => Promise<any>` and may be asynchronous.
5. The `ModelContextClient` exposes `requestUserInteraction(callback)` for tool flows that need explicit user interaction. The `callback` is a `UserInteractionCallback`, a zero-argument async function `() => Promise<any>` that performs the user-facing step and resolves with the interaction result.
6. Imperative tools can return structured tool output after the page has updated, including content-oriented payloads that the agent can read.

## Registration Semantics

1. Tool names must be unique within the current model context.
2. `registerTool()` throws `InvalidStateError` if a tool with the same name already exists.
3. `registerTool()` throws `InvalidStateError` if `name` is the empty string, exceeds 128 characters, or contains characters other than ASCII alphanumeric, `_`, `-`, or `.`.
4. `registerTool()` throws `InvalidStateError` if `description` is the empty string.
5. `registerTool()` throws `NotAllowedError` if the document is not allowed to use the `tools` Permissions Policy feature. The default allowlist is `'self'`; cross-origin iframes must be explicitly granted this feature.
6. When `inputSchema` exists, the current draft serializes it with JSON stringification semantics.
7. Non-serializable or circular `inputSchema` values can throw `TypeError` or re-throw JSON serialization errors.
8. `unregisterTool()` is removed starting Chrome 148; use the `AbortSignal` passed to `registerTool()` to control tool lifetime. During the transition window, call `unregisterTool?.()` with optional chaining before aborting the controller so both old and new browsers handle the cleanup.
9. If the `AbortSignal` passed to `registerTool()` is already aborted at the time of the call, the browser silently skips registration and returns without throwing an error; it may optionally log a warning to the console. The tool will not appear in the registered tool set.
10. The second argument to `registerTool()` also accepts `exposedTo`: an array of origin URL strings that control which documents in the page tree can see the tool. Each origin must be potentially trustworthy; passing an invalid or non-trustworthy origin throws `SecurityError`.
11. Starting in Chrome `151.0.7922.0`, `registerTool()` returns a `Promise<void>` that resolves once the tool is registered across the frame tree and is visible to `getTools()` in other documents. Earlier builds returned `void` synchronously. Cross-origin iframe integration shares tools across the frame tree, which makes registration fundamentally asynchronous even though the failure conditions remain locally known.
12. The failure conditions above are known synchronously (they depend only on the local per-document tool cache), but they may surface either as a synchronous throw or as a Promise rejection depending on the build. Await `registerTool()` inside a `try`/`catch` so both paths are caught; this also stays forward compatible with future asynchronous failure cases. Background: WebML CG [issue 175](https://github.com/webmachinelearning/webmcp/issues/175) and demo migration in [GoogleChromeLabs/webmcp-tools PR #228](https://github.com/GoogleChromeLabs/webmcp-tools/pull/228).

## Events

1. `ModelContext` fires a `toolchange` event (via `ontoolchange`) whenever a tool is registered or unregistered in the current model context.
2. `toolchange` fires on the `ModelContext` of the registering document and propagates to same-origin or explicitly exposed-to documents in the same page tree.
3. The timing of `toolchange` relative to tasks queued after `registerTool()` is not guaranteed; treat it as asynchronous notification only.
4. `toolactivated`, `toolcancel`, and the declarative pseudo-classes are preview-only events distinct from `toolchange`; see `references/declarative-api.md` and `references/compatibility.md`.

## Declarative API

1. Current implementations use a declarative form-based API built around `toolname`, `tooldescription`, and related form annotations.
2. Declarative WebMCP is still evolving and is not as fully specified as the imperative surface.
3. Treat declarative form behaviors as preview guidance that should be isolated behind compatibility-aware code and validation.
4. Declarative tools should model the real visible workflow instead of inventing a separate hidden agent-only interaction path.

## Authoring Principles

1. Use specific names that describe execution clearly.
2. Write positive descriptions that explain what the tool does and when it should be used.
3. Accept raw user input where possible instead of forcing the agent to transform values.
4. Validate loosely in schema and strictly in code so failures can produce corrective error messages.
5. Keep tools atomic and composable instead of creating multiple overlapping variants.
6. Register tools only while they match the current page state.
7. Return after the UI is updated so the agent can verify the effect in the visible page.
8. Prefer explicit business semantics in parameters such as user-facing enums or raw user values instead of opaque identifiers or computed transforms.

## Current Draft Gaps

1. Declarative WebMCP is not yet as completely specified as the imperative API.
2. `requestUserInteraction()` is defined at a high level, but some algorithmic details are still sparse.
3. Security, privacy, and accessibility guidance exists, but it remains relatively high level.