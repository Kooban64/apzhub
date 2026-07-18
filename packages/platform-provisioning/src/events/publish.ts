import type { EventBus, EventEnvelope } from "@apzhub/event-notification-framework";

import {
  PLATFORM_PROVISIONING_PUBLISHER,
  PROVISIONING_EVENT_VERSION,
} from "../constants";
import { createUuid } from "../uuid";

export type PublishProvisioningEventInput = {
  readonly bus: EventBus;
  readonly eventId: string;
  readonly correlationId: string;
  readonly tenantId: string;
  readonly actorId?: string;
  readonly causationId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export type PublishCounters = {
  ok: number;
  failed: number;
};

export function createPublishCounters(): PublishCounters {
  return { ok: 0, failed: 0 };
}

export function publishProvisioningEvent(
  input: PublishProvisioningEventInput,
  counters?: PublishCounters,
): boolean {
  const envelope: EventEnvelope = {
    envelopeId: createUuid(),
    eventId: input.eventId,
    eventVersion: PROVISIONING_EVENT_VERSION,
    category: "system",
    correlationId: input.correlationId,
    causationId: input.causationId,
    timestamp: new Date().toISOString(),
    publisher: PLATFORM_PROVISIONING_PUBLISHER,
    actorId: input.actorId,
    sourceService: PLATFORM_PROVISIONING_PUBLISHER,
    tenantId: input.tenantId,
    payload: input.payload,
  };

  const result = input.bus.publish(envelope);
  if (counters) {
    if (result.ok) counters.ok += 1;
    else counters.failed += 1;
  }
  return result.ok;
}
