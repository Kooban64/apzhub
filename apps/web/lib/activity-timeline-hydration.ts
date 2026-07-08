import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import { isDevRegistrationAllowed } from "@apzhub/config";
import {
  buildActivityRegistryHydrationDiagnostics,
  buildActivityTimelineHydrationBundle,
  buildTimelineRegistryHydrationDiagnostics,
  createEmptyActivityRegistryHydrationDiagnostics,
  createEmptyActivityTimelineHydrationBundle,
  createEmptyTimelineRegistryHydrationDiagnostics,
  filterActivityRegistryDto,
  filterTimelineRegistryDto,
  mapActivityRegistryDto,
  mapTimelineRegistryDto,
  type ActivityRegistryHydrationDiagnostics,
  type ActivityTimelineHydrationBundle,
  type TimelineRegistryHydrationDiagnostics,
} from "@apzhub/activity-timeline-framework/server";
import { createWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { createAuthPermissionContextFromUser } from "@apzhub/workbench-framework/server";

import { loadSharedActivityTimelineContext } from "./load-shared-activity-timeline-context";

export interface ActivityTimelineHydrationResult {
  readonly bundle: ActivityTimelineHydrationBundle;
  readonly activityDiagnostics: ActivityRegistryHydrationDiagnostics;
  readonly timelineDiagnostics: TimelineRegistryHydrationDiagnostics;
}

/** Permission-filtered Activity & Timeline hydration for platform layout. */
export async function loadActivityTimelineHydration(): Promise<ActivityTimelineHydrationResult> {
  const context = await loadSharedActivityTimelineContext();

  if (!context) {
    const emptyBundle = createEmptyActivityTimelineHydrationBundle();
    return {
      bundle: emptyBundle,
      activityDiagnostics: createEmptyActivityRegistryHydrationDiagnostics(),
      timelineDiagnostics: createEmptyTimelineRegistryHydrationDiagnostics(),
    };
  }

  const unfilteredActivityDto = mapActivityRegistryDto(context.registry);
  const unfilteredTimelineDto = mapTimelineRegistryDto(context.timelineRegistry);
  const session = await getValidatedSession(await headers());
  const permissionAdapter = createWorkbenchPermissionAdapter({
    authContext: createAuthPermissionContextFromUser(session?.user),
    nodeEnv: process.env.NODE_ENV,
    allowDevRegistration: isDevRegistrationAllowed(),
  });

  const activityDto = filterActivityRegistryDto(
    unfilteredActivityDto,
    permissionAdapter,
  );
  const timelineDto = filterTimelineRegistryDto(
    unfilteredTimelineDto,
    permissionAdapter,
  );
  const bundle = buildActivityTimelineHydrationBundle({
    activityRegistryDto: activityDto,
    timelineRegistryDto: timelineDto,
  });

  return {
    bundle,
    activityDiagnostics: buildActivityRegistryHydrationDiagnostics(
      context.registry,
      activityDto,
    ),
    timelineDiagnostics: buildTimelineRegistryHydrationDiagnostics(
      context.timelineRegistry,
      timelineDto,
    ),
  };
}

export {
  loadActivityFrameworkHealthSummary,
  loadTimelineFrameworkHealthSummary,
} from "./activity-timeline-health";
