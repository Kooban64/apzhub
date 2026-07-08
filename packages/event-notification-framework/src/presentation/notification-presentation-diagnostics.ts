import { NOTIFICATION_LAYER_STATUS } from "../status";
import type {
  NotificationKind,
  NotificationPriority,
} from "../types/notification-kind";
import { groupNotificationViewModelsByPriority } from "./group-notifications";
import { mapNotificationItemsToViewModels } from "./map-notification-item-to-view-model";
import type { NotificationItem } from "../notification/notification-item";
import type {
  NotificationPriorityGroup,
  NotificationViewModel,
} from "./notification-view-model";

export type NotificationPresentationDiagnosticsStatus = "empty" | "ready";

export interface NotificationPresentationDiagnostics {
  readonly status: NotificationPresentationDiagnosticsStatus;
  readonly layerStatus: typeof NOTIFICATION_LAYER_STATUS;
  readonly totalCount: number;
  readonly unreadCount: number;
  readonly readCount: number;
  readonly priorityCounts: Readonly<Partial<Record<NotificationPriority, number>>>;
  readonly kindCounts: Readonly<Partial<Record<NotificationKind, number>>>;
  readonly groupCount: number;
  readonly message: string;
}

export interface BuildNotificationPresentationDiagnosticsOptions {
  readonly groups?: readonly NotificationPriorityGroup[];
}

function countByField<T extends string>(
  models: readonly NotificationViewModel[],
  selector: (model: NotificationViewModel) => T,
): Readonly<Partial<Record<T, number>>> {
  const counts: Partial<Record<T, number>> = {};

  for (const model of models) {
    const key = selector(model);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return Object.freeze(counts);
}

/** Presentation diagnostics from mapped view models — read-only metrics for Experiences/dev. */
export function buildNotificationPresentationDiagnostics(
  models: readonly NotificationViewModel[],
  options: BuildNotificationPresentationDiagnosticsOptions = {},
): NotificationPresentationDiagnostics {
  const totalCount = models.length;
  const unreadCount = models.filter((model) => model.isUnread).length;
  const readCount = totalCount - unreadCount;
  const groups = options.groups ?? groupNotificationViewModelsByPriority(models);

  return Object.freeze({
    status: totalCount === 0 ? "empty" : "ready",
    layerStatus: NOTIFICATION_LAYER_STATUS,
    totalCount,
    unreadCount,
    readCount,
    priorityCounts: countByField(models, (model) => model.priority),
    kindCounts: countByField(models, (model) => model.kind),
    groupCount: groups.length,
    message:
      totalCount === 0
        ? "Notification presentation ready — no view models"
        : "Notification presentation ready — view models mapped",
  });
}

export interface PresentNotificationsFromItemsOptions {
  readonly now?: Date | string;
  readonly locale?: string;
  readonly includeEmptyGroups?: boolean;
}

export interface PresentNotificationsFromItemsResult {
  readonly viewModels: readonly NotificationViewModel[];
  readonly groups: readonly NotificationPriorityGroup[];
  readonly diagnostics: NotificationPresentationDiagnostics;
}

/**
 * End-to-end presentation helper from service items — map, sort, group, diagnose.
 * Does not store, deliver, publish, execute actions, or mutate service state.
 */
export function presentNotificationsFromItems(
  items: readonly NotificationItem[],
  options: PresentNotificationsFromItemsOptions = {},
): PresentNotificationsFromItemsResult {
  const viewModels = mapNotificationItemsToViewModels(items, {
    now: options.now,
    locale: options.locale,
  });
  const groups = groupNotificationViewModelsByPriority(viewModels, {
    includeEmptyGroups: options.includeEmptyGroups,
  });
  const diagnostics = buildNotificationPresentationDiagnostics(viewModels, { groups });

  return Object.freeze({
    viewModels,
    groups,
    diagnostics,
  });
}
