/**
 * Shared enums and types for Integration SDK webhook & polling contracts (OSS-100-08).
 * Vendor-neutral — adapters inject provider-specific logic.
 */

export const DELIVERY_MECHANISMS = [
  "webhook",
  "polling",
  "manual",
  "replay",
  "unknown",
] as const;

export type DeliveryMechanism = (typeof DELIVERY_MECHANISMS)[number];

export function isDeliveryMechanism(value: string): value is DeliveryMechanism {
  return (DELIVERY_MECHANISMS as readonly string[]).includes(value);
}

export const EVENT_IDENTITY_SOURCES = [
  "provider_event_id",
  "resource_action_timestamp",
  "payload_fingerprint",
  "sdk_generated",
] as const;

export type EventIdentitySource = (typeof EVENT_IDENTITY_SOURCES)[number];

/** Current IntegrationSourceEvent envelope schema version. */
export const SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION = "1.0.0";

/** Default payload schema version when adapter does not specify one. */
export const SOURCE_EVENT_PAYLOAD_SCHEMA_VERSION = "1.0.0";

export type SourceEventAction =
  | "created"
  | "updated"
  | "deleted"
  | "archived"
  | "state_changed"
  | "assigned"
  | "unassigned"
  | "commented"
  | "membership_changed"
  | "closed"
  | "reopened"
  | "priority_changed"
  | "attachment_added"
  | "unknown"
  | (string & {});

export interface WebhookDeliveryMetadata {
  readonly deliveryId?: string;
  readonly signaturePresent?: boolean;
  readonly signatureValid?: boolean;
  readonly headersRedacted?: Readonly<Record<string, string>>;
  readonly endpointId?: string;
  readonly attempt?: number;
}

export interface PollingDeliveryMetadata {
  readonly pollRunId?: string;
  readonly pageToken?: string;
  readonly cursorKind?: string;
  readonly checkpointId?: string;
  readonly mode?: string;
}

/** Safe, non-secret provider metadata for diagnostics. */
export interface SafeSourceMetadata {
  readonly vendorEvent?: string;
  readonly vendorAction?: string;
  readonly resourceId?: string;
  readonly providerStatus?: string;
  readonly extra?: Readonly<Record<string, string>>;
}

export interface TraceContext {
  readonly traceId?: string;
  readonly spanId?: string;
  readonly parentSpanId?: string;
}
