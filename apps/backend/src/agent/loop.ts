import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import type { TaskStatus, ToolName } from "@clouddev/shared";
import { TERMINAL_TASK_STATUSES } from "@clouddev/shared";
import { prisma } from "../db/client.js";
import { toTaskDto, toMessageDto } from "../db/mappers.js";
import { buildToolSchemas, getTool } from "../tools/registry.js";
import type { ToolContext } from "../tools/types.js";
import type { SandboxClient } from "../sandbox/sandbox-client.js";
import { buildSystemPrompt } from "./system-prompt.js";
import { buildLlmHistory } from "./history.js";
import { GeminiProvider } from "../llm/gemini-provider.js";
import type { LLMProvider, ToolCallRequest } from "../llm/provider.js";
import { eventBus } from "../pubsub/bus.js";
import { getSandboxClient, releaseSandbox } from "./session-manager.js";
import { env } from "../env.js";

/** Hard cap on tool-call/LLM round trips per runAgentLoop() invocation — not
 * per task. A task can span many invocations (each resumption after
 * BLOCKED_ON_USER calls this again), so this guards against one runaway
 * invocation, not total task length. */
const MAX_ITERATIONS_PER_INVOCATION = 25;

const llmProvider: LLMProvider = new GeminiProvider(env.GEMINI_API_KEY, env.GEMINI_MODEL);

/**
 * Tracks how much of each shell's output has already been broadcast, so
 * `shell_output` events carry only the new suffix. Keyed by `taskId:shellId`.
 * The sandbox-agent daemon itself has no push/streaming model in Phase 1
 * (view_shell is a plain poll that returns the full buffer) — this is what
 * turns that polling result into a real incremental stream for the
 * frontend's terminal view without changing the daemon.
 */
const shellOutputCursor = new Map<string, number>();

function clearShellOutputTracking(taskId: string): void {
  for (const key of shellOutputCursor.keys()) {
    if (key.startsWith(`${taskId}:`)) {
      shellOutputCursor.delete(key);
    }
  }
}

function publishShellOutputDelta(taskId: string, toolName: string, result: Record<string, unknown>): void {
  if (toolName !== "run_shell" && toolName !== "view_shell") return;
  const shellId = typeof result.shellId === "string" ? result.shellId : undefined;
  const output = typeof result.output === "string" ? result.output : undefined;
  if (!shellId || output === undefined) return;

  const key = `${taskId}:${shellId}`;
  const previousLength = shellOutputCursor.get(key) ?? 0;
  if (output.length <= previousLength) return; // nothing new, or shell was re-run and buffer reset

  const chunk = output.slice(previousLength);
  shellOutputCursor.set(key, output.length);
  eventBus.publish(taskId, { type: "shell_output", taskId, shellId, chunk, stream: "stdout" });
}

async function setStatus(taskId: string, status: TaskStatus): Promise<void> {
  const current = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  if (current.status === status) return;
  await prisma.task.update({ where: { id: taskId }, data: { status } });
  eventBus.publish(taskId, { type: "status_changed", taskId, status, previousStatus: current.status });
}

async function failTask(taskId: string, reason: string): Promise<void> {
  const message = await prisma.message.create({
    data: { taskId, role: "agent", content: reason, blockOnUserResponse: "NONE" },
  });
  eventBus.publish(taskId, { type: "agent_message", taskId, message: toMessageDto(message) });
  await setStatus(taskId, "FAILED");
  await releaseSandbox(taskId).catch(() => undefined);
  clearShellOutputTracking(taskId);
}

/**
 * Executes one tool call end-to-end: persists the ToolCall row, runs it,
 * persists the result, and (for message_user) mirrors it into the Message
 * table for the frontend chat panel. Returns whether the loop should pause
 * after this batch of calls (i.e. wait for the user).
 */
async function executeToolCall(taskId: string, sandbox: SandboxClient, call: ToolCallRequest): Promise<boolean> {
  const tool = getTool(call.name as ToolName);

  const persistedArgs: Prisma.InputJsonValue = call.providerMetadata
    ? ({ ...call.args, __providerMetadata: call.providerMetadata } as Prisma.InputJsonValue)
    : (call.args as Prisma.InputJsonValue);

  const toolCallRow = await prisma.toolCall.create({
    data: { taskId, toolName: call.name, args: persistedArgs, status: "running" },
  });
  eventBus.publish(taskId, {
    type: "tool_call_started",
    taskId,
    toolCall: {
      id: toolCallRow.id,
      taskId,
      toolName: call.name as ToolName,
      args: call.args,
      result: null,
      status: "running",
      startedAt: toolCallRow.startedAt.toISOString(),
      finishedAt: null,
    },
  });

  let pauseRequested = false;
  const ctx: ToolContext = {
    taskId,
    sandbox,
    publish: (event) => eventBus.publish(taskId, event),
    requestPause: () => {
      pauseRequested = true;
    },
  };

  let status: "succeeded" | "failed" = "succeeded";
  let result: Record<string, unknown>;
  try {
    if (!tool) {
      throw new Error(`Unknown tool: ${call.name}`);
    }
    result = await tool.execute(call.args, ctx);
  } catch (err) {
    status = "failed";
    result = { error: err instanceof Error ? err.message : String(err) };
  }

  const updated = await prisma.toolCall.update({
    where: { id: toolCallRow.id },
    data: { status, result: result as Prisma.InputJsonValue, finishedAt: new Date() },
  });
  eventBus.publish(taskId, {
    type: "tool_call_result",
    taskId,
    toolCall: {
      id: updated.id,
      taskId,
      toolName: call.name as ToolName,
      args: call.args,
      result,
      status,
      startedAt: updated.startedAt.toISOString(),
      finishedAt: updated.finishedAt!.toISOString(),
    },
  });

  if (status === "succeeded") {
    publishShellOutputDelta(taskId, call.name, result);
  }

  if (call.name === "message_user") {
    const content = typeof call.args.content === "string" ? call.args.content : "";
    const blockOnUserResponse =
      call.args.block_on_user_response === "BLOCK" || call.args.block_on_user_response === "DONE"
        ? call.args.block_on_user_response
        : "NONE";
    const messageRow = await prisma.message.create({
      data: { taskId, role: "agent", content, blockOnUserResponse },
    });
    eventBus.publish(taskId, { type: "agent_message", taskId, message: toMessageDto(messageRow) });
  }

  // Phase 2: git_create_pr moves the task into PR_CREATED and fires pr_created.
  if (call.name === "git_create_pr" && status === "succeeded") {
    const prUrl = typeof result.prUrl === "string" ? result.prUrl : undefined;
    const prNumber = typeof result.prNumber === "number" ? result.prNumber : undefined;
    if (prUrl && prNumber !== undefined) {
      await prisma.task.update({ where: { id: taskId }, data: { status: "PR_CREATED", prUrl, prNumber } });
      eventBus.publish(taskId, { type: "pr_created", taskId, prUrl, prNumber });
    }
  }

  return pauseRequested;
}

/**
 * Runs the agent loop for one task until it blocks on the user, finishes,
 * fails, or hits the per-invocation iteration cap. Idempotent to call again
 * later — e.g. POST /tasks/:id/messages calls this to resume a task that
 * was BLOCKED_ON_USER, and it picks up wherever Postgres left off.
 */
export async function runAgentLoop(taskId: string): Promise<void> {
  const initialTask = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  if (TERMINAL_TASK_STATUSES.includes(initialTask.status)) return;

  await setStatus(taskId, "EXECUTING");

  const task = toTaskDto(initialTask);
  const systemPrompt = buildSystemPrompt(task);
  const tools = buildToolSchemas();

  let sandbox: SandboxClient;
  try {
    sandbox = await getSandboxClient(taskId);
  } catch (err) {
    await failTask(taskId, `Failed to provision sandbox: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }

  for (let iteration = 0; iteration < MAX_ITERATIONS_PER_INVOCATION; iteration++) {
    const elapsedMs = Date.now() - new Date(task.createdAt).getTime();
    if (elapsedMs > env.SANDBOX_MAX_RUNTIME_MS) {
      await failTask(taskId, "Task exceeded the maximum runtime and was stopped.");
      return;
    }

    const history = await buildLlmHistory(taskId);

    let turn;
    try {
      turn = await llmProvider.generate({ systemPrompt, history, tools });
    } catch (err) {
      await failTask(taskId, `LLM call failed: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }

    // Normalize a plain-text turn into a synthetic message_user call so
    // there is exactly one code path for "the agent said something."
    const calls: ToolCallRequest[] =
      turn.kind === "tool_calls"
        ? turn.calls
        : [
            {
              id: randomUUID(),
              name: "message_user",
              args: { content: turn.content, block_on_user_response: "BLOCK" },
            },
          ];

    let shouldPause = false;
    for (const call of calls) {
      const paused = await executeToolCall(taskId, sandbox, call);
      shouldPause = shouldPause || paused;
    }

    if (shouldPause) {
      const current = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
      if (TERMINAL_TASK_STATUSES.includes(current.status)) return;
      const nextStatus: TaskStatus = current.status === "PR_CREATED" ? "DONE" : "BLOCKED_ON_USER";
      await setStatus(taskId, nextStatus);
      if (nextStatus === "DONE") {
        await releaseSandbox(taskId);
        clearShellOutputTracking(taskId);
      }
      return;
    }
  }

  await prisma.message.create({
    data: {
      taskId,
      role: "agent",
      content: "Paused after reaching the per-invocation step limit. Send a message to continue.",
      blockOnUserResponse: "NONE",
    },
  });
  await setStatus(taskId, "BLOCKED_ON_USER");
}
