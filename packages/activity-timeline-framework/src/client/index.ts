export type { ClientActivityType } from "./client-activity-type";
export { freezeClientActivityType } from "./client-activity-type";

export type { ClientTimelineDefinition } from "./client-timeline-definition";
export { freezeClientTimelineDefinition } from "./client-timeline-definition";

export type { ReadOnlyActivityRegistry } from "./read-only-activity-registry";
export type { ReadOnlyTimelineRegistry } from "./read-only-timeline-registry";

export type {
  ClientActivityRegistryDiagnostics,
  ClientActivityRegistryStatus,
} from "./client-activity-registry-diagnostics";
export {
  buildClientActivityRegistryDiagnostics,
  createEmptyClientActivityRegistryDiagnostics,
} from "./client-activity-registry-diagnostics";

export type {
  ClientTimelineRegistryDiagnostics,
  ClientTimelineRegistryStatus,
} from "./client-timeline-registry-diagnostics";
export {
  buildClientTimelineRegistryDiagnostics,
  classifyTimelineSource,
} from "./client-timeline-registry-diagnostics";
export { createEmptyClientTimelineRegistryDiagnostics } from "./client-timeline-registry-diagnostics";

export {
  ClientActivityRegistry,
  createEmptyClientActivityRegistry,
  createInvalidClientActivityRegistry,
} from "./client-activity-registry";

export {
  ClientTimelineRegistry,
  createEmptyClientTimelineRegistry,
  createInvalidClientTimelineRegistry,
} from "./client-timeline-registry";

export {
  mapActivityTypeDescriptorDtoToClientType,
  mapActivityRegistryDtoToClientTypes,
} from "./map-dto-to-client-activity-types";

export {
  mapTimelineDescriptorDtoToClientDefinition,
  mapTimelineRegistryDtoToClientDefinitions,
} from "./map-dto-to-client-timeline-definitions";

export {
  createActivityRegistryFromDto,
  createEmptyActivityRegistryDto,
  type CreateActivityRegistryFromDtoOptions,
  type CreateActivityRegistryFromDtoResult,
} from "./create-activity-registry-from-dto";

export {
  createTimelineRegistryFromDto,
  createEmptyTimelineRegistryDto,
  type CreateTimelineRegistryFromDtoOptions,
  type CreateTimelineRegistryFromDtoResult,
} from "./create-timeline-registry-from-dto";

export {
  ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION,
  type ActivityTimelineHydrationBundleSchemaVersion,
} from "./activity-timeline-hydration-bundle-schema-version";

export type { ActivityTimelineHydrationBundle } from "./activity-timeline-hydration-bundle";
export {
  createEmptyActivityTimelineHydrationBundle,
  validateActivityTimelineHydrationBundle,
  type ActivityTimelineHydrationBundleValidationIssue,
  type ActivityTimelineHydrationBundleValidationResult,
} from "./activity-timeline-hydration-bundle";

export type {
  ActivityTimelineHydrationDiagnostics,
  ActivityTimelineHydrationStatus,
  ActivityTimelineHydrationErrorSummary,
} from "./activity-timeline-hydration-diagnostics";
export {
  buildActivityTimelineHydrationDiagnostics,
  collectActivityTimelineHydrationErrors,
} from "./activity-timeline-hydration-diagnostics";

export type {
  ActivityTimelineClientContext,
  CreateActivityTimelineContextFromDtoOptions,
  CreateActivityTimelineContextFromDtoResult,
} from "./create-activity-timeline-context-from-dto";
export {
  createActivityTimelineContextFromDto,
  createEmptyActivityTimelineClientContext,
} from "./create-activity-timeline-context-from-dto";

export type {
  ClientRegistrySynchronisationState,
  ClientRegistrySyncMode,
} from "./synchronisation";
export { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

export {
  sampleActivityRegistryDto,
  sampleTimelineRegistryDto,
  sampleActivityTimelineHydrationBundle,
} from "./test-fixtures";

export {
  validateActivityRegistryDto,
  type ActivityRegistryDtoValidationResult,
} from "../server/filter/validate-activity-registry-dto";

export {
  validateTimelineRegistryDto,
  type TimelineRegistryDtoValidationResult,
} from "../server/filter/validate-timeline-registry-dto";

export type {
  ActivityTimelineService,
  ActivityTimelineServiceDiagnostics,
  ActivityTimelineServiceStatus,
  CreateActivityTimelineServiceOptions,
  CreateActivityTimelineServiceFromHydrationOptions,
} from "./service";

export {
  createActivityTimelineService,
  createActivityTimelineServiceFromHydration,
  DefaultActivityTimelineService,
} from "./service";
