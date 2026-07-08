import type { EventCategory } from "../types/event-category";

/** Standard platform event envelope — Document 029 / ADR-0031. */
export interface EventEnvelope {
  readonly envelopeId: string;
  readonly eventId: string;
  readonly eventVersion: string;
  readonly category: EventCategory;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly timestamp: string;
  readonly publisher: string;
  readonly actorId?: string;
  readonly sourceService?: string;
  readonly tenantId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

/** Document 029 alias — same shape as EventEnvelope. */
export type PlatformEventEnvelope = EventEnvelope;

export type EventBusPublishErrorCode =
  "NOT_IMPLEMENTED" | "EVENT_NOT_REGISTERED" | "INVALID_ENVELOPE" | "PUBLISH_FAILED";

export interface EventBusPublishResult {
  readonly ok: boolean;
  readonly envelopeId?: string;
  readonly errorCode?: EventBusPublishErrorCode;
  readonly errorMessage?: string;
  readonly subscriberCount?: number;
  readonly deliveredCount?: number;
  readonly failedSubscriberCount?: number;
}

export interface EventBusSubscribeOptions {
  readonly eventPattern: string;
  readonly handler: (envelope: EventEnvelope) => void | Promise<void>;
}

export interface EventBus {
  publish(envelope: EventEnvelope): EventBusPublishResult;
  subscribe(options: EventBusSubscribeOptions): string;
  unsubscribe(subscriptionId: string): boolean;
  getDiagnostics(): import("../types/diagnostics").EventBusDiagnostics;
}
