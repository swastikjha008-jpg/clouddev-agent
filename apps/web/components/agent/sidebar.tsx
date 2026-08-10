"use client";

import { Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAgentStore } from "@/state/store";
import type { TaskStatus } from "@/state/atoms";
import { cn } from "@/lib/utils";

const dotClass: Record<TaskStatus, string> = {
  PLANNING: "bg-cyan",
  EXECUTING: "bg-primary",
  BLOCKED_ON_USER: "bg-amber-400",
  PR_CREATED: "bg-violet",
  DONE: "bg-emerald-400",
  FAILED: "bg-destructive",
};

export function Sidebar() {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    activeTaskId,
    setActiveTaskId,
    tasks,
    tasksLoading,
    tasksError,
    refreshTasks,
    setNewTaskDialogOpen,
  } = useAgentStore();

  if (sidebarCollapsed) {
    return (
      <div className="flex w-12 shrink-0 flex-col items-center border-r border-border/60 bg-background py-3">
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border/60 bg-background">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-display text-sm font-semibold">Tasks</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setNewTaskDialogOpen(true)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar px-2 pb-3">
        {tasksLoading && <p className="px-3 py-2 text-xs text-muted-foreground">Loading tasks…</p>}

        {tasksError && !tasksLoading && (
          <div className="mx-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <p>{tasksError}</p>
            <button onClick={() => void refreshTasks()} className="mt-1 underline underline-offset-2">
              Retry
            </button>
          </div>
        )}

        {!tasksLoading && !tasksError && tasks.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            No tasks yet.
            <button onClick={() => setNewTaskDialogOpen(true)} className="mt-1 block w-full text-primary underline underline-offset-2">
              Start one
            </button>
          </div>
        )}

        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => setActiveTaskId(task.id)}
            className={cn(
              "flex w-full flex-col gap-1.5 rounded-lg px-3 py-2.5 text-left transition-colors",
              task.id === activeTaskId ? "bg-accent" : "hover:bg-accent/60",
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass[task.status])} />
              <span className="truncate text-sm font-medium">{task.title}</span>
            </div>
            <span className="pl-3.5 font-mono text-[11px] text-muted-foreground">{task.repoFullName}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
