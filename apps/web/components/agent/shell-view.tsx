"use client";

import { useEffect, useRef } from "react";
import { useAgentStore } from "@/state/store";

export function ShellView() {
  const { shellBuffer, activeTask } = useAgentStore();
  const shellIds = Object.keys(shellBuffer);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight });
  }, [shellBuffer]);

  if (shellIds.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-[#05070d] p-4 font-mono text-[13px] text-muted-foreground">
        {activeTask?.task ? "No shell activity yet." : "Select a task to see its shell."}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full overflow-y-auto custom-scrollbar bg-[#05070d] p-4 font-mono text-[13px] leading-relaxed">
      {shellIds.map((shellId) => (
        <div key={shellId} className="mb-4">
          {shellIds.length > 1 && <div className="mb-1 text-primary">$ shell {shellId.slice(0, 8)}</div>}
          <pre className="whitespace-pre-wrap break-all text-foreground/80">{shellBuffer[shellId]}</pre>
        </div>
      ))}
      <div className="flex items-center gap-1 text-primary">
        <span>$</span>
        <span className="h-4 w-2 caret-blink bg-primary" />
      </div>
    </div>
  );
}
