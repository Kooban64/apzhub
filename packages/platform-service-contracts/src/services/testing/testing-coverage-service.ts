import type { ServiceRequestContext } from "../../common/context";
import type {
  CoverageMetric,
  CoverageMetricId,
  CoverageMetricKind,
  QualityScope,
  TestPlanId,
} from "@apzhub/testing-contracts";

/** Vendor-neutral testing coverage platform service for derived metrics. */
export interface TestingCoverageService {
  recompute(
    ctx: ServiceRequestContext,
    scope: QualityScope,
  ): Promise<readonly CoverageMetric[]>;
  recomputeAll(
    ctx: ServiceRequestContext,
    scope?: QualityScope,
  ): Promise<readonly CoverageMetric[]>;
  requestRecompute(
    ctx: ServiceRequestContext,
    planId?: TestPlanId,
  ): Promise<{ readonly accepted: true; readonly correlationId: string }>;
  listMetrics(ctx: ServiceRequestContext): Promise<readonly CoverageMetric[]>;
  getMetric(ctx: ServiceRequestContext, id: CoverageMetricId): Promise<CoverageMetric>;
  listMetricsByKind(
    ctx: ServiceRequestContext,
    kind: CoverageMetricKind,
  ): Promise<readonly CoverageMetric[]>;
  listMetricsForPlan(
    ctx: ServiceRequestContext,
    planId: TestPlanId,
  ): Promise<readonly CoverageMetric[]>;
  listMetricsForSubject(
    ctx: ServiceRequestContext,
    subjectId: string,
  ): Promise<readonly CoverageMetric[]>;
}
