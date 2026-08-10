import type { Task, TaskSummary } from "./task.js";
import type { Message } from "./message.js";
import type { ToolCall } from "./tool-call.js";

export interface GithubRepo {
  fullName: string;
  private: boolean;
  defaultBranch: string;
  description: string | null;
}

export interface GetReposResponse {
  repos: GithubRepo[];
}

export interface CreateTaskRequest {
  repo: string;
  title: string;
  description: string;
}

export interface CreateTaskResponse {
  taskId: string;
}

export interface GetTaskResponse {
  task: Task;
  messages: Message[];
  toolCalls: ToolCall[];
}

export interface ListTasksResponse {
  tasks: TaskSummary[];
}

export interface PostTaskMessageRequest {
  content: string;
}

export interface ApproveDeployRequest {
  approved: boolean;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
}
