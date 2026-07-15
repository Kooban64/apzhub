export type {
  DeliveryMechanism,
  EventIdentitySource,
  PollingDeliveryMetadata,
  SafeSourceMetadata,
  SourceEventAction,
  TraceContext,
  WebhookDeliveryMetadata,
} from "./types";
export {
  DELIVERY_MECHANISMS,
  EVENT_IDENTITY_SOURCES,
  SOURCE_EVENT_ENVELOPE_SCHEMA_VERSION,
  SOURCE_EVENT_PAYLOAD_SCHEMA_VERSION,
  isDeliveryMechanism,
} from "./types";

export type {
  BuildIntegrationSourceEventInput,
  IntegrationSourceEvent,
} from "./source-event";
export { buildIntegrationSourceEvent } from "./source-event";

export type { DeriveSourceEventIdInput, DerivedEventIdentity } from "./event-identity";
export {
  createSdkEventId,
  deriveDeduplicationKey,
  deriveSourceEventId,
  fingerprintPayload,
} from "./event-identity";

export type {
  SchemaCompatibility,
  SchemaCompatibilityResult,
  SchemaVersion,
} from "./event-versioning";
export {
  assertEnvelopeSchemaCompatible,
  assertPayloadSchemaCompatible,
  compareSchemaVersions,
  currentEnvelopeSchemaVersion,
  currentPayloadSchemaVersion,
  parseSchemaVersion,
} from "./event-versioning";

export type { EventError, EventErrorCategory, EventErrorContext } from "./errors";
export {
  createEventError,
  eventDuplicateError,
  eventErrorToIntegrationError,
  eventValidationError,
  isEventError,
  mapEventErrorCategory,
  pollingCancelledError,
  pollingCheckpointError,
  pollingLimitExceededError,
  pollingStallDetectedError,
  schemaIncompatibleError,
  unsupportedWebhookOperationError,
  webhookReplayRejectedError,
  webhookVerificationFailedError,
} from "./errors";

export type {
  EventDeduplicationStore,
  InMemoryEventDeduplicationStoreOptions,
} from "./deduplication";
export {
  InMemoryEventDeduplicationStore,
  createInMemoryEventDeduplicationStore,
} from "./deduplication";

export type {
  EventDiagnosticsCollector,
  EventDiagnosticsHealth,
  EventDiagnosticsSnapshot,
  PollingDiagnosticsSnapshot,
  WebhookDiagnosticsSnapshot,
} from "./diagnostics";
export {
  DefaultEventDiagnosticsCollector,
  buildSafeEventLogFields,
  createEventDiagnosticsCollector,
} from "./diagnostics";

export type { EventMetrics, EventMetricsSnapshot } from "./metrics";
export {
  DefaultEventMetrics,
  STANDARD_EVENT_METRIC_NAMES,
  createEventMetrics,
} from "./metrics";

export type {
  EventCapabilityDeclaration,
  EventCapabilityId,
  PollingCapabilityDeclaration,
  WebhookCapabilityDeclaration,
} from "./capabilities";
export {
  EVENT_CAPABILITY_IDS,
  declareEventCapabilities,
  declarePollingCapability,
  declareWebhookCapability,
  listKnownEventCapabilityIds,
  resolveRegisteredEventCapabilityIds,
} from "./capabilities";

export type {
  FromIntegrationEventEnvelopeMeta,
  IntegrationEventEnvelopeCompat,
} from "./bridge";
export { fromIntegrationEventEnvelope, toIntegrationEventEnvelope } from "./bridge";

export * from "./webhook";
export * from "./polling";

export type { MockPollingSourceOptions, MockSourceEventOptions } from "./mock";
export {
  createMockEventTestHarness,
  createMockJsonWebhookDecoder,
  createMockPollingSource,
  createMockSourceEvent,
  createMockWebhookTranslator,
  computeMockHmacSignature,
  createMockHmacWebhookVerifier,
} from "./mock";
