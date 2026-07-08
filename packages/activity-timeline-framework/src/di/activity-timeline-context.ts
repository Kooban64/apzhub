import { bootstrapActivityRegistry } from "../bootstrap/bootstrap-activity-registry";
import { createDefaultEventToActivityMapper, type ActivityMapper } from "../mapper";
import type { ActivityRegistry } from "../registry";
import type { ActivityService } from "../service";
import { createDefaultActivityService } from "../service";
import type { ActivityTimelineFrameworkStatus } from "../status";
import { ACTIVITY_TIMELINE_FRAMEWORK_STATUS } from "../status";
import type { TimelineRegistry } from "../timeline";
import { createDefaultTimelineRegistryWithPlatformCatalogue } from "../timeline";
import type { ActivityRegistryDiagnostics } from "../types/activity-diagnostics";
import type { TimelineRegistryDiagnostics } from "../types/timeline-diagnostics";

/** Dependency injection root for Activity & Timeline Framework consumers. */
export interface ActivityContext {
  readonly status: ActivityTimelineFrameworkStatus;
  readonly registry: ActivityRegistry;
  readonly timelineRegistry: TimelineRegistry;
  readonly mapper: ActivityMapper;
  readonly service: ActivityService;
  readonly diagnostics: ActivityRegistryDiagnostics;
  readonly timelineDiagnostics: TimelineRegistryDiagnostics;
}

export interface CreateActivityTimelineContextOptions {
  readonly registry?: ActivityRegistry;
  readonly timelineRegistry?: TimelineRegistry;
  readonly mapper?: ActivityMapper;
  readonly service?: ActivityService;
}

/**
 * Composition root — defaults to bootstrapped ActivityRegistry, platform TimelineRegistry,
 * and DefaultEventToActivityMapper / DefaultActivityService.
 */
export function createActivityTimelineContext(
  options: CreateActivityTimelineContextOptions = {},
): ActivityContext {
  const registry = options.registry ?? bootstrapActivityRegistry().registry;
  const timelineRegistry =
    options.timelineRegistry ?? createDefaultTimelineRegistryWithPlatformCatalogue();
  const mapper =
    options.mapper ??
    createDefaultEventToActivityMapper({
      activityRegistry: registry,
    });
  const service = options.service ?? createDefaultActivityService();

  return {
    status: ACTIVITY_TIMELINE_FRAMEWORK_STATUS,
    registry,
    timelineRegistry,
    mapper,
    service,
    diagnostics: registry.getDiagnostics(),
    timelineDiagnostics: timelineRegistry.getDiagnostics(),
  };
}
