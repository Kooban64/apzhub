import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { asTestPlanId } from "@apzhub/testing-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { describe, expect, it } from "vitest";

import {
  analyzeRegressionByCaseKey,
  assertCoverageIntegrity,
  assertDefectCreateInput,
  assertRegressionInputs,
  assertReleaseCalculationInputs,
  computeDefectDensity,
  computeOpenDefectImpact,
  coveragePercentage,
  createQualityIntelligenceServices,
  createTestingDomainServices,
  DomainRuleError,
  overallReadinessScore,
  safePercent,
} from "../index";

const ALL_PERMS = [
  "quality.*",
  "coverage.*",
  "defects.*",
  "release.*",
  "reporting.*",
  "testing.*",
  "traceability.*",
  "certification.*",
  "evidence.*",
  "approval.*",
  "automation.*",
  "risk.*",
] as const;

function ctx(
  overrides?: Partial<ServiceRequestContext>,
): ServiceRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    correlationId: "corr_qi_1",
    permissions: [...ALL_PERMS],
    organisationId: "org_1",
    ...overrides,
  };
}

function quality() {
  return createQualityIntelligenceServices({
    persistence: createInMemoryTestingPersistence(),
    now: () => "2026-07-12T12:00:00.000Z",
    id: (() => {
      let n = 0;
      return () => `qi_${++n}`;
    })(),
  });
}

describe("quality calculations (pure)", () => {
  it("computes safe percentages and coverage", () => {
    expect(safePercent(1, 0)).toBe(0);
    expect(coveragePercentage(1, 2)).toBe(50);
    expect(coveragePercentage(0, 0)).toBe(0);
    expect(computeDefectDensity(2, 10)).toBe(0.2);
    expect(computeDefectDensity(1, 0)).toBe(0);
    expect(
      computeOpenDefectImpact([
        { status: "open", severity: "critical" },
        { status: "closed", severity: "blocker" },
        { status: "reopened", severity: "low" },
      ]),
    ).toBe(5);
    expect(overallReadinessScore([80, 100, 60])).toBe(80);
  });

  it("analyzes regression by case key deterministically", () => {
    const result = analyzeRegressionByCaseKey(
      [
        { caseKey: "b", status: "fail" },
        { caseKey: "a", status: "pass" },
        { caseKey: "c", status: "fail" },
      ],
      [
        { caseKey: "a", status: "fail" },
        { caseKey: "b", status: "pass" },
        { caseKey: "d", status: "fail" },
      ],
    );
    expect(result.newFailures).toEqual(["d"]);
    expect(result.resolvedFailures).toEqual(["b"]);
    expect(result.reopenedFailures).toEqual(["a"]);
  });

  it("validates integrity helpers", () => {
    expect(() => assertCoverageIntegrity(2, 1)).toThrow(DomainRuleError);
    expect(() => assertCoverageIntegrity(1, 2)).not.toThrow();
    expect(() => assertDefectCreateInput({})).toThrow(DomainRuleError);
    expect(() =>
      assertDefectCreateInput({ providerKind: "internal", status: "open" }),
    ).not.toThrow();
    expect(() =>
      assertReleaseCalculationInputs({ hasPlanOrRelease: false }),
    ).toThrow(DomainRuleError);
    expect(() =>
      assertRegressionInputs({
        baselineLabel: "",
        currentLabel: "c",
        baselineResults: [],
        currentResults: [],
      }),
    ).toThrow(DomainRuleError);
  });
});

describe("DefectLinkService", () => {
  it("creates, links, unlinks, lists, and archives defects", async () => {
    const q = quality();
    const created = await q.defects.create(ctx(), {
      providerKind: "projects",
      status: "open",
      severity: "major",
      priority: "high",
      summary: "Login fails",
      externalRef: "PROJ-1",
    });
    expect(created.id).toBeTruthy();
    expect(created.providerKind).toBe("projects");
    expect(q.events.listByType("defect_link.created")).toHaveLength(1);

    const linked = await q.defects.linkTo(ctx(), created.id, "case", "case_01");
    expect(linked.caseIds).toContain("case_01");
    expect(q.events.listByType("defect_link.linked").length).toBeGreaterThan(0);

    const unlinked = await q.defects.unlinkFrom(
      ctx(),
      created.id,
      "case",
      "case_01",
    );
    expect(unlinked.caseIds ?? []).not.toContain("case_01");

    const updated = await q.defects.update(ctx(), created.id, {
      status: "in_progress",
      resolution: "investigating",
    });
    expect(updated.status).toBe("in_progress");

    const open = await q.defects.listByStatus(ctx(), "in_progress");
    expect(open.some((d) => d.id === created.id)).toBe(true);

    const archived = await q.defects.archive(ctx(), created.id);
    expect(archived).toBeTruthy();
    expect(await q.defects.get(ctx(), created.id)).toBeTruthy();
  });

  it("denies create without defects permissions", async () => {
    const q = quality();
    await expect(
      q.defects.create(ctx({ permissions: ["quality.view"] }), {
        providerKind: "internal",
        status: "open",
        summary: "x",
      }),
    ).rejects.toThrow();
  });
});

describe("CoverageService", () => {
  it("recomputes deterministic coverage and persists records", async () => {
    const persistence = createInMemoryTestingPersistence();
    const q = createQualityIntelligenceServices({
      persistence,
      now: () => "2026-07-12T12:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `cov_${++n}`;
      })(),
    });
    const c = ctx();
    const rctx = {
      tenantId: c.tenantId,
      organisationId: c.organisationId,
      actorUserId: c.userId,
      permissions: c.permissions,
      correlationId: c.correlationId,
    };

    await persistence.requirements.create(rctx, {
      id: "req_1",
      key: "R1",
      title: "Req 1",
      priority: "high",
      tags: [],
      workItemRefs: [],
      riskIds: [],
    });
    await persistence.requirements.create(rctx, {
      id: "req_2",
      key: "R2",
      title: "Req 2",
      priority: "medium",
      tags: [],
      workItemRefs: [],
      riskIds: [],
    });
    await persistence.testSuites.create(rctx, {
      id: "suite_1",
      key: "S1",
      name: "Suite",
      status: "draft",
      isRegression: false,
      planIds: ["plan_1"],
      caseIds: ["case_1"],
    });
    await persistence.testPlans.create(rctx, {
      id: "plan_1",
      key: "P1",
      name: "Plan",
      status: "draft",
      suiteIds: ["suite_1"],
      requirementIds: ["req_1", "req_2"],
      riskIds: [],
    });
    await persistence.testCases.create(rctx, {
      id: "case_1",
      key: "C1",
      title: "Case",
      status: "draft",
      priority: "medium",
      suiteIds: ["suite_1"],
      requirementIds: ["req_1"],
      tags: [],
      stepIds: [],
    });
    await persistence.executionSessions.create(rctx, {
      id: "sess_1",
      status: "in_progress",
      executionType: "manual",
    });
    await persistence.manualExecutions.create(rctx, {
      id: "exec_1",
      sessionId: "sess_1",
      caseId: "case_1",
      status: "completed",
      overallResult: "pass",
      comments: [],
      stepActuals: [],
    });
    await persistence.risks.create(rctx, {
      id: "risk_1",
      key: "RK1",
      title: "Risk",
      level: "high",
      requirementIds: ["req_1"],
    });

    const metrics = await q.coverage.recompute(c, {
      planId: asTestPlanId("plan_1"),
    });
    expect(metrics.length).toBeGreaterThan(0);
    const reqMetric = metrics.find((m) => m.kind === "requirement");
    expect(reqMetric?.coveredCount).toBe(1);
    expect(reqMetric?.totalCount).toBe(2);
    expect(reqMetric?.percentage).toBe(50);

    const byKind = await q.coverage.listMetricsByKind(c, "requirement");
    expect(byKind.length).toBeGreaterThan(0);
    const forPlan = await q.coverage.listMetricsForPlan(c, asTestPlanId("plan_1"));
    expect(forPlan.length).toBeGreaterThan(0);
    const forSubject = await q.coverage.listMetricsForSubject(
      c,
      String(reqMetric?.subjectId),
    );
    expect(forSubject.length).toBeGreaterThan(0);
    const one = await q.coverage.getMetric(c, metrics[0]!.id);
    expect(one.id).toBe(metrics[0]!.id);

    const accepted = await q.coverage.requestRecompute(c, asTestPlanId("plan_1"));
    expect(accepted.accepted).toBe(true);
    expect(q.events.listByType("coverage.recomputed").length).toBeGreaterThan(0);
  });
});

describe("QualityIntelligence + trends", () => {
  it("computes snapshots and compares windows/snapshots", async () => {
    const q = quality();
    const snap1 = await q.intelligence.computeSnapshot(
      ctx(),
      { tenantId: "tenant_1" },
      "baseline",
    );
    expect(snap1.metrics.passRate).toBeDefined();
    expect(snap1.label).toBe("baseline");
    expect(q.events.listByType("quality.snapshot_computed")).toHaveLength(1);

    const snap2 = await q.intelligence.computeSnapshot(ctx(), undefined, "current");
    const listed = await q.intelligence.listSnapshots(ctx());
    expect(listed.length).toBe(2);
    expect(await q.intelligence.getSnapshot(ctx(), snap1.id)).toBeTruthy();

    const trend = await q.trends.compareSnapshots(ctx(), snap1.id, snap2.id);
    expect(trend.deltas.length).toBeGreaterThan(0);

    const windowTrend = await q.trends.compareWindows(
      ctx(),
      { label: "w1", metrics: { passRate: 50 } },
      { label: "w2", metrics: { passRate: 80 } },
    );
    expect(windowTrend.deltas[0]?.delta).toBe(30);
  });
});

describe("RegressionAnalysisService", () => {
  it("persists analysis with new/resolved/reopened failures", async () => {
    const q = quality();
    const analysis = await q.regressionAnalysis.analyze(ctx(), {
      baselineLabel: "v1",
      currentLabel: "v2",
      baselineResults: [
        { caseKey: "a", status: "pass" },
        { caseKey: "b", status: "fail" },
      ],
      currentResults: [
        { caseKey: "a", status: "fail" },
        { caseKey: "b", status: "pass" },
        { caseKey: "c", status: "fail" },
      ],
      baselineCoveragePercent: 40,
      currentCoveragePercent: 55,
      baselineExecutionCount: 2,
      currentExecutionCount: 3,
    });
    expect(analysis.newFailures).toEqual(["c"]);
    expect(analysis.resolvedFailures).toEqual(["b"]);
    expect(analysis.reopenedFailures).toEqual(["a"]);
    expect(analysis.coverageDelta).toBe(15);
    expect(analysis.executionDelta).toBe(1);
    expect(await q.regressionAnalysis.get(ctx(), analysis.id)).toBeTruthy();
    expect((await q.regressionAnalysis.list(ctx())).length).toBe(1);
    expect(q.events.listByType("regression.analyzed")).toHaveLength(1);
  });
});

describe("Release + certification readiness", () => {
  it("assesses dimensions with isDecision false", async () => {
    const persistence = createInMemoryTestingPersistence();
    const q = createQualityIntelligenceServices({
      persistence,
      now: () => "2026-07-12T12:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `rr_${++n}`;
      })(),
    });
    const c = ctx();
    const rctx = {
      tenantId: c.tenantId,
      organisationId: c.organisationId,
      actorUserId: c.userId,
      permissions: c.permissions,
      correlationId: c.correlationId,
    };
    await persistence.testPlans.create(rctx, {
      id: "plan_rr",
      key: "PR",
      name: "Plan",
      status: "draft",
      suiteIds: [],
      requirementIds: [],
      riskIds: [],
    });

    const assessment = await q.releaseReadiness.assessForPlan!(
      c,
      asTestPlanId("plan_rr"),
    );
    expect(assessment.isDecision).toBe(false);
    expect(assessment.dimensions.execution).toBeDefined();
    expect(assessment.dimensions.coverage).toBeDefined();
    expect(assessment.dimensions.defect).toBeDefined();
    expect(typeof assessment.overallScore).toBe("number");

    const legacy = await q.releaseReadiness.calculateForPlan(
      c,
      asTestPlanId("plan_rr"),
    );
    expect(legacy.isDecision).toBe(false);

    const certReady = await q.certificationReadiness.assessForPlan(
      c,
      asTestPlanId("plan_rr"),
    );
    expect(certReady.isDecision).toBe(false);
    expect(certReady.dimensions.length).toBeGreaterThan(0);

    const releaseAssess = await q.releaseReadiness.assessForRelease!(
      c,
      "rel-1",
      asTestPlanId("plan_rr"),
    );
    expect(releaseAssess.releaseLabel).toBe("rel-1");
    expect(releaseAssess.isDecision).toBe(false);
  });
});

describe("RiskAggregation + QualitySummary", () => {
  it("aggregates risks and rolls up quality summary", async () => {
    const persistence = createInMemoryTestingPersistence();
    const q = createQualityIntelligenceServices({
      persistence,
      now: () => "2026-07-12T12:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `sum_${++n}`;
      })(),
    });
    const c = ctx();
    const rctx = {
      tenantId: c.tenantId,
      organisationId: c.organisationId,
      actorUserId: c.userId,
      permissions: c.permissions,
      correlationId: c.correlationId,
    };
    await persistence.risks.create(rctx, {
      id: "risk_a",
      key: "RA",
      title: "A",
      level: "critical",
      severity: "critical",
      requirementIds: [],
    });
    await persistence.defectLinks.create(rctx, {
      id: "def_a",
      providerKind: "internal",
      status: "open",
      priority: "high",
      severity: "major",
      requirementIds: [],
      planIds: [],
      suiteIds: [],
      caseIds: [],
      manualExecutionIds: [],
      automationExecutionIds: [],
      evidenceIds: [],
      riskIds: [],
      workItemRefs: [],
    });
    await persistence.testPlans.create(rctx, {
      id: "plan_sum",
      key: "PS",
      name: "Sum",
      status: "draft",
      suiteIds: [],
      requirementIds: [],
      riskIds: [],
    });

    const agg = await q.riskAggregation.aggregate(c);
    expect(agg.totalRisks).toBe(1);
    expect(agg.uncoveredRiskCount).toBe(1);
    expect(agg.byLevel[0]?.level).toBe("critical");

    const summary = await q.summary.summarize(c, {
      planId: asTestPlanId("plan_sum"),
    });
    expect(summary.snapshot).toBeTruthy();
    expect(summary.coverageMetrics.length).toBeGreaterThan(0);
    expect(summary.openDefectsByStatus.open).toBe(1);
    expect(summary.readiness?.isDecision).toBe(false);
    expect(q.events.listByType("quality.summary_computed")).toHaveLength(1);
  });
});

describe("coverage expansion paths", () => {
  it("covers releaseLabel recomputeAll and status helpers", async () => {
    const {
      dimensionStatusFromScore,
      suggestedReleaseStatusFromDimensions,
      countExecutionStatuses,
      severityWeight,
      assertRelationshipId,
      numericDelta,
    } = await import("./index");
    expect(dimensionStatusFromScore(95, [])).toBe("ready");
    expect(dimensionStatusFromScore(50, [])).toBe("partial");
    expect(dimensionStatusFromScore(10, [])).toBe("blocked");
    expect(dimensionStatusFromScore(99, ["x"])).toBe("blocked");
    expect(suggestedReleaseStatusFromDimensions([])).toBe("not_ready");
    expect(suggestedReleaseStatusFromDimensions(["ready", "ready"])).toBe("ready");
    expect(suggestedReleaseStatusFromDimensions(["partial", "ready"])).toBe(
      "partially_ready",
    );
    expect(suggestedReleaseStatusFromDimensions(["blocked", "ready"])).toBe(
      "blocked",
    );
    expect(countExecutionStatuses([{ overallResult: "passed" }, { status: "skip" }]).pass).toBe(1);
    expect(severityWeight(undefined)).toBe(1);
    expect(severityWeight("unknown")).toBe(1);
    expect(numericDelta(10, 4)).toBe(6);
    expect(() => assertRelationshipId("", "entityId")).toThrow(DomainRuleError);
    expect(() => assertDefectCreateInput({ providerKind: "internal" })).toThrow(
      DomainRuleError,
    );
    expect(() =>
      assertRegressionInputs({
        baselineLabel: "a",
        currentLabel: "b",
        baselineResults: null as unknown as [],
        currentResults: [],
      }),
    ).toThrow(DomainRuleError);
    expect(() => assertCoverageIntegrity(-1, 1)).toThrow(DomainRuleError);

    const persistence = createInMemoryTestingPersistence();
    const q = createQualityIntelligenceServices({
      persistence,
      now: () => "2026-07-12T12:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `cov2_${++n}`;
      })(),
    });
    const c = ctx();
    const metrics = await q.coverage.recomputeAll(c, { releaseLabel: "1.0.0" });
    expect(metrics.some((m) => m.kind === "release")).toBe(true);
    const listed = await q.coverage.listMetrics(c);
    expect(listed.length).toBe(metrics.length);

    const defect = await q.defects.create(c, {
      providerKind: "support",
      status: "open",
      summary: "ticket",
    });
    const linkedWi = await q.defects.linkTo(c, defect.id, "work_item", "wi_1");
    expect(linkedWi.workItemRefs?.some((r) => String(r.workItemId) === "wi_1")).toBe(
      true,
    );
    await q.defects.unlinkFrom(c, defect.id, "work_item", "wi_1");
    const linkedExt = await q.defects.linkTo(c, defect.id, "other_kind", "ext_9");
    expect(linkedExt.externalRef).toBe("ext_9");

    const summaryRelease = await q.summary.summarize(c, { releaseLabel: "1.0.0" });
    expect(summaryRelease.readiness?.releaseLabel).toBe("1.0.0");

    const releaseOnly = await q.releaseReadiness.assessForRelease!(c, "solo-rel");
    expect(releaseOnly.isDecision).toBe(false);

    await persistence.certificationRecords.create(
      {
        tenantId: c.tenantId,
        actorUserId: c.userId,
        permissions: c.permissions,
        organisationId: c.organisationId,
      },
      {
        id: "cert_1",
        key: "CERT-1",
        name: "Cert",
        status: "qa_ready",
        planId: "plan_rr_missing",
        gateIds: [],
        approvalIds: [],
      },
    );
    // plan missing → calculateForCertification may throw; create plan first
    await persistence.testPlans.create(
      {
        tenantId: c.tenantId,
        actorUserId: c.userId,
        permissions: c.permissions,
        organisationId: c.organisationId,
      },
      {
        id: "plan_rr_missing",
        key: "PM",
        name: "Plan",
        status: "draft",
        suiteIds: [],
        requirementIds: [],
        riskIds: [],
      },
    );
    const certAssess = await q.releaseReadiness.assessForCertification!(
      c,
      "cert_1" as never,
    );
    expect(certAssess.isDecision).toBe(false);
    const certReady = await q.certificationReadiness.assessForCertification(
      c,
      "cert_1" as never,
    );
    expect(certReady.isDecision).toBe(false);
  });
});

describe("factory wiring + boundary", () => {
  it("wires quality into createTestingDomainServices and keeps manual release readiness", async () => {
    const all = createTestingDomainServices({
      persistence: createInMemoryTestingPersistence(),
    });
    expect(all.quality.defects).toBeTruthy();
    expect(all.quality.coverage).toBeTruthy();
    expect(all.releaseReadiness.calculateForPlan).toBeTruthy();
    expect(all.automation.imports).toBeTruthy();
  });

  it("quality source forbids jira/github/http/ui tokens", async () => {
    const { readFileSync, readdirSync, statSync } = await import("node:fs");
    const path = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
    const forbidden = [/jira/i, /github/i, /gitlab/i, /azure.?devops/i, /express/, /@apzhub\/ui/, /apps\/web/];
    function walk(dir: string, acc: string[] = []): string[] {
      for (const entry of readdirSync(dir)) {
        if (entry.endsWith(".test.ts")) continue;
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, acc);
        else if (full.endsWith(".ts")) acc.push(full);
      }
      return acc;
    }
    for (const file of walk(root)) {
      const content = readFileSync(file, "utf8");
      for (const pattern of forbidden) {
        expect(pattern.test(content), `${file} matched ${pattern}`).toBe(false);
      }
    }
  });
});
