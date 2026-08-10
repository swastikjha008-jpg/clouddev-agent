export type {
  Task,
  TaskSummary,
  TaskStatus,
  Message as AgentMessage,
  ToolCall,
  ServerEvent,
} from "@clouddev/shared";

import type { TaskStatus } from "@clouddev/shared";

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  PLANNING: "Planning",
  EXECUTING: "Executing",
  BLOCKED_ON_USER: "Needs your input",
  PR_CREATED: "PR opened",
  DONE: "Done",
  FAILED: "Failed",
};

/** UI-only concept — not part of the backend contract. */
export type SandboxTab = "shell" | "browser" | "diff" | "activity";
