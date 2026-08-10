# CloudDev

Devin-style autonomous coding agent — backend, sandbox daemon, and frontend in one Turborepo monorepo.

Status: **Phase 1** (core agent loop, local Docker sandbox, Shell + Editor tools only). See "Build order" below.

## Deployment readiness

Recently added: production migration command (`db:migrate:deploy`, uses `prisma migrate deploy` instead of the interactive dev-only `migrate dev`), a rate limit on `POST /tasks` (10/min per IP — it provisions a sandbox and calls the LLM, so it's real cost per hit, not just server load) plus a global default (200/min), graceful shutdown on `SIGTERM`/`SIGINT` (drains requests, disconnects Prisma), and a non-root user in the sandbox image's Dockerfile.

**Not ready for a public deployment as-is — one real blocker:**

Auth is still the Phase 1 dev stub (`apps/backend/src/plugins/dev-auth.ts`) — every request is attributed to a single shared user, and anything can act as any user by sending an arbitrary `x-user-id` header (or nothing at all). Fine for local dev or a deployment only you can reach (e.g. behind a VPN or with the URL unshared). **Do not put this behind a public URL before Phase 2's real auth lands** — right now anyone who finds the URL can read, create, and reply to every task, and every task creation triggers a real Gemini API call and a container spin-up.

**Things to know before you deploy, not blockers:**

- `NEXT_PUBLIC_API_URL` is baked into the frontend at **build time**, not read at runtime — set it correctly in the environment that *builds* `apps/web`, not just on the host that runs it. A staging and prod frontend need separate builds if they point at different backends.
- No Dockerfile for `apps/backend` or `apps/web` — only `apps/sandbox-agent` has one (it needs to be an image regardless, since it's what gets spawned per task). If your target platform needs a container (e.g. a plain VM or ECS) rather than a Node buildpack (Render/Railway) or a Next-native host (Vercel), you'll need to add one.
- `/health` only checks that the process is up, not that Postgres is reachable — fine behind a simple platform health check, not a strict readiness probe.
- The sandbox container itself has no seccomp/AppArmor profile beyond Docker's defaults — reasonable for Phase 1, worth revisiting before running untrusted repos through it.

## Layout

```
apps/backend/        Fastify orchestrator: agent loop, tools, REST + WS API, Postgres
apps/sandbox-agent/  Daemon that runs inside each session's Docker container
apps/web/            Next.js frontend — task list, chat, live shell/activity view
packages/shared/      TypeScript types shared by backend and frontend
```

## Setup

```bash
npm install

# Postgres (any local instance works, or docker run postgres:16)
cp apps/backend/.env.example apps/backend/.env
# fill in DATABASE_URL and GEMINI_API_KEY in apps/backend/.env

npm run db:migrate   # apps/backend: prisma migrate dev
npm run db:generate  # apps/backend: prisma generate (also runs automatically via postinstall)

# Build the sandbox image (backend spawns containers from this)
cd apps/sandbox-agent && npm run build
docker build -t clouddev/sandbox-agent:local .
cd ../..

cp apps/web/.env.example apps/web/.env.local
# defaults to http://localhost:8080 — only edit if your backend runs elsewhere

npm run dev           # turbo runs backend + sandbox-agent + web together in watch mode
npm run lint          # eslint across all four packages
npm run typecheck     # tsc -b across the non-Next packages (web has its own typecheck script)
```

Backend listens on `http://localhost:8080` (`GET /health` for a liveness check). Frontend listens on `http://localhost:3000`.

## API contract

`packages/shared/src/types` is the source of truth for REST/WS shapes. `apps/web` imports everything from `@clouddev/shared` — no hand-copied types, so the two sides can't silently drift.

REST base: everything in the contract exists as a route. `/auth/github`, `/auth/github/callback`, and `/repos` are Phase 2 stubs (they respond, but don't do real OAuth yet).

WebSocket: `ws://localhost:8080/ws/tasks/:id`, one connection per task — `apps/web/hooks/use-task-socket.ts` owns this connection and reconnects on drop. Server -> client events are the `ServerEvent` union in `packages/shared`.

Auth: Phase 1 has no real auth. Every request is attributed to a single upserted `dev-local` user (`apps/backend/src/plugins/dev-auth.ts`). The frontend doesn't send any auth header yet — matches the backend's current stub.

CORS: `CORS_ORIGIN` in `apps/backend/.env` (default `http://localhost:3000`) controls which origins the browser is allowed to call the API from.

## Frontend notes

- `apps/web/state/store.tsx` is the single source of truth for task/message/tool-call state — it fetches from the REST API on load/selection and applies live `ServerEvent`s from the WebSocket on top. No mock data anywhere.
- The chat input is only enabled when the active task's status is `BLOCKED_ON_USER`, matching the backend's real constraint (`POST /tasks/:id/messages` 409s otherwise) — it's disabled with a status-appropriate message the rest of the time, not just always-on like a generic chatbot.
- The **Diff** and **Browser** tabs show honest "not available yet" states rather than fabricated demo content — those correspond to Phase 4 tools (`str_replace`-based diffing, Playwright browser control) that don't exist in the backend yet. Wire them up once those tools land.
- The **Shell** tab streams real output: the backend's `run_shell`/`view_shell` tools are poll-based (Section 3.2 of the build brief), so `apps/backend/src/agent/loop.ts` tracks how much of each shell's output has already been broadcast and publishes only the new suffix as a `shell_output` event — the frontend just appends.
- New tasks are created via the dialog behind the sidebar's `+` button (`apps/web/components/agent/new-task-dialog.tsx`) — `POST /tasks` with a repo, title, and description.

## Build order

1. **Core loop** (this phase) — Gemini agent loop, Shell + Editor tools, local Docker container, full Postgres persistence, connected frontend.
2. **GitHub integration** — real OAuth, Octokit repo listing/cloning, `git_create_pr`.
3. **AWS migration** — swap `DockerSandboxProvisioner` for an ECS Fargate provisioner (same `SandboxProvisioner` interface), wire RDS/ElastiCache/Secrets Manager/S3.
4. **Browser + deployment tools** — Playwright tools, `deploy_frontend`/`deploy_backend` (Fly.io), `expose_port`. Wire up the Diff/Browser tabs once these land.
5. **LSP + MCP** — lowest priority.

Each phase is additive: new tools go in their own `src/tools/*-tools.ts` file and get added to `src/tools/registry.ts`; the agent loop and routes don't change shape.

## Notes on choices made

- **ORM: Prisma**, not Drizzle — matches the Postgres+Prisma stack already used elsewhere.
- **LLM adapter**: `src/llm/provider.ts` is a provider-agnostic interface (`LLMProvider`); `src/llm/gemini-provider.ts` is the only file that knows Gemini's function-calling schema shape. Swapping to Anthropic later is a new `anthropic-provider.ts`, not a rewrite of `src/agent/loop.ts`.
- **Pub/sub**: in-memory `EventEmitter` behind an `EventBus` interface (`src/pubsub/bus.ts`). Fine for one backend instance; swap for Redis in Phase 3 behind the same interface once there are multiple instances.
- **message_user normalization**: a plain-text LLM turn (no tool call) is normalized into a synthetic `message_user` call in the loop, so there's exactly one code path for "the agent said something to the user" instead of two.
- **apps/web is `"type": "module"`** — needed so its config files and tooling resolve as ESM consistently with the rest of the monorepo; `next.config.mjs`/`postcss.config.mjs` are ESM accordingly. Next.js itself doesn't care either way, so this was a monorepo-consistency choice, not a Next requirement.
