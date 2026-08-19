# Declarative WebMCP

Use this file when the page already has a form-centric user flow or when agent-driven submits need to stay visible to the user.

## Form Annotations

1. Add `toolname` to the `<form>` to define the registered tool name.
2. Add `tooldescription` to the `<form>` to describe what the tool does.
3. Add `toolautosubmit` only when the browser should submit the form automatically after the agent populates it.
4. Form controls become tool parameters.

## Parameter Descriptions

1. Use `toolparamdescription` on form-associated elements when a field needs an explicit parameter description.
2. If `toolparamdescription` is absent, the browser preview falls back to the associated `<label>` text.
3. If there is no associated label, the preview falls back to `aria-description`.
4. In the current preview, radio-group-style descriptions may require `toolparamdescription` on the first control in the group.

## Schema Generation In The Preview

1. Text inputs produce string properties.
2. Required form controls map into the schema's `required` list.
3. `<select>` options produce enumerated values, including both machine values and visible titles.
4. Keep form control names stable and descriptive because they become the parameter keys.

## Agent-Invoked Submit Handling

1. The preview adds `agentInvoked` to `SubmitEvent` so the page can detect agent-driven submits.
2. The preview adds `respondWith(Promise<any>)` to `SubmitEvent` so the page can pass the tool result back to the browser agent.
3. Call `preventDefault()` before `respondWith()` when intercepting the default form submission.
4. Return validation errors for agent-invoked submits instead of failing silently.
5. If the form navigates on submit, the resulting document should still reflect the completed action clearly.

## Preview Events And Visual States

1. The preview fires a `toolactivated` event on `window` after an agent populates the form.
2. The preview fires a `toolcancel` event on `window` when the agent cancels or the form resets.
3. The preview applies `:tool-form-active` to the active tool form.
4. The preview applies `:tool-submit-active` to the submit control while the agent-driven form interaction is active.
5. Treat these events and pseudo-classes as preview-only capabilities, not as the portable baseline.

## Cancelling Declarative Execution

1. When an in-page agent invokes a declarative tool with `document.modelContext.executeTool(tool, input, { signal })`, aborting the caller's signal cancels the pending form execution.
2. Handle the rejected execution promise as cancellation. Current Chrome demo and polyfill code checks the caller signal's `aborted` state and stops the agent loop instead of returning the abort as a tool error.
3. Expect the declarative form's active state to be cleaned up and a `toolcancel` event with `toolName` to be dispatched by the current Chrome-compatible implementation.
4. Keep this caller-driven execution signal separate from form reset or tool-registration lifecycle changes, which can also end a declarative invocation.

```js
const controller = new AbortController();
const cancelButton = document.querySelector("#cancel-tool");
const cancelExecution = () => controller.abort();
cancelButton?.addEventListener("click", cancelExecution, { once: true });

try {
  await document.modelContext.executeTool(tool, input, {
    signal: controller.signal,
  });
} catch (error) {
  if (!controller.signal.aborted) {
    throw error;
  }
} finally {
  cancelButton?.removeEventListener("click", cancelExecution);
}
```

## Example

```html
<form toolname="search_tool" tooldescription="Search the web" action="/search">
  <label for="query">Search query</label>
  <input id="query" name="query" type="text" required>
  <button type="submit">Search</button>
</form>
```

## Custom Result Handling Example

```html
<form toolautosubmit toolname="search_tool" tooldescription="Search the web" action="/search">
  <input name="query" type="text">
</form>
<script>
  document.querySelector("form")?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!isValidSearch()) {
      if (event.agentInvoked) {
        event.respondWith({ error: "Provide a valid query." });
      }
      return;
    }

    if (event.agentInvoked) {
      event.respondWith({ content: [{ type: "text", text: "Search complete." }] });
    }
  });
</script>
```

## Authoring Guidance

1. Prefer declarative tools when the browser form already represents the real user workflow.
2. Keep the human-visible form authoritative so user and agent paths stay synchronized.
3. Avoid using declarative tools for flows that depend on hidden state transitions the form does not represent.
4. If the form is not ready for submission until additional UI or business validation completes, keep that validation in page logic and return corrective errors through the agent path.