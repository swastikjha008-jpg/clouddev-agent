import type { ServerEvent, ToolName } from "@clouddev/shared";
import type { SandboxClient } from "../sandbox/sandbox-client.js";
import type { ToolParameterSchema } from "../llm/provider.js";

export interface ToolContext {
  taskId: string;
  sandbox: SandboxClient;
  publish: (event: ServerEvent) => void;
  /**
   * Set by the `message_user`/`wait` tools to signal the agent loop that it
   * should stop iterating after this tool call (block on user input) rather
   * than immediately calling the LLM again.
   */
  requestPause: () => void;
}

/** Whatever the tool returns is what the LLM sees on its next turn as the function result. */
export type ToolResult = Record<string, unknown>;

export interface Tool {
  name: ToolName;
  description: string;
  parameters: ToolParameterSchema;
  execute(args: Record<string, unknown>, ctx: ToolContext): Promise<ToolResult>;
}
