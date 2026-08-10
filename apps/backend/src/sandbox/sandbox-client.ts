/**
 * Thin HTTP client for the sandbox-agent daemon (apps/sandbox-agent) that
 * ships inside each session's container. The backend orchestrator never
 * touches Docker/ECS APIs from tool code — tools call this client, and this
 * client is the only thing that knows the daemon's wire format.
 */
export interface ShellStartResult {
  shellId: string;
}

export interface ShellOutputResult {
  shellId: string;
  output: string;
  running: boolean;
  exitCode: number | null;
}

export interface FileReadResult {
  path: string;
  content: string;
}

export interface EditResult {
  path: string;
  content: string;
}

export class SandboxClient {
  constructor(private readonly baseUrl: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`sandbox-agent ${path} failed: ${res.status} ${body}`);
    }
    return (await res.json()) as T;
  }

  // ---- Shell ----

  runShell(command: string, cwd?: string): Promise<ShellStartResult> {
    return this.request("/shell/run", { method: "POST", body: JSON.stringify({ command, cwd }) });
  }

  viewShell(shellId: string): Promise<ShellOutputResult> {
    return this.request(`/shell/${shellId}/output`, { method: "GET" });
  }

  writeToShell(shellId: string, input: string): Promise<{ ok: true }> {
    return this.request(`/shell/${shellId}/stdin`, { method: "POST", body: JSON.stringify({ input }) });
  }

  killShell(shellId: string): Promise<{ ok: true }> {
    return this.request(`/shell/${shellId}/kill`, { method: "POST" });
  }

  // ---- Editor ----

  openFile(path: string): Promise<FileReadResult> {
    return this.request(`/files/open?path=${encodeURIComponent(path)}`, { method: "GET" });
  }

  createFile(path: string, content: string): Promise<EditResult> {
    return this.request("/files/create", { method: "POST", body: JSON.stringify({ path, content }) });
  }

  strReplace(path: string, oldStr: string, newStr: string): Promise<EditResult> {
    return this.request("/files/str-replace", { method: "POST", body: JSON.stringify({ path, oldStr, newStr }) });
  }

  insertAtLine(path: string, line: number, content: string): Promise<EditResult> {
    return this.request("/files/insert-at-line", { method: "POST", body: JSON.stringify({ path, line, content }) });
  }

  undoEdit(path: string): Promise<EditResult> {
    return this.request("/files/undo", { method: "POST", body: JSON.stringify({ path }) });
  }
}
