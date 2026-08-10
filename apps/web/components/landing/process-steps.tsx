"use client";

import { GitBranch, MessageSquareText, Activity, GitPullRequest } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: GitBranch,
    title: "Connect a repo",
    description:
      "Authorize with GitHub and pick a repository. CloudDev clones it into a fresh, isolated sandbox — nothing touches your machine.",
  },
  {
    number: "02",
    icon: MessageSquareText,
    title: "Describe the task",
    description:
      "Write it like you would for a teammate: fix a bug, ship a feature, add tests. The agent plans its own steps from there.",
  },
  {
    number: "03",
    icon: Activity,
    title: "Watch it work",
    description:
      "Live shell output, file diffs, and a real browser preview stream to you as it runs. Step in any time it needs a decision.",
  },
  {
    number: "04",
    icon: GitPullRequest,
    title: "Review the PR",
    description:
      "When it's done, CloudDev opens a pull request with a clear description and passing checks. You merge — or send it back.",
  },
];

export function ProcessSteps() {
  return (
    <section id="how-it-works" className="relative border-t border-border/60 py-28">
      <div className="container">
        <div className="mb-16 max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">The loop</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Four steps, start to PR.
          </h2>
          <p className="mt-4 text-muted-foreground">
            No new workflow to learn — it slots in where a contractor would, except it never sleeps and shows its work.
          </p>
        </div>

        <div className="relative grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 md:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative flex flex-col gap-5 bg-background p-8 transition-colors hover:bg-card"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-4xl font-semibold text-muted-foreground/30 transition-colors group-hover:text-primary/40">
                  {step.number}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="h-4 w-4" />
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
