"use client";

import {
  SquareTerminal,
  FileEdit,
  Globe2,
  Rocket,
  Github,
  Plug,
} from "lucide-react";

const categories = [
  {
    icon: SquareTerminal,
    title: "Shell",
    description: "Persistent, ID-based shell processes so long-running commands never block the loop.",
    tags: ["run_shell", "view_shell", "kill_shell"],
  },
  {
    icon: FileEdit,
    title: "Editor",
    description: "Structured file edits only — never a raw cat or sed. Every change is tracked and undoable.",
    tags: ["str_replace", "create_file", "undo_edit"],
  },
  {
    icon: Globe2,
    title: "Browser",
    description: "A real headless browser to click through and verify its own frontend work before shipping.",
    tags: ["navigate_browser", "click_browser", "view_browser"],
  },
  {
    icon: Rocket,
    title: "Deployment",
    description: "Spins up a live preview so you can click through the change before it ever reaches your repo.",
    tags: ["deploy_frontend", "deploy_backend", "expose_port"],
  },
  {
    icon: Github,
    title: "Git / GitHub",
    description: "Opens PRs, updates descriptions, and reads CI checks the same way you would.",
    tags: ["git_create_pr", "git_pr_checks", "git_list_repos"],
  },
  {
    icon: Plug,
    title: "MCP",
    description: "Talks to the tools your team already uses — Slack, Linear, and anything else you connect.",
    tags: ["mcp_tool_call", "mcp_resource_read"],
  },
];

export function ToolGrid() {
  return (
    <section id="tools" className="border-t border-border/60 py-28">
      <div className="container">
        <div className="mb-16 max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Inside the sandbox</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything a real engineer touches.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Six tool categories, all running inside one disposable container per task.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <cat.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{cat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {cat.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {cat.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-border/60 bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
