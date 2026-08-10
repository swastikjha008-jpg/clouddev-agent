import Docker from "dockerode";
import { env } from "../env.js";

export interface ProvisionedSandbox {
  sessionId: string;
  /** Base URL the SandboxClient talks to, e.g. http://127.0.0.1:34567 */
  baseUrl: string;
}

/**
 * Spawns and tears down the per-task sandbox. Phase 1 implementation runs
 * a plain local Docker container. Phase 3 replaces this with an
 * ECSFargateProvisioner behind the same interface (spin up one Fargate
 * task per session, wire the daemon's URL through the ECS task's public/
 * private IP instead of localhost) — nothing outside this file changes.
 */
export interface SandboxProvisioner {
  provision(sessionId: string): Promise<ProvisionedSandbox>;
  teardown(sessionId: string): Promise<void>;
}

interface TrackedContainer {
  container: Docker.Container;
  port: number;
  idleTimer: NodeJS.Timeout;
  hardTimer: NodeJS.Timeout;
}

export class DockerSandboxProvisioner implements SandboxProvisioner {
  private readonly docker = new Docker();
  private readonly sessions = new Map<string, TrackedContainer>();

  async provision(sessionId: string): Promise<ProvisionedSandbox> {
    const container = await this.docker.createContainer({
      Image: env.SANDBOX_IMAGE,
      name: `clouddev-sandbox-${sessionId}`,
      ExposedPorts: { "7717/tcp": {} },
      HostConfig: {
        PortBindings: { "7717/tcp": [{ HostPort: "0" }] }, // 0 = docker picks a free host port
        AutoRemove: true,
        // Hard resource limits per Section 3.2 — self-managed container, no
        // isolated-VM-per-task product doing this for us.
        Memory: 2 * 1024 * 1024 * 1024, // 2 GiB
        NanoCpus: 1_000_000_000, // 1 vCPU
      },
      Env: [`SESSION_ID=${sessionId}`],
    });

    await container.start();
    const inspect = await container.inspect();
    const hostPort = inspect.NetworkSettings.Ports["7717/tcp"]?.[0]?.HostPort;
    if (!hostPort) {
      throw new Error(`sandbox container for ${sessionId} did not bind a host port`);
    }

    const hardTimer = setTimeout(() => {
      void this.teardown(sessionId);
    }, env.SANDBOX_MAX_RUNTIME_MS);

    const idleTimer = setTimeout(() => {
      void this.teardown(sessionId);
    }, env.SANDBOX_IDLE_TIMEOUT_MS);

    this.sessions.set(sessionId, { container, port: Number(hostPort), idleTimer, hardTimer });

    return { sessionId, baseUrl: `http://127.0.0.1:${hostPort}` };
  }

  /** Call on every tool call so the idle timeout reflects real activity. */
  touch(sessionId: string): void {
    const tracked = this.sessions.get(sessionId);
    if (!tracked) return;
    clearTimeout(tracked.idleTimer);
    tracked.idleTimer = setTimeout(() => {
      void this.teardown(sessionId);
    }, env.SANDBOX_IDLE_TIMEOUT_MS);
  }

  async teardown(sessionId: string): Promise<void> {
    const tracked = this.sessions.get(sessionId);
    if (!tracked) return;
    clearTimeout(tracked.idleTimer);
    clearTimeout(tracked.hardTimer);
    this.sessions.delete(sessionId);
    await tracked.container.stop().catch(() => {
      // AutoRemove handles cleanup even if stop() races an already-dead container.
    });
  }
}

export const sandboxProvisioner: SandboxProvisioner = new DockerSandboxProvisioner();
