export { NOTIFICATION_LAYER_STATUS, type NotificationLayerStatus } from "../../status";

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
  DefaultNotificationMapperOptions,
  CreateDefaultNotificationMapperOptions,
  ResolveNotificationRoutesOptions,
  CreateNotificationItemInput,
  NotificationService,
  ListNotificationsOptions,
  AddNotificationsResult,
} from "../../notification";

export {
  DefaultNotificationRegistry,
  createDefaultNotificationRegistry,
  defaultNotificationRegistryFactory,
  validateNotificationDescriptor,
  buildNotificationMetadata,
  PlaceholderNotificationRegistry,
  PlaceholderNotificationMapper,
  PlaceholderNotificationService,
  createPlaceholderNotificationRegistry,
  createPlaceholderNotificationMapper,
  createPlaceholderNotificationService,
} from "../../notification";

export {
  NotificationRegistryDuplicateError,
  NotificationRegistryNotFoundError,
  NotificationRegistryValidationError,
} from "../../notification";

export { NOTIFICATION_KINDS, DELIVERY_CHANNELS } from "../../types/notification-kind";

export {
  NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION,
  type NotificationRegistryDtoSchemaVersion,
} from "../../server/notification-registry-dto-schema-version";

export {
  createEmptyNotificationRegistryDto,
  mapNotificationRegistryDto,
  mapNotificationMetadataToRouteDto,
  type NotificationRegistryDto,
  type NotificationRouteDescriptorDto,
} from "../../server/map-notification-registry-dto";

export {
  validateNotificationRegistryDto,
  type NotificationRegistryDtoValidationResult,
} from "../../server/validate-notification-registry-dto";

export { filterNotificationRegistryDto } from "../../server/filter-notification-registry-dto";

export {
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
} from "../../notification";

export {
  bootstrapNotificationRegistry,
  bootstrapNotificationRegistryFromCapabilities,
} from "../../catalogue/bootstrap-notification-registry";

export type {
  BootstrapNotificationRegistryOptions,
  BootstrapNotificationRegistryResult,
  BootstrapNotificationRegistryFromCapabilitiesOptions,
  BootstrapNotificationRegistryFromCapabilitiesResult,
} from "../../catalogue/bootstrap-notification-registry";

export {
  registerPlatformNotificationCatalogue,
  buildPlatformNotificationDescriptors,
  catalogueEntryToNotificationDescriptor,
} from "../../catalogue/register-platform-notifications";

export type { PlatformNotificationRegistrationResult } from "../../catalogue/register-platform-notifications";

export {
  PLATFORM_NOTIFICATION_CATALOGUE,
  type PlatformNotificationCatalogueEntry,
} from "../../catalogue/platform-notification-catalogue";

export {
  extractNotificationDescriptorsFromCapabilities,
  collectNotificationManifestEntries,
  hasCapabilityNotificationDeclarations,
} from "../../extraction/extract-notifications";

export { populateNotificationRegistryFromCapabilities } from "../../extraction/populate-notification-registry";

export type {
  NotificationExtractionDiagnostics,
  NotificationExtractionResult,
  ManifestNotificationRegistryPopulationResult,
} from "../../extraction/types";

export type { NotificationManifestEntry } from "../../extraction/notification-manifest-schema";

export {
  buildNotificationRegistryHydrationDiagnostics,
  createEmptyNotificationRegistryHydrationDiagnostics,
  type NotificationRegistryHydrationDiagnostics,
} from "../../server/notification-registry-hydration-diagnostics";
