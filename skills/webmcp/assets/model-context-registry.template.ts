type JsonSchema = Record<string, unknown>;

type ToolResult = unknown;

type ToolExecuteOptions = {
  signal: AbortSignal;
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
  execute(
    input: Record<string, unknown>,
    options: ToolExecuteOptions,
  ): Promise<ToolResult> | ToolResult;
};

type ModelContext =
  | NonNullable<Document["modelContext"]>
  | NonNullable<Navigator["modelContext"]>;

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
  // frame tree. Each tool keeps its own try/catch so one failure does not block
  // independent registrations. Tool callbacks receive a separate execution
  // signal on Chrome 153+; aborting this controller only controls registration.
  const ready = Promise.all(
    tools.map(async (tool) => {
      try {
        await modelContext.registerTool(tool, { signal: controller.signal });
        registeredNames.push(tool.name);
      } catch (error) {
        console.error(`Failed to register WebMCP tool "${tool.name}":`, error);
      }
    }),
  ).then(() => {});

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