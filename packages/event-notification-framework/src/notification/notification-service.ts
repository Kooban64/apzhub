import type { NotificationKind } from "../types/notification-kind";
import type { NotificationServiceDiagnostics } from "../types/diagnostics";
import type { NotificationItem } from "./notification-item";

export interface ListNotificationsOptions {
  readonly unreadOnly?: boolean;
  readonly kind?: NotificationKind;
  readonly limit?: number;
}

export interface AddNotificationsResult {
  readonly addedCount: number;
  readonly skippedCount: number;
}

/** Public notification boundary — session store and read/query APIs only. */
export interface NotificationService {
  addNotifications(items: readonly NotificationItem[]): AddNotificationsResult;
  listNotifications(options?: ListNotificationsOptions): readonly NotificationItem[];
  getNotification(notificationId: string): NotificationItem | undefined;
  getUnreadCount(): number;
  markAsRead(notificationId: string): boolean;
  markAllAsRead(): number;
  clearNotifications(): number;
  /** Alias for {@link markAsRead}. */
  markRead(notificationId: string): boolean;
  /** Alias for {@link markAllAsRead}. */
  markAllRead(): number;
  subscribe(listener: () => void): () => void;
  /** Monotonic revision for external-store subscriptions — increments on mutations. */
  getStoreRevision(): number;
  getDiagnostics(): NotificationServiceDiagnostics;
}
