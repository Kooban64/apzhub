import type {
  QualityIntelligenceMetrics,
  QualityIntelligenceService,
  QualityScope,
  QualitySnapshot,
} from "@apzhub/testing-contracts";
import { asQualitySnapshotId } from "@apzhub/testing-contracts";
import type { QualitySnapshotRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import {
  computeDefectDensity,
  computeOpenDefectImpact,
  computeRate,
  countExecutionStatuses,
  coveragePercentage,
  severityDistribution,
} from "./calculations";

function toDomain(row: QualitySnapshotRecord): QualitySnapshot {
  return {
    id: asQualitySnapshotId(row.id),
    tenantId: row.tenantId,
    scope: row.scope as QualityScope,
    metrics: row.metrics as unknown as QualityIntelligenceMetrics,
    computedAt: row.computedAt,
    label: row.label,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

async function gatherMetrics(
  rt: ServiceRuntime,
  ctx: Parameters<QualityIntelligenceService["computeSnapshot"]>[0],
  scope?: QualityScope,
): Promise<QualityIntelligenceMetrics> {
  const rctx = toRepositoryContext(ctx);
  const manual = (await rt.persistence.manualExecutions.list(rctx)).items;
  const autoRuns = (await rt.persistence.automationRuns.list(rctx)).items;
  const cases = (await rt.persistence.testCases.list(rctx)).items;
  const evidence = (await rt.persistence.evidence.list(rctx)).items;
  const approvals = (await rt.persistence.approvals.list(rctx)).items;
  const coverage = (await rt.persistence.coverageRecords.list(rctx)).items;
  const defects = (await rt.persistence.defectLinks.list(rctx)).items;
  const risks = (await rt.persistence.risks.list(rctx)).items;

  const scopedManual = scope?.planId
    ? manual.filter((e) => {
        const c = cases.find((x) => x.id === e.caseId);
        return c !== undefined;
      })
    : manual;

  const combined = [
    ...scopedManual.map((e) => ({
      status: e.status,
      overallResult: e.overallResult,
    })),
    ...autoRuns.map((r) => ({ status: r.status, overallResult: r.status })),
  ];
  const counts = countExecutionStatuses(combined);
  const total = counts.total;

  const manualCount = scopedManual.length;
  const autoCount = autoRuns.length;
  const execTotal = manualCount + autoCount;

  const openDefects = defects.filter((d) =>
    ["open", "in_progress", "reopened"].includes(d.status),
  );
  const densityDenom = Math.max(cases.length, total, 1);

  const completedApprovals = approvals.filter(
    (a) => a.status === "approved" || a.status === "conditional",
  ).length;
  const evidenceLinked = evidence.filter((e) => e.executionId).length;
  const avgCoverage =
    coverage.length === 0
      ? 0
      : coverage.reduce((s, c) => s + c.percentage, 0) / coverage.length;

  const highRisks = risks.filter(
    (r) => r.level === "high" || r.level === "critical",
  ).length;
  const riskScore =
    risks.length === 0 ? 0 : coveragePercentage(highRisks, risks.length);

  return {
    passRate: computeRate(counts.pass, total),
    failRate: computeRate(counts.fail, total),
    blockedRate: computeRate(counts.blocked, total),
    skippedRate: computeRate(counts.skipped, total),
    automationRatio: computeRate(autoCount, execTotal),
    manualRatio: computeRate(manualCount, execTotal),
    evidenceCompleteness: computeRate(evidenceLinked, Math.max(manualCount, 1)),
    approvalCompleteness: computeRate(
      completedApprovals,
      Math.max(approvals.length, 1),
    ),
    executionCompleteness: computeRate(
      counts.pass + counts.fail + counts.blocked + counts.skipped,
      Math.max(cases.length, 1),
    ),
    coverageCompleteness: roundOrZero(avgCoverage),
    riskScore,
    defectDensity: computeDefectDensity(openDefects.length, densityDenom),
    severityDistribution: severityDistribution(defects),
    openDefectImpact: computeOpenDefectImpact(defects),
    totalExecutions: total,
    openDefectCount: openDefects.length,
  };
}

function roundOrZero(n: number): number {
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

export function createQualityIntelligenceService(
  rt: ServiceRuntime,
): QualityIntelligenceService {
  return {
    async computeSnapshot(ctx, scope?: QualityScope, label?: string) {
      const metrics = await gatherMetrics(rt, ctx, scope);
      const row = await rt.persistence.qualitySnapshots.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          scope: { ...(scope ?? { tenantId: ctx.tenantId }) },
          metrics: { ...metrics },
          computedAt: rt.now(),
          label,
          organisationId: ctx.organisationId,
        },
      );
      rt.events.record({
        eventType: "quality.snapshot_computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { snapshotId: row.id, label },
      });
      return toDomain(row);
    },
    async getSnapshot(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.qualitySnapshots.get(toRepositoryContext(ctx), id),
          "quality_snapshot",
          id,
        ),
      );
    },
    async listSnapshots(ctx) {
      const page = await rt.persistence.qualitySnapshots.list(toRepositoryContext(ctx));
      return page.items.map(toDomain);
    },
  };
}
