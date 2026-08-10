import { sandboxProvisioner } from "../sandbox/docker-manager.js";
import { SandboxClient } from "../sandbox/sandbox-client.js";

const clients = new Map<string, SandboxClient>();

/** Lazily provisions (or reuses) the sandbox container backing a task. */
export async function getSandboxClient(taskId: string): Promise<SandboxClient> {
  const existing = clients.get(taskId);
  if (existing) return existing;

  const { baseUrl } = await sandboxProvisioner.provision(taskId);
  const client = new SandboxClient(baseUrl);
  clients.set(taskId, client);
  return client;
}

export async function releaseSandbox(taskId: string): Promise<void> {
  clients.delete(taskId);
  await sandboxProvisioner.teardown(taskId);
}
