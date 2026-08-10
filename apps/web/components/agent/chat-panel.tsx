"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, User } from "lucide-react";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import { SnakeLoader } from "@/components/ui/snake-loader";
import { useAgentStore } from "@/state/store";
import { cn } from "@/lib/utils";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatPanel() {
  const { activeTask, sendMessage, sendingMessage } = useAgentStore();
  const messages = activeTask?.messages ?? [];
  const task = activeTask?.task ?? null;
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isWorking = task?.status === "PLANNING" || task?.status === "EXECUTING";
  const canReply = task?.status === "BLOCKED_ON_USER";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, isWorking]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canReply) return;
    const formData = new FormData(e.currentTarget);
    const text = (formData.get("message") as string)?.trim();
    if (!text) return;

    setSendError(null);
    e.currentTarget.reset();
    try {
      await sendMessage(text);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send message.");
    }
  };

  const placeholderText = !task
    ? "Select or start a task to begin…"
    : canReply
      ? undefined // default PromptBox placeholder ("Message...")
      : isWorking
        ? "Agent is working — you can reply once it needs your input"
        : task.status === "PR_CREATED" || task.status === "DONE"
          ? "This task is finished"
          : "This task failed";

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-background">
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-6">
          {activeTask?.loading && <p className="text-center text-xs text-muted-foreground">Loading…</p>}
          {activeTask?.error && <p className="text-center text-xs text-destructive">{activeTask.error}</p>}

          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  msg.role !== "user" ? "bg-primary/15 text-primary" : "bg-accent text-foreground",
                )}
              >
                {msg.role !== "user" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={cn("flex max-w-[85%] flex-col gap-1", msg.role === "user" && "items-end")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role !== "user"
                      ? "rounded-tl-sm bg-card text-card-foreground"
                      : "rounded-tr-sm bg-primary text-primary-foreground",
                  )}
                >
                  {msg.content}
                </div>
                <span className="px-1 font-mono text-[11px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          ))}

          {isWorking && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-card px-4 py-3">
                <SnakeLoader width={5} speed={70} snakeColor="hsl(var(--primary))" appleColor="hsl(var(--cyan))" dotClassName="size-[3px] rounded-[0.5px]" />
                <span className="font-mono text-xs text-muted-foreground">working…</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/60 bg-background p-4">
        <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto max-w-2xl">
          <fieldset disabled={!canReply || sendingMessage} className="disabled:opacity-60">
            <PromptBox
              key={messages.length}
              name="message"
              {...(placeholderText ? { placeholder: placeholderText } : {})}
              className="!bg-card dark:!bg-card"
            />
          </fieldset>
          {sendError && <p className="mt-2 text-xs text-destructive">{sendError}</p>}
        </form>
      </div>
    </div>
  );
}
