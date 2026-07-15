import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { QualityScope, QualitySummary } from "../domain";

/** Rollup quality summary for a plan / release / scope. */
export interface QualitySummaryService {
  summarize(
    ctx: ServiceRequestContext,
    scope?: QualityScope,
  ): Promise<QualitySummary>;
}
