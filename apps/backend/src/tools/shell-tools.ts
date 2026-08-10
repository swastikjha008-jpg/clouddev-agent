import type { Tool } from "./types.js";

export const runShellTool: Tool = {
  name: "run_shell",
  description:
    "Start a shell command as a persistent, ID-based process inside the sandbox. Does not block on long-running commands (e.g. `npm run dev`) — use view_shell to poll output.",
  parameters: {
    type: "object",
    properties: {
      command: { type: "string", description: "The shell command to run." },
      cwd: { type: "string", description: "Working directory, relative to the repo root. Defaults to repo root." },
    },
    required: ["command"],
  },
  async execute(args, ctx) {
    const command = String(args.command);
    const cwd = typeof args.cwd === "string" ? args.cwd : undefined;
    const { shellId } = await ctx.sandbox.runShell(command, cwd);
    return { shellId };
  },
};

export const viewShellTool: Tool = {
  name: "view_shell",
  description: "Get the output (and running/exit status) of a shell process started by run_shell.",
  parameters: {
    type: "object",
    properties: {
      shellId: { type: "string", description: "The shell process id returned by run_shell." },
    },
    required: ["shellId"],
  },
  async execute(args, ctx) {
    const shellId = String(args.shellId);
    const result = await ctx.sandbox.viewShell(shellId);
    return { ...result };
  },
};

export const writeToShellTool: Tool = {
  name: "write_to_shell",
  description: "Send stdin to a running shell process (e.g. answering an interactive prompt).",
  parameters: {
    type: "object",
    properties: {
      shellId: { type: "string", description: "The shell process id." },
      input: { type: "string", description: "Text to write to stdin, without a trailing newline." },
    },
    required: ["shellId", "input"],
  },
  async execute(args, ctx) {
    const shellId = String(args.shellId);
    const input = String(args.input);
    await ctx.sandbox.writeToShell(shellId, input);
    return { ok: true };
  },
};

export const killShellTool: Tool = {
  name: "kill_shell",
  description: "Kill a running shell process.",
  parameters: {
    type: "object",
    properties: {
      shellId: { type: "string", description: "The shell process id." },
    },
    required: ["shellId"],
  },
  async execute(args, ctx) {
    const shellId = String(args.shellId);
    await ctx.sandbox.killShell(shellId);
    return { ok: true };
  },
};

export const shellTools: Tool[] = [runShellTool, viewShellTool, writeToShellTool, killShellTool];
