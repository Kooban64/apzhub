import { ACTIVITY_TIMELINE_FRAMEWORK_STATUS } from "../status";
import type { ActivityServiceDiagnostics } from "../types/activity-diagnostics";
import type { ActivityDocument } from "../types/activity-document";
import type { TimelineQuery, TimelineResult } from "../types/timeline-scope";
import type {
  ActivitySessionStore,
  AddActivitiesResult,
  ListActivitiesOptions,
} from "./activity-session-store";
import { createDefaultActivitySessionStore } from "./default-activity-session-store";
import type { ActivityService } from "./activity-service";

export interface DefaultActivityServiceOptions {
  readonly store?: ActivitySessionStore;
}

/**
 * Default Activity Service — stable public API between mapper and timeline experiences.
 *
 * Stores immutable ActivityDocument instances in a session-scoped in-memory store.
 * Does not publish events, execute mappers, render UI, persist, or track user state.
 */
export class DefaultActivityService implements ActivityService {
  private readonly store: ActivitySessionStore;

  constructor(options: DefaultActivityServiceOptions = {}) {
    this.store = options.store ?? createDefaultActivitySessionStore();
  }

  addActivities(items: readonly ActivityDocument[]): AddActivitiesResult {
    return Object.freeze(this.store.append(items));
  }

  listActivities(query: ListActivitiesOptions = {}): readonly ActivityDocument[] {
    return this.store.list(query);
  }

  getActivity(activityId: string): ActivityDocument | undefined {
    return this.store.get(activityId);
  }

  queryTimeline(query: TimelineQuery): TimelineResult {
    const activities = this.store.list({
      timelineScope: query.scopeId,
      category: query.category,
      activityTypeId: query.activityTypeId,
      limit: query.limit,
    });

    return Object.freeze({
      scopeId: query.scopeId,
      items: Object.freeze(activities.map((activity) => activity.activityId)),
      status: activities.length === 0 ? "empty" : "ok",
    });
  }

  clearActivities(): number {
    return this.store.clear();
  }

  getDiagnostics(): ActivityServiceDiagnostics {
    const totalActivityCount = this.store.getTotalCount();

    return Object.freeze({
      status: totalActivityCount === 0 ? "empty" : "ready",
      totalActivityCount,
      scopeCounts: this.store.getScopeCounts(),
      categoryCounts: this.store.getCategoryCounts(),
      latestActivityTimestamp: this.store.getLastActivityTimestamp(),
      message:
        totalActivityCount === 0
          ? "DefaultActivityService ready — no activities stored"
          : `DefaultActivityService ready — ${ACTIVITY_TIMELINE_FRAMEWORK_STATUS} session store active`,
    });
  }
}

export function createDefaultActivityService(
  options: DefaultActivityServiceOptions = {},
): DefaultActivityService {
  return new DefaultActivityService(options);
}

export type { ActivitySessionStore } from "./activity-session-store";
export type { DefaultActivitySessionStore } from "./default-activity-session-store";
