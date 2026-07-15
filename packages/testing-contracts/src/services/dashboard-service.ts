import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { DashboardSnapshot } from "../domain";
import type { DashboardSnapshotId, TestPlanId } from "../identifiers";

/** Dashboard aggregate / snapshot contract — derived data only. */
export interface DashboardService {
  getCurrentSnapshot(ctx: ServiceRequestContext): Promise<DashboardSnapshot>;
  getSnapshot(
    ctx: ServiceRequestContext,
    id: DashboardSnapshotId,
  ): Promise<DashboardSnapshot>;
  listRecentSnapshots(
    ctx: ServiceRequestContext,
    limit?: number,
  ): Promise<readonly DashboardSnapshot[]>;
  getPlanSnapshot(
    ctx: ServiceRequestContext,
    planId: TestPlanId,
  ): Promise<DashboardSnapshot>;
  refreshSnapshot(
    ctx: ServiceRequestContext,
  ): Promise<{ readonly accepted: true; readonly correlationId: string }>;
}
