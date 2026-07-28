/**
 * SavedDashboardService — saved view port (interfaces only).
 * APZHUB-PLATFORM-ANALYTICS-003 — no business logic.
 */

import type { AnalyticsRequestContext } from "../common/context";
import type { SavedDashboard } from "../domain/analytics";
import type { SavedDashboardId } from "../identifiers";

export type SaveDashboardInput = {
  readonly saved: Omit<
    SavedDashboard,
    "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "revision"
  > &
    Partial<
      Pick<
        SavedDashboard,
        "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "revision"
      >
    >;
};

export type SavedDashboardService = {
  readonly listSaved: (
    ctx: AnalyticsRequestContext,
  ) => Promise<readonly SavedDashboard[]>;
  readonly save: (
    ctx: AnalyticsRequestContext,
    input: SaveDashboardInput,
  ) => Promise<SavedDashboard>;
  readonly archive: (
    ctx: AnalyticsRequestContext,
    savedDashboardId: SavedDashboardId,
  ) => Promise<SavedDashboard>;
};
