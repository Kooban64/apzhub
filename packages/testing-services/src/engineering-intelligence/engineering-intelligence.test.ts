import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";
import { describe, expect, it } from "vitest";

import {
  aggregateRisk,
  clamp01to100,
  computeQualityScore,
  computeTrendDelta,
  computeTrendDirection,
  createEngineeringIntelligenceServices,
  createTestingDomainServices,
  healthStatusFromScore,
  invertPenalty,
  normalizeWeights,
  rollingAverage,
} from "../index";

const ALL_PERMS = [
  "quality.*",
  "analytics.*",
  "engineering.*",
  "benchmark.*",
  "trend.*",
  "coverage.*",
  "defects.*",
  "release.*",
  "reporting.*",
  "testing.*",
  "certification.*",
  "evidence.*",
  "approval.*",
  "automation.*",
  "pipeline.*",
] as const;

function ctx(
  overrides?: Partial<ServiceRequestContext>,
): ServiceRequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_1",
    correlationId: "corr_ei_1",
    permissions: [...ALL_PERMS],
    organisationId: "org_1",
    ...overrides,
  };
}

function ei() {
  return createEngineeringIntelligenceServices({
    persistence: createInMemoryTestingPersistence(),
    now: () => "2026-07-12T12:00:00.000Z",
    id: (() => {
      let n = 0;
      return () => `ei_${++n}`;
    })(),
  });
}

describe("engineering intelligence calculations (pure)", () => {
  it("clamps, inverts, and normalizes weights", () => {
    expect(clamp01to100(150)).toBe(100);
    expect(clamp01to100(-5)).toBe(0);
    expect(invertPenalty(20)).toBe(80);
    const w = normalizeWeights({
      coverage: 2,
      automation: 2,
      manualExecution: 0,
      failedTests: 0,
      openDefects: 0,
      certification: 0,
      approvals: 0,
      releaseReadiness: 0,
    });
    expect(w.coverage).toBe(0.5);
    expect(w.automation).toBe(0.5);
  });

  it("computes deterministic quality scores with inverted penalties", () => {
    const score = computeQualityScore({
      id: "qs_1",
      scope: { tenantId: "t1" },
      inputs: {
        coverage: 80,
        automation: 60,
        manualExecution: 40,
        failedTests: 20,
        openDefects: 10,
        certification: 90,
        approvals: 100,
        releaseReadiness: 70,
      },
      computedAt: "2026-07-12T12:00:00.000Z",
    });
    expect(score.score).toBeGreaterThan(0);
    expect(score.score).toBeLessThanOrEqual(100);
    expect(score.components.find((c) => c.key === "failedTests")?.inverted).toBe(
      true,
    );
    expect(score.components.find((c) => c.key === "coverage")?.inverted).toBe(
      false,
    );
  });

  it("computes trend directions without forecasting", () => {
    expect(computeTrendDirection([])).toBe("unknown");
    expect(computeTrendDirection([{ value: 1 }])).toBe("unknown");
    expect(computeTrendDirection([{ value: 10 }, { value: 10.5 }])).toBe("stable");
    expect(computeTrendDirection([{ value: 10 }, { value: 12 }])).toBe("increase");
    expect(computeTrendDirection([{ value: 10 }, { value: 20 }])).toBe("improving");
    expect(computeTrendDirection([{ value: 20 }, { value: 18 }])).toBe("decrease");
    expect(computeTrendDirection([{ value: 20 }, { value: 10 }])).toBe("declining");
    expect(computeTrendDelta([{ value: 10 }, { value: 15 }])).toBe(5);
    expect(rollingAverage([10, 20, 30])).toBe(20);
  });

  it("maps health and risk bands", () => {
    expect(healthStatusFromScore(90)).toBe("healthy");
    expect(healthStatusFromScore(75)).toBe("watch");
    expect(healthStatusFromScore(55)).toBe("at_risk");
    expect(healthStatusFromScore(20)).toBe("critical");
    const risk = aggregateRisk(
      {
        coverage: 80,
        automation: 50,
        manualExecution: 50,
        failedTests: 10,
        openDefects: 20,
        certification: 70,
        approvals: 80,
        releaseReadiness: 60,
        stability: 70,
        pipelineHealth: 90,
        risk: 25,
        velocity: 50,
        leadTime: 40,
        sourceRefs: {},
        reasons: ["coverage gap", "defect density"],
      },
      "2026-07-12T12:00:00.000Z",
    );
    expect(risk.factors).toHaveLength(7);
    expect(risk.overallLevel).toBeTruthy();
  });
});

describe("engineering intelligence services", () => {
  it("scores from empty SoR and assesses health", async () => {
    const services = ei();
    const c = ctx();
    const score = await services.scoring.scoreFromScope(c);
    expect(score.score).toBeGreaterThanOrEqual(0);
    const health = await services.health.assess(c);
    expect(health.isDecision).toBe(false);
    expect(health.indicators.length).toBeGreaterThan(0);
    expect(["healthy", "watch", "at_risk", "critical", "unknown"]).toContain(
      health.status,
    );
  });

  it("builds trends, benchmarks, and baselines", async () => {
    const services = ei();
    const c = ctx();
    const series = await services.trends.buildSeries(c, "coverage", undefined, "weekly");
    expect(series.kind).toBe("coverage");
    expect(series.direction).toBeTruthy();
    const listed = await services.trends.listSeries(c);
    expect(listed.length).toBe(1);

    const bench = await services.benchmarks.compare(
      c,
      "coverage",
      [50, 60, 70],
      55,
      undefined,
      "coverage-bench",
    );
    expect(bench.comparison.current).toBe(70);
    expect(bench.comparison.previous).toBe(60);
    expect(bench.comparison.rollingAverage).toBe(60);
    expect(bench.comparison.baseline).toBe(55);
    expect(bench.comparison.best).toBe(70);
    expect(bench.comparison.worst).toBe(50);
    expect(await services.benchmarks.get(c, String(bench.id))).toEqual(bench);
    expect((await services.benchmarks.list(c)).length).toBe(1);

    const baseline = await services.baselines.record(c, {
      kind: "last_month",
      metricKey: "coverage",
      value: 65,
      label: "jun",
    });
    expect(baseline.value).toBe(65);
    expect(await services.baselines.get(c, String(baseline.id))).toEqual(baseline);
    expect((await services.baselines.list(c)).length).toBe(1);
  });

  it("captures immutable historical snapshots", async () => {
    const services = ei();
    const c = ctx();
    const snap = await services.historical.capture(
      c,
      {
        kind: "monthly",
        startAt: "2026-06-01T00:00:00.000Z",
        endAt: "2026-06-30T23:59:59.000Z",
        label: "June 2026",
      },
      { tenantId: "tenant_1" },
    );
    expect(snap.immutable).toBe(true);
    expect(snap.period.kind).toBe("monthly");
    expect(await services.historical.get(c, String(snap.id))).toEqual(snap);
    expect((await services.historical.list(c)).length).toBe(1);
    expect(
      services.events.listByType("engineering.historical_captured").length,
    ).toBeGreaterThan(0);
  });

  it("computes full engineering snapshot via facade", async () => {
    const services = ei();
    const c = ctx();
    const snap = await services.intelligence.computeSnapshot(
      c,
      { tenantId: "tenant_1" },
      "wave-closeout",
    );
    expect(snap.label).toBe("wave-closeout");
    expect(snap.qualityScore.score).toBeGreaterThanOrEqual(0);
    expect(snap.health.isDecision).toBe(false);
    expect(snap.trends.length).toBe(8);
    expect(snap.indicators.length).toBeGreaterThan(0);
    expect(await services.intelligence.getSnapshot(c, String(snap.id))).toEqual(
      snap,
    );
    expect((await services.intelligence.listSnapshots(c)).length).toBe(1);
  });

  it("consumes quality snapshot metrics without recalculation", async () => {
    const persistence = createInMemoryTestingPersistence();
    const c = ctx();
    await persistence.qualitySnapshots.create(
      {
        tenantId: c.tenantId,
        actorUserId: c.userId,
        permissions: c.permissions,
        organisationId: c.organisationId,
        correlationId: c.correlationId,
      },
      {
        id: "qi_seed",
        scope: { tenantId: "tenant_1" },
        metrics: {
          passRate: 90,
          failRate: 5,
          blockedRate: 0,
          skippedRate: 5,
          automationRatio: 70,
          manualRatio: 30,
          evidenceCompleteness: 80,
          approvalCompleteness: 85,
          executionCompleteness: 90,
          coverageCompleteness: 88,
          riskScore: 10,
          defectDensity: 0.1,
          severityDistribution: {},
          openDefectImpact: 12,
          totalExecutions: 100,
          openDefectCount: 2,
        },
        computedAt: "2026-07-12T10:00:00.000Z",
        label: "seed",
      },
    );
    const services = createEngineeringIntelligenceServices({
      persistence,
      now: () => "2026-07-12T12:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `ei_q_${++n}`;
      })(),
    });
    const inputs = await services.aggregation.gatherInputs(c);
    expect(inputs.coverage).toBe(88);
    expect(inputs.automation).toBe(70);
    expect(inputs.sourceRefs.qualitySnapshots).toContain("qi_seed");
    expect(inputs.reasons.some((r) => r.includes("quality.snapshot"))).toBe(true);
  });

  it("wires into createTestingDomainServices", () => {
    const domain = createTestingDomainServices({
      persistence: createInMemoryTestingPersistence(),
    });
    expect(domain.engineeringIntelligence).toBeDefined();
    expect(domain.engineeringIntelligence.intelligence).toBeDefined();
  });

  it("aggregates risk through service", async () => {
    const services = ei();
    const summary = await services.risk.aggregate(ctx(), {
      coverage: 50,
      automation: 50,
      manualExecution: 50,
      failedTests: 40,
      openDefects: 60,
      certification: 40,
      approvals: 40,
      releaseReadiness: 40,
      stability: 40,
      pipelineHealth: 40,
      risk: 50,
      velocity: 50,
      leadTime: 50,
      sourceRefs: {},
      reasons: ["defect pressure"],
    });
    expect(summary.factors.find((f) => f.key === "defect")?.reasons.length).toBeGreaterThan(
      0,
    );
  });

  it("normalizes zero-sum weights to defaults", () => {
    const w = normalizeWeights({
      coverage: 0,
      automation: 0,
      manualExecution: 0,
      failedTests: 0,
      openDefects: 0,
      certification: 0,
      approvals: 0,
      releaseReadiness: 0,
    });
    expect(w.coverage).toBeGreaterThan(0);
  });

  it("falls back to coverage/defect counts when no QI snapshot", async () => {
    const persistence = createInMemoryTestingPersistence();
    const c = ctx();
    const rctx = {
      tenantId: c.tenantId,
      actorUserId: c.userId,
      permissions: c.permissions,
      organisationId: c.organisationId,
      correlationId: c.correlationId,
    };
    await persistence.coverageRecords.create(rctx, {
      id: "cov_1",
      kind: "plan",
      subjectId: "subj",
      coveredCount: 8,
      totalCount: 10,
      percentage: 80,
      computedAt: "2026-07-12T10:00:00.000Z",
    });
    await persistence.defectLinks.create(rctx, {
      id: "def_1",
      providerKind: "internal",
      status: "open",
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
    const services = createEngineeringIntelligenceServices({
      persistence,
      now: () => "2026-07-12T12:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `ei_fb_${++n}`;
      })(),
    });
    const inputs = await services.aggregation.gatherInputs(c);
    expect(inputs.coverage).toBe(80);
    expect(inputs.openDefects).toBe(100);
    expect(inputs.reasons.some((r) => r.includes("no quality snapshots"))).toBe(
      true,
    );
  });

  it("aggregates certification and pipeline health from SoR", async () => {
    const persistence = createInMemoryTestingPersistence();
    const c = ctx();
    const rctx = {
      tenantId: c.tenantId,
      actorUserId: c.userId,
      permissions: c.permissions,
      organisationId: c.organisationId,
      correlationId: c.correlationId,
    };
    await persistence.releaseReadinessSnapshots.create(rctx, {
      id: "rrs_1",
      releaseId: "rel_1",
      snapshotJson: { overallScore: 77 },
      computedAt: "2026-07-12T11:00:00.000Z",
      isDecision: false,
    });
    await persistence.pipelines.create(rctx, {
      id: "pipe_1",
      key: "main",
      name: "Main",
      providerKind: "generic_ci",
      status: "active",
      variablesJson: [],
      secretRefsJson: [],
    });
    await persistence.pipelineRuns.create(rctx, {
      id: "pr_1",
      pipelineId: "pipe_1",
      importId: "imp_1",
      providerKind: "generic_ci",
      status: "passed",
      externalRunRef: "r1",
      stagesJson: [],
      jobsJson: [],
      artifactsJson: [],
      approvalsJson: [],
      eventsJson: [],
      environmentJson: {},
      linksJson: {},
      summaryJson: {},
      logsJson: [],
      variablesJson: [],
      secretRefsJson: [],
    });
    const services = createEngineeringIntelligenceServices({
      persistence,
      now: () => "2026-07-12T12:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `ei_agg_${++n}`;
      })(),
    });
    const inputs = await services.aggregation.gatherInputs(c, {
      releaseLabel: "v1",
    });
    expect(inputs.pipelineHealth).toBe(100);
    expect(inputs.releaseReadiness).toBe(77);
    expect(inputs.stability).toBe(100);
    expect(inputs.reasons.some((r) => r.includes("releaseLabel"))).toBe(true);
  });

  it("scores with explicit weights via scoring.score", async () => {
    const services = ei();
    const score = await services.scoring.score(
      ctx(),
      {
        coverage: 100,
        automation: 100,
        manualExecution: 100,
        failedTests: 0,
        openDefects: 0,
        certification: 100,
        approvals: 100,
        releaseReadiness: 100,
        stability: 100,
        pipelineHealth: 100,
        risk: 0,
        velocity: 100,
        leadTime: 100,
        sourceRefs: {},
        reasons: [],
      },
      { tenantId: "tenant_1" },
      {
        coverage: 1,
        automation: 0,
        manualExecution: 0,
        failedTests: 0,
        openDefects: 0,
        certification: 0,
        approvals: 0,
        releaseReadiness: 0,
      },
    );
    expect(score.score).toBe(100);
  });

  it("lists trends after multiple builds", async () => {
    const services = ei();
    const c = ctx();
    await services.trends.buildSeries(c, "defect", undefined, "daily");
    await services.trends.buildSeries(c, "defect", undefined, "daily");
    const listed = await services.trends.listSeries(c);
    expect(listed.length).toBe(2);
    expect(services.trends.computeDirection([{ value: 1 }, { value: 2 }])).toBe(
      "increase",
    );
  });
});
