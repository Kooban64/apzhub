export {
  ACTIVITY_TIMELINE_FRAMEWORK_STATUS,
  type ActivityTimelineFrameworkStatus,
} from "./status";

export type {
  ActivityCategory,
  ActivityDescriptor,
  ActivityDescriptorSource,
  ActivityDescriptorStatus,
  ActivityDocument,
  ActivityDocumentActor,
  ActivityDocumentDiagnostics,
  ActivityDocumentMetadata,
  ActivityEntryDiagnostics,
  ActivityMapperDiagnostics,
  ActivityMapperResult,
  ActivityMappingIssue,
  ActivityMappingIssueCode,
  ActivityMetadata,
  ActivityRegistrationIssue,
  ActivityRegistryDiagnostics,
  ActivityRegistryMetadata,
  ActivityServiceDiagnostics,
  ActivityRetentionHint,
  ActivitySeverity,
  ActivityStability,
  ActivityVisibility,
  TimelineDefinition,
  TimelineDefinitionSource,
  TimelineDefinitionStatus,
  TimelineEntryDiagnostics,
  TimelineMetadata,
  TimelineQuery,
  TimelineRegistrationIssue,
  TimelineRegistryDiagnostics,
  TimelineRegistryMetadata,
  TimelineResult,
  TimelineScope,
  TimelineScopeId,
} from "./types";
export {
  ACTIVITY_CATEGORIES,
  CANONICAL_ACTIVITY_CATEGORIES,
  RESERVED_TIMELINE_SCOPE_IDS,
  TIMELINE_SCOPE_ORGANIZATION,
  TIMELINE_SCOPE_PERSONAL,
  TIMELINE_SCOPE_SYSTEM,
  TIMELINE_SCOPE_TEAM,
} from "./types";

export type { ActivityRegistry, ActivityBatchRegistrationResult } from "./registry";
export {
  DefaultActivityRegistry,
  PlaceholderActivityRegistry,
  ActivityRegistryDuplicateError,
  ActivityRegistryNotFoundError,
  ActivityRegistryValidationError,
  buildActivityMetadata,
  buildActivityMetadataList,
  collectActivityValidationIssues,
  collectDuplicateActivityIssues,
  createDefaultActivityRegistry,
  createPlaceholderActivityRegistry,
  defaultActivityRegistryFactory,
  freezeActivityDescriptor,
  freezeActivityDescriptors,
  validateActivityDescriptor,
} from "./registry";

export type { TimelineRegistry, TimelineBatchRegistrationResult } from "./timeline";
export {
  DefaultTimelineRegistry,
  PlaceholderTimelineRegistry,
  TimelineRegistryDuplicateError,
  TimelineRegistryNotFoundError,
  TimelineRegistryValidationError,
  PLATFORM_TIMELINE_DEFINITIONS,
  buildTimelineMetadata,
  buildTimelineMetadataList,
  collectTimelineValidationIssues,
  collectDuplicateTimelineIssues,
  createDefaultTimelineRegistry,
  createDefaultTimelineRegistryWithPlatformCatalogue,
  createPlaceholderTimelineRegistry,
  defaultTimelineRegistryFactory,
  freezeTimelineDefinition,
  freezeTimelineDefinitions,
  registerPlatformTimelineCatalogue,
  validateTimelineDefinition,
} from "./timeline";

export type {
  ActivityMapper,
  ActivityMapperRegistry,
  ActivityTypeTemplate,
} from "./mapper";
export {
  ACTIVITY_TEMPLATE_PLACEHOLDERS,
  DefaultActivityMapperRegistry,
  DefaultEventToActivityMapper,
  PlaceholderActivityMapper,
  buildActivityDocumentId,
  createActivityDocument,
  createDefaultActivityMapperRegistry,
  createDefaultEventToActivityMapper,
  createPlaceholderActivityMapper,
  freezeActivityDocument,
  renderActivityTemplate,
  resolveActivityTypes,
} from "./mapper";

export type {
  ActivityService,
  AddActivitiesResult,
  ListActivitiesOptions,
} from "./service";
export {
  DefaultActivityService,
  DefaultActivitySessionStore,
  PersistedActivitySessionStore,
  PlaceholderActivityService,
  compareActivityDocuments,
  createDefaultActivityService,
  createDefaultActivitySessionStore,
  createPersistedActivitySessionStore,
  createLawActivityPersistenceStorageKey,
  createPlaceholderActivityService,
} from "./service";
/* Postgres SoR factories: import from @apzhub/activity-timeline-framework/server */
export type {
  ActivitySessionStore,
  ActivityPersistenceStorage,
  PersistedActivitySessionStoreOptions,
} from "./service";

export { createActivityTimelineContext } from "./di";

export {
  ACTIVITY_PRESENTATION_LAYER_STATUS,
  type ActivityActionRef,
  type ActivityViewModel,
  type ActivityViewModelGroup,
  type ActivityGroupingStrategy,
  type ActivityPresentationDiagnostics,
  type ActivityPresentationFormattingStatus,
  type PresentActivitiesOptions,
  type PresentActivitiesResult,
  mapActivityDocumentToViewModel,
  mapActivityDocumentsToViewModels,
  sortActivityViewModels,
  groupActivityViewModels,
  formatActivityRelativeTimestamp,
  buildActivityPresentationDiagnostics,
  presentActivities,
} from "./presentation";

export type { ActivityContext, CreateActivityTimelineContextOptions } from "./di";

export { ACTIVITY_MANIFEST_BLOCK, DEFAULT_TIMELINE_SCOPE_ID } from "./constants";

/** Three-layer architecture layer identifiers — presentation and experiences deferred. */
export const ACTIVITY_TIMELINE_ARCHITECTURE_LAYERS = {
  mapping: "activity-mapping",
  service: "activity-service",
  presentation: "activity-presentation",
  experience: "timeline-experience",
} as const;

export type ActivityTimelineArchitectureLayer =
  (typeof ACTIVITY_TIMELINE_ARCHITECTURE_LAYERS)[keyof typeof ACTIVITY_TIMELINE_ARCHITECTURE_LAYERS];

/** Active implementation layer during AT-012 timeline experiences story. */
export const ACTIVITY_TIMELINE_ACTIVE_LAYER =
  ACTIVITY_TIMELINE_ARCHITECTURE_LAYERS.experience;
