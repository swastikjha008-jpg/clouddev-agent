/**
 * Task state machine:
 *
 *   PLANNING -> EXECUTING -> BLOCKED_ON_USER -> EXECUTING -> PR_CREATED -> DONE
 *                         \-> FAILED
 *
 * EXECUTING and BLOCKED_ON_USER can cycle multiple times before the task
 * resolves into PR_CREATED/DONE or FAILED.
 */
export const TASK_STATUSES = [
  "PLANNING",
  "EXECUTING",
  "BLOCKED_ON_USER",
  "PR_CREATED",
  "DONE",
  "FAILED",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Terminal states the agent loop will not resume from. */
export const TERMINAL_TASK_STATUSES: readonly TaskStatus[] = ["DONE", "FAILED"];

export interface Task {
  id: string;
  userId: string;
  repoFullName: string;
  title: string;
  description: string;
  status: TaskStatus;
  /** Set once a preview/deploy is pending explicit user approval. */
  pendingDeployApproval: boolean;
  /** Set once git_create_pr succeeds (status moves to PR_CREATED). */
  prUrl: string | null;
  prNumber: number | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskSummary = Pick<
  Task,
  "id" | "repoFullName" | "title" | "status" | "prUrl" | "prNumber" | "createdAt" | "updatedAt"
>;
