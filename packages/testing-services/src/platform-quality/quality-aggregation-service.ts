import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  PlatformQualityAggregate,
  PlatformQualityAggregationInput,
  PlatformQualityAggregationService,
  PlatformReleaseReadinessVerdict,
  ProductQualityContribution,
} from "@apzhub/testing-contracts";

import type { Clock } from "../services/types";
import {
  combineReadinessVerdicts,
  qualityStatusToReadiness,
  worstQualityStatus,
} from "./status";

export interface QualityAggregationServiceDeps {
  readonly now: Clock;
}

function contributionReadiness(
  contribution: ProductQualityContribution,
): PlatformReleaseReadinessVerdict {
  const fromQuality = qualityStatusToReadiness(contribution.qualityStatus);
  if (!contribution.readiness) return fromQuality;

  let fromAssessment: PlatformReleaseReadinessVerdict;
  switch (contribution.readiness.suggestedStatus) {
    case "ready":
      fromAssessment = "READY";
      break;
    case "partially_ready":
      fromAssessment = "READY_WITH_WARNINGS";
      break;
    case "not_ready":
    case "blocked":
      fromAssessment = "NOT_READY";
      break;
  }
  return combineReadinessVerdicts([fromQuality, fromAssessment]);
}

export function createQualityAggregationService(
  deps: QualityAggregationServiceDeps,
): PlatformQualityAggregationService {
  const { now } = deps;

  return {
    async aggregate(
      ctx: ServiceRequestContext,
      input: PlatformQualityAggregationInput,
    ): Promise<PlatformQualityAggregate> {
      const contributions = input.contributions;
      const overallQualityStatus = worstQualityStatus(
        contributions.map((c) => c.qualityStatus),
      );
      const readinessVerdict = combineReadinessVerdicts(
        contributions.map(contributionReadiness),
      );

      const coverageLabels = contributions
        .filter((c) => c.coveragePercent !== undefined)
        .map((c) => `${c.productKey}:${c.coveragePercent}%`);
      const riskLabels = [
        ...new Set(contributions.flatMap((c) => c.riskLabels)),
      ];
      const certificationLabels = contributions
        .filter((c) => c.certificationRecordIds.length > 0)
        .map(
          (c) =>
            `${c.productKey}:certs:${c.certificationRecordIds.length}`,
        );
      const defectLabels = contributions
        .filter((c) => c.openIssueCount > 0)
        .map((c) => `${c.productKey}:open:${c.openIssueCount}`);

      return {
        tenantId: ctx.tenantId,
        productContributions: contributions,
        overallQualityStatus,
        coverageLabels,
        riskLabels,
        approvalLabels: [],
        defectLabels,
        automationLabels: [],
        manualExecutionLabels: [],
        readinessVerdict,
        certificationLabels,
        computedAt: now(),
        isDecision: false,
      };
    },
  };
}
