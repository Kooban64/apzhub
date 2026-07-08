import type { ActivityService } from "../../service/activity-service";
import { createDefaultActivityService } from "../../service/default-activity-service";
import { ACTIVITY_TIMELINE_FRAMEWORK_STATUS } from "../../status";
import type { ActivityDocument } from "../../types/activity-document";
import type { TimelineQuery, TimelineResult } from "../../types/timeline-scope";
import type { ListActivitiesOptions } from "../../service/activity-session-store";
import type { ActivityTimelineHydrationDiagnostics } from "../activity-timeline-hydration-diagnostics";
import type { ClientActivityRegistryDiagnostics } from "../client-activity-registry-diagnostics";
import type { ClientTimelineRegistryDiagnostics } from "../client-timeline-registry-diagnostics";
import type { CreateActivityTimelineServiceOptions } from "./create-activity-timeline-service";
import type { ActivityTimelineService } from "./activity-timeline-service";
import type {
  ActivityTimelineServiceDiagnostics,
  ActivityTimelineServiceStatus,
} from "./activity-timeline-service-diagnostics";

function resolveServiceStatus(
  registryReady: boolean,
  activityCount: number,
): ActivityTimelineServiceStatus {
  if (!registryReady) {
    return "unavailable";
  }

  return activityCount === 0 ? "empty" : "ready";
}

/**
 * Default public Activity Timeline Service — delegates read/query APIs to the internal Activity Service.
 *
 * Does not expose mutations (`addActivities`, `clearActivities`). No business logic beyond delegation.
 */
export class DefaultActivityTimelineService implements ActivityTimelineService {
  private readonly activityService: ActivityService;
  private readonly registryReady: boolean;
  private readonly activityRegistryDiagnostics?: ClientActivityRegistryDiagnostics;
  private readonly timelineRegistryDiagnostics?: ClientTimelineRegistryDiagnostics;
  private readonly hydrationDiagnostics?: ActivityTimelineHydrationDiagnostics;

  constructor(options: CreateActivityTimelineServiceOptions) {
    this.activityService = options.activityService ?? createDefaultActivityService();
    this.registryReady = options.registryReady ?? false;
    this.activityRegistryDiagnostics = options.activityRegistryDiagnostics;
    this.timelineRegistryDiagnostics = options.timelineRegistryDiagnostics;
    this.hydrationDiagnostics = options.hydrationDiagnostics;
  }

  listActivities(query: ListActivitiesOptions = {}): readonly ActivityDocument[] {
    return this.activityService.listActivities(query);
  }

  getActivity(activityId: string): ActivityDocument | undefined {
    return this.activityService.getActivity(activityId);
  }

  queryTimeline(query: TimelineQuery): TimelineResult {
    return this.activityService.queryTimeline(query);
  }

  getDiagnostics(): ActivityTimelineServiceDiagnostics {
    const activityService = this.activityService.getDiagnostics();
    const activityCount = activityService.totalActivityCount;
    const timelineDefinitionCount =
      this.timelineRegistryDiagnostics?.timelineCount ?? 0;
    const serviceStatus = resolveServiceStatus(this.registryReady, activityCount);

    return Object.freeze({
      frameworkStatus: ACTIVITY_TIMELINE_FRAMEWORK_STATUS,
      serviceStatus,
      registryStatus: this.activityRegistryDiagnostics?.status,
      timelineRegistryStatus: this.timelineRegistryDiagnostics?.status,
      registryReady: this.registryReady,
      hydrationStatus: this.hydrationDiagnostics?.hydrationStatus,
      activityCount,
      timelineDefinitionCount,
      activityService,
      message:
        serviceStatus === "unavailable"
          ? "ActivityTimelineService unavailable — registry hydration failed"
          : activityCount === 0
            ? "ActivityTimelineService ready — no activities stored"
            : `ActivityTimelineService ready — ${activityCount} activities available`,
    });
  }
}
