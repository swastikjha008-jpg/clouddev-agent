import { randomUUID } from "node:crypto";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

interface TrackedShell {
  process: ChildProcessWithoutNullStreams;
  output: string[];
  running: boolean;
  exitCode: number | null;
}

export interface ShellOutput {
  shellId: string;
  output: string;
  running: boolean;
  exitCode: number | null;
}

/**
 * Tracks shell processes by ID so a long-running command (a dev server,
 * `npm install`) never blocks the orchestrator's request — it starts the
 * process here and polls output separately via getOutput().
 */
export class ShellManager {
  private readonly shells = new Map<string, TrackedShell>();

  run(command: string, cwd?: string): string {
    const shellId = randomUUID();
    const child = spawn("bash", ["-lc", command], {
      cwd: cwd ?? process.env.WORKSPACE_DIR ?? "/workspace",
      env: process.env,
    });

    const tracked: TrackedShell = { process: child, output: [], running: true, exitCode: null };
    this.shells.set(shellId, tracked);

    child.stdout.on("data", (chunk: Buffer) => tracked.output.push(chunk.toString("utf8")));
    child.stderr.on("data", (chunk: Buffer) => tracked.output.push(chunk.toString("utf8")));
    child.on("exit", (code) => {
      tracked.running = false;
      tracked.exitCode = code;
    });
    child.on("error", (err) => {
      tracked.running = false;
      tracked.output.push(`\n[shell error] ${err.message}\n`);
    });

    return shellId;
  }

  getOutput(shellId: string): ShellOutput {
    const tracked = this.mustGet(shellId);
    return {
      shellId,
      output: tracked.output.join(""),
      running: tracked.running,
      exitCode: tracked.exitCode,
    };
  }

  writeStdin(shellId: string, input: string): void {
    const tracked = this.mustGet(shellId);
    if (!tracked.running) {
      throw new Error(`shell ${shellId} is not running`);
    }
    tracked.process.stdin.write(`${input}\n`);
  }

  kill(shellId: string): void {
    const tracked = this.mustGet(shellId);
    if (tracked.running) {
      tracked.process.kill("SIGTERM");
    }
  }

  private mustGet(shellId: string): TrackedShell {
    const tracked = this.shells.get(shellId);
    if (!tracked) {
      throw new Error(`unknown shell id: ${shellId}`);
    }
    return tracked;
  }
}
