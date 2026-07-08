import type { NotificationItem } from "./notification-item";
import type { ListNotificationsOptions } from "./notification-service";
import {
  compareNotificationItems,
  type NotificationSessionAppendResult,
  type NotificationSessionEntry,
  type NotificationSessionStore,
  withNotificationReadState,
} from "./notification-session-store";

/**
 * Default in-memory notification session store.
 * Session-scoped only — no database, browser storage, or cross-session persistence.
 */
export class DefaultNotificationSessionStore implements NotificationSessionStore {
  private readonly entries = new Map<string, NotificationSessionEntry>();

  append(items: readonly NotificationItem[]): NotificationSessionAppendResult {
    let addedCount = 0;
    let skippedCount = 0;
    const storedAt = new Date().toISOString();

    for (const item of items) {
      if (this.entries.has(item.notificationId)) {
        skippedCount += 1;
        continue;
      }

      this.entries.set(
        item.notificationId,
        Object.freeze({
          item,
          read: item.metadata.read,
          storedAt,
        }),
      );
      addedCount += 1;
    }

    return { addedCount, skippedCount };
  }

  get(notificationId: string): NotificationItem | undefined {
    const entry = this.entries.get(notificationId);
    return entry ? withNotificationReadState(entry.item, entry.read) : undefined;
  }

  list(options: ListNotificationsOptions = {}): readonly NotificationItem[] {
    let results = [...this.entries.values()];

    if (options.unreadOnly) {
      results = results.filter((entry) => !entry.read);
    }

    if (options.kind) {
      results = results.filter((entry) => entry.item.kind === options.kind);
    }

    results.sort(compareNotificationItems);

    const limited =
      options.limit !== undefined && options.limit >= 0
        ? results.slice(0, options.limit)
        : results;

    return Object.freeze(
      limited.map((entry) => withNotificationReadState(entry.item, entry.read)),
    );
  }

  getUnreadCount(): number {
    let count = 0;
    for (const entry of this.entries.values()) {
      if (!entry.read) {
        count += 1;
      }
    }
    return count;
  }

  getReadCount(): number {
    let count = 0;
    for (const entry of this.entries.values()) {
      if (entry.read) {
        count += 1;
      }
    }
    return count;
  }

  getTotalCount(): number {
    return this.entries.size;
  }

  getLastNotificationTimestamp(): string | undefined {
    if (this.entries.size === 0) {
      return undefined;
    }

    let latest: string | undefined;
    for (const entry of this.entries.values()) {
      if (latest === undefined || entry.item.timestamp.localeCompare(latest) > 0) {
        latest = entry.item.timestamp;
      }
    }

    return latest;
  }

  markAsRead(notificationId: string): boolean {
    const entry = this.entries.get(notificationId);
    if (!entry || entry.read) {
      return false;
    }

    this.entries.set(
      notificationId,
      Object.freeze({
        ...entry,
        read: true,
      }),
    );
    return true;
  }

  markAllAsRead(): number {
    let updated = 0;

    for (const [notificationId, entry] of this.entries.entries()) {
      if (entry.read) {
        continue;
      }

      this.entries.set(
        notificationId,
        Object.freeze({
          ...entry,
          read: true,
        }),
      );
      updated += 1;
    }

    return updated;
  }

  clear(): number {
    const count = this.entries.size;
    this.entries.clear();
    return count;
  }
}

export function createDefaultNotificationSessionStore(): NotificationSessionStore {
  return new DefaultNotificationSessionStore();
}
