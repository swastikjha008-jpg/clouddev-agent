import type { Task as PrismaTask, Message as PrismaMessage, ToolCall as PrismaToolCall } from "@prisma/client";
import type { Task, TaskSummary, Message, ToolCall, ToolName, Attachment } from "@clouddev/shared";

export function toTaskDto(row: PrismaTask): Task {
  return {
    id: row.id,
    userId: row.userId,
    repoFullName: row.repoFullName,
    title: row.title,
    description: row.description,
    status: row.status,
    pendingDeployApproval: row.pendingDeployApproval,
    prUrl: row.prUrl,
    prNumber: row.prNumber,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toTaskSummaryDto(row: PrismaTask): TaskSummary {
  return {
    id: row.id,
    repoFullName: row.repoFullName,
    title: row.title,
    status: row.status,
    prUrl: row.prUrl,
    prNumber: row.prNumber,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toMessageDto(row: PrismaMessage): Message {
  return {
    id: row.id,
    taskId: row.taskId,
    role: row.role,
    content: row.content,
    blockOnUserResponse: row.blockOnUserResponse,
    attachments: (row.attachments as Attachment[] | null) ?? [],
    createdAt: row.createdAt.toISOString(),
  };
}

export function toToolCallDto(row: PrismaToolCall): ToolCall {
  const args = { ...(row.args as Record<string, unknown>) };
  delete args.__providerMetadata;

  return {
    id: row.id,
    taskId: row.taskId,
    toolName: row.toolName as ToolName,
    args,
    result: (row.result as Record<string, unknown> | null) ?? null,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    finishedAt: row.finishedAt ? row.finishedAt.toISOString() : null,
  };
}
