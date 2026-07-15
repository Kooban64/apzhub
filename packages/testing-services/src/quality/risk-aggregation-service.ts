import type {
  QualityScope,
  RiskAggregationBucket,
  RiskAggregationService,
  RiskAggregationSummary,
  RiskLevel,
  Severity,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import type { ServiceRuntime } from "../services/types";
import { stableSortIds } from "./calculations";

export function createRiskAggregationService(
  rt: ServiceRuntime,
): RiskAggregationService {
  return {
    async aggregate(ctx, scope?: QualityScope) {
      const rctx = toRepositoryContext(ctx);
      const risks = (await rt.persistence.risks.list(rctx)).items;
      const cases = (await rt.persistence.testCases.list(rctx)).items;
      const links = (await rt.persistence.traceabilityLinks.list(rctx)).items;

      const byLevelMap = new Map<string, number>();
      const bySeverityMap = new Map<string, number>();
      for (const risk of risks) {
        byLevelMap.set(risk.level, (byLevelMap.get(risk.level) ?? 0) + 1);
        const sev = risk.severity ?? "unspecified";
        bySeverityMap.set(sev, (bySeverityMap.get(sev) ?? 0) + 1);
      }

      const byLevel: RiskAggregationBucket[] = stableSortIds([
        ...byLevelMap.keys(),
      ]).map((key) => ({
        key,
        count: byLevelMap.get(key)!,
        level: key as RiskLevel,
      }));
      const bySeverity: RiskAggregationBucket[] = stableSortIds([
        ...bySeverityMap.keys(),
      ]).map((key) => ({
        key,
        count: bySeverityMap.get(key)!,
        severity: key === "unspecified" ? undefined : (key as Severity),
      }));

      const coverageGaps: string[] = [];
      for (const risk of [...risks].sort((a, b) => a.id.localeCompare(b.id))) {
        const hasCase = cases.some((c) =>
          c.requirementIds.some((rid) => risk.requirementIds.includes(rid)),
        );
        const hasLink = links.some(
          (l) =>
            (l.sourceId === risk.id && l.sourceKind === "risk") ||
            (l.targetId === risk.id && l.targetKind === "risk"),
        );
        if (!hasCase && !hasLink) {
          coverageGaps.push(`risk:${risk.id}`);
        }
      }

      // Optional plan/suite filter on gaps only when scope provided
      void scope;

      const summary: RiskAggregationSummary = {
        byLevel,
        bySeverity,
        coverageGaps,
        totalRisks: risks.length,
        uncoveredRiskCount: coverageGaps.length,
        computedAt: rt.now(),
      };
      rt.events.record({
        eventType: "risk.aggregated",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          totalRisks: summary.totalRisks,
          uncoveredRiskCount: summary.uncoveredRiskCount,
        },
      });
      return summary;
    },
  };
}
