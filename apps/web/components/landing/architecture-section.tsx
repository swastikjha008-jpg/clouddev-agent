import { Github, Box, RefreshCw, Wrench, Radio, GitPullRequest } from "lucide-react";

const rows = [
  { icon: Github, label: "GitHub OAuth", detail: "scoped repo access, no plaintext tokens" },
  { icon: Box, label: "Sandbox container", detail: "one isolated, disposable environment per task" },
  { icon: RefreshCw, label: "Agent loop", detail: "plan → call a tool → observe → repeat" },
  { icon: Wrench, label: "Tool execution", detail: "shell, editor, browser, deploy — inside the container" },
  { icon: Radio, label: "Live stream", detail: "shell output, diffs, and browser state pushed to you" },
  { icon: GitPullRequest, label: "Pull request", detail: "opened with a description and passing checks" },
];

export function ArchitectureSection() {
  return (
    <section className="relative border-t border-border/60 py-28">
      <div className="container">
        <div className="mb-14 max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Under the hood</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Powered by a real sandbox pipeline.
          </h2>
          <p className="mt-4 text-muted-foreground">
            No shared state between tasks, no lingering access — each run gets its own throwaway environment.
          </p>
        </div>

        <div className="mx-auto max-w-2xl divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="group flex items-center gap-4 bg-card/40 px-5 py-4 transition-colors hover:bg-card"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <row.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-medium text-foreground">{row.label}</p>
                <p className="truncate text-xs text-muted-foreground">{row.detail}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground/50">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
