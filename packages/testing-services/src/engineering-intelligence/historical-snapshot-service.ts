import type {
  HistoricalSnapshot,
  HistoricalSnapshotService,
  QualityIndicator,
} from "@apzhub/testing-contracts";
import { asEngineeringHistoricalSnapshotId } from "@apzhub/testing-contracts";
import type { EngineeringHistoricalSnapshotRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { createEngineeringAggregationService } from "./aggregation-service";
import { computeQualityScore, healthStatusFromScore } from "./calculations";
import { createEngineeringHealthService } from "./health-service";

function toDomain(row: EngineeringHistoricalSnapshotRecord): HistoricalSnapshot {
  return {
    id: asEngineeringHistoricalSnapshotId(row.id),
    tenantId: row.tenantId,
    scope: row.scope as HistoricalSnapshot["scope"],
    period: row.periodJson as unknown as HistoricalSnapshot["period"],
    qualityScore: row.qualityScore,
    engineeringHealthScore: row.engineeringHealthScore,
    indicators: row.indicatorsJson as readonly QualityIndicator[],
    metrics: row.metricsJson as Readonly<Record<string, number>>,
    sourceRefs: row.sourceRefsJson as HistoricalSnapshot["sourceRefs"],
    computedAt: row.computedAt,
    immutable: true,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createHistoricalSnapshotService(
  rt: ServiceRuntime,
): HistoricalSnapshotService {
  const aggregation = createEngineeringAggregationService(rt);
  const health = createEngineeringHealthService(rt);
  return {
    async capture(ctx, period, scope) {
      const inputs = await aggregation.gatherInputs(ctx, scope);
      const quality = computeQualityScore({
        id: rt.id(),
        scope: scope ?? { tenantId: ctx.tenantId },
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
        computedAt: rt.now(),
      });
      const assessed = await health.assess(ctx, scope);
      const indicators: QualityIndicator[] = [
        {
          kind: "quality",
          key: "quality_score",
          label: "Quality score",
          value: quality.score,
          direction: "unknown",
          reasons: [`score=${quality.score}`],
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
          kind: "risk",
          key: "risk",
          label: "Risk",
          value: assessed.riskScore,
          reasons: [`level=${assessed.risk.overallLevel}`],
        },
      ];
      const row = await rt.persistence.engineeringHistoricalSnapshots.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          scope: { ...(scope ?? { tenantId: ctx.tenantId }) },
          periodJson: { ...period },
          qualityScore: quality.score,
          engineeringHealthScore: assessed.overallScore,
          indicatorsJson: indicators,
          metricsJson: {
            coverage: inputs.coverage,
            automation: inputs.automation,
            manualExecution: inputs.manualExecution,
            failedTests: inputs.failedTests,
            openDefects: inputs.openDefects,
            certification: inputs.certification,
            approvals: inputs.approvals,
            releaseReadiness: inputs.releaseReadiness,
            stability: inputs.stability,
            pipelineHealth: inputs.pipelineHealth,
            risk: inputs.risk,
            velocity: inputs.velocity,
            leadTime: inputs.leadTime,
            healthStatusRank:
              healthStatusFromScore(assessed.overallScore) === "healthy"
                ? 4
                : healthStatusFromScore(assessed.overallScore) === "watch"
                  ? 3
                  : healthStatusFromScore(assessed.overallScore) === "at_risk"
                    ? 2
                    : 1,
          },
          sourceRefsJson: { ...inputs.sourceRefs },
          computedAt: rt.now(),
          immutable: true,
          organisationId: ctx.organisationId,
        },
      );
      // Also persist a quality summary for this capture
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
      rt.events.record({
        eventType: "engineering.historical_captured",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          snapshotId: row.id,
          periodKind: period.kind,
          qualityScore: quality.score,
        },
      });
      return toDomain(row);
    },
    async get(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.engineeringHistoricalSnapshots.get(
            toRepositoryContext(ctx),
            id,
          ),
          "engineering_historical_snapshot",
          id,
        ),
      );
    },
    async list(ctx) {
      return (
        await rt.persistence.engineeringHistoricalSnapshots.list(
          toRepositoryContext(ctx),
        )
      ).items.map(toDomain);
    },
  };
}
