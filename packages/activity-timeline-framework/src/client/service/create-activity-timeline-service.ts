import type { ActivityService } from "../../service/activity-service";
import type { ActivityTimelineHydrationDiagnostics } from "../activity-timeline-hydration-diagnostics";
import type { ClientActivityRegistryDiagnostics } from "../client-activity-registry-diagnostics";
import type { ClientTimelineRegistryDiagnostics } from "../client-timeline-registry-diagnostics";
import { DefaultActivityTimelineService } from "./default-activity-timeline-service";
import type { ActivityTimelineService } from "./activity-timeline-service";

export interface CreateActivityTimelineServiceOptions {
  /** Internal runtime store — {@link DefaultActivityService} remains server/mapper owned. */
  readonly activityService?: ActivityService;
  readonly registryReady?: boolean;
  readonly activityRegistryDiagnostics?: ClientActivityRegistryDiagnostics;
  readonly timelineRegistryDiagnostics?: ClientTimelineRegistryDiagnostics;
  readonly hydrationDiagnostics?: ActivityTimelineHydrationDiagnostics;
}

export function createActivityTimelineService(
  options: CreateActivityTimelineServiceOptions = {},
): ActivityTimelineService {
  return new DefaultActivityTimelineService(options);
}
