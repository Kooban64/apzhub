import { describe, expect, it } from "vitest";

import type { NotificationItem } from "./notification-item";
import { freezeNotificationItem } from "./notification-item";
import {
  createLawNotificationPersistenceStorageKey,
  createPersistedNotificationSessionStore,
} from "./persisted-notification-session-store";

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
    removeItem(key: string) {
      map.delete(key);
    },
    key() {
      return null;
    },
  };
}

function sampleNotification(id: string, read = false): NotificationItem {
  return freezeNotificationItem({
    notificationId: id,
    routeId: "legal.matter.updated.inbox",
    eventId: `evt-${id}`,
    title: `Notification ${id}`,
    body: "body",
    kind: "inbox",
    channel: "in-app",
    priority: "normal",
    timestamp: "2026-07-19T12:00:00.000Z",
    metadata: {
      templateRef: "t1",
      sourceEnvelopeId: `env-${id}`,
      category: "business",
      correlationId: `corr-${id}`,
      publisher: "law-platform",
      read,
      actorId: "user-1",
    },
    diagnostics: {
      renderedAt: "2026-07-19T12:00:00.000Z",
      routeStatus: "active",
      eventPattern: "legal.matter.*",
      message: "ok",
    },
  });
}

describe("PersistedNotificationSessionStore", () => {
  it("restores notifications and read state across store instances", () => {
    const storage = createMemoryStorage();
    const key = createLawNotificationPersistenceStorageKey({
      tenantId: "tenant-1",
      userId: "user-1",
    });

    const first = createPersistedNotificationSessionStore({
      storageKey: key,
      storage,
    });
    first.append([sampleNotification("n-1"), sampleNotification("n-2")]);
    expect(first.markAsRead("n-1")).toBe(true);
    expect(first.getUnreadCount()).toBe(1);

    const second = createPersistedNotificationSessionStore({
      storageKey: key,
      storage,
    });
    expect(second.getTotalCount()).toBe(2);
    expect(second.get("n-1")?.metadata.read).toBe(true);
    expect(second.getUnreadCount()).toBe(1);
  });

  it("scopes storage keys by tenant and user", () => {
    expect(
      createLawNotificationPersistenceStorageKey({
        tenantId: "t1",
        userId: "u1",
      }),
    ).toBe("apzhub.law.notification.v1.t1.u1");
  });
});
