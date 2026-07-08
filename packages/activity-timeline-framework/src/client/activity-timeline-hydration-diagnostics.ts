import type { ActivityRegistrationIssue } from "../types/activity-metadata";
import type { TimelineRegistrationIssue } from "../types/timeline-metadata";
import type { ClientActivityRegistryDiagnostics } from "./client-activity-registry-diagnostics";
import type { ClientTimelineRegistryDiagnostics } from "./client-timeline-registry-diagnostics";
import {
  ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION,
  type ActivityTimelineHydrationBundleSchemaVersion,
} from "./activity-timeline-hydration-bundle-schema-version";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

export type ActivityTimelineHydrationStatus = "empty" | "hydrated" | "invalid";

/** Combined client hydration diagnostics — metadata registries only. */
export interface ActivityTimelineHydrationDiagnostics {
  readonly hydrationStatus: ActivityTimelineHydrationStatus;
  readonly activityRegistryStatus: ClientActivityRegistryDiagnostics["status"];
  readonly timelineRegistryStatus: ClientTimelineRegistryDiagnostics["status"];
  readonly schemaVersion: ActivityTimelineHydrationBundleSchemaVersion;
  readonly frameworkVersion?: string;
  readonly activityTypeCount: number;
  readonly timelineDefinitionCount: number;
  readonly hydratedAt?: string;
  readonly synchronisation: ClientRegistrySynchronisationState;
}

export function buildActivityTimelineHydrationDiagnostics(input: {
  readonly ok: boolean;
  readonly activityDiagnostics: ClientActivityRegistryDiagnostics;
  readonly timelineDiagnostics: ClientTimelineRegistryDiagnostics;
  readonly frameworkVersion?: string;
  readonly hydratedAt?: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}): ActivityTimelineHydrationDiagnostics {
  const activityTypeCount = input.activityDiagnostics.typeCount;
  const timelineDefinitionCount = input.timelineDiagnostics.timelineCount;

  let hydrationStatus: ActivityTimelineHydrationStatus;

  if (!input.ok) {
    hydrationStatus = "invalid";
  } else if (activityTypeCount === 0 && timelineDefinitionCount === 0) {
    hydrationStatus = "empty";
  } else {
    hydrationStatus = "hydrated";
  }

  return Object.freeze({
    hydrationStatus,
    activityRegistryStatus: input.activityDiagnostics.status,
    timelineRegistryStatus: input.timelineDiagnostics.status,
    schemaVersion: ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION,
    frameworkVersion:
      input.frameworkVersion ??
      input.activityDiagnostics.frameworkVersion ??
      input.timelineDiagnostics.frameworkVersion,
    activityTypeCount,
    timelineDefinitionCount,
    hydratedAt: input.hydratedAt,
    synchronisation: input.synchronisation ?? CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  });
}

export interface ActivityTimelineHydrationErrorSummary {
  readonly activityErrors: readonly ActivityRegistrationIssue[];
  readonly timelineErrors: readonly TimelineRegistrationIssue[];
  readonly bundleErrors: readonly {
    readonly code: "VALIDATION";
    readonly message: string;
    readonly field?: string;
  }[];
}

export function collectActivityTimelineHydrationErrors(
  summary: ActivityTimelineHydrationErrorSummary,
): readonly (
  | ActivityRegistrationIssue
  | TimelineRegistrationIssue
  | ActivityTimelineHydrationErrorSummary["bundleErrors"][number]
)[] {
  return Object.freeze([
    ...summary.bundleErrors,
    ...summary.activityErrors,
    ...summary.timelineErrors,
  ]);
}
