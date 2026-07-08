import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it, vi } from "vitest";

import { bootstrapNotificationRegistry } from "../catalogue/bootstrap-notification-registry";
import { createEventNotificationContext } from "../di/event-notification-context";
import type { EventEnvelope } from "../event/event-envelope";
import { NOTIFICATION_LAYER_STATUS } from "../status";
import { createNotificationItem } from "./create-notification-item";
import {
  createDefaultNotificationService,
  DefaultNotificationService,
} from "./default-notification-service";
import { createDefaultNotificationSessionStore } from "./default-notification-session-store";
import type { NotificationDescriptor } from "./notification-descriptor";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const ROUTE: NotificationDescriptor = {
  routeId: "platform.inbox.system",
  eventPattern: "system.platform.bootstrap.completed",
  notificationKind: "inbox",
  channel: "in-app",
  templateRef: "bootstrap-completed",
  version: "1.0.0",
  status: "active",
};

const ENVELOPE: EventEnvelope = {
  envelopeId: "env-1",
  eventId: "system.platform.bootstrap.completed",
  eventVersion: "1.0.0",
  category: "system",
  correlationId: "corr-1",
  timestamp: "2026-07-04T10:00:00.000Z",
  publisher: "platform-runtime",
  payload: { bootstrapId: "boot-1" },
};

const ENVELOPE_OLDER: EventEnvelope = {
  ...ENVELOPE,
  envelopeId: "env-0",
  timestamp: "2026-07-04T09:00:00.000Z",
};

const ENVELOPE_NEWER: EventEnvelope = {
  ...ENVELOPE,
  envelopeId: "env-2",
  timestamp: "2026-07-04T11:00:00.000Z",
};

function itemForEnvelope(
  envelope: EventEnvelope,
  route: NotificationDescriptor = ROUTE,
) {
  return createNotificationItem({
    envelope,
    route,
    title: `Title for ${envelope.envelopeId}`,
    body: "Body",
    renderedAt: "2026-07-04T10:00:01.000Z",
  });
}

describe("DefaultNotificationSessionStore", () => {
  it("appends items and skips duplicate notification ids", () => {
    const store = createDefaultNotificationSessionStore();
    const item = itemForEnvelope(ENVELOPE);

    expect(store.append([item])).toEqual({ addedCount: 1, skippedCount: 0 });
    expect(store.append([item])).toEqual({ addedCount: 0, skippedCount: 1 });
    expect(store.getTotalCount()).toBe(1);
  });

  it("orders list by timestamp descending then notification id", () => {
    const store = createDefaultNotificationSessionStore();
    const older = itemForEnvelope(ENVELOPE_OLDER);
    const newer = itemForEnvelope(ENVELOPE_NEWER);

    store.append([older, newer]);

    expect(store.list().map((entry) => entry.notificationId)).toEqual([
      newer.notificationId,
      older.notificationId,
    ]);
  });

  it("filters by unreadOnly, kind, and limit", () => {
    const store = createDefaultNotificationSessionStore();
    const inbox = itemForEnvelope(ENVELOPE);
    const toast = itemForEnvelope(ENVELOPE_NEWER, {
      ...ROUTE,
      routeId: "platform.toast.default",
      notificationKind: "toast",
    });

    store.append([inbox, toast]);
    store.markAsRead(inbox.notificationId);

    expect(
      store.list({ unreadOnly: true }).map((entry) => entry.notificationId),
    ).toEqual([toast.notificationId]);
    expect(store.list({ kind: "inbox" })).toHaveLength(1);
    expect(store.list({ limit: 1 })).toHaveLength(1);
  });

  it("tracks read and unread counts and clears session", () => {
    const store = createDefaultNotificationSessionStore();
    const first = itemForEnvelope(ENVELOPE);
    const second = itemForEnvelope(ENVELOPE_NEWER);

    store.append([first, second]);
    expect(store.getUnreadCount()).toBe(2);
    expect(store.getReadCount()).toBe(0);

    expect(store.markAsRead(first.notificationId)).toBe(true);
    expect(store.markAsRead(first.notificationId)).toBe(false);
    expect(store.getUnreadCount()).toBe(1);
    expect(store.getReadCount()).toBe(1);
    expect(store.get(first.notificationId)?.metadata.read).toBe(true);

    expect(store.markAllAsRead()).toBe(1);
    expect(store.getUnreadCount()).toBe(0);
    expect(store.getReadCount()).toBe(2);

    expect(store.clear()).toBe(2);
    expect(store.getTotalCount()).toBe(0);
  });

  it("reports last notification timestamp", () => {
    const store = createDefaultNotificationSessionStore();
    expect(store.getLastNotificationTimestamp()).toBeUndefined();

    store.append([itemForEnvelope(ENVELOPE_OLDER), itemForEnvelope(ENVELOPE_NEWER)]);
    expect(store.getLastNotificationTimestamp()).toBe(ENVELOPE_NEWER.timestamp);
  });
});

describe("DefaultNotificationService", () => {
  it("adds notifications and exposes lookup APIs", () => {
    const service = createDefaultNotificationService();
    const item = itemForEnvelope(ENVELOPE);

    expect(service.addNotifications([item])).toEqual({
      addedCount: 1,
      skippedCount: 0,
    });
    expect(service.getNotification(item.notificationId)?.title).toBe(item.title);
    expect(service.listNotifications()).toHaveLength(1);
    expect(service.getUnreadCount()).toBe(1);
  });

  it("deduplicates on addNotifications", () => {
    const service = createDefaultNotificationService();
    const item = itemForEnvelope(ENVELOPE);

    service.addNotifications([item]);
    expect(service.addNotifications([item])).toEqual({
      addedCount: 0,
      skippedCount: 1,
    });
  });

  it("orders notifications newest first", () => {
    const service = createDefaultNotificationService();
    const older = itemForEnvelope(ENVELOPE_OLDER);
    const newer = itemForEnvelope(ENVELOPE_NEWER);
    service.addNotifications([older, newer]);

    expect(service.listNotifications().map((entry) => entry.notificationId)).toEqual([
      newer.notificationId,
      older.notificationId,
    ]);
  });

  it("marks read individually and in bulk", () => {
    const service = createDefaultNotificationService();
    const first = itemForEnvelope(ENVELOPE);
    const second = itemForEnvelope(ENVELOPE_NEWER);
    service.addNotifications([first, second]);

    expect(service.markAsRead(first.notificationId)).toBe(true);
    expect(service.markRead(first.notificationId)).toBe(false);
    expect(service.getUnreadCount()).toBe(1);

    expect(service.markAllAsRead()).toBe(1);
    expect(service.markAllRead()).toBe(0);
    expect(service.getUnreadCount()).toBe(0);
  });

  it("clears all session notifications", () => {
    const service = createDefaultNotificationService();
    service.addNotifications([itemForEnvelope(ENVELOPE)]);

    expect(service.clearNotifications()).toBe(1);
    expect(service.listNotifications()).toEqual([]);
  });

  it("notifies subscribers on mutations", () => {
    const service = createDefaultNotificationService();
    const listener = vi.fn();
    service.subscribe(listener);
    const item = itemForEnvelope(ENVELOPE);

    service.addNotifications([item]);
    expect(listener).toHaveBeenCalledTimes(1);

    service.markAsRead(item.notificationId);
    expect(listener).toHaveBeenCalledTimes(2);

    service.clearNotifications();
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("reports diagnostics with counts, timestamp, and health", () => {
    const service = createDefaultNotificationService();
    const emptyDiagnostics = service.getDiagnostics();

    expect(emptyDiagnostics.status).toBe("empty");
    expect(emptyDiagnostics.layerStatus).toBe(NOTIFICATION_LAYER_STATUS);
    expect(emptyDiagnostics.activeNotificationCount).toBe(0);
    expect(emptyDiagnostics.unreadCount).toBe(0);
    expect(emptyDiagnostics.readCount).toBe(0);
    expect(emptyDiagnostics.health).toBe("empty");
    expect(emptyDiagnostics.lastNotificationTimestamp).toBeUndefined();

    service.addNotifications([itemForEnvelope(ENVELOPE)]);
    const activeDiagnostics = service.getDiagnostics();

    expect(activeDiagnostics.status).toBe("ready");
    expect(activeDiagnostics.activeNotificationCount).toBe(1);
    expect(activeDiagnostics.unreadCount).toBe(1);
    expect(activeDiagnostics.readCount).toBe(0);
    expect(activeDiagnostics.health).toBe("healthy");
    expect(activeDiagnostics.lastNotificationTimestamp).toBe(ENVELOPE.timestamp);
  });

  it("integrates mapper output without delivery", () => {
    const context = createEventNotificationContext();
    bootstrapNotificationRegistry({ registry: context.notificationRegistry });

    const mapped = context.notificationMapper.map(ENVELOPE);
    expect(mapped.ok).toBe(true);
    expect(mapped.items.length).toBeGreaterThan(0);

    const ingest = context.notificationService.addNotifications(mapped.items);
    expect(ingest.addedCount).toBe(mapped.items.length);
    expect(context.notificationService.listNotifications().length).toBe(
      mapped.items.length,
    );
  });
});

describe("createEventNotificationContext DI", () => {
  it("defaults to DefaultNotificationService", () => {
    const context = createEventNotificationContext();
    expect(context.notificationService).toBeInstanceOf(DefaultNotificationService);
    expect(context.getDiagnostics().notificationService.layerStatus).toBe(
      "experiences",
    );
  });

  it("allows notification service injection", () => {
    const store = createDefaultNotificationSessionStore();
    const service = createDefaultNotificationService({ store });
    const context = createEventNotificationContext({ notificationService: service });

    expect(context.notificationService).toBe(service);
  });
});

describe("DefaultNotificationService boundary", () => {
  it("does not publish events or execute mappers", () => {
    const source = readFileSync(
      join(packageRoot, "notification/default-notification-service.ts"),
      "utf8",
    );
    expect(source.includes("publish(")).toBe(false);
    expect(source.includes("EventBus")).toBe(false);
    expect(source.includes("DefaultNotificationMapper")).toBe(false);
  });
});
