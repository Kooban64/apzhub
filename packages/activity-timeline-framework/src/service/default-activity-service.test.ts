import { describe, expect, it } from "vitest";

import type { ActivityDocument } from "../types/activity-document";
import {
  TIMELINE_SCOPE_ORGANIZATION,
  TIMELINE_SCOPE_PERSONAL,
  TIMELINE_SCOPE_SYSTEM,
} from "../types/timeline-scope";
import { compareActivityDocuments } from "./compare-activity-documents";
import {
  createDefaultActivityService,
  createDefaultActivitySessionStore,
} from "./index";

function sampleActivity(
  overrides: Partial<ActivityDocument> & Pick<ActivityDocument, "activityId">,
): ActivityDocument {
  return Object.freeze({
    activityTypeId: "platform.action.executed",
    sourceEventId: "capability.action.executed",
    title: "Action executed",
    description: "Action executed description",
    timelineScope: TIMELINE_SCOPE_PERSONAL,
    category: "capability",
    timestamp: "2026-07-04T12:00:00.000Z",
    actor: Object.freeze({ id: "user-1" }),
    metadata: Object.freeze({
      templateRef: "activity.platform.action.executed",
      sourceEnvelopeId: "env-1",
      correlationId: "corr-1",
      publisher: "command-framework",
      timelineScopes: Object.freeze([TIMELINE_SCOPE_PERSONAL]),
      severity: "info" as const,
    }),
    diagnostics: Object.freeze({
      renderedAt: "2026-07-04T12:00:01.000Z",
      matchedActivityTypeId: "platform.action.executed",
      eventPattern: "capability.action.executed",
      typeStatus: "active" as const,
      templateStatus: "ok" as const,
      message: "Activity document mapped — not stored",
    }),
    ...overrides,
  });
}

describe("compareActivityDocuments", () => {
  it("orders by timestamp descending then activity id ascending", () => {
    const older = sampleActivity({
      activityId: "env-1:platform.action.executed",
      timestamp: "2026-07-04T11:00:00.000Z",
    });
    const newer = sampleActivity({
      activityId: "env-2:platform.action.executed",
      timestamp: "2026-07-04T12:00:00.000Z",
    });

    expect(compareActivityDocuments(newer, older)).toBeLessThan(0);
    expect(compareActivityDocuments(older, newer)).toBeGreaterThan(0);
  });
});

describe("DefaultActivitySessionStore", () => {
  it("appends activities and skips duplicate activity ids", () => {
    const store = createDefaultActivitySessionStore();
    const item = sampleActivity({ activityId: "env-1:platform.action.executed" });

    expect(store.append([item])).toEqual({ addedCount: 1, skippedCount: 0 });
    expect(store.append([item])).toEqual({ addedCount: 0, skippedCount: 1 });
    expect(store.getTotalCount()).toBe(1);
  });

  it("filters by timeline scope, category, activity type, and limit", () => {
    const store = createDefaultActivitySessionStore();
    store.append([
      sampleActivity({
        activityId: "env-1:platform.action.executed",
        timelineScope: TIMELINE_SCOPE_PERSONAL,
        category: "capability",
        activityTypeId: "platform.action.executed",
        timestamp: "2026-07-04T12:00:00.000Z",
      }),
      sampleActivity({
        activityId: "env-2:platform.lifecycle.started",
        timelineScope: TIMELINE_SCOPE_SYSTEM,
        category: "system",
        activityTypeId: "platform.lifecycle.started",
        timestamp: "2026-07-04T13:00:00.000Z",
      }),
      sampleActivity({
        activityId: "env-3:platform.notification.generated",
        timelineScope: TIMELINE_SCOPE_PERSONAL,
        category: "system",
        activityTypeId: "platform.notification.generated",
        timestamp: "2026-07-04T11:00:00.000Z",
      }),
    ]);

    expect(
      store
        .list({ timelineScope: TIMELINE_SCOPE_PERSONAL })
        .map((entry) => entry.activityId),
    ).toEqual([
      "env-1:platform.action.executed",
      "env-3:platform.notification.generated",
    ]);

    expect(store.list({ category: "system" })).toHaveLength(2);
    expect(store.list({ activityTypeId: "platform.lifecycle.started" })).toHaveLength(
      1,
    );
    expect(store.list({ limit: 1 })).toHaveLength(1);
  });

  it("clears stored activities", () => {
    const store = createDefaultActivitySessionStore();
    store.append([sampleActivity({ activityId: "env-1:platform.action.executed" })]);

    expect(store.clear()).toBe(1);
    expect(store.getTotalCount()).toBe(0);
  });
});

describe("DefaultActivityService", () => {
  it("adds activities without mutating stored documents", () => {
    const service = createDefaultActivityService();
    const item = sampleActivity({ activityId: "env-1:platform.action.executed" });

    service.addActivities([item]);

    const stored = service.getActivity(item.activityId);
    expect(stored).toBe(item);
    expect(Object.isFrozen(stored)).toBe(true);
  });

  it("lists activities in deterministic timestamp-descending order", () => {
    const service = createDefaultActivityService();
    service.addActivities([
      sampleActivity({
        activityId: "env-1:platform.action.executed",
        timestamp: "2026-07-04T11:00:00.000Z",
      }),
      sampleActivity({
        activityId: "env-2:platform.lifecycle.started",
        timestamp: "2026-07-04T13:00:00.000Z",
      }),
    ]);

    expect(service.listActivities().map((entry) => entry.activityId)).toEqual([
      "env-2:platform.lifecycle.started",
      "env-1:platform.action.executed",
    ]);
  });

  it("queries timeline by scope and returns activity ids", () => {
    const service = createDefaultActivityService();
    service.addActivities([
      sampleActivity({
        activityId: "env-1:platform.action.executed",
        timelineScope: TIMELINE_SCOPE_PERSONAL,
      }),
      sampleActivity({
        activityId: "env-2:platform.lifecycle.started",
        timelineScope: TIMELINE_SCOPE_SYSTEM,
        activityTypeId: "platform.lifecycle.started",
        category: "system",
      }),
    ]);

    const result = service.queryTimeline({
      scopeId: TIMELINE_SCOPE_PERSONAL,
    });

    expect(result.status).toBe("ok");
    expect(result.items).toEqual(["env-1:platform.action.executed"]);

    const filtered = service.queryTimeline({
      scopeId: TIMELINE_SCOPE_SYSTEM,
      category: "system",
      activityTypeId: "platform.lifecycle.started",
    });

    expect(filtered.items).toEqual(["env-2:platform.lifecycle.started"]);
  });

  it("clears activities via clearActivities", () => {
    const service = createDefaultActivityService();
    service.addActivities([
      sampleActivity({ activityId: "env-1:platform.action.executed" }),
    ]);

    expect(service.clearActivities()).toBe(1);
    expect(service.getDiagnostics().status).toBe("empty");
  });

  it("exposes service diagnostics", () => {
    const service = createDefaultActivityService();
    service.addActivities([
      sampleActivity({
        activityId: "env-1:platform.action.executed",
        timelineScope: TIMELINE_SCOPE_PERSONAL,
        category: "capability",
        timestamp: "2026-07-04T12:00:00.000Z",
      }),
      sampleActivity({
        activityId: "env-2:platform.lifecycle.started",
        timelineScope: TIMELINE_SCOPE_ORGANIZATION,
        category: "system",
        timestamp: "2026-07-04T13:00:00.000Z",
      }),
    ]);

    const diagnostics = service.getDiagnostics();

    expect(diagnostics.status).toBe("ready");
    expect(diagnostics.totalActivityCount).toBe(2);
    expect(diagnostics.scopeCounts[TIMELINE_SCOPE_PERSONAL]).toBe(1);
    expect(diagnostics.scopeCounts[TIMELINE_SCOPE_ORGANIZATION]).toBe(1);
    expect(diagnostics.categoryCounts.capability).toBe(1);
    expect(diagnostics.categoryCounts.system).toBe(1);
    expect(diagnostics.latestActivityTimestamp).toBe("2026-07-04T13:00:00.000Z");
  });
});
