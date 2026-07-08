import type { ActivityCategory } from "../types/activity-category";
import type { ActivityDocument } from "../types/activity-document";
import type { TimelineScopeId } from "../types/timeline-scope";

/** Filters for listing stored activity documents. */
export interface ListActivitiesOptions {
  readonly timelineScope?: TimelineScopeId;
  readonly category?: ActivityCategory;
  readonly activityTypeId?: string;
  readonly limit?: number;
}

export interface ActivitySessionAppendResult {
  readonly addedCount: number;
  readonly skippedCount: number;
}

/** Alias for service append results. */
export type AddActivitiesResult = ActivitySessionAppendResult;

/** In-memory session-scoped activity store — no persistence or user state. */
export interface ActivitySessionStore {
  append(items: readonly ActivityDocument[]): ActivitySessionAppendResult;
  get(activityId: string): ActivityDocument | undefined;
  list(options?: ListActivitiesOptions): readonly ActivityDocument[];
  clear(): number;
  getTotalCount(): number;
  getLastActivityTimestamp(): string | undefined;
  getScopeCounts(): Readonly<Partial<Record<string, number>>>;
  getCategoryCounts(): Readonly<Partial<Record<ActivityCategory, number>>>;
}
