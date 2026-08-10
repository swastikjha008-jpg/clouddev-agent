"use client";

import { useEffect, useRef, useState } from "react";
import type { ServerEvent } from "@clouddev/shared";
import { getWsBaseUrl } from "@/lib/api";

const RECONNECT_DELAY_MS = 2000;

/**
 * Subscribes to `/ws/tasks/:id` for as long as `taskId` is set, and calls
 * `onEvent` for every ServerEvent the backend publishes (see
 * packages/shared's ServerEvent union — this hook doesn't interpret
 * events, it just delivers them). Reconnects on an unexpected close;
 * closes cleanly on unmount or when `taskId` changes.
 */
export function useTaskSocket(taskId: string | null, onEvent: (event: ServerEvent) => void) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!taskId) {
      setConnected(false);
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      socket = new WebSocket(`${getWsBaseUrl()}/ws/tasks/${taskId}`);

      socket.onopen = () => setConnected(true);

      socket.onmessage = (event: MessageEvent<string>) => {
        try {
          const parsed = JSON.parse(event.data) as ServerEvent;
          onEventRef.current(parsed);
        } catch {
          // Ignore malformed frames rather than crashing the whole panel.
        }
      };

      socket.onclose = () => {
        setConnected(false);
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
      setConnected(false);
    };
  }, [taskId]);

  return { connected };
}
