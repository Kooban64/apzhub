import type { ActivityDocument } from "../../types/activity-document";
import type { TimelineQuery, TimelineResult } from "../../types/timeline-scope";
import type { ListActivitiesOptions } from "../../service/activity-session-store";
import type { ActivityTimelineServiceDiagnostics } from "./activity-timeline-service-diagnostics";

/**
 * Public client boundary between Timeline Experiences and activity storage (AT-010).
 *
 * Experiences must consume this interface — not {@link DefaultActivityService}.
 */
export interface ActivityTimelineService {
  listActivities(query?: ListActivitiesOptions): readonly ActivityDocument[];
  getActivity(activityId: string): ActivityDocument | undefined;
  queryTimeline(query: TimelineQuery): TimelineResult;
  getDiagnostics(): ActivityTimelineServiceDiagnostics;
}

export type { ListActivitiesOptions };
