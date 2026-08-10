# ☁️ CloudDev

### Autonomous AI Coding Agent

<p align="center">
  <strong>A Devin-style autonomous coding agent that works inside isolated development environments.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-0A192F?style=for-the-badge&logo=typescript&logoColor=3178C6&labelColor=000000" />
  <img src="https://img.shields.io/badge/Next.js-0A192F?style=for-the-badge&logo=next.js&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/React-0A192F?style=for-the-badge&logo=react&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/Node.js-0A192F?style=for-the-badge&logo=node.js&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/Fastify-0A192F?style=for-the-badge&logo=fastify&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/Gemini-0A192F?style=for-the-badge&logo=googlegemini&logoColor=8E75B2&labelColor=000000" />
  <img src="https://img.shields.io/badge/Docker-0A192F?style=for-the-badge&logo=docker&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/PostgreSQL-0A192F?style=for-the-badge&logo=postgresql&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/Prisma-0A192F?style=for-the-badge&logo=prisma&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/Turborepo-0A192F?style=for-the-badge&logo=turborepo&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/WebSocket-0A192F?style=for-the-badge&logo=websocket&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/AWS-0A192F?style=for-the-badge&logo=amazonaws&logoColor=FF9900&labelColor=000000" />
  <img src="https://img.shields.io/badge/GitHub-0A192F?style=for-the-badge&logo=github&logoColor=white&labelColor=000000" />
  <img src="https://img.shields.io/badge/npm-0A192F?style=for-the-badge&logo=npm&logoColor=CB3837&labelColor=000000" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Phase%201%20—%20Core%20Agent%20Loop-00B4FF?style=for-the-badge&labelColor=000000" />
  <img src="https://img.shields.io/badge/Live%20Demo-Testing%20on%20AWS%20%2B%20Render-00B4FF?style=for-the-badge&labelColor=000000" />
</p>

<p align="center">
  <a href="https://github.com/swastikjha008/clouddev-agent"><img src="https://img.shields.io/badge/Source%20Code-View%20on%20GitHub-0A192F?style=for-the-badge&logo=github&logoColor=white&labelColor=000000" /></a>
  <a href="https://hub.docker.com/r/swastik7/clouddev-sandbox-agent"><img src="https://img.shields.io/badge/Sandbox%20Image-Docker%20Hub-0A192F?style=for-the-badge&logo=docker&logoColor=00B4FF&labelColor=000000" /></a>
</p>

---

CloudDev is a **Devin-style autonomous coding agent** built as a Turborepo monorepo.

It takes a coding task, provisions an isolated Docker sandbox, gives an AI agent access to the repository and development tools, executes commands, and streams the agent's activity back to the frontend in real time.

> 🚧 **Current Status: Phase 1 — Core Agent Loop**
>
> The core agent loop, local Docker sandbox, Shell + Editor tools, PostgreSQL persistence, REST API, WebSocket events, and connected frontend are working.
>
> The frontend and backend are also now deployed for live testing (see [🌍 Current Deployment](#-current-deployment-testing) below). Full production infrastructure is still planned for **Phase 3**.

---

## 🔗 Project Links

| Resource | Link |
|---|---|
| 💻 Source Code | [github.com/swastikjha008/clouddev-agent](https://github.com/swastikjha008/clouddev-agent) |
| 🐳 Sandbox Image | [hub.docker.com/r/swastik7/clouddev-sandbox-agent](https://hub.docker.com/r/swastik7/clouddev-sandbox-agent) |

```bash
docker pull swastik7/clouddev-sandbox-agent:latest
```

---

## ✨ What is CloudDev?

Traditional AI coding assistants mostly operate as chat interfaces.

CloudDev is designed around a different idea:

**Give the AI an actual development environment.**

Instead of only suggesting code, the agent can:

```text
User Task
    ↓
Backend Orchestrator
    ↓
Create isolated Docker Sandbox
    ↓
Clone / Prepare Repository
    ↓
AI Agent
    ↓
Shell + Editor Tools
    ↓
Execute / Inspect / Modify
    ↓
Stream Activity & Logs
    ↓
Frontend
```

The goal is to eventually evolve CloudDev into a complete cloud-based autonomous development environment.

---

## 🚀 Current Features

### 🤖 Autonomous Agent Loop
CloudDev runs an agent loop powered by Gemini with tool calling. The agent can reason about the task and decide when to use available development tools.

### 🐳 Isolated Docker Sandbox
Every task gets its own development environment. The sandbox provides an isolated workspace where the agent can:
- Inspect repositories
- Execute shell commands
- Modify files
- Run development commands
- Observe command output

The sandbox runs as a dedicated Docker container using a non-root user.

### 💻 Shell Tools
The agent can execute commands inside the sandbox and inspect their output. Shell output is streamed to the frontend as the task progresses.

### 📝 Editor Tools
The agent can interact with project files through the available editor tooling — allowing it to move beyond simply reading a repository and actually work with its codebase.

### ⚡ Real-Time Activity
CloudDev uses WebSockets to stream task activity from the backend to the frontend. The frontend receives events such as:
- Agent activity
- Tool calls
- Shell output
- Messages
- Task status changes

The Shell interface displays **real execution output**, not mock/demo logs.

### 🗄️ PostgreSQL Persistence
Task and message state is persisted using PostgreSQL + Prisma ORM. The frontend loads persisted state through REST and then applies live WebSocket events on top.

### 🧩 Shared Type System
The REST and WebSocket contracts live inside `packages/shared/`. Both the backend and frontend consume the same TypeScript types — preventing API contracts from silently drifting between the two applications.

### 🛑 Honest UI States
Features that don't exist yet aren't faked. For example, **Diff** and **Browser** are marked "Not available yet" — reserved for future phases instead of showing fabricated functionality.

---

## 🌍 Current Deployment (Testing)

CloudDev now has a live, working deployment used for manual testing while Phase 3 (AWS ECS Fargate) infrastructure is designed properly.

```text
                     ┌───────────────────────┐
                     │   CloudDev Frontend    │
                     │   Next.js on Render    │
                     │        (HTTPS)         │
                     └───────────┬───────────┘
                                 │
                          HTTPS request
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   Cloudflare Tunnel    │
                     │  (HTTPS termination)   │
                     └───────────┬───────────┘
                                 │
                            localhost:8080
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   CloudDev Backend     │
                     │  Fastify · AWS EC2     │
                     │  managed by systemd    │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   Neon PostgreSQL      │
                     │   (managed, serverless)│
                     └───────────────────────┘
```

**How it's wired up:**

- **Frontend** — deployed to **Render** as a Next.js web service, built from `apps/web` via Turborepo (`turbo run build --filter=@clouddev/web...`).
- **Backend** — runs on an **AWS EC2** instance, kept alive as a `systemd` service (`clouddev-backend.service`) so it survives SSH disconnects and reboots, with automatic restarts on crash.
- **HTTPS for the backend** — the backend only listens on plain HTTP, so a **Cloudflare Tunnel** (`cloudflared`) sits in front of it to provide a public HTTPS endpoint. This avoids the browser's mixed-content blocking (an HTTPS frontend cannot call an HTTP API).
- **Database** — **Neon** (managed serverless PostgreSQL), with Prisma migrations applied via `npx prisma migrate deploy`.
- **CORS** — the backend's `CORS_ORIGIN` env var allowlists the Render frontend origin explicitly.

> ⚠️ **This is a testing setup, not production infrastructure.** The Cloudflare Quick Tunnel URL is ephemeral and will change if the tunnel process restarts. It also does not solve any of the items listed in [🔐 Deployment Readiness](#-deployment-readiness) — dev-auth is still in place, and this deployment should not be shared as a public/production product yet. A named Cloudflare Tunnel (or the planned ECS Fargate + ALB setup from Phase 3) is required for a stable, permanent URL.

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │      CloudDev UI     │
                         │       Next.js        │
                         └──────────┬──────────┘
                                    │
                              REST + WebSocket
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       Backend        │
                         │       Fastify        │
                         │                       │
                         │   Agent Loop          │
                         │   Tool Registry       │
                         │   Task Management     │
                         │   Event Bus           │
                         └───────┬───────┬─────┘
                                 │       │
                       PostgreSQL│       │ Docker
                                 │       │
                                 ▼       ▼
                         ┌──────────┐  ┌─────────────────┐
                         │  Prisma  │  │  Sandbox Agent  │
                         │ + Postgres│  │     Docker      │
                         └──────────┘  │                 │
                                       │  Shell          │
                                       │  Editor         │
                                       │  Repository     │
                                       └─────────────────┘
```

---

## 📁 Project Structure

```text
CloudDev/
│
├── apps/
│   │
│   ├── backend/
│   │   ├── src/
│   │   │   ├── agent/
│   │   │   ├── llm/
│   │   │   ├── tools/
│   │   │   ├── routes/
│   │   │   ├── plugins/
│   │   │   └── pubsub/
│   │   │
│   │   └── prisma/
│   │
│   ├── sandbox-agent/
│   │   ├── src/
│   │   └── Dockerfile
│   │
│   └── web/
│       ├── components/
│       ├── hooks/
│       ├── state/
│       └── app/
│
├── packages/
│   └── shared/
│       └── src/
│           └── types/
│
├── package.json
├── turbo.json
└── README.md
```

**`apps/backend`** — The main orchestration service. Responsible for the agent loop, task creation, REST API, WebSocket API, LLM communication, tool registry, sandbox provisioning, PostgreSQL persistence, and event broadcasting.

**`apps/sandbox-agent`** — Runs inside each Docker sandbox. Responsible for executing the actual development operations requested by the agent.

**`apps/web`** — Next.js frontend providing task management, agent conversation, live activity, shell output, tool-call visibility, task status, and real-time updates.

**`packages/shared`** — Shared TypeScript contracts used by both frontend and backend.

---

## 🧰 Tech Stack

### Frontend
<p>
  <img src="https://img.shields.io/badge/Next.js-0A192F?style=for-the-badge&logo=next.js&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/React-0A192F?style=for-the-badge&logo=react&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/TypeScript-0A192F?style=for-the-badge&logo=typescript&logoColor=00B4FF&labelColor=000000" />
</p>

- Next.js
- React
- TypeScript
- WebSockets
- Client-side state management

### Backend
<p>
  <img src="https://img.shields.io/badge/Node.js-0A192F?style=for-the-badge&logo=node.js&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/Fastify-0A192F?style=for-the-badge&logo=fastify&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/TypeScript-0A192F?style=for-the-badge&logo=typescript&logoColor=00B4FF&labelColor=000000" />
</p>

- Node.js
- Fastify
- TypeScript
- REST API
- WebSocket API
- Event-driven architecture

### AI
<p>
  <img src="https://img.shields.io/badge/Google%20Gemini-0A192F?style=for-the-badge&logo=googlegemini&logoColor=8E75B2&labelColor=000000" />
</p>

- Google Gemini
- Function calling
- Provider abstraction
- Autonomous agent loop
- Tool-based execution

The LLM layer is intentionally provider-agnostic:

```text
LLMProvider
     │
     ├── GeminiProvider
     │
     └── Future providers
          ├── Anthropic
          └── Others
```

Adding another provider should not require rewriting the agent loop.

### Infrastructure
<p>
  <img src="https://img.shields.io/badge/Docker-0A192F?style=for-the-badge&logo=docker&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/PostgreSQL-0A192F?style=for-the-badge&logo=postgresql&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/Prisma-0A192F?style=for-the-badge&logo=prisma&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/AWS-0A192F?style=for-the-badge&logo=amazonaws&logoColor=FF9900&labelColor=000000" />
</p>

- Docker
- PostgreSQL (Neon, managed)
- Prisma ORM
- Docker-based sandboxing
- In-memory EventBus
- Turborepo
- **AWS EC2** — backend host, run as a `systemd` service
- **Cloudflare Tunnel** — HTTPS ingress for the backend
- **Render** — frontend hosting

### Development
<p>
  <img src="https://img.shields.io/badge/Turborepo-0A192F?style=for-the-badge&logo=turborepo&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/Git-0A192F?style=for-the-badge&logo=git&logoColor=00B4FF&labelColor=000000" />
  <img src="https://img.shields.io/badge/GitHub-0A192F?style=for-the-badge&logo=github&logoColor=white&labelColor=000000" />
</p>

- Turborepo
- Git
- GitHub
- npm
- ESLint
- TypeScript

---

## ⚙️ Getting Started

### Prerequisites
- Node.js
- npm
- Docker
- PostgreSQL
- Gemini API key

### 1. Clone the repository
```bash
git clone https://github.com/swastikjha008/clouddev-agent
cd clouddev-agent
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure PostgreSQL
You can use any local PostgreSQL instance, or quickly start one using Docker:
```bash
docker run --name clouddev-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=clouddev \
  -p 5432:5432 \
  -d postgres:16
```

### 4. Configure backend environment
```bash
cp apps/backend/.env.example apps/backend/.env
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clouddev"
GEMINI_API_KEY="your-gemini-api-key"
CORS_ORIGIN="http://localhost:3000"
```

### 5. Run Prisma migrations
```bash
npm run db:migrate
npm run db:generate
```

### 6. Build the sandbox image
The backend provisions this image whenever a task requires a sandbox — or pull the pre-built image directly from Docker Hub:
```bash
docker pull swastik7/clouddev-sandbox-agent:latest
```
Or build it locally:
```bash
cd apps/sandbox-agent
npm run build
docker build -t clouddev/sandbox-agent:local .
cd ../..
```

### 7. Configure the frontend
```bash
cp apps/web/.env.example apps/web/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> ⚠️ `NEXT_PUBLIC_API_URL` is a **build-time environment variable** in Next.js. Make sure it is configured correctly in the environment where the frontend is built.

### 8. Start CloudDev
```bash
npm run dev
```

```text
Backend       → http://localhost:8080
Frontend      → http://localhost:3000
Sandbox Agent → Watch mode
```

Health check: `http://localhost:8080/health`

---

## 🔄 How a Task Works

```text
 1. User creates task
 2. Backend receives POST /tasks
 3. Task is persisted in PostgreSQL
 4. Docker sandbox is provisioned
 5. Repository is prepared
 6. Agent loop starts
 7. Gemini decides which tool to use
 8. Tool executes inside sandbox
 9. Result returns to agent
10. Agent continues reasoning
11. Events are broadcast over WebSocket
12. Frontend displays live activity
```

The important part is that the agent isn't simply generating a response — it is operating inside a real development environment.

---

## 📡 Real-Time Communication

CloudDev uses a WebSocket connection per task:

```text
ws://localhost:8080/ws/tasks/:id
```

The backend publishes server events and the frontend applies them to the current task state. The shared `ServerEvent` union defines the event contract — letting the frontend display activity as it happens instead of repeatedly polling the entire task state.

---

## 🖥️ Shell Output

Shell execution is poll-based internally. The backend tracks how much output from each shell execution has already been broadcast — only the newly generated output is sent through the WebSocket:

```text
Shell Process → New Output → Backend detects suffix → shell_output event → WebSocket → Frontend → Live Shell UI
```

This keeps the frontend from repeatedly receiving the same shell output.

---

## 🧠 Agent Architecture

The agent loop is intentionally separated from the LLM implementation.

```text
                ┌──────────────────┐
                │    Agent Loop    │
                └────────┬─────────┘
                         │
                  LLMProvider
                         │
              ┌──────────┴──────────┐
              │                     │
        GeminiProvider        Future Provider
              │
              ▼
         Gemini API
```

The Gemini-specific function-calling format lives inside `apps/backend/src/llm/gemini-provider.ts`. The generic interface lives inside `apps/backend/src/llm/provider.ts`. This keeps the core agent loop independent from a specific LLM vendor.

---

## 🧩 Tool Architecture

Tools are isolated into individual modules inside `apps/backend/src/tools/`, each registered through `src/tools/registry.ts`.

Current Phase 1 tools focus on:
- Shell execution
- Shell output inspection
- File/editor operations

Future tools will be added without changing the fundamental agent loop.

---

## 🛡️ Safety & Isolation

CloudDev executes agent operations inside Docker containers instead of directly on the host machine. The sandbox image:
- Runs as a non-root user
- Provides an isolated workspace
- Separates task execution from the backend process
- Uses Docker's default container security boundaries

This is appropriate for the current local development phase.

> ⚠️ The sandbox security model will need additional hardening before CloudDev is used to execute arbitrary untrusted repositories in production.

Future infrastructure will include stronger isolation and cloud-based execution.

---

## ⚠️ Current Limitations

CloudDev is intentionally a **Phase 1 implementation**. Some capabilities are not implemented yet.

**GitHub OAuth** — The following routes currently exist as Phase 2 stubs: `/auth/github`, `/auth/github/callback`, `/repos`. Real GitHub OAuth and repository management are planned for Phase 2.

**Browser Automation** — Not implemented yet. The Browser tab currently displays an honest "not available yet" state. Planned technology: Playwright.

**Diff System** — Reserved for future file-diff tooling.

**Deployment Tools** — CloudDev does not currently deploy projects automatically. Planned deployment support will be added in a future phase.

**Distributed Infrastructure** — The current EventBus uses an in-memory `EventEmitter`, which works for a single backend instance. For multiple backend instances, it will be replaced with a distributed system such as Redis.

**Sandbox availability in the deployed environment** — the current AWS EC2 deployment does not yet have the sandbox Docker image built/pulled on the host, so live tasks created against the deployed backend will fail at the sandbox-provisioning step until the image is available there. Everything else in the request pipeline (auth stub, database, CORS, task creation) works end-to-end.

---

## 🚨 Gemini API Quota Limitation

During development, the project hit the Gemini API's free-tier request quota:

```text
429 Too Many Requests
Quota exceeded
```

This happened because the autonomous agent can make multiple LLM calls while completing a single task — a single user action can therefore result in several Gemini requests. This is important because CloudDev is not a simple one-request chatbot:

```text
User Task → Agent reasoning → Tool call → Tool result → Agent reasoning → Another tool call → Tool result → ...
```

Each reasoning cycle can consume API quota.

**Current handling** — Gemini free-tier limits are accepted as a current constraint for development/testing. Tasks can stop when the API quota is exhausted, but the sandbox and repository execution continue to work independently of the quota issue.

**Planned improvements** — Exponential backoff, retry handling, better request budgeting, reduced unnecessary LLM calls, provider fallback, production-grade API quotas, and better task-level error handling.

> **This is currently a development limitation, not a failure of the CloudDev sandbox architecture.**

---

## 🔐 Deployment Readiness

CloudDev is **not publicly deployable yet**. The biggest blocker is authentication.

Phase 1 currently uses a development authentication stub at `apps/backend/src/plugins/dev-auth.ts`. All requests are associated with a shared development user, and the current implementation also accepts an arbitrary `x-user-id` header — meaning a public deployment would allow users to access or manipulate other users' tasks.

This applies to the current [live testing deployment](#-current-deployment-testing) as well — it exists to validate the deployment pipeline (build, hosting, HTTPS, database, CORS), not to serve as a public product.

**Before public deployment, CloudDev needs:**
- Real authentication
- Proper user isolation
- GitHub OAuth
- Production secrets management
- Stronger sandbox isolation
- Production database configuration
- Distributed event infrastructure
- Better API quota handling
- Production monitoring
- Deployment infrastructure
- A stable, non-ephemeral HTTPS endpoint for the backend (replacing the current Cloudflare Quick Tunnel)

**Do not expose the current Phase 1 backend publicly.**

---

## 🗺️ Build Roadmap

### ✅ Phase 1 — Core Agent Loop
- [x] Gemini agent loop
- [x] Tool calling
- [x] Shell tools
- [x] Editor tools
- [x] Docker sandbox
- [x] PostgreSQL persistence
- [x] Prisma
- [x] REST API
- [x] WebSocket API
- [x] Real-time shell output
- [x] Connected Next.js frontend
- [x] Shared TypeScript contracts
- [x] Basic task management
- [x] Frontend deployed (Render) and backend deployed (AWS EC2) for manual testing

### 🔜 Phase 2 — GitHub Integration
- [ ] GitHub OAuth
- [ ] GitHub repository listing
- [ ] Repository cloning through Octokit
- [ ] `git_create_pr`
- [ ] Proper user/repository permissions

### ☁️ Phase 3 — AWS Infrastructure
Planned migration: `Local Docker / single EC2 → AWS ECS Fargate`

- ECS Fargate
- RDS PostgreSQL
- ElastiCache / Redis
- Secrets Manager
- S3
- Application Load Balancer + ACM (permanent HTTPS, replacing the Cloudflare Quick Tunnel used during testing)
- Distributed event system

The existing `SandboxProvisioner` abstraction is designed to make this migration possible without rewriting the agent architecture.

### 🌐 Phase 4 — Browser & Deployment Tools
- [ ] Playwright browser tools
- [ ] Browser interaction
- [ ] `deploy_frontend`
- [ ] `deploy_backend`
- [ ] `expose_port`
- [ ] Diff tooling
- [ ] Browser UI integration

### 🧠 Phase 5 — LSP & MCP
- [ ] Language Server Protocol integration
- [ ] MCP support
- [ ] More advanced developer tooling

---

## 📊 Phase Overview

| Phase | Focus | Status |
|---|---|---|
| Phase 1 | Core Agent + Docker Sandbox + Test Deployment | 🟢 Working |
| Phase 2 | GitHub Integration | 🟡 Planned |
| Phase 3 | AWS Infrastructure (ECS Fargate) | 🟡 Planned |
| Phase 4 | Browser + Deployment | 🟡 Planned |
| Phase 5 | LSP + MCP | ⚪ Future |

---

## 🎯 Design Principles

1. **Real execution over simulated output** — CloudDev displays actual shell output and task activity. No fake logs.
2. **Isolation first** — Agent operations happen inside a sandbox rather than directly on the host.
3. **Provider independence** — The agent loop should not be tied to one LLM provider.
4. **Shared contracts** — Frontend and backend consume the same TypeScript types.
5. **Additive architecture** — New capabilities are implemented as tools instead of requiring major rewrites to the agent loop.
6. **Honest product states** — If a feature doesn't exist yet, the UI says so.

---

## 🧪 Development Commands

```bash
npm install                  # Install dependencies
npm run dev                  # Run development environment
npm run lint                 # Run linting
npm run typecheck            # Run type checking
npm run db:generate          # Generate Prisma client
npm run db:migrate           # Run development migrations
npm run db:migrate:deploy    # Run production migrations
```

---

## 📜 API

The API contract is defined inside `packages/shared/src/types`.

### Main endpoints
```text
POST   /tasks
GET    /tasks
GET    /tasks/:id
POST   /tasks/:id/messages

GET    /health

GET    /auth/github
GET    /auth/github/callback

GET    /repos
```

### WebSocket
```text
/ws/tasks/:id
```

The WebSocket is responsible for real-time task events.

---

## 🔭 Future Vision

CloudDev is being built toward a platform where a developer can submit:

> "Fix this bug and open a PR."

and the system can:

```text
Understand task → Clone repository → Create isolated environment → Inspect codebase
→ Modify files → Run tests → Debug failures → Review changes → Create commit
→ Open Pull Request → Deploy
```

The current implementation is only the beginning of that workflow.

---

## 🙌 Learning & Inspiration

This project was built while learning through the **100xDevs** ecosystem and the masterclass that inspired the CloudDev architecture.

A big thanks to **Kirat Bhaiya / Harkirat Singh** and **100xDevs** for the learning resources and the push toward building real engineering projects instead of stopping at tutorials.

---

## 📌 Project Status

**CloudDev — Phase 1**

The core autonomous coding workflow is working locally, and a test deployment is live on Render (frontend) + AWS EC2 (backend):

```text
Task → Agent → Docker Sandbox → Repository → Shell / Editor → Real Execution → Live Logs → Frontend
```

Production infrastructure (Phase 3) will replace the current EC2 + Cloudflare Tunnel testing setup as the project moves into the next phase.

---

## ⭐ If you find the project interesting

Feel free to explore the code, open an issue, suggest improvements, or follow the project as it evolves.

**Built to learn. Built to ship. Built to become something bigger. 🚀**
