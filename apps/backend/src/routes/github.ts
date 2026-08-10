import type { FastifyInstance } from "fastify";
import type { GetReposResponse } from "@clouddev/shared";
import { env } from "../env.js";

/**
 * Phase 2 (Section 6) work — OAuth + Octokit-backed repo listing. Stubbed
 * now so the routes in the API contract (Section 5) exist and return a
 * predictable shape while the frontend is built in parallel, instead of a
 * bare 404. Swap the bodies for real Octokit/OAuth calls in Phase 2; the
 * URL paths and response shapes are already final per @clouddev/shared.
 */
export function githubRoutes(app: FastifyInstance): void {
  app.get("/auth/github", async (_request, reply) => {
    if (!env.GITHUB_CLIENT_ID) {
      return reply
        .code(501)
        .send({ error: "not_configured", message: "GITHUB_CLIENT_ID is not set — GitHub OAuth is Phase 2." });
    }
    const redirectUri = `${env.NODE_ENV === "production" ? "https" : "http"}://localhost:${env.PORT}/auth/github/callback`;
    const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
    authorizeUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("scope", "repo");
    return reply.redirect(authorizeUrl.toString());
  });

  app.get("/auth/github/callback", async (_request, reply) => {
    return reply
      .code(501)
      .send({ error: "not_implemented", message: "GitHub OAuth token exchange lands in Phase 2." });
  });

  app.get("/repos", async (_request, reply) => {
    const response: GetReposResponse = { repos: [] };
    return reply.send(response);
  });
}
