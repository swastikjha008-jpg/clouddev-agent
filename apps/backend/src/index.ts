import Fastify from "fastify";
import websocketPlugin from "@fastify/websocket";
import corsPlugin from "@fastify/cors";
import rateLimitPlugin from "@fastify/rate-limit";
import { ZodError } from "zod";
import { env } from "./env.js";
import { prisma } from "./db/client.js";
import { devAuthPlugin } from "./plugins/dev-auth.js";
import { taskRoutes } from "./routes/tasks.js";
import { wsRoutes } from "./routes/ws.js";
import { githubRoutes } from "./routes/github.js";

const app = Fastify({
  logger: {
    level: env.NODE_ENV === "development" ? "info" : "warn",
    transport: env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
  },
});

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.code(400).send({ error: "invalid_request", message: error.issues.map((i) => i.message).join(", ") });
  }
  app.log.error(error);
  return reply.code(500).send({ error: "internal_error", message: "Something went wrong." });
});

app.get("/health", () => ({ status: "ok" }));

await app.register(corsPlugin, {
  origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
});

// Global default; POST /tasks (spins up a sandbox + calls Gemini per request,
// i.e. real cost per hit) carries its own stricter per-route limit — see
// routes/tasks.ts.
await app.register(rateLimitPlugin, {
  max: 200,
  timeWindow: "1 minute",
});

await app.register(websocketPlugin);
await app.register(devAuthPlugin);
await app.register(githubRoutes);
await app.register(taskRoutes);
await app.register(wsRoutes);

await app
  .listen({ port: env.PORT, host: "0.0.0.0" })
  .then((address) => app.log.info(`CloudDev backend listening on ${address}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });

// Drain in-flight requests and release the DB pool before the process dies —
// matters once this runs behind an orchestrator that sends SIGTERM on deploy/scale-down.
async function shutdown(signal: string): Promise<void> {
  app.log.info(`received ${signal}, shutting down`);
  try {
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    app.log.error(err, "error during shutdown");
    process.exit(1);
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
