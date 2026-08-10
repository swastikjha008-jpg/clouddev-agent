"use client";

import { Terminal, FileEdit, FolderOpen, MessageSquare, GitPullRequest, CheckCircle2, XCircle, Loader2, Wrench } from "lucide-react";
import { useAgentStore } from "@/state/store";
import type { ToolCall } from "@/state/atoms";
import { cn } from "@/lib/utils";

const iconFor: Record<string, typeof Terminal> = {
  run_shell: Terminal,
  view_shell: Terminal,
  write_to_shell: Terminal,
  kill_shell: Terminal,
  open_file: FolderOpen,
  create_file: FileEdit,
  str_replace: FileEdit,
  insert_at_line: FileEdit,
  undo_edit: FileEdit,
  message_user: MessageSquare,
  git_create_pr: GitPullRequest,
};

function detailFor(toolCall: ToolCall): string {
  const args = toolCall.args;
  if (typeof args.command === "string") return args.command;
  if (typeof args.path === "string") return args.path;
  if (typeof args.content === "string") return args.content.slice(0, 80);
  if (typeof args.shellId === "string") return `shell ${args.shellId.slice(0, 8)}`;
  return Object.keys(args).length > 0 ? JSON.stringify(args) : "";
}

export function ActivityLog() {
  const { activeTask } = useAgentStore();
  const toolCalls = activeTask?.toolCalls ?? [];

  if (!activeTask?.task) {
    return <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Select a task to see its activity.</div>;
  }

  if (toolCalls.length === 0) {
    return <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No activity yet.</div>;
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-3">
      <ul className="space-y-1.5">
        {toolCalls.map((tc) => {
          const Icon = iconFor[tc.toolName] ?? Wrench;
          return (
            <li key={tc.id} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-medium text-foreground">{tc.toolName}</span>
                  {tc.status === "running" && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                  {tc.status === "succeeded" && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                  {tc.status === "failed" && <XCircle className="h-3 w-3 text-destructive" />}
                </div>
                <p className={cn("mt-0.5 truncate font-mono text-[11px] text-muted-foreground")}>{detailFor(tc)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
