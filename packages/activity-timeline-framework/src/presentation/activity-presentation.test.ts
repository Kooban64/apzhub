import { describe, expect, it } from "vitest";

import { sampleActivityDocument } from "../client/service/test-fixtures";
import { ACTIVITY_PRESENTATION_LAYER_STATUS } from "./layer-status";
import { TIMELINE_SCOPE_PERSONAL, TIMELINE_SCOPE_TEAM } from "../types/timeline-scope";
import {
  buildActivityPresentationDiagnostics,
  formatActivityRelativeTimestamp,
  groupActivityViewModels,
  mapActivityDocumentToViewModel,
  presentActivities,
  sortActivityViewModels,
} from "./index";

describe("mapActivityDocumentToViewModel", () => {
  it("maps document fields, severity, and relative timestamp", () => {
    const document = sampleActivityDocument({
      activityId: "env-1:platform.action.executed",
      timestamp: "2026-07-04T12:00:00.000Z",
    });

    const model = mapActivityDocumentToViewModel(document, {
      now: "2026-07-04T12:02:00.000Z",
      iconRef: "icon.action",
    });

    expect(model.activityId).toBe(document.activityId);
    expect(model.title).toBe(document.title);
    expect(model.description).toBe(document.description);
    expect(model.timelineScope).toBe(TIMELINE_SCOPE_PERSONAL);
    expect(model.category).toBe("capability");
    expect(model.severity).toBe("info");
    expect(model.relativeTimestamp).toBe("2m ago");
    expect(model.icon).toBe("icon.action");
    expect(model.correlationId).toBe("corr-1");
    expect(Object.isFrozen(model)).toBe(true);
  });

  it("passes actionRef through from payload summary", () => {
    const document = sampleActivityDocument({
      activityId: "env-2:platform.action.executed",
      metadata: Object.freeze({
        templateRef: "activity.platform.action.executed",
        sourceEnvelopeId: "env-2",
        correlationId: "corr-2",
        publisher: "command-framework",
        timelineScopes: Object.freeze([TIMELINE_SCOPE_PERSONAL]),
        severity: "info" as const,
        payloadSummary: Object.freeze({
          actionRef: Object.freeze({
            actionId: "platform.theme.toggle",
            handlerContext: Object.freeze({ source: "activity" }),
          }),
        }),
      }),
    });

    const model = mapActivityDocumentToViewModel(document);
    expect(model.actionRef?.actionId).toBe("platform.theme.toggle");
    expect(model.actionRef?.handlerContext).toEqual({ source: "activity" });
  });
});

describe("sortActivityViewModels", () => {
  it("orders newest first with activityId tie-break", () => {
    const older = mapActivityDocumentToViewModel(
      sampleActivityDocument({
        activityId: "env-a:platform.action.executed",
        timestamp: "2026-07-04T11:00:00.000Z",
      }),
    );
    const newer = mapActivityDocumentToViewModel(
      sampleActivityDocument({
        activityId: "env-b:platform.action.executed",
        timestamp: "2026-07-04T12:00:00.000Z",
      }),
    );

    expect(
      sortActivityViewModels([older, newer]).map((model) => model.activityId),
    ).toEqual([newer.activityId, older.activityId]);
  });
});

describe("groupActivityViewModels", () => {
  const now = "2026-07-04T12:00:00.000Z";

  it("groups by date into Today, Yesterday, and Earlier", () => {
    const models = [
      mapActivityDocumentToViewModel(
        sampleActivityDocument({
          activityId: "today",
          timestamp: "2026-07-04T11:30:00.000Z",
        }),
        { now },
      ),
      mapActivityDocumentToViewModel(
        sampleActivityDocument({
          activityId: "yesterday",
          timestamp: "2026-07-03T15:00:00.000Z",
        }),
        { now },
      ),
      mapActivityDocumentToViewModel(
        sampleActivityDocument({
          activityId: "earlier",
          timestamp: "2026-07-01T10:00:00.000Z",
        }),
        { now },
      ),
    ];

    const groups = groupActivityViewModels(models, { strategy: "date", now });

    expect(groups.map((group) => group.key)).toEqual(["today", "yesterday", "earlier"]);
    expect(groups[0]?.label).toBe("Today");
    expect(groups[0]?.items.map((item) => item.activityId)).toEqual(["today"]);
  });

  it("groups by category", () => {
    const models = [
      mapActivityDocumentToViewModel(
        sampleActivityDocument({ activityId: "cap", category: "capability" }),
      ),
      mapActivityDocumentToViewModel(
        sampleActivityDocument({
          activityId: "sys",
          category: "system",
          metadata: Object.freeze({
            templateRef: "t",
            sourceEnvelopeId: "env",
            correlationId: "corr",
            publisher: "platform",
            timelineScopes: Object.freeze([TIMELINE_SCOPE_PERSONAL]),
            severity: "info" as const,
          }),
        }),
      ),
    ];

    const groups = groupActivityViewModels(models, { strategy: "category" });
    const capabilityGroup = groups.find((group) => group.key === "capability");
    const systemGroup = groups.find((group) => group.key === "system");

    expect(capabilityGroup?.items).toHaveLength(1);
    expect(systemGroup?.items).toHaveLength(1);
  });

  it("groups by timeline scope", () => {
    const models = [
      mapActivityDocumentToViewModel(
        sampleActivityDocument({
          activityId: "personal",
          timelineScope: TIMELINE_SCOPE_PERSONAL,
        }),
      ),
      mapActivityDocumentToViewModel(
        sampleActivityDocument({
          activityId: "team",
          timelineScope: TIMELINE_SCOPE_TEAM,
        }),
      ),
    ];

    const groups = groupActivityViewModels(models, { strategy: "timelineScope" });
    expect(
      groups.find((group) => group.key === TIMELINE_SCOPE_PERSONAL)?.items,
    ).toHaveLength(1);
    expect(
      groups.find((group) => group.key === TIMELINE_SCOPE_TEAM)?.items,
    ).toHaveLength(1);
  });
});

describe("formatActivityRelativeTimestamp", () => {
  it("formats elapsed labels deterministically", () => {
    expect(
      formatActivityRelativeTimestamp("2026-07-04T11:59:30.000Z", {
        now: "2026-07-04T12:00:00.000Z",
      }),
    ).toBe("Just now");

    expect(
      formatActivityRelativeTimestamp("2026-07-04T11:00:00.000Z", {
        now: "2026-07-04T12:00:00.000Z",
      }),
    ).toBe("1h ago");
  });
});

describe("buildActivityPresentationDiagnostics", () => {
  it("reports counts, layer status, and formatting status", () => {
    const model = mapActivityDocumentToViewModel(
      sampleActivityDocument({ activityId: "env-1:platform.action.executed" }),
      { now: "2026-07-04T12:02:00.000Z" },
    );
    const diagnostics = buildActivityPresentationDiagnostics([model], {
      presentationDurationMs: 1.5,
    });

    expect(diagnostics.status).toBe("ready");
    expect(diagnostics.layerStatus).toBe(ACTIVITY_PRESENTATION_LAYER_STATUS);
    expect(diagnostics.totalCount).toBe(1);
    expect(diagnostics.categoryCounts.capability).toBe(1);
    expect(diagnostics.scopeCounts[TIMELINE_SCOPE_PERSONAL]).toBe(1);
    expect(diagnostics.presentationDurationMs).toBe(1.5);
    expect(diagnostics.formattingStatus).toBe("ok");
  });

  it("marks formatting partial for invalid timestamps", () => {
    const model = mapActivityDocumentToViewModel(
      sampleActivityDocument({
        activityId: "invalid",
        timestamp: "not-a-date",
      }),
    );

    expect(buildActivityPresentationDiagnostics([model]).formattingStatus).toBe(
      "partial",
    );
  });
});

describe("presentActivities", () => {
  it("maps, sorts, groups, and diagnoses in one pipeline", () => {
    const result = presentActivities(
      [
        sampleActivityDocument({
          activityId: "env-1:platform.action.executed",
          timestamp: "2026-07-04T12:00:00.000Z",
        }),
      ],
      {
        now: "2026-07-04T12:05:00.000Z",
        grouping: "date",
      },
    );

    expect(result.viewModels).toHaveLength(1);
    expect(result.groupedViewModels[0]?.key).toBe("today");
    expect(result.diagnostics.totalCount).toBe(1);
    expect(result.diagnostics.presentationDurationMs).toBeGreaterThanOrEqual(0);
  });
});
