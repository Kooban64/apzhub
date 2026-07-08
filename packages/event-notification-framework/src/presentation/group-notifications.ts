import type { NotificationPriority } from "../types/notification-kind";
import {
  compareNotificationPriority,
  getNotificationPriorityLabel,
  mapNotificationPriorityToSeverity,
} from "./notification-priority-order";
import {
  freezeNotificationPriorityGroup,
  type NotificationPriorityGroup,
  type NotificationViewModel,
} from "./notification-view-model";

const PRIORITY_ORDER: readonly NotificationPriority[] = [
  "urgent",
  "high",
  "normal",
  "low",
];

export interface SortNotificationViewModelsOptions {
  readonly newestFirstWithinPriority?: boolean;
}

/** Sorts view models by priority (urgent first), then timestamp descending. */
export function sortNotificationViewModelsByPriority(
  models: readonly NotificationViewModel[],
  options: SortNotificationViewModelsOptions = {},
): readonly NotificationViewModel[] {
  const newestFirst = options.newestFirstWithinPriority ?? true;

  return Object.freeze(
    [...models].sort((left, right) => {
      const priorityCompare = compareNotificationPriority(
        left.priority,
        right.priority,
      );
      if (priorityCompare !== 0) {
        return priorityCompare;
      }

      const timestampCompare = left.timestamp.localeCompare(right.timestamp);
      return newestFirst ? -timestampCompare : timestampCompare;
    }),
  );
}

export interface GroupNotificationViewModelsOptions extends SortNotificationViewModelsOptions {
  readonly includeEmptyGroups?: boolean;
}

/** Groups sorted view models into priority buckets for list Experiences. */
export function groupNotificationViewModelsByPriority(
  models: readonly NotificationViewModel[],
  options: GroupNotificationViewModelsOptions = {},
): readonly NotificationPriorityGroup[] {
  const sorted = sortNotificationViewModelsByPriority(models, options);
  const buckets = new Map<NotificationPriority, NotificationViewModel[]>();

  for (const model of sorted) {
    const bucket = buckets.get(model.priority);
    if (bucket) {
      bucket.push(model);
    } else {
      buckets.set(model.priority, [model]);
    }
  }

  const groups: NotificationPriorityGroup[] = [];

  for (const priority of PRIORITY_ORDER) {
    const items = buckets.get(priority) ?? [];
    if (items.length === 0 && !options.includeEmptyGroups) {
      continue;
    }

    groups.push(
      freezeNotificationPriorityGroup({
        key: priority,
        label: getNotificationPriorityLabel(priority),
        priority,
        severity: mapNotificationPriorityToSeverity(priority),
        items: Object.freeze([...items]),
        unreadCount: items.filter((item) => item.isUnread).length,
      }),
    );
  }

  return Object.freeze(groups);
}

export interface PresentNotificationsOptions extends GroupNotificationViewModelsOptions {
  readonly now?: Date | string;
  readonly locale?: string;
}

/** Convenience pipeline: sort then group view models for Experiences. */
export function presentNotificationViewModels(
  models: readonly NotificationViewModel[],
  options: PresentNotificationsOptions = {},
): readonly NotificationPriorityGroup[] {
  return groupNotificationViewModelsByPriority(models, options);
}
