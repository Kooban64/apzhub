import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { QualityTrendComparison } from "../domain";

/** Compares two quality windows/snapshots — metadata trends only, no prediction. */
export interface QualityTrendService {
  compareSnapshots(
    ctx: ServiceRequestContext,
    baselineSnapshotId: string,
    currentSnapshotId: string,
  ): Promise<QualityTrendComparison>;
  compareWindows(
    ctx: ServiceRequestContext,
    baseline: {
      readonly label: string;
      readonly metrics: Readonly<Record<string, number>>;
    },
    current: {
      readonly label: string;
      readonly metrics: Readonly<Record<string, number>>;
    },
  ): Promise<QualityTrendComparison>;
}
