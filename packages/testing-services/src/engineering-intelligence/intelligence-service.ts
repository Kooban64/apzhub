import type {
  EngineeringIntelligenceService,
  EngineeringSnapshot,
  QualityIndicator,
  QualityScoreWeights,
  TrendSeries,
  TrendSeriesKind,
} from "@apzhub/testing-contracts";
import { asEngineeringSnapshotId } from "@apzhub/testing-contracts";
import type { EngineeringSnapshotRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { createEngineeringAggregationService } from "./aggregation-service";
import { computeQualityScore } from "./calculations";
import { createEngineeringHealthService } from "./health-service";
import { createEngineeringRiskService } from "./risk-service";
import { createTrendEngineService } from "./trend-engine-service";

const SNAPSHOT_TREND_KINDS: readonly TrendSeriesKind[] = [
  "quality",
  "coverage",
  "automation",
  "defect",
  "release",
  "certification",
  "stability",
  "risk",
];

function toDomain(row: EngineeringSnapshotRecord): EngineeringSnapshot {
  return {
    id: asEngineeringSnapshotId(row.id),
    tenantId: row.tenantId,
    scope: row.scope as EngineeringSnapshot["scope"],
    qualityScore: row.qualityScoreJson as unknown as EngineeringSnapshot["qualityScore"],
    health: row.healthJson as unknown as EngineeringSnapshot["health"],
    risk: row.riskJson as unknown as EngineeringSnapshot["risk"],
    indicators: row.indicatorsJson as readonly QualityIndicator[],
    trends: row.trendsJson as readonly TrendSeries[],
    computedAt: row.computedAt,
    label: row.label,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createEngineeringIntelligenceService(
  rt: ServiceRuntime,
): EngineeringIntelligenceService {
  const aggregation = createEngineeringAggregationService(rt);
  const healthSvc = createEngineeringHealthService(rt);
  const riskSvc = createEngineeringRiskService(rt);
  const trends = createTrendEngineService(rt);

  return {
    async computeSnapshot(ctx, scope, label, weights?: QualityScoreWeights) {
      const inputs = await aggregation.gatherInputs(ctx, scope);
      const quality = computeQualityScore({
        id: rt.id(),
        scope: scope ?? { tenantId: ctx.tenantId, organisationId: ctx.organisationId },
        inputs: {
          coverage: inputs.coverage,
          automation: inputs.automation,
          manualExecution: inputs.manualExecution,
          failedTests: inputs.failedTests,
          openDefects: inputs.openDefects,
          certification: inputs.certification,
          approvals: inputs.approvals,
          releaseReadiness: inputs.releaseReadiness,
        },
        weights,
        computedAt: rt.now(),
      });
      rt.events.record({
        eventType: "quality.score_computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { score: quality.score },
      });
      const health = await healthSvc.assess(ctx, scope, weights);
      const risk = await riskSvc.aggregate(ctx, inputs);
      const trendSeries: TrendSeries[] = [];
      for (const kind of SNAPSHOT_TREND_KINDS) {
        trendSeries.push(await trends.buildSeries(ctx, kind, scope, "weekly"));
      }
      const indicators: QualityIndicator[] = [
        {
          kind: "quality",
          key: "quality_score",
          label: "Quality score",
          value: quality.score,
          reasons: quality.components.map(
            (c) => `${c.key}:${c.contribution}`,
          ),
        },
        {
          kind: "coverage",
          key: "coverage",
          label: "Coverage",
          value: inputs.coverage,
          reasons: [],
        },
        {
          kind: "automation",
          key: "automation",
          label: "Automation",
          value: inputs.automation,
          reasons: [],
        },
        {
          kind: "certification",
          key: "certification",
          label: "Certification",
          value: inputs.certification,
          reasons: [],
        },
        {
          kind: "release",
          key: "release_readiness",
          label: "Release readiness",
          value: inputs.releaseReadiness,
          reasons: [],
        },
        {
          kind: "pipeline",
          key: "pipeline_health",
          label: "Pipeline health",
          value: inputs.pipelineHealth,
          reasons: [],
        },
        {
          kind: "risk",
          key: "risk",
          label: "Risk",
          value: risk.overallScore,
          reasons: risk.factors.map((f) => `${f.key}:${f.level}`),
        },
      ];

      await rt.persistence.engineeringQualitySummaries.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          scope: { ...(scope ?? { tenantId: ctx.tenantId }) },
          qualityScoreJson: { ...quality },
          indicatorsJson: indicators,
          computedAt: rt.now(),
          organisationId: ctx.organisationId,
        },
      );

      const row = await rt.persistence.engineeringSnapshots.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          scope: { ...(scope ?? { tenantId: ctx.tenantId }) },
          qualityScoreJson: { ...quality },
          healthJson: { ...health },
          riskJson: { ...risk },
          indicatorsJson: indicators,
          trendsJson: trendSeries,
          computedAt: rt.now(),
          label,
          organisationId: ctx.organisationId,
        },
      );
      rt.events.record({
        eventType: "engineering.snapshot_computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { snapshotId: row.id, label, score: quality.score },
      });
      return toDomain(row);
    },
    async getSnapshot(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.engineeringSnapshots.get(
            toRepositoryContext(ctx),
            id,
          ),
          "engineering_snapshot",
          id,
        ),
      );
    },
    async listSnapshots(ctx) {
      return (
        await rt.persistence.engineeringSnapshots.list(toRepositoryContext(ctx))
      ).items.map(toDomain);
    },
  };
}
