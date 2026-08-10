# Base image for CloudDev sandbox sessions. One container per task
# (Section 3.2). Phase 1: run locally with `docker run`. Phase 3: same
# image, spawned as an ECS Fargate task instead.
FROM node:22-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    python3 \
    python3-pip \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Playwright + headless Chromium for the browser tools (Phase 4). Installed
# here so Phase 4 doesn't require rebuilding the base image.
RUN npm install -g playwright@1.48.0 && playwright install --with-deps chromium

# Run as a non-root user — this container executes arbitrary LLM-generated
# shell commands, so it shouldn't run as root even inside Docker's isolation
# boundary. Must happen after the apt-based installs above, which need root.
RUN groupadd -r sandbox && useradd -r -g sandbox -m -d /home/sandbox sandbox

WORKDIR /app

# Install the daemon's own deps (not the target repo's — that gets cloned
# into /workspace by the orchestrator after the container starts).
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY dist ./dist

ENV WORKSPACE_DIR=/workspace
RUN mkdir -p /workspace && chown -R sandbox:sandbox /app /workspace /home/sandbox

USER sandbox

EXPOSE 7717

CMD ["node", "dist/index.js"]
