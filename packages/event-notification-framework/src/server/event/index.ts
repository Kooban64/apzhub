export { EVENT_LAYER_STATUS, type EventLayerStatus } from "../../status";

export type {
  EventEnvelope,
  PlatformEventEnvelope,
  EventDescriptor,
  EventDescriptorStatus,
  EventVisibility,
  EventStability,
  EventRegistry,
  EventMetadata,
  EventRegistryMetadata,
  EventBus,
  EventBusPublishResult,
  EventBusPublishErrorCode,
  EventBusSubscribeOptions,
} from "../../event";

export {
  DefaultEventRegistry,
  createDefaultEventRegistry,
  defaultEventRegistryFactory,
  InProcessEventBus,
  createInProcessEventBus,
  PlaceholderEventRegistry,
  PlaceholderEventBus,
  createPlaceholderEventRegistry,
  createPlaceholderEventBus,
  validateEventDescriptor,
  validateEventEnvelope,
  matchesEventPattern,
  buildEventMetadata,
} from "../../event";

export type { InProcessEventBusOptions } from "../../event";
export type {
  EventEnvelopeValidationIssue,
  EventEnvelopeValidationIssueCode,
  EventEnvelopeValidationResult,
} from "../../event";
export type { EventBusTransport, EventBusTransportStatus } from "../../event";

export {
  bootstrapEventRegistry,
  bootstrapEventRegistryFromCapabilities,
} from "../../catalogue/bootstrap-event-registry";

export type {
  BootstrapEventRegistryOptions,
  BootstrapEventRegistryResult,
} from "../../catalogue/bootstrap-event-registry";

export {
  registerPlatformEventCatalogue,
  buildPlatformEventDescriptors,
} from "../../catalogue/register-platform-events";

export { PLATFORM_EVENT_CATALOGUE } from "../../catalogue/platform-event-catalogue";

export { EVENT_NOTIFICATION_PLATFORM_VERSION } from "../../catalogue/platform-version";

export {
  extractEventDescriptorsFromCapabilities,
  hasCapabilityEventDeclarations,
} from "../../extraction/extract-events";

export {
  buildEventRegistryHydrationDiagnostics,
  createEmptyEventRegistryHydrationDiagnostics,
  type EventRegistryHydrationDiagnostics,
} from "../event-registry-hydration-diagnostics";

export { mapPlatformCapabilitiesToEventRecords } from "../map-capability-records";

export {
  EVENT_REGISTRY_DTO_SCHEMA_VERSION,
  type EventRegistryDtoSchemaVersion,
} from "../event-registry-dto-schema-version";

export {
  createEmptyEventRegistryDto,
  mapEventRegistryDto,
  mapEventMetadataToDescriptorDto,
  type EventDescriptorDto,
  type EventRegistryDto,
} from "../map-event-registry-dto";

export { filterEventRegistryDto } from "../filter-event-registry-dto";

export {
  validateEventRegistryDto,
  type EventRegistryDtoValidationResult,
} from "../validate-event-registry-dto";
