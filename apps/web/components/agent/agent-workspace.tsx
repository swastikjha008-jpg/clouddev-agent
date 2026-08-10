"use client";

import { AgentStoreProvider } from "@/state/store";
import { TopBar } from "@/components/agent/top-bar";
import { Sidebar } from "@/components/agent/sidebar";
import { ChatPanel } from "@/components/agent/chat-panel";
import { SandboxPanel } from "@/components/agent/sandbox-panel";
import { NewTaskDialog } from "@/components/agent/new-task-dialog";

export function AgentWorkspace() {
  return (
    <AgentStoreProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <TopBar />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <ChatPanel />
          <SandboxPanel />
        </div>
      </div>
      <NewTaskDialog />
    </AgentStoreProvider>
  );
}
