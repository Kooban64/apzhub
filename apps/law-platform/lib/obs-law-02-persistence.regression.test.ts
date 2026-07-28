import { describe, expect, it } from "vitest";

import {
  createLawActivityPersistenceStorageKey,
  createPersistedActivitySessionStore,
} from "@apzhub/activity-timeline-framework/server";
import { CAPABILITY_ACTION_EXECUTED_EVENT_ID } from "@apzhub/command-framework";
import {
  createLawNotificationPersistenceStorageKey,
  createPersistedNotificationSessionStore,
} from "@apzhub/event-notification-framework";

import { createAppActivityTimelineContext } from "./create-app-activity-timeline-context";
import { createAppEventNotificationContext } from "./create-app-event-notification-context";

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

const auditPayload = {
  actionId: "workbench.view.open",
  actor: "user",
  resultCode: "SUCCESS",
  ok: true,
  durationMs: 5,
  auditReference: "action-audit:obs-law-02",
} as const;

describe("OBS-LAW-02 Law operational persistence regression", () => {
  it("retains notifications across context recreation for the same scope", () => {
    const storage = createMemoryStorage();
    const scope = { userId: "user-obs-02", tenantId: "tenant-obs-02" };

    const storeA = createPersistedNotificationSessionStore({
      storageKey: createLawNotificationPersistenceStorageKey(scope),
      storage,
    });
    const contextA = createAppEventNotificationContext({
      notificationStore: storeA,
    });

    contextA.eventBus.publish({
      envelopeId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      eventId: CAPABILITY_ACTION_EXECUTED_EVENT_ID,
      eventVersion: "1.0.0",
      category: "capability",
      correlationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      timestamp: "2026-07-19T12:00:00.000Z",
      publisher: "command-framework",
      payload: { ...auditPayload },
    });

    expect(contextA.notificationService.listNotifications().length).toBeGreaterThan(0);

    const storeB = createPersistedNotificationSessionStore({
      storageKey: createLawNotificationPersistenceStorageKey(scope),
      storage,
    });
    const contextB = createAppEventNotificationContext({
      notificationStore: storeB,
    });

    expect(contextB.notificationService.listNotifications().length).toBeGreaterThan(0);
  });

  it("retains activities across context recreation for the same scope", () => {
    const storage = createMemoryStorage();
    const scope = { userId: "user-obs-02a", tenantId: "tenant-obs-02a" };

    const eventContext = createAppEventNotificationContext();
    const storeA = createPersistedActivitySessionStore({
      storageKey: createLawActivityPersistenceStorageKey(scope),
      storage,
    });
    const activityA = createAppActivityTimelineContext({
      eventBus: eventContext.eventBus,
      activityStore: storeA,
    });

    eventContext.eventBus.publish({
      envelopeId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      eventId: CAPABILITY_ACTION_EXECUTED_EVENT_ID,
      eventVersion: "1.0.0",
      category: "capability",
      correlationId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      timestamp: "2026-07-19T12:00:00.000Z",
      publisher: "command-framework",
      payload: { ...auditPayload, auditReference: "action-audit:obs-law-02-activity" },
    });

    expect(activityA.service.listActivities().length).toBeGreaterThan(0);

    const storeB = createPersistedActivitySessionStore({
      storageKey: createLawActivityPersistenceStorageKey(scope),
      storage,
    });
    const activityB = createAppActivityTimelineContext({
      activityStore: storeB,
    });

    expect(activityB.service.listActivities().length).toBeGreaterThan(0);
  });
});
