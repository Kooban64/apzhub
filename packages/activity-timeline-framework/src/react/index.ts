/** React subpath status — AT-012 Timeline Experiences. */
export const ACTIVITY_TIMELINE_REACT_STATUS = "experiences" as const;

export type ActivityTimelineReactStatus = typeof ACTIVITY_TIMELINE_REACT_STATUS;

export {
  ACTIVITY_TIMELINE_FRAMEWORK_STATUS,
  type ActivityTimelineFrameworkStatus,
} from "../status";

export type { ActivityContext, CreateActivityTimelineContextOptions } from "../di";
export { createActivityTimelineContext } from "../di";

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
} from "../types";

export { DEFAULT_TIMELINE_SCOPE_ID } from "../constants";
export { TIMELINE_SCOPE_PERSONAL } from "../types/timeline-scope";

export type { ActivityService } from "../service";

export {
  ActivityTimelineProvider,
  useActivityTimelineContext,
  useOptionalActivityTimelineContext,
  type ActivityTimelineContextValue,
  type ActivityTimelineProviderProps,
} from "./activity-timeline-context";

export {
  ActivityTimelineServiceProvider,
  useActivityTimelineServiceContext,
  type ActivityTimelineServiceProviderProps,
} from "./activity-timeline-service-context";

export {
  useActivityRegistry,
  type UseActivityRegistryResult,
} from "./use-activity-registry";
export {
  useTimelineRegistry,
  type UseTimelineRegistryResult,
} from "./use-timeline-registry";
export {
  useActivityService,
  type UseActivityServiceResult,
} from "./use-activity-service";
export {
  useActivityPresentation,
  type UseActivityPresentationOptions,
  type UseActivityPresentationResult,
} from "./use-activity-presentation";

export type {
  ActivityActionRef,
  ActivityViewModel,
  ActivityViewModelGroup,
  ActivityGroupingStrategy,
  ActivityPresentationDiagnostics,
  ActivityPresentationFormattingStatus,
  MapActivityDocumentToViewModelOptions,
  PresentActivitiesOptions,
  PresentActivitiesResult,
} from "../presentation";

export {
  ACTIVITY_PRESENTATION_LAYER_STATUS,
  mapActivityDocumentToViewModel,
  mapActivityDocumentsToViewModels,
  sortActivityViewModels,
  groupActivityViewModels,
  formatActivityRelativeTimestamp,
  buildActivityPresentationDiagnostics,
  presentActivities,
} from "../presentation";

export type {
  ActivityTimelineService,
  ActivityTimelineServiceDiagnostics,
  ActivityTimelineServiceStatus,
  CreateActivityTimelineServiceOptions,
  CreateActivityTimelineServiceFromHydrationOptions,
} from "../client/service";

export {
  createActivityTimelineService,
  createActivityTimelineServiceFromHydration,
} from "../client/service";

export type {
  ClientActivityType,
  ClientTimelineDefinition,
  ReadOnlyActivityRegistry,
  ReadOnlyTimelineRegistry,
  ClientActivityRegistryDiagnostics,
  ClientTimelineRegistryDiagnostics,
  ActivityTimelineHydrationBundle,
  ActivityTimelineHydrationDiagnostics,
  ActivityTimelineClientContext,
  CreateActivityRegistryFromDtoOptions,
  CreateActivityRegistryFromDtoResult,
  CreateTimelineRegistryFromDtoOptions,
  CreateTimelineRegistryFromDtoResult,
  CreateActivityTimelineContextFromDtoOptions,
  CreateActivityTimelineContextFromDtoResult,
  ClientRegistrySynchronisationState,
} from "../client";

export {
  createActivityRegistryFromDto,
  createTimelineRegistryFromDto,
  createActivityTimelineContextFromDto,
  createEmptyActivityTimelineHydrationBundle,
  createEmptyActivityRegistryDto,
  createEmptyTimelineRegistryDto,
  createEmptyClientActivityRegistry,
  createEmptyClientTimelineRegistry,
  validateActivityTimelineHydrationBundle,
  validateActivityRegistryDto,
  validateTimelineRegistryDto,
  buildActivityTimelineHydrationDiagnostics,
  CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION,
  sampleActivityTimelineHydrationBundle,
  sampleActivityRegistryDto,
  sampleTimelineRegistryDto,
} from "../client";

export type {
  ActivityRegistryDto,
  ActivityTypeDescriptorDto,
} from "../server/filter/map-activity-registry-dto";

export type {
  TimelineRegistryDto,
  TimelineDescriptorDto,
} from "../server/filter/map-timeline-registry-dto";

export { ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION } from "../server/filter/activity-registry-dto-schema-version";
export { TIMELINE_REGISTRY_DTO_SCHEMA_VERSION } from "../server/filter/timeline-registry-dto-schema-version";

export type {
  ActivityTimelineExperienceDiagnostics,
  ActivityTimelineExperienceProps,
  ActivityTimelineExperienceSurface,
  ActivityTimelinePanelExperienceProps,
  WorkbenchActivityTimelineProps,
} from "../experiences";

export {
  ActivityTimelineExperience,
  ActivityTimelinePanelExperience,
  WorkbenchActivityTimeline,
  ActivityTimelineList,
  TimelineEmptyState,
  TimelineLoadingState,
  buildActivityTimelineExperienceDiagnostics,
  delegateActivityActionRef,
  useActivityTimelineExperienceDiagnostics,
} from "../experiences";
