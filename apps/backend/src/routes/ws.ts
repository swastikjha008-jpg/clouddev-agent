import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";
import { prisma } from "../db/client.js";
import { eventBus } from "../pubsub/bus.js";

export function wsRoutes(app: FastifyInstance): void {
  app.get<{ Params: { id: string } }>("/ws/tasks/:id", { websocket: true }, async (socket: WebSocket, request) => {
    const taskId = request.params.id;

    const task = await prisma.task.findFirst({ where: { id: taskId, userId: request.userId } });
    if (!task) {
      socket.close(4004, "task not found");
      return;
    }

    const unsubscribe = eventBus.subscribe(taskId, (event) => {
      if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(event));
      }
    });

    socket.on("close", unsubscribe);
    socket.on("error", unsubscribe);
  });
}
