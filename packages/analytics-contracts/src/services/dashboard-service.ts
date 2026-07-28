/**
 * DashboardService — catalogue / registry port (interfaces only).
 * APZHUB-PLATFORM-ANALYTICS-003 — no business logic.
 */

import type { AnalyticsRequestContext } from "../common/context";
import type {
  AnalyticsDashboard,
  CataloguePage,
  DashboardCatalogueQuery,
  DashboardCategory,
  DashboardPermission,
  DashboardSummary,
} from "../domain/analytics";
import type { AnalyticsDashboardId, DashboardPermissionId } from "../identifiers";
import type { AnalyticsLifecycleStatus } from "../enums/catalogue";

export type PublishDashboardInput = {
  readonly dashboardId: AnalyticsDashboardId;
};

export type SetDashboardStatusInput = {
  readonly dashboardId: AnalyticsDashboardId;
  readonly status: AnalyticsLifecycleStatus;
};

export type SetRoleVisibilityInput = {
  readonly permission: Omit<
    DashboardPermission,
    "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "revision"
  > & { readonly id?: DashboardPermissionId };
};

export type DashboardService = {
  readonly listCategories: (
    ctx: AnalyticsRequestContext,
  ) => Promise<readonly DashboardCategory[]>;
  readonly listCatalogue: (
    ctx: AnalyticsRequestContext,
    query?: DashboardCatalogueQuery,
  ) => Promise<CataloguePage<DashboardSummary>>;
  readonly getDashboard: (
    ctx: AnalyticsRequestContext,
    dashboardId: AnalyticsDashboardId,
  ) => Promise<AnalyticsDashboard>;
  readonly publish: (
    ctx: AnalyticsRequestContext,
    input: PublishDashboardInput,
  ) => Promise<AnalyticsDashboard>;
  readonly deprecate: (
    ctx: AnalyticsRequestContext,
    input: SetDashboardStatusInput,
  ) => Promise<AnalyticsDashboard>;
  readonly setRoleVisibility: (
    ctx: AnalyticsRequestContext,
    input: SetRoleVisibilityInput,
  ) => Promise<DashboardPermission>;
};
