import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  PlatformDashboardService,
  PlatformQualityDashboardSnapshot,
  PlatformQualityStatus,
  PlatformReleaseReadinessVerdict,
} from "@apzhub/testing-contracts";

import type { Clock } from "../services/types";

export interface DashboardServiceDeps {
  readonly now: Clock;
}

export function createPlatformDashboardService(
  deps: DashboardServiceDeps,
): PlatformDashboardService {
  const { now } = deps;

  return {
    async snapshot(
      ctx: ServiceRequestContext,
      input: Parameters<PlatformDashboardService["snapshot"]>[1],
    ): Promise<PlatformQualityDashboardSnapshot> {
      const overallHealth: PlatformQualityStatus =
        input.quality?.overallQualityStatus ?? "unknown";
      const releaseReadiness: PlatformReleaseReadinessVerdict =
        input.readiness?.verdict ?? input.quality?.readinessVerdict ?? "NOT_READY";

      return {
        tenantId: ctx.tenantId,
        overallHealth,
        qualityScoreLabel: `overall:${overallHealth}`,
        certificationSummary:
          input.certifications?.overallLabel ?? "no_certification_data",
        releaseReadiness,
        riskOverview: input.quality?.riskLabels ?? input.readiness?.riskLabels ?? [],
        dependencyHealth: input.dependencyHealth ?? [],
        recentRegressions: input.recentRegressions ?? [],
        manualTestingLabel: input.quality?.manualExecutionLabels[0] ?? "manual:n/a",
        automationLabel: input.quality?.automationLabels[0] ?? "automation:n/a",
        defectsLabel: input.quality?.defectLabels[0] ?? "defects:n/a",
        coverageLabel: input.quality?.coverageLabels[0] ?? "coverage:n/a",
        computedAt: now(),
        isChartPayload: false,
      };
    },
  };
}
