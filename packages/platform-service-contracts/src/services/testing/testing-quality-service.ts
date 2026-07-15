import type { ServiceRequestContext } from "../../common/context";
import type {
  QualityScope,
  QualitySnapshot,
  QualitySummary,
  QualityTrendComparison,
} from "@apzhub/testing-contracts";

/** Vendor-neutral testing quality intelligence platform service. */
export interface TestingQualityService {
  summarize(ctx: ServiceRequestContext, scope?: QualityScope): Promise<QualitySummary>;
  getSnapshot(ctx: ServiceRequestContext, id: string): Promise<QualitySnapshot>;
  listSnapshots(ctx: ServiceRequestContext): Promise<readonly QualitySnapshot[]>;
  computeSnapshot(
    ctx: ServiceRequestContext,
    scope?: QualityScope,
    label?: string,
  ): Promise<QualitySnapshot>;
  compareSnapshots(
    ctx: ServiceRequestContext,
    baselineSnapshotId: string,
    currentSnapshotId: string,
  ): Promise<QualityTrendComparison>;
  compareWindows(
    ctx: ServiceRequestContext,
    baseline: { readonly label: string; readonly metrics: Readonly<Record<string, number>> },
    current: { readonly label: string; readonly metrics: Readonly<Record<string, number>> },
  ): Promise<QualityTrendComparison>;
}
