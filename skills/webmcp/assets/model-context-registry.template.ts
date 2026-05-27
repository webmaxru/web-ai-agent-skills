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

  for (const tool of tools) {
    modelContext.registerTool(tool, { signal: controller.signal });
    registeredNames.push(tool.name);
  }

  return {
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