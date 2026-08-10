"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CreateTaskRequest } from "@clouddev/shared";
import type { Task, TaskSummary, AgentMessage, ToolCall, SandboxTab, ServerEvent } from "./atoms";
import * as api from "@/lib/api";
import { useTaskSocket } from "@/hooks/use-task-socket";

interface TaskDetail {
  task: Task | null;
  messages: AgentMessage[];
  toolCalls: ToolCall[];
  loading: boolean;
  error: string | null;
}

interface AgentStoreValue {
  tasks: TaskSummary[];
  tasksLoading: boolean;
  tasksError: string | null;
  refreshTasks: () => Promise<void>;

  activeTaskId: string | null;
  setActiveTaskId: (id: string) => void;
  activeTask: TaskDetail | null;

  sendMessage: (content: string) => Promise<void>;
  sendingMessage: boolean;

  createTask: (input: CreateTaskRequest) => Promise<void>;
  creatingTask: boolean;
  createTaskError: string | null;

  /** shellId -> accumulated output, for the active task only. */
  shellBuffer: Record<string, string>;

  sandboxTab: SandboxTab;
  setSandboxTab: (tab: SandboxTab) => void;
  /** Derived from the active task's real status — not a timer. */
  sandboxBooted: boolean;

  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  newTaskDialogOpen: boolean;
  setNewTaskDialogOpen: (open: boolean) => void;

  /** Whether the live event WebSocket for the active task is currently open. */
  wsConnected: boolean;
}

const AgentStoreContext = createContext<AgentStoreValue | null>(null);

const EMPTY_DETAIL: TaskDetail = { task: null, messages: [], toolCalls: [], loading: false, error: null };

export function AgentStoreProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskDetails, setTaskDetails] = useState<Record<string, TaskDetail>>({});
  const [shellBuffers, setShellBuffers] = useState<Record<string, Record<string, string>>>({});

  const [sendingMessage, setSendingMessage] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [createTaskError, setCreateTaskError] = useState<string | null>(null);

  const [sandboxTab, setSandboxTab] = useState<SandboxTab>("shell");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);

  const refreshTasks = useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const res = await api.listTasks();
      setTasks(res.tasks);
      setActiveTaskId((current) => current ?? res.tasks[0]?.id ?? null);
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : "Failed to load tasks.");
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshTasks();
    // Only on mount — refreshTasks is stable (empty deps) and re-running it
    // elsewhere happens explicitly (createTask, retry buttons).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load full detail (messages + tool calls) whenever the selected task changes.
  useEffect(() => {
    if (!activeTaskId) return;
    let cancelled = false;

    setTaskDetails((prev) => ({
      ...prev,
      [activeTaskId]: prev[activeTaskId]
        ? { ...prev[activeTaskId], loading: true, error: null }
        : { ...EMPTY_DETAIL, loading: true },
    }));

    api
      .getTask(activeTaskId)
      .then((res) => {
        if (cancelled) return;
        setTaskDetails((prev) => ({
          ...prev,
          [activeTaskId]: { task: res.task, messages: res.messages, toolCalls: res.toolCalls, loading: false, error: null },
        }));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setTaskDetails((prev) => ({
          ...prev,
          [activeTaskId]: {
            ...(prev[activeTaskId] ?? EMPTY_DETAIL),
            loading: false,
            error: err instanceof Error ? err.message : "Failed to load task.",
          },
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [activeTaskId]);

  const applyServerEvent = useCallback((event: ServerEvent) => {
    const { taskId } = event;

    switch (event.type) {
      case "agent_message": {
        setTaskDetails((prev) => {
          const detail = prev[taskId];
          if (!detail) return prev;
          if (detail.messages.some((m) => m.id === event.message.id)) return prev;
          return { ...prev, [taskId]: { ...detail, messages: [...detail.messages, event.message] } };
        });
        break;
      }
      case "tool_call_started":
      case "tool_call_result": {
        setTaskDetails((prev) => {
          const detail = prev[taskId];
          if (!detail) return prev;
          const idx = detail.toolCalls.findIndex((tc) => tc.id === event.toolCall.id);
          const toolCalls =
            idx === -1 ? [...detail.toolCalls, event.toolCall] : detail.toolCalls.map((tc, i) => (i === idx ? event.toolCall : tc));
          return { ...prev, [taskId]: { ...detail, toolCalls } };
        });
        break;
      }
      case "shell_output": {
        setShellBuffers((prev) => {
          const taskBuffers = prev[taskId] ?? {};
          const existing = taskBuffers[event.shellId] ?? "";
          return { ...prev, [taskId]: { ...taskBuffers, [event.shellId]: existing + event.chunk } };
        });
        break;
      }
      case "status_changed": {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: event.status } : t)));
        setTaskDetails((prev) => {
          const detail = prev[taskId];
          if (!detail?.task) return prev;
          return { ...prev, [taskId]: { ...detail, task: { ...detail.task, status: event.status } } };
        });
        break;
      }
      case "pr_created": {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, prUrl: event.prUrl, prNumber: event.prNumber } : t)));
        setTaskDetails((prev) => {
          const detail = prev[taskId];
          if (!detail?.task) return prev;
          return { ...prev, [taskId]: { ...detail, task: { ...detail.task, prUrl: event.prUrl, prNumber: event.prNumber } } };
        });
        break;
      }
    }
  }, []);

  const { connected: wsConnected } = useTaskSocket(activeTaskId, applyServerEvent);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeTaskId) return;
      setSendingMessage(true);
      try {
        await api.postTaskMessage(activeTaskId, content);
      } finally {
        setSendingMessage(false);
      }
    },
    [activeTaskId],
  );

  const createTask = useCallback(
    async (input: CreateTaskRequest) => {
      setCreatingTask(true);
      setCreateTaskError(null);
      try {
        const res = await api.createTask(input);
        await refreshTasks();
        setActiveTaskId(res.taskId);
        setNewTaskDialogOpen(false);
      } catch (err) {
        setCreateTaskError(err instanceof Error ? err.message : "Failed to create task.");
        throw err;
      } finally {
        setCreatingTask(false);
      }
    },
    [refreshTasks],
  );

  const activeTask = activeTaskId ? (taskDetails[activeTaskId] ?? EMPTY_DETAIL) : null;

  const value = useMemo<AgentStoreValue>(() => {
    const shellBuffer = activeTaskId ? (shellBuffers[activeTaskId] ?? {}) : {};
    const sandboxBooted = activeTask?.task ? activeTask.task.status !== "PLANNING" : false;

    return {
      tasks,
      tasksLoading,
      tasksError,
      refreshTasks,
      activeTaskId,
      setActiveTaskId,
      activeTask,
      sendMessage,
      sendingMessage,
      createTask,
      creatingTask,
      createTaskError,
      shellBuffer,
      sandboxTab,
      setSandboxTab,
      sandboxBooted,
      sidebarCollapsed,
      setSidebarCollapsed,
      newTaskDialogOpen,
      setNewTaskDialogOpen,
      wsConnected,
    };
  }, [
    tasks,
    tasksLoading,
    tasksError,
    refreshTasks,
    activeTaskId,
    activeTask,
    shellBuffers,
    sendMessage,
    sendingMessage,
    createTask,
    creatingTask,
    createTaskError,
    sandboxTab,
    sidebarCollapsed,
    newTaskDialogOpen,
    wsConnected,
  ]);

  return <AgentStoreContext.Provider value={value}>{children}</AgentStoreContext.Provider>;
}

export function useAgentStore() {
  const ctx = useContext(AgentStoreContext);
  if (!ctx) throw new Error("useAgentStore must be used within AgentStoreProvider");
  return ctx;
}
