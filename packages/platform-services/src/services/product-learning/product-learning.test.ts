import { describe, expect, it } from "vitest";

import { createMemoryProductLearningStore } from "./memory-store";
import { recordProductLearningEvent } from "./record-learning-event";
import { summarizeContextLearning } from "./summarize-context-learning";

describe("summarizeContextLearning", () => {
  it("computes Product Board metrics from anonymous events", () => {
    const summary = summarizeContextLearning(
      [
        {
          id: "1",
          tenantId: "t1",
          featureKey: "enterprise-context",
          eventName: "context.panel_opened",
          properties: {},
          occurredAt: "2026-08-06T10:00:00.000Z",
        },
        {
          id: "2",
          tenantId: "t1",
          featureKey: "enterprise-context",
          eventName: "context.section_viewed",
          properties: { sectionId: "support" },
          occurredAt: "2026-08-06T10:00:01.000Z",
        },
        {
          id: "3",
          tenantId: "t1",
          featureKey: "enterprise-context",
          eventName: "context.section_viewed",
          properties: { sectionId: "support" },
          occurredAt: "2026-08-06T10:00:02.000Z",
        },
        {
          id: "4",
          tenantId: "t1",
          featureKey: "enterprise-context",
          eventName: "context.section_viewed",
          properties: { sectionId: "law" },
          occurredAt: "2026-08-06T10:00:03.000Z",
        },
        {
          id: "5",
          tenantId: "t1",
          featureKey: "enterprise-context",
          eventName: "context.link_followed",
          properties: { targetProduct: "support" },
          occurredAt: "2026-08-06T10:00:04.000Z",
        },
        {
          id: "6",
          tenantId: "t1",
          featureKey: "enterprise-context",
          eventName: "context.feedback",
          properties: { rating: "helpful" },
          occurredAt: "2026-08-06T10:00:05.000Z",
        },
        {
          id: "7",
          tenantId: "t1",
          featureKey: "enterprise-context",
          eventName: "context.feedback",
          properties: { rating: "not_helpful" },
          occurredAt: "2026-08-06T10:00:06.000Z",
        },
        {
          id: "8",
          tenantId: "t1",
          featureKey: "enterprise-context",
          eventName: "context.load_timed",
          properties: { totalMs: 120, missingProviderCount: 1 },
          occurredAt: "2026-08-06T10:00:07.000Z",
        },
        {
          id: "9",
          tenantId: "t1",
          featureKey: "enterprise-context",
          eventName: "context.panel_collapsed",
          properties: { visibleMs: 4000 },
          occurredAt: "2026-08-06T10:00:08.000Z",
        },
      ],
      new Date("2026-08-06T12:00:00.000Z"),
    );

    expect(summary.mostUsedSection).toBe("support");
    expect(summary.leastUsedSection).toBe("workflow");
    expect(summary.linkFollowThrough.support).toBe(1);
    expect(summary.helpful).toBe(1);
    expect(summary.notHelpful).toBe(1);
    expect(summary.helpfulRatio).toBe(0.5);
    expect(summary.averageLoadMs).toBe(120);
    expect(summary.missingProviderResponses).toBe(1);
    expect(summary.averageVisibleMs).toBe(4000);
  });
});

describe("recordProductLearningEvent", () => {
  it("strips sensitive properties and never stores user ids", async () => {
    const store = createMemoryProductLearningStore();
    const event = await recordProductLearningEvent(
      {
        userId: "user_secret",
        tenantId: "tenant_1",
        correlationId: "corr_1",
        requestId: "req_1",
        permissions: [],
      },
      store,
      {
        featureKey: "enterprise-context",
        eventName: "context.feedback",
        properties: {
          rating: "helpful",
          userId: "should-strip",
          title: "should-strip",
          comment: "x".repeat(400),
        },
      },
    );

    expect(event.properties.userId).toBeUndefined();
    expect(event.properties.title).toBeUndefined();
    expect(String(event.properties.comment).length).toBe(280);
    expect(event.properties.rating).toBe("helpful");
    const listed = await store.listByFeature("tenant_1", "enterprise-context");
    expect(listed).toHaveLength(1);
  });
});
