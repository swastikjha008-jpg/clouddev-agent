import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../db/client.js";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

/**
 * Phase 1 has no GitHub OAuth yet (that's Phase 2 — Section 6). Every
 * request is attributed to a single upserted "dev-local" user so the rest
 * of the API (tasks, messages) has a real user_id to work against. Replace
 * this hook's body with real session/JWT verification in Phase 2; nothing
 * downstream (routes, agent loop) needs to change since they only ever see
 * `request.userId`.
 */
export const devAuthPlugin = fp((app: FastifyInstance) => {
  app.decorateRequest("userId", "");

  app.addHook("preHandler", async (request: FastifyRequest) => {
    const headerUserId = request.headers["x-user-id"];
    if (typeof headerUserId === "string" && headerUserId.length > 0) {
      request.userId = headerUserId;
      return;
    }

    const devUser = await prisma.user.upsert({
      where: { githubId: "dev-local" },
      update: {},
      create: { githubId: "dev-local", githubAccessToken: "unset", email: "dev-local@clouddev.local" },
    });
    request.userId = devUser.id;
  });
});
