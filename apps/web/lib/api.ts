import type {
  ApiErrorResponse,
  ApproveDeployRequest,
  CreateTaskRequest,
  CreateTaskResponse,
  GetReposResponse,
  GetTaskResponse,
  ListTasksResponse,
  PostTaskMessageRequest,
} from "@clouddev/shared";

/**
 * Base URL of apps/backend. Phase 1 has no real auth (see
 * apps/backend/src/plugins/dev-auth.ts) — every request here is
 * attributed to a single dev-local user server-side, so no auth header
 * is sent from the client yet.
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
}

/** Same host as the API, with http(s) swapped for ws(s) — one env var to configure both. */
export function getWsBaseUrl(): string {
  return getApiBaseUrl().replace(/^http/, "ws");
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Partial<ApiErrorResponse>;
    throw new ApiError(body.message ?? `Request to ${path} failed with ${res.status}`, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export function listTasks(): Promise<ListTasksResponse> {
  return request("/tasks");
}

export function getTask(taskId: string): Promise<GetTaskResponse> {
  return request(`/tasks/${taskId}`);
}

export function createTask(body: CreateTaskRequest): Promise<CreateTaskResponse> {
  return request("/tasks", { method: "POST", body: JSON.stringify(body) });
}

export function postTaskMessage(taskId: string, content: string): Promise<{ accepted: boolean }> {
  const body: PostTaskMessageRequest = { content };
  return request(`/tasks/${taskId}/messages`, { method: "POST", body: JSON.stringify(body) });
}

export function approveDeploy(taskId: string, approved: boolean): Promise<{ accepted: boolean }> {
  const body: ApproveDeployRequest = { approved };
  return request(`/tasks/${taskId}/approve-deploy`, { method: "POST", body: JSON.stringify(body) });
}

export function getRepos(): Promise<GetReposResponse> {
  return request("/repos");
}
