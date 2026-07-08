import {
  ACTIVITY_TIMELINE_FRAMEWORK_STATUS,
  buildActivityRegistryHydrationDiagnostics,
  buildTimelineRegistryHydrationDiagnostics,
  filterActivityRegistryDto,
  filterTimelineRegistryDto,
  mapActivityRegistryDto,
  mapTimelineRegistryDto,
} from "@apzhub/activity-timeline-framework/server";
import type {
  ActivityFrameworkHealthSummary,
  TimelineFrameworkHealthSummary,
} from "@apzhub/types";
import { createWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import { loadSharedActivityTimelineContext } from "./load-shared-activity-timeline-context";

function mapRegistryHealthStatus(
  registeredCount: number,
  filteredCount: number,
  bootstrapOk: boolean,
): ActivityFrameworkHealthSummary["status"] {
  if (!bootstrapOk || registeredCount === 0) {
    return "unhealthy";
  }

  if (filteredCount === 0 && registeredCount > 0) {
    return "degraded";
  }

  return "healthy";
}

function resolveHydrationStatus(
  bootstrapOk: boolean,
  filteredActivityCount: number,
  filteredTimelineCount: number,
): TimelineFrameworkHealthSummary["hydrationStatus"] {
  if (!bootstrapOk) {
    return "invalid";
  }

  if (filteredActivityCount === 0 && filteredTimelineCount === 0) {
    return "empty";
  }

  return "hydrated";
}

/** Platform-wide Activity Framework summary for `/api/health` (allow-all visibility). */
export async function loadActivityFrameworkHealthSummary(): Promise<
  ActivityFrameworkHealthSummary | undefined
> {
  const context = await loadSharedActivityTimelineContext();

  if (!context) {
    return undefined;
  }

  const permissionAdapter = createWorkbenchPermissionAdapter({ mode: "allow-all" });
  const activityDto = filterActivityRegistryDto(
    mapActivityRegistryDto(context.registry),
    permissionAdapter,
  );
  const activityDiagnostics = buildActivityRegistryHydrationDiagnostics(
    context.registry,
    activityDto,
  );
  const mapperDiagnostics = context.mapper.getDiagnostics();
  const serviceDiagnostics = context.service.getDiagnostics();

  return {
    status: mapRegistryHealthStatus(
      activityDiagnostics.registeredCount,
      activityDiagnostics.filteredCount,
      context.activityBootstrapOk,
    ),
    frameworkStatus: ACTIVITY_TIMELINE_FRAMEWORK_STATUS,
    layerStatus: context.diagnostics.status,
    registeredTypeCount: activityDiagnostics.registeredCount,
    filteredTypeCount: activityDiagnostics.filteredCount,
    platformTypeCount: activityDiagnostics.builtinCount,
    capabilityTypeCount: activityDiagnostics.manifestCount,
    serviceStatus: serviceDiagnostics.status,
    storedCount: serviceDiagnostics.totalActivityCount,
    viewedCount: 0,
    unviewedCount: serviceDiagnostics.totalActivityCount,
    mapperStatus: mapperDiagnostics.status,
    mappedCount: mapperDiagnostics.mappedCount,
    lastBootstrapStatus: context.activityBootstrapOk ? "ok" : "failed",
    subscriberRegistered: context.subscriberId !== undefined,
  };
}

/** Platform-wide Timeline Framework summary for `/api/health` (allow-all visibility). */
export async function loadTimelineFrameworkHealthSummary(): Promise<
  TimelineFrameworkHealthSummary | undefined
> {
  const context = await loadSharedActivityTimelineContext();

  if (!context) {
    return undefined;
  }

  const permissionAdapter = createWorkbenchPermissionAdapter({ mode: "allow-all" });
  const activityDto = filterActivityRegistryDto(
    mapActivityRegistryDto(context.registry),
    permissionAdapter,
  );
  const timelineDto = filterTimelineRegistryDto(
    mapTimelineRegistryDto(context.timelineRegistry),
    permissionAdapter,
  );
  const timelineDiagnostics = buildTimelineRegistryHydrationDiagnostics(
    context.timelineRegistry,
    timelineDto,
  );
  const activityDiagnostics = buildActivityRegistryHydrationDiagnostics(
    context.registry,
    activityDto,
  );

  const scopeCounts = Object.fromEntries(
    Object.entries(context.timelineDiagnostics.scopeCounts).map(([key, value]) => [
      key,
      value ?? 0,
    ]),
  );
  const activeScopeCount = Object.values(scopeCounts).filter(
    (count) => count > 0,
  ).length;

  return {
    status: mapRegistryHealthStatus(
      timelineDiagnostics.registeredCount,
      timelineDiagnostics.filteredCount,
      context.timelineBootstrapOk,
    ),
    frameworkStatus: ACTIVITY_TIMELINE_FRAMEWORK_STATUS,
    layerStatus: context.timelineDiagnostics.status,
    registeredTimelineCount: timelineDiagnostics.registeredCount,
    filteredTimelineCount: timelineDiagnostics.filteredCount,
    platformTimelineCount: timelineDiagnostics.builtinCount,
    capabilityTimelineCount: timelineDiagnostics.manifestCount,
    activeScopeCount,
    scopeCounts,
    lastBootstrapStatus: context.timelineBootstrapOk ? "ok" : "failed",
    hydrationStatus: resolveHydrationStatus(
      context.activityBootstrapOk && context.timelineBootstrapOk,
      activityDiagnostics.filteredCount,
      timelineDiagnostics.filteredCount,
    ),
  };
}
