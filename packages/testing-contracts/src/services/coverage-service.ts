import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { CoverageMetric, QualityScope } from "../domain";
import type { CoverageMetricId, TestPlanId } from "../identifiers";
import type { CoverageMetricKind } from "../enums";

/** Derived coverage metrics — recomputation is deterministic and synchronous in-domain. */
export interface CoverageService {
  listMetrics(ctx: ServiceRequestContext): Promise<readonly CoverageMetric[]>;
  getMetric(
    ctx: ServiceRequestContext,
    id: CoverageMetricId,
  ): Promise<CoverageMetric>;
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
  /** Deterministic recompute for a single scope; persists CoverageRecord rows. */
  recompute(
    ctx: ServiceRequestContext,
    scope: QualityScope,
  ): Promise<readonly CoverageMetric[]>;
  /** Deterministic recompute across an expanded scope (plan / suite / release / tenant). */
  recomputeAll(
    ctx: ServiceRequestContext,
    scope?: QualityScope,
  ): Promise<readonly CoverageMetric[]>;
  /** Async-style acceptance stub for later workers — still deterministic when run. */
  requestRecompute(
    ctx: ServiceRequestContext,
    planId?: TestPlanId,
  ): Promise<{ readonly accepted: true; readonly correlationId: string }>;
}
