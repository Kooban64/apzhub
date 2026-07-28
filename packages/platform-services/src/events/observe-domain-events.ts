/**
 * Observe alert lifecycle domain events (ADR-0070 Phase A).
 * Delivery providers are NOT implemented here — Event Bus seam only.
 */

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  createDomainEventEnvelopeId,
  publishDomainEventFailSoft,
  type DomainEventEnvelope,
  type DomainEventPublisher,
  type DomainEventPublishResult,
} from "./domain-event-publisher";

export const OBSERVE_ALERT_DOMAIN_EVENT_IDS = {
  fired: "observe.alert.fired",
  acknowledged: "observe.alert.acknowledged",
  resolved: "observe.alert.resolved",
  suppressed: "observe.alert.suppressed",
} as const;

export type ObserveAlertDomainEventId =
  (typeof OBSERVE_ALERT_DOMAIN_EVENT_IDS)[keyof typeof OBSERVE_ALERT_DOMAIN_EVENT_IDS];

export interface ObserveAlertEventPayload {
  readonly alertStateId: string;
  readonly alertDefinitionId: string;
  readonly state: string;
  readonly severity?: string;
  readonly fingerprint?: string;
  readonly organisationId?: string;
  readonly message?: string;
}

function buildEnvelope(
  eventId: ObserveAlertDomainEventId,
  ctx: ServiceRequestContext,
  payload: Readonly<Record<string, unknown>>,
): DomainEventEnvelope {
  return {
    envelopeId: createDomainEventEnvelopeId(),
    eventId,
    eventVersion: "1.0.0",
    category: "business",
    correlationId: ctx.correlationId || createDomainEventEnvelopeId(),
    timestamp: new Date().toISOString(),
    publisher: "observe-service",
    actorId: ctx.userId,
    sourceService: "observe-service",
    tenantId: ctx.tenantId,
    payload,
  };
}

export function publishObserveAlertEvent(
  publisher: DomainEventPublisher | undefined,
  ctx: ServiceRequestContext,
  eventId: ObserveAlertDomainEventId,
  payload: ObserveAlertEventPayload,
): DomainEventPublishResult {
  return publishDomainEventFailSoft(
    publisher,
    buildEnvelope(eventId, ctx, { ...payload }),
  );
}
