"use client";

import Link from "next/link";
import { Terminal, ChevronDown, CircleDot } from "lucide-react";
import { useAgentStore } from "@/state/store";
import { TASK_STATUS_LABEL } from "@/state/atoms";
import type { TaskStatus } from "@/state/atoms";

const statusClass: Record<TaskStatus, string> = {
  PLANNING: "text-cyan bg-cyan/10",
  EXECUTING: "text-primary bg-primary/10",
  BLOCKED_ON_USER: "text-amber-400 bg-amber-400/10",
  PR_CREATED: "text-violet bg-violet/10",
  DONE: "text-emerald-400 bg-emerald-400/10",
  FAILED: "text-destructive bg-destructive/10",
};

export function TopBar() {
  const { activeTask, wsConnected } = useAgentStore();
  const task = activeTask?.task;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background px-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-display text-sm font-semibold">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Terminal className="h-3.5 w-3.5" />
          </span>
          CloudDev
        </Link>
        {task && (
          <>
            <div className="mx-1 h-4 w-px bg-border" />
            <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <span className="font-mono text-xs">{task.repoFullName}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {task && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[task.status]}`}>
            <CircleDot className="h-3 w-3" />
            {TASK_STATUS_LABEL[task.status]}
          </span>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${wsConnected ? "animate-pulse-glow bg-emerald-400" : "bg-muted-foreground/40"}`} />
          {wsConnected ? "Live" : "Connecting…"}
        </div>
      </div>
    </header>
  );
}
