import { useMemo, useSyncExternalStore } from "react";

import type { NotificationItem } from "../notification/notification-item";
import type {
  AddNotificationsResult,
  NotificationService,
} from "../notification/notification-service";
import type { NotificationServiceDiagnostics } from "../types/diagnostics";
import { useNotificationServiceContext } from "./notification-service-context";

export interface UseNotificationServiceResult {
  readonly service: NotificationService;
  readonly notifications: readonly NotificationItem[];
  readonly unreadCount: number;
  readonly diagnostics: NotificationServiceDiagnostics;
  addNotifications(items: readonly NotificationItem[]): AddNotificationsResult;
  getNotification(notificationId: string): NotificationItem | undefined;
  markAsRead(notificationId: string): boolean;
  markAllAsRead(): number;
  clearNotifications(): number;
}

export function useNotificationService(): UseNotificationServiceResult {
  const { service } = useNotificationServiceContext();

  const revision = useSyncExternalStore(
    (listener) => service.subscribe(listener),
    () => service.getStoreRevision(),
    () => service.getStoreRevision(),
  );

  const notifications = useMemo(() => service.listNotifications(), [service, revision]);

  const unreadCount = useMemo(() => service.getUnreadCount(), [service, revision]);

  const diagnostics = useMemo(() => service.getDiagnostics(), [service, revision]);

  return useMemo(
    () => ({
      service,
      notifications,
      unreadCount,
      diagnostics,
      addNotifications: (items: readonly NotificationItem[]) =>
        service.addNotifications(items),
      getNotification: (notificationId: string) =>
        service.getNotification(notificationId),
      markAsRead: (notificationId: string) => service.markAsRead(notificationId),
      markAllAsRead: () => service.markAllAsRead(),
      clearNotifications: () => service.clearNotifications(),
    }),
    [service, notifications, unreadCount, diagnostics],
  );
}
