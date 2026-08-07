import { beforeEach, describe, expect, it } from "vitest";

import {
  createDecisionIntelligenceService,
  getMemoryDecisionIntelligenceStore,
  resetMemoryDecisionIntelligenceStoreForTests,
  setDecisionIntelligenceStoreForTests,
} from "./index";

const ctx = {
  userId: "user_exec",
  tenantId: "tenant_1",
  correlationId: "c1",
  requestId: "r1",
  permissions: ["analytics.view", "analytics.admin"],
};

describe("DecisionIntelligenceService", () => {
  beforeEach(() => {
    resetMemoryDecisionIntelligenceStoreForTests();
    setDecisionIntelligenceStoreForTests(getMemoryDecisionIntelligenceStore());
  });

  it("lists executive question catalogue by role", async () => {
    const service = createDecisionIntelligenceService();
    const all = await service.listQuestions(ctx);
    expect(all.length).toBeGreaterThanOrEqual(16);

    const executive = await service.listQuestions(ctx, "executive");
    expect(executive.every((q) => q.audienceRoles.includes("executive"))).toBe(true);

    const support = await service.listQuestions(ctx, "support_manager");
    expect(support.some((q) => q.id === "EQ-SM01")).toBe(true);
  });

  it("generates rule-based decision packs with evidence and actions", async () => {
    const service = createDecisionIntelligenceService();
    const pack = await service.generatePack(ctx, {
      questionId: "EQ-E01",
      audienceRole: "executive",
    });
    expect(pack.question).toContain("projects healthy");
    expect(pack.indicators.length).toBeGreaterThan(0);
    expect(pack.supportingEvidence.length).toBeGreaterThan(0);
    expect(pack.recommendedActions.length).toBeGreaterThan(0);
    expect(pack.trendSummary.length).toBeGreaterThan(0);

    const packs = await service.listPacks(ctx);
    expect(packs).toHaveLength(1);
  });

  it("provides trend series for delivery, support, workflow, and quality", async () => {
    const service = createDecisionIntelligenceService();
    const trends = await service.listTrends(ctx);
    expect(trends.map((t) => t.domain)).toEqual(
      expect.arrayContaining([
        "project_delivery",
        "support_performance",
        "workflow_throughput",
        "operational_quality",
      ]),
    );
    expect(trends[0]?.points.length).toBeGreaterThan(1);
    expect(trends[0]?.changeSummary.length).toBeGreaterThan(0);
  });

  it("manages KPIs with owners, targets, and history", async () => {
    const service = createDecisionIntelligenceService();
    const kpi = await service.createKpi(ctx, {
      name: "On-track projects",
      description: "Share of projects with green delivery health",
      owner: "PMO Lead",
      targetValue: 85,
      currentValue: 78,
      unit: "percent",
      domain: "project_delivery",
    });
    expect(kpi.status).toBe("at_risk");

    const updated = await service.updateKpi(ctx, kpi.id, { currentValue: 86 });
    expect(updated.status).toBe("on_track");
    expect(updated.history.length).toBe(2);
  });

  it("records decision timeline with evidence references", async () => {
    const service = createDecisionIntelligenceService();
    const entry = await service.createTimelineEntry(ctx, {
      title: "Hold launch for recovery",
      decision: "Defer go-live by two weeks",
      rationale: "Delivery health red and critical risks open",
      decidedBy: "Delivery Director",
      evidenceRefs: ["EQ-E01 pack", "Projects delivery dashboard"],
      relatedQuestionId: "EQ-E01",
      relatedProduct: "APZ Projects",
      sourceRecordRef: "proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });
    expect(entry.evidenceRefs).toContain("EQ-E01 pack");
    expect((await service.listTimeline(ctx)).length).toBe(1);
  });
});
