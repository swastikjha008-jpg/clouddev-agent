/**
 * Every tool the agent can invoke, grouped by category (Section 3.3 of the
 * build brief). Keep this list in sync with the tool registry in
 * apps/backend/src/tools — it is the contract the frontend's live "agent is
 * working" feed renders against.
 */
export const TOOL_NAMES = [
  // Shell
  "run_shell",
  "view_shell",
  "write_to_shell",
  "kill_shell",
  // Editor
  "open_file",
  "str_replace",
  "create_file",
  "undo_edit",
  "insert_at_line",
  "find_and_edit",
  // LSP (phase 3+)
  "go_to_definition",
  "go_to_references",
  "hover_symbol",
  // Browser (phase 4)
  "navigate_browser",
  "view_browser",
  "click_browser",
  "type_browser",
  "scroll_browser",
  "press_key_browser",
  "select_option_browser",
  "move_mouse",
  "restart_browser",
  "browser_console",
  "set_mobile_browser",
  // Deployment (phase 4)
  "deploy_frontend",
  "deploy_backend",
  "expose_port",
  // User interaction
  "message_user",
  "wait",
  "list_secrets",
  // Git/GitHub (phase 2)
  "git_view_pr",
  "git_create_pr",
  "git_update_pr_description",
  "git_pr_checks",
  "git_list_repos",
  // MCP (phase 4, lowest priority)
  "mcp_server_list",
  "mcp_tool_list",
  "mcp_tool_call",
  "mcp_resource_read",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export type ToolCallStatus = "running" | "succeeded" | "failed";

export interface ToolCall {
  id: string;
  taskId: string;
  toolName: ToolName;
  args: Record<string, unknown>;
  result: Record<string, unknown> | null;
  status: ToolCallStatus;
  startedAt: string;
  finishedAt: string | null;
}
