import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { QualityScope, RiskAggregationSummary } from "../domain";

/** Aggregates risk by level/severity and coverage gaps. */
export interface RiskAggregationService {
  aggregate(
    ctx: ServiceRequestContext,
    scope?: QualityScope,
  ): Promise<RiskAggregationSummary>;
}
