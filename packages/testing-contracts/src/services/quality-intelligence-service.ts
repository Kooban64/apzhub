import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { QualityScope, QualitySnapshot } from "../domain";

/** Computes deterministic quality intelligence snapshots. */
export interface QualityIntelligenceService {
  computeSnapshot(
    ctx: ServiceRequestContext,
    scope?: QualityScope,
    label?: string,
  ): Promise<QualitySnapshot>;
  getSnapshot(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QualitySnapshot>;
  listSnapshots(ctx: ServiceRequestContext): Promise<readonly QualitySnapshot[]>;
}
