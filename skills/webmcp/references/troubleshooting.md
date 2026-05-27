# WebMCP Troubleshooting

## `document.modelContext` (and `navigator.modelContext`) is undefined

1. Resolve the context with the feature-detection pattern `const modelContext = document.modelContext || navigator.modelContext;` instead of reading either property directly.
2. Confirm the code runs in a browser window context, not on the server.
3. Confirm the page is in a secure context.
4. Confirm the target Chrome build meets the preview version requirement.
5. Confirm `chrome://flags/#enable-webmcp-testing` is enabled when using the preview.
6. If only `navigator.modelContext` is present, the page is running on Chrome 146\u2013149; the deprecated `navigator.modelContext` fallback in the pattern above will pick it up. On Chrome 150+, prefer `document.modelContext`.
7. If the feature must run in a worker or headlessly, stop and redirect the design because WebMCP does not support that mode.

## `registerTool()` throws `InvalidStateError`

1. Check whether the tool name is already registered.
2. Check whether `name` is an empty string.
3. Check whether `name` exceeds 128 characters or contains characters other than ASCII alphanumeric, `_`, `-`, or `.`.
4. Check whether `description` is an empty string.
5. If the route or page state changes, unregister stale tools before registering replacements.

## `registerTool()` throws `NotAllowedError`

1. Check whether the page is running in a cross-origin iframe that has not been granted the `tools` Permissions Policy feature.
2. The `tools` feature defaults to `'self'`; the embedding document must include `allow="tools"` on the iframe for cross-origin frames to call `registerTool()`.
3. Verify that the registering document is the expected top-level origin or a same-origin frame.

## `registerTool()` throws `SecurityError`

1. Check the `exposedTo` array for origins that are not potentially trustworthy (e.g., `http://` addresses other than localhost, or malformed URLs).
2. Replace any non-trustworthy origin strings with valid HTTPS origins or remove the `exposedTo` option to default to same-origin visibility only.

## Tool registered with `AbortSignal` does not appear

1. Check that the `AbortController` has not been aborted before `registerTool()` is called.
2. When the signal is already aborted at registration time, the browser silently skips registration without throwing an error; the tool will not appear in the registered tool set.
3. Create a fresh `AbortController` after any prior cleanup, and only abort it when removing the tool, not before registration.

## `registerTool()` throws `TypeError` or serialization errors

1. Check that `inputSchema` is plain JSON-compatible data.
2. Remove circular references from `inputSchema`.
3. Remove custom serialization logic that returns `undefined` or non-JSON values.
4. Reduce the schema to a minimal plain object, then add properties back incrementally.

## Imperative tool runs but the page stays stale

1. Update the UI and application state before resolving the tool result.
2. Confirm that async state updates complete before the tool returns.
3. Keep the human path and agent path on the same state transition logic rather than duplicating side effects.

## Declarative form is not behaving as a tool

1. Check that the `<form>` has both `toolname` and `tooldescription`.
2. Check that the form controls have stable `name` attributes.
3. Check that labels or `toolparamdescription` exist for fields that need clear parameter descriptions.
4. If using custom submit handling, call `preventDefault()` before `respondWith()`.
5. Return explicit validation errors for agent-invoked submits instead of relying only on HTML validation UI.

## Agent-invoked submit does not return useful output

1. Confirm the code only calls `respondWith()` for the agent-driven path.
2. Return descriptive, structured results or corrective errors rather than empty values.
3. If the page redirects after submit, verify that the resulting document still reflects the completed action.

## Preview-only events or styles are missing

1. Check whether the implementation actually targets the current Chrome preview.
2. Treat `toolactivated`, `toolcancel`, `agentInvoked`, `:tool-form-active`, and `:tool-submit-active` as preview-only behavior.
3. Do not make core application logic depend exclusively on those preview signals.

## Old examples mention removed APIs

1. Remove any use of `provideContext` or `clearContext`.
2. Remove any use of `toolparamtitle`.
3. Align the integration with the current WebMCP surface instead of reviving removed names.

## Deterministic validation is hard

1. Use the Model Context Tool Inspector to inspect the registered tool set and invoke tools manually.
2. Test imperative and declarative flows without an LLM before optimizing descriptions for natural-language routing.
3. After manual validation passes, test with an agent to refine descriptions and parameter design.