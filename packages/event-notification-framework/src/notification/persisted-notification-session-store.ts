import type { NotificationItem } from "./notification-item";
import type { ListNotificationsOptions } from "./notification-service";
import type {
  NotificationSessionAppendResult,
  NotificationSessionStore,
} from "./notification-session-store";
import { createDefaultNotificationSessionStore } from "./default-notification-session-store";

/** Minimal storage surface — browser localStorage or test double. */
export type NotificationPersistenceStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export interface PersistedNotificationSessionStoreOptions {
  /** Stable key scoped by product/tenant/user. */
  readonly storageKey: string;
  readonly storage?: NotificationPersistenceStorage;
  /** Optional seed applied after restore (deduped by notificationId). */
  readonly initialItems?: readonly NotificationItem[];
  readonly maxItems?: number;
}

const DEFAULT_MAX_ITEMS = 500;

/**
 * Durable NotificationSessionStore — sync API preserved; snapshots to storage.
 * Platform-owned persistence behind NotificationService (OBS-LAW-02 / LAW-012 §10.1).
 */
export class PersistedNotificationSessionStore implements NotificationSessionStore {
  private readonly inner: NotificationSessionStore;
  private readonly storage: NotificationPersistenceStorage | null;
  private readonly storageKey: string;
  private readonly maxItems: number;

  constructor(options: PersistedNotificationSessionStoreOptions) {
    this.inner = createDefaultNotificationSessionStore();
    this.storageKey = options.storageKey;
    this.maxItems = options.maxItems ?? DEFAULT_MAX_ITEMS;
    this.storage = options.storage ?? resolveBrowserStorage();

    this.restore();
    if (options.initialItems && options.initialItems.length > 0) {
      this.inner.append(options.initialItems);
      this.persist();
    }
  }

  append(items: readonly NotificationItem[]): NotificationSessionAppendResult {
    const result = this.inner.append(items);
    if (result.addedCount > 0) {
      this.trimAndPersist();
    }
    return result;
  }

  get(notificationId: string): NotificationItem | undefined {
    return this.inner.get(notificationId);
  }

  list(options?: ListNotificationsOptions): readonly NotificationItem[] {
    return this.inner.list(options);
  }

  getUnreadCount(): number {
    return this.inner.getUnreadCount();
  }

  getReadCount(): number {
    return this.inner.getReadCount();
  }

  getTotalCount(): number {
    return this.inner.getTotalCount();
  }

  getLastNotificationTimestamp(): string | undefined {
    return this.inner.getLastNotificationTimestamp();
  }

  markAsRead(notificationId: string): boolean {
    const updated = this.inner.markAsRead(notificationId);
    if (updated) {
      this.persist();
    }
    return updated;
  }

  markAllAsRead(): number {
    const updated = this.inner.markAllAsRead();
    if (updated > 0) {
      this.persist();
    }
    return updated;
  }

  clear(): number {
    const cleared = this.inner.clear();
    this.persist();
    return cleared;
  }

  private restore(): void {
    if (!this.storage) {
      return;
    }

    const raw = this.storage.getItem(this.storageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        this.storage.removeItem(this.storageKey);
        return;
      }

      const items = parsed.filter(isNotificationItemLike) as NotificationItem[];
      if (items.length > 0) {
        this.inner.append(items);
      }
    } catch {
      this.storage.removeItem(this.storageKey);
    }
  }

  private trimAndPersist(): void {
    const total = this.inner.getTotalCount();
    if (total > this.maxItems) {
      const all = this.inner.list();
      const keep = all.slice(0, this.maxItems);
      this.inner.clear();
      this.inner.append(keep);
    }
    this.persist();
  }

  private persist(): void {
    if (!this.storage) {
      return;
    }

    const items = this.inner.list({ limit: this.maxItems });
    this.storage.setItem(this.storageKey, JSON.stringify(items));
  }
}

export function createPersistedNotificationSessionStore(
  options: PersistedNotificationSessionStoreOptions,
): NotificationSessionStore {
  return new PersistedNotificationSessionStore(options);
}

export function createLawNotificationPersistenceStorageKey(input: {
  readonly tenantId?: string;
  readonly userId?: string;
}): string {
  const tenant = input.tenantId?.trim() || "default-tenant";
  const user = input.userId?.trim() || "anonymous";
  return `apzhub.law.notification.v1.${tenant}.${user}`;
}

function resolveBrowserStorage(): NotificationPersistenceStorage | null {
  if (typeof globalThis.localStorage === "undefined") {
    return null;
  }
  return globalThis.localStorage;
}

function isNotificationItemLike(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.notificationId === "string" &&
    typeof record.routeId === "string" &&
    typeof record.title === "string" &&
    typeof record.timestamp === "string" &&
    record.metadata !== null &&
    typeof record.metadata === "object"
  );
}
