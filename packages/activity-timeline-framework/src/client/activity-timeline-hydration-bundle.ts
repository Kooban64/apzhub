import type { ActivityRegistryDto } from "../server/filter/map-activity-registry-dto";
import { createEmptyActivityRegistryDto } from "../server/filter/map-activity-registry-dto";
import type { TimelineRegistryDto } from "../server/filter/map-timeline-registry-dto";
import { createEmptyTimelineRegistryDto } from "../server/filter/map-timeline-registry-dto";
import {
  ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION,
  type ActivityTimelineHydrationBundleSchemaVersion,
} from "./activity-timeline-hydration-bundle-schema-version";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

/** Server → client metadata hydration payload — registries only (no ActivityDocuments). */
export interface ActivityTimelineHydrationBundle {
  readonly schemaVersion: ActivityTimelineHydrationBundleSchemaVersion;
  readonly frameworkVersion?: string;
  readonly activityRegistry: ActivityRegistryDto;
  readonly timelineRegistry: TimelineRegistryDto;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}

export function createEmptyActivityTimelineHydrationBundle(): ActivityTimelineHydrationBundle {
  return Object.freeze({
    schemaVersion: ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION,
    activityRegistry: createEmptyActivityRegistryDto(),
    timelineRegistry: createEmptyTimelineRegistryDto(),
    synchronisation: CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  });
}

export interface ActivityTimelineHydrationBundleValidationIssue {
  readonly code: "VALIDATION";
  readonly message: string;
  readonly field?: string;
}

export interface ActivityTimelineHydrationBundleValidationResult {
  readonly ok: boolean;
  readonly bundle: ActivityTimelineHydrationBundle;
  readonly errors: readonly ActivityTimelineHydrationBundleValidationIssue[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validate bundle shape at the client hydration boundary.
 * Descriptor validation runs separately via registry hydration factories.
 */
export function validateActivityTimelineHydrationBundle(
  bundle: unknown,
): ActivityTimelineHydrationBundleValidationResult {
  const errors: ActivityTimelineHydrationBundleValidationIssue[] = [];

  if (!isRecord(bundle)) {
    return {
      ok: false,
      bundle: createEmptyActivityTimelineHydrationBundle(),
      errors: Object.freeze([
        {
          code: "VALIDATION",
          message: "ActivityTimelineHydrationBundle must be an object",
        },
      ]),
    };
  }

  if (bundle.schemaVersion !== ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION) {
    errors.push({
      code: "VALIDATION",
      message: `ActivityTimelineHydrationBundle.schemaVersion must be ${ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION}`,
      field: "schemaVersion",
    });
  }

  if (!isRecord(bundle.activityRegistry)) {
    errors.push({
      code: "VALIDATION",
      message: "ActivityTimelineHydrationBundle.activityRegistry must be an object",
      field: "activityRegistry",
    });
  }

  if (!isRecord(bundle.timelineRegistry)) {
    errors.push({
      code: "VALIDATION",
      message: "ActivityTimelineHydrationBundle.timelineRegistry must be an object",
      field: "timelineRegistry",
    });
  }

  if (errors.length > 0) {
    return {
      ok: false,
      bundle: createEmptyActivityTimelineHydrationBundle(),
      errors: Object.freeze([...errors]),
    };
  }

  const frameworkVersion =
    typeof bundle.frameworkVersion === "string" && bundle.frameworkVersion.trim()
      ? bundle.frameworkVersion
      : undefined;

  const synchronisation =
    isRecord(bundle.synchronisation) &&
    (bundle.synchronisation.mode === "hydration" ||
      bundle.synchronisation.mode === "synchronisation")
      ? (bundle.synchronisation as unknown as ClientRegistrySynchronisationState)
      : CLIENT_REGISTRY_HYDRATION_SYNC_STATE;

  return {
    ok: true,
    bundle: Object.freeze({
      schemaVersion: ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION,
      frameworkVersion,
      activityRegistry: bundle.activityRegistry as ActivityRegistryDto,
      timelineRegistry: bundle.timelineRegistry as TimelineRegistryDto,
      synchronisation,
    }),
    errors: [],
  };
}
