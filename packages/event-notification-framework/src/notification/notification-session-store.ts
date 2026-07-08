import type { NotificationItem } from "./notification-item";
import { freezeNotificationItem } from "./notification-item";
import type { ListNotificationsOptions } from "./notification-service";

export interface NotificationSessionEntry {
  readonly item: NotificationItem;
  readonly read: boolean;
  readonly storedAt: string;
}

export interface NotificationSessionAppendResult {
  readonly addedCount: number;
  readonly skippedCount: number;
}

/** In-memory session-scoped notification store — no persistence. */
export interface NotificationSessionStore {
  append(items: readonly NotificationItem[]): NotificationSessionAppendResult;
  get(notificationId: string): NotificationItem | undefined;
  list(options?: ListNotificationsOptions): readonly NotificationItem[];
  getUnreadCount(): number;
  getReadCount(): number;
  getTotalCount(): number;
  getLastNotificationTimestamp(): string | undefined;
  markAsRead(notificationId: string): boolean;
  markAllAsRead(): number;
  clear(): number;
}

export function withNotificationReadState(
  item: NotificationItem,
  read: boolean,
): NotificationItem {
  return freezeNotificationItem({
    ...item,
    metadata: Object.freeze({
      ...item.metadata,
      read,
    }),
  });
}

export function compareNotificationItems(
  left: NotificationSessionEntry,
  right: NotificationSessionEntry,
): number {
  const timestampCompare = right.item.timestamp.localeCompare(left.item.timestamp);
  if (timestampCompare !== 0) {
    return timestampCompare;
  }

  return left.item.notificationId.localeCompare(right.item.notificationId);
}
