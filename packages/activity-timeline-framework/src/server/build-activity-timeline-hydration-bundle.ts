import type { ActivityTimelineHydrationBundle } from "../client/activity-timeline-hydration-bundle";
import { ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION } from "../client/activity-timeline-hydration-bundle-schema-version";
import type { ClientRegistrySynchronisationState } from "../client/synchronisation";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "../client/synchronisation";
import { ACTIVITY_TIMELINE_PLATFORM_VERSION } from "../catalogue/platform-version";
import type { ActivityRegistry } from "../registry/activity-registry";
import type { TimelineRegistry } from "../timeline/timeline-registry";
import type { ActivityRegistryDto } from "./filter/map-activity-registry-dto";
import { mapActivityRegistryDto } from "./filter/map-activity-registry-dto";
import type { TimelineRegistryDto } from "./filter/map-timeline-registry-dto";
import { mapTimelineRegistryDto } from "./filter/map-timeline-registry-dto";

export interface BuildActivityTimelineHydrationBundleInput {
  readonly activityRegistry?: ActivityRegistry;
  readonly timelineRegistry?: TimelineRegistry;
  readonly activityRegistryDto?: ActivityRegistryDto;
  readonly timelineRegistryDto?: TimelineRegistryDto;
  readonly frameworkVersion?: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}

/**
 * Assemble server → client metadata hydration bundle (registries only — no ActivityDocuments).
 */
export function buildActivityTimelineHydrationBundle(
  input: BuildActivityTimelineHydrationBundleInput,
): ActivityTimelineHydrationBundle {
  const activityRegistry =
    input.activityRegistryDto ??
    (input.activityRegistry
      ? mapActivityRegistryDto(input.activityRegistry)
      : undefined);
  const timelineRegistry =
    input.timelineRegistryDto ??
    (input.timelineRegistry
      ? mapTimelineRegistryDto(input.timelineRegistry)
      : undefined);

  if (!activityRegistry || !timelineRegistry) {
    throw new Error(
      "buildActivityTimelineHydrationBundle requires activity and timeline registry sources",
    );
  }

  const frameworkVersion =
    input.frameworkVersion ??
    activityRegistry.frameworkVersion ??
    timelineRegistry.frameworkVersion ??
    ACTIVITY_TIMELINE_PLATFORM_VERSION;

  return Object.freeze({
    schemaVersion: ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION,
    frameworkVersion,
    activityRegistry,
    timelineRegistry,
    synchronisation: input.synchronisation ?? CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  });
}
