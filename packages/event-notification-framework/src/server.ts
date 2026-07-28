export {
  EVENT_NOTIFICATION_SERVER_STATUS,
  type EventNotificationServerStatus,
} from "./status";

export type {
  EventNotificationContext,
  CreateEventNotificationContextOptions,
} from "./di";
export { createEventNotificationContext } from "./di";

export type {
  EventEnvelope,
  PlatformEventEnvelope,
  EventDescriptor,
  EventMetadata,
  EventRegistryMetadata,
  EventRegistry,
  EventBus,
} from "./event";

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
} from "./event";

export type { InProcessEventBusOptions } from "./event";
export type {
  EventEnvelopeValidationIssue,
  EventEnvelopeValidationIssueCode,
  EventEnvelopeValidationResult,
} from "./event";
export type { EventBusTransport, EventBusTransportStatus } from "./event";

export {
  bootstrapEventRegistry,
  bootstrapEventRegistryFromCapabilities,
} from "./catalogue/bootstrap-event-registry";

export type {
  BootstrapEventRegistryOptions,
  BootstrapEventRegistryResult,
} from "./catalogue/bootstrap-event-registry";

export {
  registerPlatformEventCatalogue,
  buildPlatformEventDescriptors,
} from "./catalogue/register-platform-events";

export {
  PLATFORM_EVENT_CATALOGUE,
  type PlatformEventCatalogueEntry,
} from "./catalogue/platform-event-catalogue";

export { EVENT_NOTIFICATION_PLATFORM_VERSION } from "./catalogue/platform-version";

export {
  buildEventRegistryHydrationDiagnostics,
  createEmptyEventRegistryHydrationDiagnostics,
  type EventRegistryHydrationDiagnostics,
} from "./server/event-registry-hydration-diagnostics";

export {
  EVENT_REGISTRY_DTO_SCHEMA_VERSION,
  type EventRegistryDtoSchemaVersion,
} from "./server/event-registry-dto-schema-version";

export {
  createEmptyEventRegistryDto,
  mapEventRegistryDto,
  mapEventMetadataToDescriptorDto,
  type EventDescriptorDto,
  type EventRegistryDto,
} from "./server/map-event-registry-dto";

export { filterEventRegistryDto } from "./server/filter-event-registry-dto";

export {
  validateEventRegistryDto,
  type EventRegistryDtoValidationResult,
} from "./server/validate-event-registry-dto";

export {
  mapPlatformCapabilitiesToEventRecords,
  type EventCapabilitySnapshot,
} from "./server/map-capability-records";

export type {
  NotificationDescriptor,
  NotificationRouteStatus,
  NotificationVisibility,
  NotificationStability,
  NotificationDescriptorSource,
  NotificationRegistry,
  NotificationRegistryFactory,
  NotificationMetadata,
  NotificationRegistryMetadata,
  NotificationMapper,
  NotificationService,
  NotificationItem,
} from "./notification";

export {
  DefaultNotificationRegistry,
  createDefaultNotificationRegistry,
  defaultNotificationRegistryFactory,
  validateNotificationDescriptor,
  buildNotificationMetadata,
  DefaultNotificationMapper,
  createDefaultNotificationMapper,
  syncNotificationMapperRegistryFromDescriptors,
  DefaultNotificationMapperRegistry,
  createDefaultNotificationMapperRegistry,
  resolveNotificationRoutes,
  renderNotificationTemplate,
  createNotificationItem,
  DefaultNotificationService,
  createDefaultNotificationService,
  DefaultNotificationSessionStore,
  createDefaultNotificationSessionStore,
  PersistedNotificationSessionStore,
  createPersistedNotificationSessionStore,
  createLawNotificationPersistenceStorageKey,
  createPostgresNotificationPersistenceStorage,
  createProductionPostgresNotificationSessionStore,
  loadPostgresNotificationSessionSnapshot,
  savePostgresNotificationSessionSnapshot,
  PlaceholderNotificationRegistry,
  PlaceholderNotificationMapper,
  PlaceholderNotificationService,
  createPlaceholderNotificationRegistry,
  createPlaceholderNotificationMapper,
  createPlaceholderNotificationService,
} from "./notification";

export type {
  NotificationMapperResult,
  NotificationMappingIssue,
  NotificationMapperRegistry,
  NotificationRouteTemplate,
  NotificationItemMetadata,
  NotificationItemDiagnostics,
  DefaultNotificationMapperOptions,
  CreateDefaultNotificationMapperOptions,
  ResolveNotificationRoutesOptions,
} from "./notification";

export {
  bootstrapNotificationRegistry,
  bootstrapNotificationRegistryFromCapabilities,
} from "./catalogue/bootstrap-notification-registry";

export type {
  BootstrapNotificationRegistryOptions,
  BootstrapNotificationRegistryResult,
} from "./catalogue/bootstrap-notification-registry";

export {
  registerPlatformNotificationCatalogue,
  buildPlatformNotificationDescriptors,
} from "./catalogue/register-platform-notifications";

export {
  PLATFORM_NOTIFICATION_CATALOGUE,
  type PlatformNotificationCatalogueEntry,
} from "./catalogue/platform-notification-catalogue";

export {
  buildNotificationRegistryHydrationDiagnostics,
  createEmptyNotificationRegistryHydrationDiagnostics,
  type NotificationRegistryHydrationDiagnostics,
} from "./server/notification-registry-hydration-diagnostics";

export {
  NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION,
  type NotificationRegistryDtoSchemaVersion,
} from "./server/notification-registry-dto-schema-version";

export {
  createEmptyNotificationRegistryDto,
  mapNotificationRegistryDto,
  mapNotificationMetadataToRouteDto,
  type NotificationRegistryDto,
  type NotificationRouteDescriptorDto,
} from "./server/map-notification-registry-dto";

export {
  validateNotificationRegistryDto,
  type NotificationRegistryDtoValidationResult,
} from "./server/validate-notification-registry-dto";

export { filterNotificationRegistryDto } from "./server/filter-notification-registry-dto";

export {
  extractNotificationDescriptorsFromCapabilities,
  collectNotificationManifestEntries,
  hasCapabilityNotificationDeclarations,
} from "./extraction/extract-notifications";

export { populateNotificationRegistryFromCapabilities } from "./extraction/populate-notification-registry";
