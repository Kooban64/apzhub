/**
 * Analytics permission assertion port (interfaces only).
 * Delegates evaluation to platform AuthZ / PermissionService.
 * Named AnalyticsPermissionService to avoid collision with IAM PermissionService.
 * Owner programme "PermissionService" maps to this analytics-scoped port.
 * APZHUB-PLATFORM-ANALYTICS-003 — no business logic.
 */

import type { AnalyticsRequestContext } from "../common/context";
import type { AnalyticsDashboardId, AnalyticsDatasetId } from "../identifiers";
import type { AnalyticsPermissionOperationKey } from "../permissions/catalogue";

export type AnalyticsPermissionService = {
  readonly assertCanViewDashboard: (
    ctx: AnalyticsRequestContext,
    dashboardId: AnalyticsDashboardId,
  ) => Promise<void>;
  readonly assertCanViewDataset: (
    ctx: AnalyticsRequestContext,
    datasetId: AnalyticsDatasetId,
  ) => Promise<void>;
  readonly assertCanViewKpi: (ctx: AnalyticsRequestContext) => Promise<void>;
  readonly assertCanRunReport: (ctx: AnalyticsRequestContext) => Promise<void>;
  readonly assertCanManageSaved: (ctx: AnalyticsRequestContext) => Promise<void>;
  readonly assertCanShareDashboard: (
    ctx: AnalyticsRequestContext,
    dashboardId: AnalyticsDashboardId,
  ) => Promise<void>;
  readonly assertCanEmbedDashboard: (
    ctx: AnalyticsRequestContext,
    dashboardId: AnalyticsDashboardId,
  ) => Promise<void>;
  readonly assertCanAdminister: (ctx: AnalyticsRequestContext) => Promise<void>;
  readonly assertOperation: (
    ctx: AnalyticsRequestContext,
    operation: AnalyticsPermissionOperationKey,
  ) => Promise<void>;
};

/** Owner programme alias — analytics-scoped only. */
export type PermissionService = AnalyticsPermissionService;
