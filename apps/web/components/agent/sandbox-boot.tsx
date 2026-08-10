"use client";

import { SnakeLoader } from "@/components/ui/snake-loader";
import { useAgentStore } from "@/state/store";

export function SandboxBoot() {
  const { sandboxBooted, activeTask } = useAgentStore();

  if (sandboxBooted || !activeTask?.task) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-background">
      <SnakeLoader width={9} speed={65} snakeColor="hsl(var(--primary))" appleColor="hsl(var(--cyan))" dotClassName="size-2 rounded-[2px]" />
      <p className="font-mono text-xs text-muted-foreground">Provisioning sandbox…</p>
    </div>
  );
}
