import { useCallback, useMemo } from "react";

import type { ActivityDocument } from "../types/activity-document";
import type { TimelineQuery, TimelineResult } from "../types/timeline-scope";
import type { ListActivitiesOptions } from "../service/activity-session-store";
import type { ActivityTimelineServiceDiagnostics } from "../client/service/activity-timeline-service-diagnostics";
import { useActivityTimelineServiceContext } from "./activity-timeline-service-context";

export interface UseActivityServiceResult {
  readonly isReady: boolean;
  readonly listActivities: (
    query?: ListActivitiesOptions,
  ) => readonly ActivityDocument[];
  readonly getActivity: (activityId: string) => ActivityDocument | undefined;
  readonly queryTimeline: (query: TimelineQuery) => TimelineResult;
  readonly diagnostics: ActivityTimelineServiceDiagnostics;
}

/**
 * Public Activity Timeline Service hook for Experience surfaces (AT-010).
 *
 * Experiences must consume this hook — not {@link DefaultActivityService}.
 */
export function useActivityService(): UseActivityServiceResult {
  const service = useActivityTimelineServiceContext();

  const diagnostics = useMemo(() => service.getDiagnostics(), [service]);

  const listActivities = useCallback(
    (query?: ListActivitiesOptions) => service.listActivities(query),
    [service],
  );

  const getActivity = useCallback(
    (activityId: string) => service.getActivity(activityId),
    [service],
  );

  const queryTimeline = useCallback(
    (query: TimelineQuery) => service.queryTimeline(query),
    [service],
  );

  return {
    isReady: diagnostics.serviceStatus !== "unavailable",
    listActivities,
    getActivity,
    queryTimeline,
    diagnostics,
  };
}
