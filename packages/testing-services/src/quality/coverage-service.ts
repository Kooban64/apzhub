import type {
  CoverageMetric,
  CoverageMetricKind,
  CoverageService,
  QualityScope,
} from "@apzhub/testing-contracts";
import {
  asCoverageMetricId,
  asRequirementId,
  asRiskId,
  asTestPlanId,
  asTestSuiteId,
  type CoverageMetricId,
  type TestPlanId,
} from "@apzhub/testing-contracts";
import type { CoverageRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { coveragePercentage, stableSortIds } from "./calculations";
import { assertCoverageIntegrity } from "./validation";

function toDomain(row: CoverageRecord): CoverageMetric {
  return {
    id: asCoverageMetricId(row.id),
    tenantId: row.tenantId,
    kind: row.kind,
    subjectId: row.subjectId,
    coveredCount: row.coveredCount,
    totalCount: row.totalCount,
    percentage: row.percentage,
    computedAt: row.computedAt,
    planId: row.planId ? asTestPlanId(row.planId) : undefined,
    suiteId: row.suiteId ? asTestSuiteId(row.suiteId) : undefined,
    requirementId: row.requirementId ? asRequirementId(row.requirementId) : undefined,
    riskId: row.riskId ? asRiskId(row.riskId) : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

interface ComputedCoverage {
  readonly kind: CoverageMetricKind;
  readonly subjectId: string;
  readonly coveredCount: number;
  readonly totalCount: number;
  readonly planId?: string;
  readonly suiteId?: string;
  readonly requirementId?: string;
  readonly riskId?: string;
}

async function computeCoverageForScope(
  rt: ServiceRuntime,
  ctx: Parameters<CoverageService["recompute"]>[0],
  scope: QualityScope,
): Promise<ComputedCoverage[]> {
  const rctx = toRepositoryContext(ctx);
  const results: ComputedCoverage[] = [];

  const requirements = (await rt.persistence.requirements.list(rctx)).items;
  const plans = (await rt.persistence.testPlans.list(rctx)).items;
  const suites = (await rt.persistence.testSuites.list(rctx)).items;
  const cases = (await rt.persistence.testCases.list(rctx)).items;
  const risks = (await rt.persistence.risks.list(rctx)).items;
  const links = (await rt.persistence.traceabilityLinks.list(rctx)).items;
  const manualExecs = (await rt.persistence.manualExecutions.list(rctx)).items;
  const autoExecs = (await rt.persistence.automatedExecutions.list(rctx)).items;

  const scopedPlans = scope.planId ? plans.filter((p) => p.id === scope.planId) : plans;
  const scopedSuites = scope.suiteId
    ? suites.filter((s) => s.id === scope.suiteId)
    : scope.planId
      ? suites.filter((s) => scopedPlans.some((p) => p.suiteIds.includes(s.id)))
      : suites;
  const scopedCases = cases.filter((c) =>
    scopedSuites.length === 0
      ? !scope.planId && !scope.suiteId
      : c.suiteIds.some((sid) => scopedSuites.some((s) => s.id === sid)),
  );
  const scopedReqIds = new Set(
    scopedPlans
      .flatMap((p) => p.requirementIds)
      .concat(scopedCases.flatMap((c) => c.requirementIds)),
  );
  const scopedReqs =
    scopedReqIds.size > 0
      ? requirements.filter((r) => scopedReqIds.has(r.id))
      : scope.planId || scope.suiteId
        ? []
        : requirements;

  // Requirement coverage: requirements with ≥1 linked case or execution
  const reqCovered = scopedReqs.filter((req) => {
    const hasCase = scopedCases.some((c) => c.requirementIds.includes(req.id));
    const hasLink = links.some(
      (l) =>
        (l.sourceKind === "requirement" &&
          l.sourceId === req.id &&
          (l.targetKind === "case" || l.targetKind === "test_case")) ||
        (l.targetKind === "requirement" &&
          l.targetId === req.id &&
          (l.sourceKind === "case" || l.sourceKind === "test_case")),
    );
    const hasExec = manualExecs.some((e) =>
      scopedCases.some((c) => c.id === e.caseId && c.requirementIds.includes(req.id)),
    );
    return hasCase || hasLink || hasExec;
  });
  const reqSubject =
    scope.planId ?? scope.suiteId ?? scope.releaseLabel ?? ctx.tenantId;
  assertCoverageIntegrity(reqCovered.length, scopedReqs.length);
  results.push({
    kind: "requirement",
    subjectId: String(reqSubject),
    coveredCount: reqCovered.length,
    totalCount: scopedReqs.length,
    planId: scope.planId ? String(scope.planId) : undefined,
    suiteId: scope.suiteId,
  });

  // Plan coverage
  for (const plan of [...scopedPlans].sort((a, b) => a.id.localeCompare(b.id))) {
    const planSuites = suites.filter((s) => plan.suiteIds.includes(s.id));
    const planCases = cases.filter((c) =>
      c.suiteIds.some((sid) => plan.suiteIds.includes(sid)),
    );
    const covered = planCases.filter((c) =>
      manualExecs.some((e) => e.caseId === c.id),
    ).length;
    assertCoverageIntegrity(covered, planCases.length);
    results.push({
      kind: "plan",
      subjectId: plan.id,
      coveredCount: covered,
      totalCount: planCases.length,
      planId: plan.id,
    });
    void planSuites;
  }

  // Suite coverage
  for (const suite of [...scopedSuites].sort((a, b) => a.id.localeCompare(b.id))) {
    const suiteCases = cases.filter((c) => c.suiteIds.includes(suite.id));
    const covered = suiteCases.filter((c) =>
      manualExecs.some((e) => e.caseId === c.id),
    ).length;
    assertCoverageIntegrity(covered, suiteCases.length);
    results.push({
      kind: "suite",
      subjectId: suite.id,
      coveredCount: covered,
      totalCount: suiteCases.length,
      suiteId: suite.id,
      planId: scope.planId ? String(scope.planId) : undefined,
    });
  }

  // Case coverage (cases with ≥1 execution)
  {
    const covered = scopedCases.filter((c) =>
      manualExecs.some((e) => e.caseId === c.id),
    ).length;
    assertCoverageIntegrity(covered, scopedCases.length);
    results.push({
      kind: "case",
      subjectId: String(reqSubject),
      coveredCount: covered,
      totalCount: scopedCases.length,
      planId: scope.planId ? String(scope.planId) : undefined,
      suiteId: scope.suiteId,
    });
  }

  // Manual vs automation coverage
  {
    const caseIds = new Set(scopedCases.map((c) => c.id));
    const manualCovered = new Set(
      manualExecs.filter((e) => caseIds.has(e.caseId)).map((e) => e.caseId),
    ).size;
    assertCoverageIntegrity(manualCovered, scopedCases.length || 0);
    results.push({
      kind: "manual",
      subjectId: String(reqSubject),
      coveredCount: manualCovered,
      totalCount: scopedCases.length,
      planId: scope.planId ? String(scope.planId) : undefined,
    });
    const autoCovered = autoExecs.length;
    const autoTotal = Math.max(autoExecs.length, scopedCases.length);
    assertCoverageIntegrity(Math.min(autoCovered, autoTotal), autoTotal);
    results.push({
      kind: "automation",
      subjectId: String(reqSubject),
      coveredCount: Math.min(autoCovered, autoTotal),
      totalCount: autoTotal,
      planId: scope.planId ? String(scope.planId) : undefined,
    });
    results.push({
      kind: "execution",
      subjectId: String(reqSubject),
      coveredCount: manualCovered + Math.min(autoCovered, autoTotal),
      totalCount: scopedCases.length + autoTotal,
      planId: scope.planId ? String(scope.planId) : undefined,
    });
  }

  // Risk coverage
  const scopedRisks =
    scope.planId || scope.suiteId
      ? risks.filter((r) => r.requirementIds.some((rid) => scopedReqIds.has(rid)))
      : risks;
  const riskCovered = scopedRisks.filter((risk) => {
    const hasCase = scopedCases.some((c) =>
      c.requirementIds.some((rid) => risk.requirementIds.includes(rid)),
    );
    const hasLink = links.some(
      (l) =>
        (l.sourceId === risk.id && l.sourceKind === "risk") ||
        (l.targetId === risk.id && l.targetKind === "risk"),
    );
    return hasCase || hasLink;
  });
  assertCoverageIntegrity(riskCovered.length, scopedRisks.length);
  results.push({
    kind: "risk",
    subjectId: String(reqSubject),
    coveredCount: riskCovered.length,
    totalCount: scopedRisks.length,
    planId: scope.planId ? String(scope.planId) : undefined,
  });

  // Release label coverage (cases with any execution under release scope)
  if (scope.releaseLabel) {
    results.push({
      kind: "release",
      subjectId: scope.releaseLabel,
      coveredCount: scopedCases.filter((c) =>
        manualExecs.some((e) => e.caseId === c.id),
      ).length,
      totalCount: scopedCases.length,
    });
  }

  return results.sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.subjectId.localeCompare(b.subjectId),
  );
}

async function persistComputed(
  rt: ServiceRuntime,
  ctx: Parameters<CoverageService["recompute"]>[0],
  computed: readonly ComputedCoverage[],
): Promise<CoverageMetric[]> {
  const rctx = toRepositoryContext(ctx);
  const existing = (await rt.persistence.coverageRecords.list(rctx)).items;
  const out: CoverageMetric[] = [];

  for (const item of computed) {
    assertCoverageIntegrity(item.coveredCount, item.totalCount);
    const percentage = coveragePercentage(item.coveredCount, item.totalCount);
    const match = existing.find(
      (e) => e.kind === item.kind && e.subjectId === item.subjectId && !e.archivedAt,
    );
    const payload = {
      kind: item.kind,
      subjectId: item.subjectId,
      coveredCount: item.coveredCount,
      totalCount: item.totalCount,
      percentage,
      computedAt: rt.now(),
      planId: item.planId,
      suiteId: item.suiteId,
      requirementId: item.requirementId,
      riskId: item.riskId,
      organisationId: ctx.organisationId,
    };
    if (match) {
      const row = await rt.persistence.coverageRecords.update(
        rctx,
        match.id,
        match.revision,
        payload,
      );
      out.push(toDomain(row));
    } else {
      const row = await rt.persistence.coverageRecords.create(rctx, {
        ...payload,
        id: rt.id(),
      });
      out.push(toDomain(row));
    }
  }
  return out;
}

export function createCoverageService(rt: ServiceRuntime): CoverageService {
  return {
    async listMetrics(ctx) {
      const page = await rt.persistence.coverageRecords.list(toRepositoryContext(ctx));
      return page.items.map(toDomain);
    },
    async getMetric(ctx, id: CoverageMetricId) {
      return toDomain(
        requireFound(
          await rt.persistence.coverageRecords.get(toRepositoryContext(ctx), id),
          "coverage_record",
          id,
        ),
      );
    },
    async listMetricsByKind(ctx, kind: CoverageMetricKind) {
      const all = await this.listMetrics(ctx);
      return all.filter((m) => m.kind === kind);
    },
    async listMetricsForPlan(ctx, planId: TestPlanId) {
      const all = await this.listMetrics(ctx);
      return all.filter((m) => m.planId === planId || m.subjectId === planId);
    },
    async listMetricsForSubject(ctx, subjectId: string) {
      const all = await this.listMetrics(ctx);
      return all.filter((m) => m.subjectId === subjectId);
    },
    async recompute(ctx, scope: QualityScope) {
      const computed = await computeCoverageForScope(rt, ctx, scope);
      const metrics = await persistComputed(rt, ctx, computed);
      rt.events.record({
        eventType: "coverage.recomputed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          scope,
          metricIds: stableSortIds(metrics.map((m) => m.id)),
          count: metrics.length,
        },
      });
      return metrics;
    },
    async recomputeAll(ctx, scope?: QualityScope) {
      return this.recompute(ctx, scope ?? { tenantId: ctx.tenantId });
    },
    async requestRecompute(ctx, planId?: TestPlanId) {
      await this.recompute(ctx, {
        planId,
        tenantId: ctx.tenantId,
      });
      return { accepted: true as const, correlationId: ctx.correlationId };
    },
  };
}
