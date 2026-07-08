export {
  EVENT_NOTIFICATION_FRAMEWORK_STATUS,
  EVENT_LAYER_STATUS,
  NOTIFICATION_LAYER_STATUS,
  EVENT_NOTIFICATION_SERVER_STATUS,
  type EventNotificationFrameworkStatus,
  type EventLayerStatus,
  type NotificationLayerStatus,
  type EventNotificationServerStatus,
} from "./status";

export type {
  EventCategory,
  CanonicalEventCategory,
  NotificationKind,
  DeliveryChannel,
  NotificationPriority,
  EventNotificationDiagnosticsStatus,
  EventRegistryDiagnostics,
  EventBusDiagnostics,
  NotificationRegistryDiagnostics,
  NotificationMapperDiagnostics,
  NotificationServiceDiagnostics,
  EventNotificationFrameworkDiagnostics,
} from "./types";

export { CANONICAL_EVENT_CATEGORIES } from "./types";

export type {
  EventEnvelope,
  PlatformEventEnvelope,
  EventBus,
  EventBusPublishResult,
  EventBusPublishErrorCode,
  EventBusSubscribeOptions,
  EventDescriptor,
  EventDescriptorStatus,
  EventDescriptorSource,
  EventVisibility,
  EventStability,
  EventRegistry,
  EventRegistryFactory,
  EventEntryDiagnostics,
  EventMetadata,
  EventRegistryMetadata,
  EventRegistrationIssue,
  EventRegistrationIssueCode,
  EventBatchRegistrationResult,
} from "./event";

export {
  EventRegistryDuplicateError,
  EventRegistryNotFoundError,
  EventRegistryValidationError,
  validateEventDescriptor,
  DefaultEventRegistry,
  createDefaultEventRegistry,
  defaultEventRegistryFactory,
  InProcessEventBus,
  createInProcessEventBus,
  PlaceholderEventRegistry,
  PlaceholderEventBus,
  createPlaceholderEventRegistry,
  createPlaceholderEventBus,
  buildEventMetadata,
  validateEventEnvelope,
  matchesEventPattern,
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
  BootstrapEventRegistryFromCapabilitiesOptions,
  BootstrapEventRegistryFromCapabilitiesResult,
} from "./catalogue/bootstrap-event-registry";

export {
  registerPlatformEventCatalogue,
  buildPlatformEventDescriptors,
  catalogueEntryToDescriptor,
} from "./catalogue/register-platform-events";

export type { PlatformEventRegistrationResult } from "./catalogue/register-platform-events";

export {
  PLATFORM_EVENT_CATALOGUE,
  type PlatformEventCatalogueEntry,
} from "./catalogue/platform-event-catalogue";

export {
  EVENT_NOTIFICATION_PLATFORM_VERSION,
  type EventNotificationPlatformVersion,
} from "./catalogue/platform-version";

export {
  extractEventDescriptorsFromCapabilities,
  collectEventManifestEntries,
  hasCapabilityEventDeclarations,
} from "./extraction/extract-events";

export { populateRegistryFromCapabilities } from "./extraction/populate-registry";

export type {
  EventCapabilityRecord,
  EventExtractionDiagnostics,
  EventExtractionResult,
  ManifestEventRegistryPopulationResult,
  NotificationExtractionDiagnostics,
  NotificationExtractionResult,
  ManifestNotificationRegistryPopulationResult,
} from "./extraction/types";

export type { EventManifestEntry } from "./extraction/event-manifest-schema";

export type { NotificationManifestEntry } from "./extraction/notification-manifest-schema";

export {
  bootstrapNotificationRegistry,
  bootstrapNotificationRegistryFromCapabilities,
} from "./catalogue/bootstrap-notification-registry";

export type {
  BootstrapNotificationRegistryOptions,
  BootstrapNotificationRegistryResult,
  BootstrapNotificationRegistryFromCapabilitiesOptions,
  BootstrapNotificationRegistryFromCapabilitiesResult,
} from "./catalogue/bootstrap-notification-registry";

export {
  registerPlatformNotificationCatalogue,
  buildPlatformNotificationDescriptors,
  catalogueEntryToNotificationDescriptor,
} from "./catalogue/register-platform-notifications";

export type { PlatformNotificationRegistrationResult } from "./catalogue/register-platform-notifications";

export {
  PLATFORM_NOTIFICATION_CATALOGUE,
  type PlatformNotificationCatalogueEntry,
} from "./catalogue/platform-notification-catalogue";

export {
  extractNotificationDescriptorsFromCapabilities,
  collectNotificationManifestEntries,
  hasCapabilityNotificationDeclarations,
} from "./extraction/extract-notifications";

export { populateNotificationRegistryFromCapabilities } from "./extraction/populate-notification-registry";

export {
  buildNotificationRegistryHydrationDiagnostics,
  createEmptyNotificationRegistryHydrationDiagnostics,
  type NotificationRegistryHydrationDiagnostics,
} from "./server/notification-registry-hydration-diagnostics";

export type {
  NotificationDescriptor,
  NotificationRouteStatus,
  NotificationVisibility,
  NotificationStability,
  NotificationDescriptorSource,
  NotificationItem,
  NotificationActionRef,
  NotificationRegistry,
  NotificationRegistryFactory,
  NotificationEntryDiagnostics,
  NotificationMetadata,
  NotificationRegistryMetadata,
  NotificationRegistrationIssue,
  NotificationRegistrationIssueCode,
  NotificationBatchRegistrationResult,
  NotificationMapper,
  NotificationMapperResult,
  NotificationMappingIssue,
  NotificationMappingIssueCode,
  NotificationMapperRegistry,
  NotificationRouteTemplate,
  NotificationItemMetadata,
  NotificationItemDiagnostics,
  NotificationService,
  ListNotificationsOptions,
  AddNotificationsResult,
} from "./notification";

export {
  NotificationRegistryDuplicateError,
  NotificationRegistryNotFoundError,
  NotificationRegistryValidationError,
  validateNotificationDescriptor,
  DefaultNotificationRegistry,
  createDefaultNotificationRegistry,
  defaultNotificationRegistryFactory,
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
  PlaceholderNotificationRegistry,
  PlaceholderNotificationMapper,
  PlaceholderNotificationService,
  createPlaceholderNotificationRegistry,
  createPlaceholderNotificationMapper,
  createPlaceholderNotificationService,
  buildNotificationMetadata,
} from "./notification";

export {
  createNotificationRegistryFromDto,
  type CreateNotificationRegistryFromDtoOptions,
  type CreateNotificationRegistryFromDtoResult,
  type ReadOnlyNotificationRegistry,
  type ClientNotificationRoute,
  type ClientNotificationRegistryDiagnostics,
} from "./client";

export type {
  NotificationRegistryDto,
  NotificationRouteDescriptorDto,
} from "./server/map-notification-registry-dto";

export {
  mapNotificationRegistryDto,
  createEmptyNotificationRegistryDto,
} from "./server/map-notification-registry-dto";

export { filterNotificationRegistryDto } from "./server/filter-notification-registry-dto";

export { validateNotificationRegistryDto } from "./server/validate-notification-registry-dto";

export { NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION } from "./server/notification-registry-dto-schema-version";

export type {
  DefaultNotificationMapperOptions,
  CreateDefaultNotificationMapperOptions,
  ResolveNotificationRoutesOptions,
  CreateNotificationItemInput,
} from "./notification";

export type {
  EventNotificationContext,
  CreateEventNotificationContextOptions,
} from "./di";

export { createEventNotificationContext } from "./di";

export {
  createActionAuditEventBusHook,
  publishActionExecutedEventToBus,
  buildPlatformActionExecutedEventEnvelope,
  wireNotificationMapperToService,
  type CreateActionAuditEventBusHookOptions,
  type PublishActionExecutedEventToBusOptions,
} from "./integration";

export type {
  NotificationViewModel,
  NotificationPriorityGroup,
  NotificationPresentationDiagnostics,
  NotificationPresentationSeverity,
  NotificationReadPresentationState,
  MapNotificationItemToViewModelOptions,
  MapNotificationDtoToViewModelOptions,
  PresentNotificationsFromItemsOptions,
  PresentNotificationsFromItemsResult,
  FormatNotificationRelativeTimestampOptions,
  SortNotificationViewModelsOptions,
  GroupNotificationViewModelsOptions,
} from "./presentation";

export {
  mapNotificationItemToViewModel,
  mapNotificationDtoToViewModel,
  mapNotificationItemsToViewModels,
  sortNotificationViewModelsByPriority,
  groupNotificationViewModelsByPriority,
  presentNotificationViewModels,
  presentNotificationsFromItems,
  buildNotificationPresentationDiagnostics,
  formatNotificationRelativeTimestamp,
  compareNotificationPriority,
  mapNotificationPriorityToSeverity,
  getNotificationPriorityLabel,
} from "./presentation";

/** Layer identifiers — event and notification remain separate subsystems. */
export const EVENT_NOTIFICATION_ARCHITECTURE_LAYERS = {
  event: "event-layer",
  notification: "notification-layer",
} as const;

export type EventNotificationArchitectureLayer =
  (typeof EVENT_NOTIFICATION_ARCHITECTURE_LAYERS)[keyof typeof EVENT_NOTIFICATION_ARCHITECTURE_LAYERS];

export const EVENT_NOTIFICATION_ACTIVE_LAYERS = [
  EVENT_NOTIFICATION_ARCHITECTURE_LAYERS.event,
  EVENT_NOTIFICATION_ARCHITECTURE_LAYERS.notification,
] as const;
