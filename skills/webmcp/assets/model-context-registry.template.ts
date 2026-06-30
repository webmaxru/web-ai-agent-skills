type JsonSchema = Record<string, unknown>;

type ToolResult = unknown;

type ToolContextClient = {
  requestUserInteraction(callback: () => Promise<unknown>): Promise<unknown>;
};

type ToolDefinition = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: JsonSchema;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute(input: Record<string, unknown>, client: ToolContextClient): Promise<ToolResult> | ToolResult;
};

type ModelContext = NonNullable<Document["modelContext"]> | NonNullable<Navigator["modelContext"]>;

function assertModelContext(): ModelContext {
  // Chrome 150+ exposes `document.modelContext`; older 146-149 previews used
  // `navigator.modelContext`, which is deprecated and will be removed.
  const modelContext =
    (typeof document !== "undefined" && document.modelContext) ||
    (typeof navigator !== "undefined" && navigator.modelContext) ||
    null;

  if (!modelContext) {
    throw new Error("WebMCP is unavailable in this browser context.");
  }

  return modelContext as ModelContext;
}

export function registerWebMcpTools(tools: ToolDefinition[]) {
  const modelContext = assertModelContext();
  const controller = new AbortController();
  const registeredNames: string[] = [];

  // Registration is asynchronous on Chrome 151+: `registerTool()` returns a
  // Promise that resolves once the tool is visible to getTools() across the
  // frame tree. `await` stays backward compatible with older builds that
  // returned void synchronously, and the try/catch handles both synchronous
  // throws (older builds, locally-known failures) and Promise rejections
  // (Chrome 151+ asynchronous failures). `dispose()` stays synchronous so it
  // can be used directly as framework effect cleanup while registration is
  // still settling; await `ready` when you need registration to be complete.
  const ready = (async () => {
    for (const tool of tools) {
      try {
        await modelContext.registerTool(tool, { signal: controller.signal });
        registeredNames.push(tool.name);
      } catch (error) {
        console.error(`Failed to register WebMCP tool "${tool.name}":`, error);
      }
    }
  })();

  return {
    ready,
    dispose() {
      // Transitional: unregisterTool is removed in Chrome 148+; signal abort handles unregistration.
      // Call both during the transition window for cross-version compatibility.
      for (const name of registeredNames.splice(0).reverse()) {
        try {
          modelContext.unregisterTool?.(name);
        } catch {
          // Ignore stale cleanup during route transitions.
        }
      }
      controller.abort();
    },
  };
}

export async function requestConfirmedAction(
  client: ToolContextClient,
  callback: () => Promise<ToolResult>,
) {
  return client.requestUserInteraction(async () => callback());
}