import type { ActivityDocument } from "../../types/activity-document";
import type { ActivityService } from "../../service/activity-service";
import { createDefaultActivityService } from "../../service/default-activity-service";
import type { ActivityTimelineClientContext } from "../create-activity-timeline-context-from-dto";
import { createActivityTimelineService } from "./create-activity-timeline-service";
import type { ActivityTimelineService } from "./activity-timeline-service";

export interface CreateActivityTimelineServiceFromHydrationOptions {
  readonly context: ActivityTimelineClientContext;
  /** Internal runtime store override — not exposed on the public service API. */
  readonly activityService?: ActivityService;
  /** Server/runtime seed for tests and future hydration bundles — uses internal addActivities. */
  readonly initialActivities?: readonly ActivityDocument[];
}

/**
 * Wires the internal Activity Service behind the public Activity Timeline Service.
 *
 * {@link DefaultActivityService} remains an implementation detail — experiences consume
 * {@link ActivityTimelineService} through React only.
 */
export function createActivityTimelineServiceFromHydration(
  options: CreateActivityTimelineServiceFromHydrationOptions,
): ActivityTimelineService {
  const activityService = options.activityService ?? createDefaultActivityService();

  if (options.initialActivities && options.initialActivities.length > 0) {
    activityService.addActivities(options.initialActivities);
  }

  return createActivityTimelineService({
    activityService,
    registryReady: options.context.ok,
    activityRegistryDiagnostics: options.context.activityRegistryDiagnostics,
    timelineRegistryDiagnostics: options.context.timelineRegistryDiagnostics,
    hydrationDiagnostics: options.context.diagnostics,
  });
}
