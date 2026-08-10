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
  <img src="https://img.shields.io/badge/GitHub-0A192F?style=for-the-badge&logo=github&logoColor=white&labelColor=000000" />
  <img src="https://img.shields.io/badge/npm-0A192F?style=for-the-badge&logo=npm&logoColor=CB3837&labelColor=000000" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Phase%201%20—%20Core%20Agent%20Loop-00B4FF?style=for-the-badge&labelColor=000000" />
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
> Deployment and production infrastructure will be added in the next phase.

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
</p>

- Docker
- PostgreSQL
- Prisma ORM
- Docker-based sandboxing
- In-memory EventBus
- Turborepo

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

### 🔜 Phase 2 — GitHub Integration
- [ ] GitHub OAuth
- [ ] GitHub repository listing
- [ ] Repository cloning through Octokit
- [ ] `git_create_pr`
- [ ] Proper user/repository permissions

### ☁️ Phase 3 — AWS Infrastructure
Planned migration: `Local Docker → AWS ECS Fargate`

- ECS Fargate
- RDS PostgreSQL
- ElastiCache / Redis
- Secrets Manager
- S3
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
| Phase 1 | Core Agent + Docker Sandbox | 🟢 Working |
| Phase 2 | GitHub Integration | 🟡 Planned |
| Phase 3 | AWS Infrastructure | 🟡 Planned |
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

The core autonomous coding workflow is working locally:

```text
Task → Agent → Docker Sandbox → Repository → Shell / Editor → Real Execution → Live Logs → Frontend
```

Deployment and production infrastructure will be documented here as the project moves into the next phase.

---

## ⭐ If you find the project interesting

Feel free to explore the code, open an issue, suggest improvements, or follow the project as it evolves.

**Built to learn. Built to ship. Built to become something bigger. 🚀**
