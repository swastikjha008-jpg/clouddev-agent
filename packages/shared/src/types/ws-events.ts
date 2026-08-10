import type { TaskStatus } from "./task.js";
import type { Message } from "./message.js";
import type { ToolCall, ToolName } from "./tool-call.js";

/**
 * One WebSocket connection per task: `/ws/tasks/:id`.
 * These are the only server -> client event shapes. Add new variants here
 * first — both frontend and backend import this union, so it can't drift.
 */
export type ServerEvent =
  | { type: "agent_message"; taskId: string; message: Message }
  | { type: "tool_call_started"; taskId: string; toolCall: ToolCall }
  | { type: "tool_call_result"; taskId: string; toolCall: ToolCall }
  | {
      type: "shell_output";
      taskId: string;
      shellId: string;
      /** Incremental chunk — client appends, does not replace. */
      chunk: string;
      stream: "stdout" | "stderr";
    }
  | { type: "status_changed"; taskId: string; status: TaskStatus; previousStatus: TaskStatus }
  | { type: "pr_created"; taskId: string; prUrl: string; prNumber: number };

export type ServerEventType = ServerEvent["type"];

/** Narrow a ServerEvent by its `type` discriminant. */
export type ServerEventOf<T extends ServerEventType> = Extract<ServerEvent, { type: T }>;

/** Tool names that stream `shell_output` events while running. */
export const SHELL_STREAMING_TOOLS: readonly ToolName[] = ["run_shell", "view_shell"];
