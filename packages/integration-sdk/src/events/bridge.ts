import type { IntegrationSourceEvent } from "./source-event";
import { buildIntegrationSourceEvent } from "./source-event";
import { createSdkEventId } from "./event-identity";
import type { DeliveryMechanism } from "./types";

/**
 * Structural mirror of `@apzhub/platform-service-contracts` IntegrationEventEnvelope.
 * Kept local so the events package does not hard-depend on contracts at runtime;
 * bridge functions remain compatible with the contracts type.
 */
export interface IntegrationEventEnvelopeCompat {
  readonly id: string;
  readonly type: string;
  readonly resource: string;
  readonly action: string;
  readonly occurredAt: string;
  readonly workspaceId?: string;
  readonly projectId?: string;
  readonly supportTicketId?: string;
  readonly resourceId?: string;
  readonly actorId?: string;
  readonly correlationId?: string;
  readonly deliveryId?: string;
  readonly summary: string;
}

export interface FromIntegrationEventEnvelopeMeta {
  readonly providerId: string;
  readonly integrationId: string;
  readonly deliveryMechanism?: DeliveryMechanism;
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly envelopeSchemaVersion?: string;
  readonly payloadSchemaVersion?: string;
  readonly receivedTimestamp?: string;
  readonly causationId?: string;
  readonly sourceEventId?: string;
}

/**
 * Convert IntegrationSourceEvent → legacy IntegrationEventEnvelope.
 */
export function toIntegrationEventEnvelope(
  sourceEvent: IntegrationSourceEvent,
): IntegrationEventEnvelopeCompat {
  return {
    id: sourceEvent.eventId,
    type: sourceEvent.eventType,
    resource: sourceEvent.resourceType,
    action: sourceEvent.action,
    occurredAt: sourceEvent.providerTimestamp ?? sourceEvent.receivedTimestamp,
    workspaceId: sourceEvent.organisationId,
    projectId:
      typeof sourceEvent.canonicalPayload?.projectId === "string"
        ? sourceEvent.canonicalPayload.projectId
        : undefined,
    supportTicketId:
      typeof sourceEvent.canonicalPayload?.supportTicketId === "string"
        ? sourceEvent.canonicalPayload.supportTicketId
        : undefined,
    resourceId: sourceEvent.safeSourceMetadata?.resourceId,
    actorId:
      typeof sourceEvent.canonicalPayload?.actorId === "string"
        ? sourceEvent.canonicalPayload.actorId
        : undefined,
    correlationId: sourceEvent.correlationId,
    deliveryId: sourceEvent.webhookMetadata?.deliveryId,
    summary: `${sourceEvent.eventType} (${sourceEvent.resourceType}.${sourceEvent.action})`,
  };
}

/**
 * Convert legacy IntegrationEventEnvelope → IntegrationSourceEvent.
 */
export function fromIntegrationEventEnvelope(
  envelope: IntegrationEventEnvelopeCompat,
  meta: FromIntegrationEventEnvelopeMeta,
): IntegrationSourceEvent {
  const sourceEventId = meta.sourceEventId ?? envelope.deliveryId ?? envelope.id;

  return buildIntegrationSourceEvent({
    eventId: envelope.id || createSdkEventId(),
    sourceEventId,
    eventType: envelope.type,
    action: envelope.action,
    resourceType: envelope.resource,
    providerId: meta.providerId,
    integrationId: meta.integrationId,
    correlationId: envelope.correlationId ?? createSdkEventId("corr"),
    causationId: meta.causationId,
    deliveryMechanism: meta.deliveryMechanism ?? "unknown",
    tenantId: meta.tenantId,
    organisationId: meta.organisationId ?? envelope.workspaceId,
    providerTimestamp: envelope.occurredAt,
    receivedTimestamp: meta.receivedTimestamp,
    envelopeSchemaVersion: meta.envelopeSchemaVersion,
    payloadSchemaVersion: meta.payloadSchemaVersion,
    webhookMetadata: envelope.deliveryId
      ? { deliveryId: envelope.deliveryId }
      : undefined,
    safeSourceMetadata: {
      resourceId: envelope.resourceId,
    },
    canonicalPayload: {
      ...(envelope.projectId ? { projectId: envelope.projectId } : {}),
      ...(envelope.supportTicketId
        ? { supportTicketId: envelope.supportTicketId }
        : {}),
      ...(envelope.actorId ? { actorId: envelope.actorId } : {}),
      summary: envelope.summary,
    },
  });
}
