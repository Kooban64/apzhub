import {
  SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION,
  SOURCE_EVENT_PAYLOAD_SCHEMA_VERSION,
  type DeliveryMechanism,
  type PollingDeliveryMetadata,
  type SafeSourceMetadata,
  type SourceEventAction,
  type TraceContext,
  type WebhookDeliveryMetadata,
} from "./types";

/**
 * Canonical vendor-neutral source event envelope produced by adapters.
 * No secrets. Platform global IDs are optional — not required.
 */
export interface IntegrationSourceEvent {
  readonly eventId: string;
  readonly sourceEventId: string;
  readonly eventType: string;
  readonly action: SourceEventAction;
  readonly resourceType: string;
  readonly providerId: string;
  readonly integrationId: string;
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly providerTimestamp?: string;
  readonly receivedTimestamp: string;
  readonly envelopeSchemaVersion: string;
  readonly payloadSchemaVersion: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly trace?: TraceContext;
  readonly deliveryMechanism: DeliveryMechanism;
  readonly webhookMetadata?: WebhookDeliveryMetadata;
  readonly pollingMetadata?: PollingDeliveryMetadata;
  readonly safeSourceMetadata?: SafeSourceMetadata;
  /** Canonical adapter payload — never includes secrets. */
  readonly canonicalPayload?: Readonly<Record<string, unknown>>;
  /** Redacted provider fields safe for diagnostics. */
  readonly redactedProviderMetadata?: Readonly<Record<string, string>>;
}

export interface BuildIntegrationSourceEventInput {
  readonly eventId: string;
  readonly sourceEventId: string;
  readonly eventType: string;
  readonly action: SourceEventAction;
  readonly resourceType: string;
  readonly providerId: string;
  readonly integrationId: string;
  readonly correlationId: string;
  readonly deliveryMechanism: DeliveryMechanism;
  readonly receivedTimestamp?: string;
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly providerTimestamp?: string;
  readonly causationId?: string;
  readonly trace?: TraceContext;
  readonly envelopeSchemaVersion?: string;
  readonly payloadSchemaVersion?: string;
  readonly webhookMetadata?: WebhookDeliveryMetadata;
  readonly pollingMetadata?: PollingDeliveryMetadata;
  readonly safeSourceMetadata?: SafeSourceMetadata;
  readonly canonicalPayload?: Readonly<Record<string, unknown>>;
  readonly redactedProviderMetadata?: Readonly<Record<string, string>>;
}

export function buildIntegrationSourceEvent(
  input: BuildIntegrationSourceEventInput,
): IntegrationSourceEvent {
  return {
    eventId: input.eventId,
    sourceEventId: input.sourceEventId,
    eventType: input.eventType,
    action: input.action,
    resourceType: input.resourceType,
    providerId: input.providerId,
    integrationId: input.integrationId,
    tenantId: input.tenantId,
    organisationId: input.organisationId,
    providerTimestamp: input.providerTimestamp,
    receivedTimestamp: input.receivedTimestamp ?? new Date().toISOString(),
    envelopeSchemaVersion:
      input.envelopeSchemaVersion ?? SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION,
    payloadSchemaVersion:
      input.payloadSchemaVersion ?? SOURCE_EVENT_PAYLOAD_SCHEMA_VERSION,
    correlationId: input.correlationId,
    causationId: input.causationId,
    trace: input.trace,
    deliveryMechanism: input.deliveryMechanism,
    webhookMetadata: input.webhookMetadata,
    pollingMetadata: input.pollingMetadata,
    safeSourceMetadata: input.safeSourceMetadata,
    canonicalPayload: input.canonicalPayload,
    redactedProviderMetadata: input.redactedProviderMetadata,
  };
}
