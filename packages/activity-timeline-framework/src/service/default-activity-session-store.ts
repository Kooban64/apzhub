import type { ActivityCategory } from "../types/activity-category";
import type { ActivityDocument } from "../types/activity-document";
import type {
  ActivitySessionAppendResult,
  ActivitySessionStore,
  ListActivitiesOptions,
} from "./activity-session-store";
import { compareActivityDocuments } from "./compare-activity-documents";

/**
 * Default in-memory activity session store.
 * Session-scoped only — no database, browser storage, cross-session persistence, or user state.
 */
export class DefaultActivitySessionStore implements ActivitySessionStore {
  private readonly entries = new Map<string, ActivityDocument>();

  append(items: readonly ActivityDocument[]): ActivitySessionAppendResult {
    let addedCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      if (this.entries.has(item.activityId)) {
        skippedCount += 1;
        continue;
      }

      this.entries.set(item.activityId, item);
      addedCount += 1;
    }

    return Object.freeze({ addedCount, skippedCount });
  }

  get(activityId: string): ActivityDocument | undefined {
    const entry = this.entries.get(activityId);
    return entry ? entry : undefined;
  }

  list(options: ListActivitiesOptions = {}): readonly ActivityDocument[] {
    let results = [...this.entries.values()];

    if (options.timelineScope !== undefined) {
      results = results.filter(
        (entry) => entry.timelineScope === options.timelineScope,
      );
    }

    if (options.category !== undefined) {
      results = results.filter((entry) => entry.category === options.category);
    }

    if (options.activityTypeId !== undefined) {
      results = results.filter(
        (entry) => entry.activityTypeId === options.activityTypeId,
      );
    }

    results.sort(compareActivityDocuments);

    if (options.limit !== undefined && options.limit >= 0) {
      results = results.slice(0, options.limit);
    }

    return Object.freeze(results);
  }

  clear(): number {
    const cleared = this.entries.size;
    this.entries.clear();
    return cleared;
  }

  getTotalCount(): number {
    return this.entries.size;
  }

  getLastActivityTimestamp(): string | undefined {
    if (this.entries.size === 0) {
      return undefined;
    }

    let latest: ActivityDocument | undefined;

    for (const entry of this.entries.values()) {
      if (!latest || compareActivityDocuments(entry, latest) < 0) {
        latest = entry;
      }
    }

    return latest?.timestamp;
  }

  getScopeCounts(): Readonly<Partial<Record<string, number>>> {
    const counts: Record<string, number> = {};

    for (const entry of this.entries.values()) {
      counts[entry.timelineScope] = (counts[entry.timelineScope] ?? 0) + 1;
    }

    return Object.freeze({ ...counts });
  }

  getCategoryCounts(): Readonly<Partial<Record<ActivityCategory, number>>> {
    const counts: Partial<Record<ActivityCategory, number>> = {};

    for (const entry of this.entries.values()) {
      counts[entry.category] = (counts[entry.category] ?? 0) + 1;
    }

    return Object.freeze({ ...counts });
  }
}

export function createDefaultActivitySessionStore(): ActivitySessionStore {
  return new DefaultActivitySessionStore();
}
