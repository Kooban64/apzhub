/** Server subpath status — AT-008 Activity Service. */
export const ACTIVITY_TIMELINE_SERVER_STATUS = "service" as const;

export {
  ACTIVITY_TIMELINE_FRAMEWORK_STATUS,
  type ActivityTimelineFrameworkStatus,
} from "./status";

export type { ActivityContext, CreateActivityTimelineContextOptions } from "./di";
export { createActivityTimelineContext } from "./di";

export type { ActivityRegistry, ActivityBatchRegistrationResult } from "./registry";
export {
  DefaultActivityRegistry,
  PlaceholderActivityRegistry,
  ActivityRegistryDuplicateError,
  ActivityRegistryNotFoundError,
  ActivityRegistryValidationError,
  createDefaultActivityRegistry,
  createPlaceholderActivityRegistry,
  defaultActivityRegistryFactory,
  validateActivityDescriptor,
  buildActivityMetadata,
  freezeActivityDescriptor,
} from "./registry";

export type { TimelineRegistry, TimelineBatchRegistrationResult } from "./timeline";
export {
  DefaultTimelineRegistry,
  PlaceholderTimelineRegistry,
  TimelineRegistryDuplicateError,
  TimelineRegistryNotFoundError,
  TimelineRegistryValidationError,
  PLATFORM_TIMELINE_DEFINITIONS,
  createDefaultTimelineRegistry,
  createDefaultTimelineRegistryWithPlatformCatalogue,
  createPlaceholderTimelineRegistry,
  registerPlatformTimelineCatalogue,
  validateTimelineDefinition,
  buildTimelineMetadata,
  freezeTimelineDefinition,
} from "./timeline";

export type { ActivityMapper } from "./mapper";
export {
  ACTIVITY_TEMPLATE_PLACEHOLDERS,
  ActivityTemplateRenderError,
  DefaultActivityMapperRegistry,
  DefaultEventToActivityMapper,
  PlaceholderActivityMapper,
  assertRenderableActivityTemplate,
  buildActivityDocumentId,
  createActivityDocument,
  createDefaultActivityMapperRegistry,
  createDefaultEventToActivityMapper,
  createPlaceholderActivityMapper,
  freezeActivityDocument,
  isActivityTemplateRenderError,
  matchesActivityEventPattern,
  renderActivityTemplate,
  renderActivityTypeDocument,
  resolveActivityTypes,
  syncActivityMapperRegistryFromDescriptors,
} from "./mapper";
export type {
  ActivityMapperRegistry,
  ActivityTypeTemplate,
  CreateActivityDocumentInput,
  CreateDefaultEventToActivityMapperOptions,
  ResolveActivityTypesOptions,
} from "./mapper";

export type {
  ActivityService,
  AddActivitiesResult,
  ListActivitiesOptions,
} from "./service";
export {
  DefaultActivityService,
  DefaultActivitySessionStore,
  PlaceholderActivityService,
  compareActivityDocuments,
  createDefaultActivityService,
  createDefaultActivitySessionStore,
  createPlaceholderActivityService,
} from "./service";
export type { ActivitySessionStore } from "./service";

export type {
  ActivityDescriptor,
  ActivityDocument,
  ActivityRegistryDiagnostics,
  ActivityServiceDiagnostics,
  TimelineDefinition,
  TimelineMetadata,
  TimelineRegistryDiagnostics,
  TimelineQuery,
  TimelineResult,
  TimelineScope,
  TimelineScopeId,
} from "./types";

export {
  ACTIVITY_MANIFEST_BLOCK,
  ACTIVITY_TIMELINES_MANIFEST_BLOCK,
  DEFAULT_TIMELINE_SCOPE_ID,
} from "./constants";

export {
  RESERVED_TIMELINE_SCOPE_IDS,
  TIMELINE_SCOPE_ORGANIZATION,
  TIMELINE_SCOPE_PERSONAL,
  TIMELINE_SCOPE_SYSTEM,
  TIMELINE_SCOPE_TEAM,
} from "./types/timeline-scope";

export {
  ACTIVITY_TIMELINE_PLATFORM_VERSION,
  type ActivityTimelinePlatformVersion,
} from "./catalogue/platform-version";

export {
  PLATFORM_ACTIVITY_CATALOGUE,
  type PlatformActivityCatalogueEntry,
} from "./catalogue/platform-activity-catalogue";

export {
  registerPlatformActivityCatalogue,
  buildPlatformActivityDescriptors,
  catalogueEntryToActivityDescriptor,
  type PlatformActivityRegistrationResult,
} from "./catalogue/register-platform-activities";

export type { PlatformTimelineRegistrationResult } from "./catalogue/register-platform-timelines";

export type {
  ActivityCapabilityRecord,
  ActivityExtractionDiagnostics,
  ActivityExtractionResult,
  ManifestActivityRegistryPopulationResult,
  TimelineExtractionDiagnostics,
  TimelineExtractionResult,
  ManifestTimelineRegistryPopulationResult,
} from "./extraction/types";

export {
  collectActivityTypeManifestEntries,
  extractActivityDescriptorsFromCapabilities,
  hasCapabilityActivityTypeDeclarations,
} from "./extraction/extract-activities";

export {
  collectTimelineManifestEntries,
  extractTimelineDefinitionsFromCapabilities,
  hasCapabilityTimelineDeclarations,
} from "./extraction/extract-timelines";

export { populateActivityRegistryFromCapabilities } from "./extraction/populate-activity-registry";
export { populateTimelineRegistryFromCapabilities } from "./extraction/populate-timeline-registry";

export {
  mapPlatformCapabilitiesToActivityRecords,
  type ActivityCapabilitySnapshot,
} from "./extraction/map-capability-records";

export {
  parseActivityManifestEntry,
  type ActivityManifestEntry,
} from "./extraction/activity-manifest-schema";

export {
  parseTimelineManifestEntry,
  type TimelineManifestEntry,
} from "./extraction/timeline-manifest-schema";

export {
  bootstrapActivityRegistry,
  bootstrapActivityRegistryFromCapabilities,
  type BootstrapActivityRegistryOptions,
  type BootstrapActivityRegistryResult,
  type BootstrapActivityRegistryFromCapabilitiesOptions,
  type BootstrapActivityRegistryFromCapabilitiesResult,
} from "./bootstrap/bootstrap-activity-registry";

export {
  bootstrapTimelineRegistry,
  bootstrapTimelineRegistryFromCapabilities,
  type BootstrapTimelineRegistryOptions,
  type BootstrapTimelineRegistryResult,
  type BootstrapTimelineRegistryFromCapabilitiesOptions,
  type BootstrapTimelineRegistryFromCapabilitiesResult,
} from "./bootstrap/bootstrap-timeline-registry";

export {
  buildActivityRegistryHydrationDiagnostics,
  createEmptyActivityRegistryHydrationDiagnostics,
  type ActivityRegistryHydrationDiagnostics,
} from "./server/activity-registry-hydration-diagnostics";

export {
  buildTimelineRegistryHydrationDiagnostics,
  createEmptyTimelineRegistryHydrationDiagnostics,
  type TimelineRegistryHydrationDiagnostics,
} from "./server/timeline-registry-hydration-diagnostics";

export {
  ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION,
  type ActivityRegistryDtoSchemaVersion,
} from "./server/filter/activity-registry-dto-schema-version";

export {
  TIMELINE_REGISTRY_DTO_SCHEMA_VERSION,
  type TimelineRegistryDtoSchemaVersion,
} from "./server/filter/timeline-registry-dto-schema-version";

export type {
  ActivityRegistryDto,
  ActivityTypeDescriptorDto,
} from "./server/filter/map-activity-registry-dto";

export {
  createEmptyActivityRegistryDto,
  mapActivityDescriptorToTypeDto,
  mapActivityRegistryDto,
} from "./server/filter/map-activity-registry-dto";

export type {
  TimelineRegistryDto,
  TimelineDescriptorDto,
} from "./server/filter/map-timeline-registry-dto";

export {
  createEmptyTimelineRegistryDto,
  mapTimelineDefinitionToDescriptorDto,
  mapTimelineRegistryDto,
} from "./server/filter/map-timeline-registry-dto";

export {
  validateActivityRegistryDto,
  type ActivityRegistryDtoValidationResult,
} from "./server/filter/validate-activity-registry-dto";

export {
  validateTimelineRegistryDto,
  type TimelineRegistryDtoValidationResult,
} from "./server/filter/validate-timeline-registry-dto";

export { filterActivityRegistryDto } from "./server/filter/filter-activity-registry-dto";
export { filterTimelineRegistryDto } from "./server/filter/filter-timeline-registry-dto";

export {
  buildActivityTimelineHydrationBundle,
  type BuildActivityTimelineHydrationBundleInput,
} from "./server/build-activity-timeline-hydration-bundle";

export { createEmptyActivityTimelineHydrationBundle } from "./client/activity-timeline-hydration-bundle";

export type { ActivityTimelineHydrationBundle } from "./client/activity-timeline-hydration-bundle";
