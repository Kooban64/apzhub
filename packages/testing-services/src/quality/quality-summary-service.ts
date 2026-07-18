import type {
  DefectStatus,
  Priority,
  QualityScope,
  QualitySummary,
  QualitySummaryService,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import type { ServiceRuntime } from "../services/types";
import { createCoverageService } from "./coverage-service";
import { createQualityIntelligenceService } from "./quality-intelligence-service";
import { createQualityReleaseReadinessService } from "./release-readiness-service";
import { createRiskAggregationService } from "./risk-aggregation-service";
import { asTestPlanId } from "@apzhub/testing-contracts";

export function createQualitySummaryService(rt: ServiceRuntime): QualitySummaryService {
  const intelligence = createQualityIntelligenceService(rt);
  const coverage = createCoverageService(rt);
  const readiness = createQualityReleaseReadinessService(rt);
  const risks = createRiskAggregationService(rt);

  return {
    async summarize(ctx, scope?: QualityScope) {
      const resolvedScope = scope ?? { tenantId: ctx.tenantId };
      const snapshot = await intelligence.computeSnapshot(ctx, resolvedScope);
      const coverageMetrics = await coverage.recompute(ctx, resolvedScope);
      const riskAggregation = await risks.aggregate(ctx, resolvedScope);

      let readinessAssessment;
      if (resolvedScope.planId) {
        readinessAssessment = await readiness.assessForPlan?.(
          ctx,
          asTestPlanId(String(resolvedScope.planId)),
        );
      } else if (resolvedScope.releaseLabel) {
        readinessAssessment = await readiness.assessForRelease?.(
          ctx,
          resolvedScope.releaseLabel,
        );
      }

      const defects = (await rt.persistence.defectLinks.list(toRepositoryContext(ctx)))
        .items;
      const openDefectsByStatus: Partial<Record<DefectStatus, number>> = {};
      const openDefectsByPriority: Partial<Record<Priority, number>> = {};
      for (const d of defects) {
        if (!["open", "in_progress", "reopened"].includes(d.status)) continue;
        const st = d.status as DefectStatus;
        openDefectsByStatus[st] = (openDefectsByStatus[st] ?? 0) + 1;
        if (d.priority) {
          const p = d.priority as Priority;
          openDefectsByPriority[p] = (openDefectsByPriority[p] ?? 0) + 1;
        }
      }

      const summary: QualitySummary = {
        scope: resolvedScope,
        snapshot,
        coverageMetrics,
        readiness: readinessAssessment,
        riskAggregation,
        openDefectsByStatus,
        openDefectsByPriority,
        computedAt: rt.now(),
      };
      rt.events.record({
        eventType: "quality.summary_computed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { scope: resolvedScope, snapshotId: snapshot.id },
      });
      return summary;
    },
  };
}
