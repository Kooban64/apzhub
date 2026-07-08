import { NOTIFICATION_LAYER_STATUS } from "../status";
import type { NotificationServiceDiagnostics } from "../types/diagnostics";
import { createDefaultNotificationSessionStore } from "./default-notification-session-store";
import type { NotificationItem } from "./notification-item";
import type {
  AddNotificationsResult,
  ListNotificationsOptions,
  NotificationService,
} from "./notification-service";
import type { NotificationSessionStore } from "./notification-session-store";

export interface DefaultNotificationServiceOptions {
  readonly store?: NotificationSessionStore;
}

/**
 * Default Notification Service — stable public API between mappers and experiences.
 *
 * Stores immutable NotificationItem instances in a session-scoped in-memory store.
 * Does not publish events, execute mappers, deliver notifications, render UI, or persist.
 */
export class DefaultNotificationService implements NotificationService {
  private readonly listeners = new Set<() => void>();
  private readonly store: NotificationSessionStore;
  private storeRevision = 0;

  constructor(options: DefaultNotificationServiceOptions = {}) {
    this.store = options.store ?? createDefaultNotificationSessionStore();
  }

  addNotifications(items: readonly NotificationItem[]): AddNotificationsResult {
    const result = this.store.append(items);
    if (result.addedCount > 0) {
      this.notifyListeners();
    }
    return Object.freeze(result);
  }

  listNotifications(options?: ListNotificationsOptions): readonly NotificationItem[] {
    return this.store.list(options);
  }

  getNotification(notificationId: string): NotificationItem | undefined {
    return this.store.get(notificationId);
  }

  getUnreadCount(): number {
    return this.store.getUnreadCount();
  }

  markAsRead(notificationId: string): boolean {
    const updated = this.store.markAsRead(notificationId);
    if (updated) {
      this.notifyListeners();
    }
    return updated;
  }

  markAllAsRead(): number {
    const updated = this.store.markAllAsRead();
    if (updated > 0) {
      this.notifyListeners();
    }
    return updated;
  }

  clearNotifications(): number {
    const cleared = this.store.clear();
    if (cleared > 0) {
      this.notifyListeners();
    }
    return cleared;
  }

  markRead(notificationId: string): boolean {
    return this.markAsRead(notificationId);
  }

  markAllRead(): number {
    return this.markAllAsRead();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getStoreRevision(): number {
    return this.storeRevision;
  }

  getDiagnostics(): NotificationServiceDiagnostics {
    const total = this.store.getTotalCount();
    const unreadCount = this.store.getUnreadCount();
    const readCount = this.store.getReadCount();

    return Object.freeze({
      status: total === 0 ? "empty" : "ready",
      layerStatus: NOTIFICATION_LAYER_STATUS,
      activeNotificationCount: total,
      unreadCount,
      readCount,
      lastNotificationTimestamp: this.store.getLastNotificationTimestamp(),
      health: total === 0 ? "empty" : "healthy",
      message:
        total === 0
          ? "DefaultNotificationService ready — no notifications stored"
          : "DefaultNotificationService ready — session store active",
    });
  }

  private notifyListeners(): void {
    this.storeRevision += 1;
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export function createDefaultNotificationService(
  options: DefaultNotificationServiceOptions = {},
): DefaultNotificationService {
  return new DefaultNotificationService(options);
}

export type { NotificationSessionStore } from "./notification-session-store";
export type { DefaultNotificationSessionStore } from "./default-notification-session-store";
