export { PLATFORM_EVENT_BUS_VERSION } from "./version";
export {
  PLATFORM_INTEGRATION_SOURCE_EVENT_ID,
  PLATFORM_INTEGRATION_SOURCE_EVENT_VERSION,
  PLATFORM_EVENT_BUS_PUBLISHER,
  OUTBOX_AGGREGATE_TYPE_INTEGRATION,
  OUTBOX_EVENT_TYPE_INTEGRATION_SOURCE,
  PLATFORM_WEBHOOK_SIGNATURE_HEADER,
} from "./constants";

export {
  platformEventBusDescriptors,
  ensurePlatformEventBusRegistry,
} from "./registry";

export {
  validateIntegrationSourceEvent,
  type SourceEventValidationIssue,
  type SourceEventValidationResult,
} from "./validate-source-event";

export { mapSourceEventToEnvelope } from "./map-source-event";
export { mapOutboxEventToEnvelope, type MapOutboxResult } from "./map-outbox-event";

export { routeSourceEvent, type EventRoute } from "./routing";
export { dispatchEnvelope, type DispatchResult } from "./dispatch";

export {
  createJsonWebhookDecoder,
  createPlatformIngressTranslator,
  createPlatformIngressPipeline,
} from "./ingress/pipeline";

export {
  createPlatformWebhookIngressService,
  type IngressDispatchMode,
  type PlatformWebhookIngressRequest,
  type PlatformWebhookIngressResult,
  type PlatformWebhookIngressService,
} from "./ingress/service";

export {
  createEventBusOutboxHandler,
  type CreateEventBusOutboxHandlerOptions,
} from "./relay/outbox-handler";

export {
  createPlatformEventBus,
  type CreatePlatformEventBusOptions,
  type PlatformEventBusRuntime,
} from "./create-platform-event-bus";

export {
  createEventBusMetrics,
  type EventBusMetrics,
  type EventBusMetricsSnapshot,
} from "./metrics";

export {
  createInMemoryEventBusAuditSink,
  type EventBusAuditAction,
  type EventBusAuditRecord,
  type EventBusAuditSink,
} from "./audit";

export {
  buildDiagnostics,
  type PlatformEventBusDiagnostics,
  type PlatformEventBusDiagnosticsState,
} from "./diagnostics";

export { toHealth, type PlatformEventBusHealth } from "./health";

export {
  createStructuredLogger,
  type StructuredLogger,
  type StructuredLogLevel,
  type StructuredLogFields,
} from "./logging";
