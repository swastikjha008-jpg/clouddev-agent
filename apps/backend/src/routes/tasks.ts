import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type {
  ApproveDeployRequest,
  CreateTaskRequest,
  CreateTaskResponse,
  GetTaskResponse,
  ListTasksResponse,
  PostTaskMessageRequest,
} from "@clouddev/shared";
import { prisma } from "../db/client.js";
import { toTaskDto, toTaskSummaryDto, toMessageDto, toToolCallDto } from "../db/mappers.js";
import { runAgentLoop } from "../agent/loop.js";
import { eventBus } from "../pubsub/bus.js";

const createTaskSchema = z.object({
  repo: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
}) satisfies z.ZodType<CreateTaskRequest>;

const postMessageSchema = z.object({
  content: z.string().min(1),
}) satisfies z.ZodType<PostTaskMessageRequest>;

const approveDeploySchema = z.object({
  approved: z.boolean(),
}) satisfies z.ZodType<ApproveDeployRequest>;

/**
 * Fires the agent loop without blocking the HTTP response — the loop can
 * run for minutes (Section 3.2's 30-60 min cap), so the request/response
 * cycle only ever kicks it off. Progress streams over the task's WebSocket.
 */
function kickOffLoop(taskId: string, app: FastifyInstance): void {
  runAgentLoop(taskId).catch((err) => {
    app.log.error({ err, taskId }, "agent loop crashed");
  });
}

export function taskRoutes(app: FastifyInstance): void {
  app.post(
    "/tasks",
    // Each request provisions a sandbox container and calls the LLM —
    // stricter than the global default (see index.ts) since the cost per
    // hit is real, not just server load.
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const body = createTaskSchema.parse(request.body);

      const task = await prisma.task.create({
        data: {
          userId: request.userId,
          repoFullName: body.repo,
          title: body.title,
          description: body.description,
        },
      });

      // The task description is the agent's first turn of context — without
      // a seed message, buildLlmHistory() returns an empty array on the
      // very first loop iteration, and Gemini's generateContent rejects an
      // empty `contents` array outright (400: "contents is not specified").
      const seedMessage = await prisma.message.create({
        data: { taskId: task.id, role: "user", content: body.description, blockOnUserResponse: "NONE" },
      });
      eventBus.publish(task.id, { type: "agent_message", taskId: task.id, message: toMessageDto(seedMessage) });

      kickOffLoop(task.id, app);

      const response: CreateTaskResponse = { taskId: task.id };
      return reply.code(201).send(response);
    },
  );

  app.get<{ Params: { id: string } }>("/tasks/:id", async (request, reply) => {
    const task = await prisma.task.findFirst({
      where: { id: request.params.id, userId: request.userId },
    });
    if (!task) {
      return reply.code(404).send({ error: "not_found", message: "Task not found." });
    }

    const [messages, toolCalls] = await Promise.all([
      prisma.message.findMany({ where: { taskId: task.id }, orderBy: { createdAt: "asc" } }),
      prisma.toolCall.findMany({ where: { taskId: task.id }, orderBy: { startedAt: "asc" } }),
    ]);

    const response: GetTaskResponse = {
      task: toTaskDto(task),
      messages: messages.map(toMessageDto),
      toolCalls: toolCalls.map(toToolCallDto),
    };
    return reply.send(response);
  });

  app.get("/tasks", async (request, reply) => {
    const tasks = await prisma.task.findMany({
      where: { userId: request.userId },
      orderBy: { createdAt: "desc" },
    });

    const response: ListTasksResponse = { tasks: tasks.map(toTaskSummaryDto) };
    return reply.send(response);
  });

  app.post<{ Params: { id: string } }>("/tasks/:id/messages", async (request, reply) => {
    const body = postMessageSchema.parse(request.body);

    const task = await prisma.task.findFirst({
      where: { id: request.params.id, userId: request.userId },
    });
    if (!task) {
      return reply.code(404).send({ error: "not_found", message: "Task not found." });
    }
    if (task.status !== "BLOCKED_ON_USER") {
      return reply
        .code(409)
        .send({ error: "not_blocked", message: `Task is ${task.status}, not waiting on a reply.` });
    }

    const message = await prisma.message.create({
      data: { taskId: task.id, role: "user", content: body.content, blockOnUserResponse: "NONE" },
    });
    eventBus.publish(task.id, { type: "agent_message", taskId: task.id, message: toMessageDto(message) });

    kickOffLoop(task.id, app);

    return reply.code(202).send({ accepted: true });
  });

  app.post<{ Params: { id: string } }>("/tasks/:id/approve-deploy", async (request, reply) => {
    const body = approveDeploySchema.parse(request.body);

    const task = await prisma.task.findFirst({
      where: { id: request.params.id, userId: request.userId },
    });
    if (!task) {
      return reply.code(404).send({ error: "not_found", message: "Task not found." });
    }

    await prisma.task.update({ where: { id: task.id }, data: { pendingDeployApproval: false } });

    const message = await prisma.message.create({
      data: {
        taskId: task.id,
        role: "user",
        content: body.approved ? "Deploy approved." : "Deploy rejected.",
        blockOnUserResponse: "NONE",
      },
    });
    eventBus.publish(task.id, { type: "agent_message", taskId: task.id, message: toMessageDto(message) });

    if (body.approved && task.status === "BLOCKED_ON_USER") {
      kickOffLoop(task.id, app);
    }

    return reply.send({ accepted: true });
  });
}