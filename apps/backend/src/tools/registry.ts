import type { ToolName } from "@clouddev/shared";
import type { ToolSchema } from "../llm/provider.js";
import type { Tool } from "./types.js";
import { shellTools } from "./shell-tools.js";
import { editorTools } from "./editor-tools.js";
import { userTools } from "./user-tools.js";

/**
 * Phase 1 registers Shell + Editor + user-interaction tools only (Section 6
 * build order). LSP/Browser/Deployment/Git/MCP tools get their own
 * `*-tools.ts` files and get added to this list in their respective
 * phases — the agent loop and routes never need to change.
 */
const allTools: Tool[] = [...shellTools, ...editorTools, ...userTools];

export const toolRegistry = new Map<ToolName, Tool>(allTools.map((tool) => [tool.name, tool]));

export function getTool(name: ToolName): Tool | undefined {
  return toolRegistry.get(name);
}

export function buildToolSchemas(): ToolSchema[] {
  return allTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));
}
