/** Registered ENF event id for SDK IntegrationSourceEvent ingress. */
export const PLATFORM_INTEGRATION_SOURCE_EVENT_ID =
  "platform.integration.sourceevent.received";

/** Event descriptor / envelope version. */
export const PLATFORM_INTEGRATION_SOURCE_EVENT_VERSION = "1.0.0";

/** Authorized publisher for platform event-bus envelopes. */
export const PLATFORM_EVENT_BUS_PUBLISHER = "platform-event-bus";

/** Outbox aggregate + event type for durable relay. */
export const OUTBOX_AGGREGATE_TYPE_INTEGRATION = "integration-source-event";
export const OUTBOX_EVENT_TYPE_INTEGRATION_SOURCE =
  PLATFORM_INTEGRATION_SOURCE_EVENT_ID;

/** Default HMAC signature header for platform webhook ingress. */
export const PLATFORM_WEBHOOK_SIGNATURE_HEADER = "x-apzhub-webhook-signature";
