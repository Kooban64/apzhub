import type { ActivityServiceDiagnostics } from "../types/activity-diagnostics";
import type { ActivityDocument } from "../types/activity-document";
import type { TimelineQuery, TimelineResult } from "../types/timeline-scope";
import type {
  ActivityService,
  AddActivitiesResult,
  ListActivitiesOptions,
} from "./activity-service";

const PLACEHOLDER_DIAGNOSTICS: ActivityServiceDiagnostics = {
  status: "scaffold",
  totalActivityCount: 0,
  scopeCounts: {},
  categoryCounts: {},
  message: "Placeholder service — storage deferred until wired explicitly",
};

/** No-op service — opt-in via DI override when storage is not required. */
export class PlaceholderActivityService implements ActivityService {
  addActivities(_items: readonly ActivityDocument[]): AddActivitiesResult {
    return Object.freeze({ addedCount: 0, skippedCount: 0 });
  }

  listActivities(_query?: ListActivitiesOptions): readonly ActivityDocument[] {
    return [];
  }

  getActivity(_activityId: string): ActivityDocument | undefined {
    return undefined;
  }

  queryTimeline(query: TimelineQuery): TimelineResult {
    return {
      scopeId: query.scopeId,
      items: [],
      status: "empty",
    };
  }

  clearActivities(): number {
    return 0;
  }

  getDiagnostics(): ActivityServiceDiagnostics {
    return PLACEHOLDER_DIAGNOSTICS;
  }
}

export function createPlaceholderActivityService(): ActivityService {
  return new PlaceholderActivityService();
}
