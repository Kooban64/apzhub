import { describe, expect, it } from "vitest";

import type { ActivityDocument } from "../types/activity-document";
import {
  createLawActivityPersistenceStorageKey,
  createPersistedActivitySessionStore,
} from "./persisted-activity-session-store";

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

function sampleActivity(id: string): ActivityDocument {
  return {
    activityId: id,
    activityTypeId: "legal.matter.updated",
    sourceEventId: `evt-${id}`,
    title: `Activity ${id}`,
    description: "desc",
    timelineScope: "timeline.personal",
    category: "capability",
    timestamp: "2026-07-19T12:00:00.000Z",
    actor: { id: "user-1" },
    metadata: {
      templateRef: "t1",
      sourceEnvelopeId: `env-${id}`,
      correlationId: `corr-${id}`,
      publisher: "law-platform",
      timelineScopes: ["timeline.personal"],
      severity: "info",
    },
    diagnostics: {
      renderedAt: "2026-07-19T12:00:00.000Z",
      matchedActivityTypeId: "legal.matter.updated",
      eventPattern: "legal.matter.*",
      typeStatus: "active",
      templateStatus: "ok",
      message: "ok",
    },
  };
}

describe("PersistedActivitySessionStore", () => {
  it("restores activities across store instances (cross-reload)", () => {
    const storage = createMemoryStorage();
    const key = createLawActivityPersistenceStorageKey({
      tenantId: "tenant-1",
      userId: "user-1",
    });

    const first = createPersistedActivitySessionStore({
      storageKey: key,
      storage,
    });
    first.append([sampleActivity("a-1"), sampleActivity("a-2")]);
    expect(first.getTotalCount()).toBe(2);

    const second = createPersistedActivitySessionStore({
      storageKey: key,
      storage,
    });
    expect(second.getTotalCount()).toBe(2);
    expect(second.get("a-1")?.title).toBe("Activity a-1");
  });

  it("scopes storage keys by tenant and user", () => {
    expect(
      createLawActivityPersistenceStorageKey({
        tenantId: "t1",
        userId: "u1",
      }),
    ).toBe("apzhub.law.activity.v1.t1.u1");
  });
});
