import { EventEmitter } from "node:events";
import type { ServerEvent } from "@clouddev/shared";

export type Unsubscribe = () => void;

/**
 * Fan-out of live agent events to WebSocket clients, keyed by task id.
 * Phase 1 implementation is a single in-process EventEmitter, which is
 * correct for a single backend instance. Phase 3 swaps this for
 * ElastiCache Redis pub/sub (same interface) once the backend runs as
 * multiple instances behind a load balancer and events need to reach a
 * WS connection that isn't on the instance that produced them.
 */
export interface EventBus {
  publish(taskId: string, event: ServerEvent): void;
  subscribe(taskId: string, handler: (event: ServerEvent) => void): Unsubscribe;
}

export class InMemoryEventBus implements EventBus {
  private readonly emitter = new EventEmitter();

  constructor() {
    // Many concurrent tasks each with a WS subscriber is expected.
    this.emitter.setMaxListeners(0);
  }

  publish(taskId: string, event: ServerEvent): void {
    this.emitter.emit(taskId, event);
  }

  subscribe(taskId: string, handler: (event: ServerEvent) => void): Unsubscribe {
    this.emitter.on(taskId, handler);
    return () => this.emitter.off(taskId, handler);
  }
}

export const eventBus: EventBus = new InMemoryEventBus();
