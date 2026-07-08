import { useMemo } from "react";

import type { NotificationItem } from "../notification/notification-item";
import {
  buildNotificationPresentationDiagnostics,
  groupNotificationViewModelsByPriority,
  mapNotificationItemsToViewModels,
  type MapNotificationItemToViewModelOptions,
  type NotificationPresentationDiagnostics,
  type NotificationPriorityGroup,
  type NotificationViewModel,
} from "../presentation";
import {
  useNotificationService,
  type UseNotificationServiceResult,
} from "./use-notification-service";

export interface UseNotificationPresentationOptions extends MapNotificationItemToViewModelOptions {
  readonly includeEmptyGroups?: boolean;
}

export interface UseNotificationPresentationResult extends Pick<
  UseNotificationServiceResult,
  | "service"
  | "unreadCount"
  | "addNotifications"
  | "getNotification"
  | "markAsRead"
  | "markAllAsRead"
  | "clearNotifications"
> {
  readonly notifications: readonly NotificationItem[];
  readonly viewModels: readonly NotificationViewModel[];
  readonly groups: readonly NotificationPriorityGroup[];
  readonly diagnostics: NotificationPresentationDiagnostics;
  readonly serviceDiagnostics: UseNotificationServiceResult["diagnostics"];
}

/**
 * Maps Notification Service state into UI-ready view models.
 * Read-only — does not mutate service state, deliver, publish, or execute actions.
 */
export function useNotificationPresentation(
  options: UseNotificationPresentationOptions = {},
): UseNotificationPresentationResult {
  const serviceState = useNotificationService();
  const { now, locale, includeEmptyGroups } = options;

  const viewModels = useMemo(
    () =>
      mapNotificationItemsToViewModels(serviceState.notifications, {
        now,
        locale,
      }),
    [serviceState.notifications, now, locale],
  );

  const groups = useMemo(
    () =>
      groupNotificationViewModelsByPriority(viewModels, {
        includeEmptyGroups,
      }),
    [viewModels, includeEmptyGroups],
  );

  const diagnostics = useMemo(
    () => buildNotificationPresentationDiagnostics(viewModels, { groups }),
    [viewModels, groups],
  );

  return useMemo(
    () => ({
      service: serviceState.service,
      notifications: serviceState.notifications,
      viewModels,
      groups,
      unreadCount: serviceState.unreadCount,
      diagnostics,
      serviceDiagnostics: serviceState.diagnostics,
      addNotifications: serviceState.addNotifications,
      getNotification: serviceState.getNotification,
      markAsRead: serviceState.markAsRead,
      markAllAsRead: serviceState.markAllAsRead,
      clearNotifications: serviceState.clearNotifications,
    }),
    [serviceState, viewModels, groups, diagnostics],
  );
}
