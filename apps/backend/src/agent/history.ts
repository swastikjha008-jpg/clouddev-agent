import type { Message as PrismaMessage, ToolCall as PrismaToolCall } from "@prisma/client";
import { prisma } from "../db/client.js";
import type { LLMHistoryItem } from "../llm/provider.js";

/**
 * Reconstructs conversation history for the LLM from Postgres.
 *
 * Deliberate simplification: only user-authored Message rows and finished
 * ToolCall rows feed the LLM's context. Agent-authored Message rows exist
 * purely as a read-model for the frontend chat panel (every agent message
 * originates from a message_user tool call, which is already represented
 * here as a tool-call/tool-result pair) — including them too would show the
 * model its own words twice.
 */
export async function buildLlmHistory(taskId: string): Promise<LLMHistoryItem[]> {
  const [userMessages, toolCalls] = await Promise.all([
    prisma.message.findMany({
      where: { taskId, role: "user" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.toolCall.findMany({
      where: { taskId, status: { in: ["succeeded", "failed"] } },
      orderBy: { startedAt: "asc" },
    }),
  ]);

  type TimelineItem = { at: Date; items: LLMHistoryItem[] };

  const timeline: TimelineItem[] = [
    ...userMessages.map((m: PrismaMessage) => ({
      at: m.createdAt,
      items: [{ role: "user" as const, content: m.content }],
    })),
    ...toolCalls.map((tc: PrismaToolCall) => {
      const rawArgs = tc.args as Record<string, unknown>;
      const { __providerMetadata, ...cleanArgs } = rawArgs;
      const providerMetadata =
        __providerMetadata && typeof __providerMetadata === "object" ? (__providerMetadata as Record<string, unknown>) : undefined;

      return {
        at: tc.startedAt,
        items: [
          {
            role: "assistant" as const,
            toolCalls: [{ id: tc.id, name: tc.toolName, args: cleanArgs, providerMetadata }],
          },
          {
            role: "tool" as const,
            toolCallId: tc.id,
            toolName: tc.toolName,
            result: tc.status === "failed" ? { error: tc.result } : tc.result,
          },
        ],
      };
    }),
  ];

  timeline.sort((a, b) => a.at.getTime() - b.at.getTime());

  return timeline.flatMap((entry) => entry.items);
}
