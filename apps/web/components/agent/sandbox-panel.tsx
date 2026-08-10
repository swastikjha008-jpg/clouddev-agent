"use client";

import { SquareTerminal, Globe2, FileDiff, ListTree } from "lucide-react";
import { useAgentStore } from "@/state/store";
import type { SandboxTab } from "@/state/atoms";
import { cn } from "@/lib/utils";
import { SandboxBoot } from "@/components/agent/sandbox-boot";
import { ShellView } from "@/components/agent/shell-view";
import { BrowserPreview } from "@/components/agent/browser-preview";
import { DiffViewer } from "@/components/agent/diff-viewer";
import { ActivityLog } from "@/components/agent/activity-log";

const tabs: { id: SandboxTab; label: string; icon: typeof SquareTerminal }[] = [
  { id: "shell", label: "Shell", icon: SquareTerminal },
  { id: "browser", label: "Browser", icon: Globe2 },
  { id: "diff", label: "Diff", icon: FileDiff },
  { id: "activity", label: "Activity", icon: ListTree },
];

export function SandboxPanel() {
  const { sandboxTab, setSandboxTab } = useAgentStore();

  return (
    <div className="relative flex w-[46%] min-w-[380px] shrink-0 flex-col border-l border-border/60 bg-card/30">
      <SandboxBoot />

      <div className="flex shrink-0 items-center gap-1 border-b border-border/60 px-2 py-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSandboxTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              sandboxTab === t.id
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        {sandboxTab === "shell" && <ShellView />}
        {sandboxTab === "browser" && <BrowserPreview />}
        {sandboxTab === "diff" && <DiffViewer />}
        {sandboxTab === "activity" && <ActivityLog />}
      </div>
    </div>
  );
}
