import { ACTIVITY_CATEGORIES } from "../types/activity-category";
import type { ActivityCategory } from "../types/activity-category";
import {
  RESERVED_TIMELINE_SCOPE_IDS,
  type TimelineScopeId,
} from "../types/timeline-scope";
import type { ActivityViewModel } from "./activity-view-model";
import { sortActivityViewModels } from "./sort-activity-view-models";

const DAY_MS = 86_400_000;

export type ActivityGroupingStrategy = "date" | "category" | "timelineScope";

export type ActivityDateGroupKey = "today" | "yesterday" | "earlier";

export interface ActivityViewModelGroup {
  readonly key: string;
  readonly label: string;
  readonly strategy: ActivityGroupingStrategy;
  readonly items: readonly ActivityViewModel[];
}

export interface GroupActivityViewModelsOptions {
  readonly strategy?: ActivityGroupingStrategy;
  readonly includeEmptyGroups?: boolean;
  readonly now?: Date | string;
}

const DATE_GROUP_ORDER: readonly ActivityDateGroupKey[] = [
  "today",
  "yesterday",
  "earlier",
];

const DATE_GROUP_LABELS: Readonly<Record<ActivityDateGroupKey, string>> = {
  today: "Today",
  yesterday: "Yesterday",
  earlier: "Earlier",
};

function resolveNow(options: GroupActivityViewModelsOptions): Date {
  if (options.now instanceof Date) {
    return options.now;
  }

  if (typeof options.now === "string") {
    const parsed = Date.parse(options.now);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }
  }

  return new Date();
}

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function resolveDateGroupKey(timestamp: string, now: Date): ActivityDateGroupKey {
  const target = Date.parse(timestamp);
  if (Number.isNaN(target)) {
    return "earlier";
  }

  const dayDiff = Math.floor(
    (startOfUtcDay(now) - startOfUtcDay(new Date(target))) / DAY_MS,
  );

  if (dayDiff <= 0) {
    return "today";
  }

  if (dayDiff === 1) {
    return "yesterday";
  }

  return "earlier";
}

function freezeGroup(group: ActivityViewModelGroup): ActivityViewModelGroup {
  return Object.freeze({
    ...group,
    items: Object.freeze([...group.items]),
  });
}

function groupByDate(
  models: readonly ActivityViewModel[],
  options: GroupActivityViewModelsOptions,
): readonly ActivityViewModelGroup[] {
  const now = resolveNow(options);
  const buckets = new Map<ActivityDateGroupKey, ActivityViewModel[]>();

  for (const model of models) {
    const key = resolveDateGroupKey(model.timestamp, now);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(model);
    } else {
      buckets.set(key, [model]);
    }
  }

  return Object.freeze(
    DATE_GROUP_ORDER.flatMap((key) => {
      const items = sortActivityViewModels(buckets.get(key) ?? []);
      if (items.length === 0 && !options.includeEmptyGroups) {
        return [];
      }

      return [
        freezeGroup({
          key,
          label: DATE_GROUP_LABELS[key],
          strategy: "date",
          items,
        }),
      ];
    }),
  );
}

function groupByCategory(
  models: readonly ActivityViewModel[],
  options: GroupActivityViewModelsOptions,
): readonly ActivityViewModelGroup[] {
  const buckets = new Map<ActivityCategory, ActivityViewModel[]>();

  for (const model of models) {
    const bucket = buckets.get(model.category);
    if (bucket) {
      bucket.push(model);
    } else {
      buckets.set(model.category, [model]);
    }
  }

  return Object.freeze(
    ACTIVITY_CATEGORIES.flatMap((category) => {
      const items = sortActivityViewModels(buckets.get(category) ?? []);
      if (items.length === 0 && !options.includeEmptyGroups) {
        return [];
      }

      return [
        freezeGroup({
          key: category,
          label: category,
          strategy: "category",
          items,
        }),
      ];
    }),
  );
}

function groupByTimelineScope(
  models: readonly ActivityViewModel[],
  options: GroupActivityViewModelsOptions,
): readonly ActivityViewModelGroup[] {
  const buckets = new Map<TimelineScopeId, ActivityViewModel[]>();

  for (const model of models) {
    const bucket = buckets.get(model.timelineScope);
    if (bucket) {
      bucket.push(model);
    } else {
      buckets.set(model.timelineScope, [model]);
    }
  }

  return Object.freeze(
    RESERVED_TIMELINE_SCOPE_IDS.flatMap((scope) => {
      const items = sortActivityViewModels(buckets.get(scope) ?? []);
      if (items.length === 0 && !options.includeEmptyGroups) {
        return [];
      }

      return [
        freezeGroup({
          key: scope,
          label: scope,
          strategy: "timelineScope",
          items,
        }),
      ];
    }),
  );
}

/**
 * Groups sorted view models by date, category, or timeline scope.
 *
 * Date buckets (UTC calendar day relative to `now`):
 * - Today — same UTC day as `now`
 * - Yesterday — previous UTC day
 * - Earlier — all older entries
 */
export function groupActivityViewModels(
  models: readonly ActivityViewModel[],
  options: GroupActivityViewModelsOptions = {},
): readonly ActivityViewModelGroup[] {
  const sorted = sortActivityViewModels(models);
  const strategy = options.strategy ?? "date";

  switch (strategy) {
    case "category":
      return groupByCategory(sorted, options);
    case "timelineScope":
      return groupByTimelineScope(sorted, options);
    case "date":
    default:
      return groupByDate(sorted, options);
  }
}
