import type {
  AnalyticsCapability,
  AnalyticsDashboard,
  AnalyticsDataset,
  AnalyticsHealth,
  AnalyticsReport,
  AnalyticsRequestContext,
  CataloguePage,
  DashboardCatalogueQuery,
  DashboardCategory,
  DashboardEmbedding,
  DashboardPermission,
  DashboardSummary,
  OpenDashboardRequest,
  OpenDashboardResult,
  SavedDashboard,
} from "@apzhub/analytics-contracts";
import type {
  AnalyticsDashboardId,
  AnalyticsDatasetId,
  AnalyticsReportId,
  DashboardCategoryId,
  DashboardPermissionId,
  SavedDashboardId,
} from "@apzhub/analytics-contracts";

/** Provider ops — health, readiness, capabilities (backed by Metabase adapter). */
export interface AnalyticsOpsProvider {
  readonly providerId: string;
  getHealth(ctx: AnalyticsRequestContext): Promise<AnalyticsHealth>;
  getReadiness(ctx: AnalyticsRequestContext): Promise<{
    readonly readiness: "ready" | "ready_with_limitations" | "not_ready";
    readonly reasons: readonly string[];
  }>;
  listProviderCapabilities(
    ctx: AnalyticsRequestContext,
  ): Promise<readonly AnalyticsCapability[]>;
}

/** Platform-owned Analytics registry (metadata SoR — not engine visuals). */
export interface AnalyticsRegistryProvider {
  listCategories(ctx: AnalyticsRequestContext): Promise<readonly DashboardCategory[]>;
  listCatalogue(
    ctx: AnalyticsRequestContext,
    query?: DashboardCatalogueQuery,
  ): Promise<CataloguePage<DashboardSummary>>;
  getDashboard(
    ctx: AnalyticsRequestContext,
    dashboardId: AnalyticsDashboardId,
  ): Promise<AnalyticsDashboard>;
  publishDashboard(
    ctx: AnalyticsRequestContext,
    dashboardId: AnalyticsDashboardId,
  ): Promise<AnalyticsDashboard>;
  deprecateDashboard(
    ctx: AnalyticsRequestContext,
    dashboardId: AnalyticsDashboardId,
  ): Promise<AnalyticsDashboard>;
  setRoleVisibility(
    ctx: AnalyticsRequestContext,
    permission: DashboardPermission,
  ): Promise<DashboardPermission>;
  listPermissionsForDashboard(
    ctx: AnalyticsRequestContext,
    dashboardId: AnalyticsDashboardId,
  ): Promise<readonly DashboardPermission[]>;

  listDatasets(ctx: AnalyticsRequestContext): Promise<readonly AnalyticsDataset[]>;
  getDataset(
    ctx: AnalyticsRequestContext,
    datasetId: AnalyticsDatasetId,
  ): Promise<AnalyticsDataset>;
  upsertDataset(
    ctx: AnalyticsRequestContext,
    dataset: AnalyticsDataset,
  ): Promise<AnalyticsDataset>;

  listReports(ctx: AnalyticsRequestContext): Promise<readonly AnalyticsReport[]>;
  getReport(
    ctx: AnalyticsRequestContext,
    reportId: AnalyticsReportId,
  ): Promise<AnalyticsReport>;

  listSaved(ctx: AnalyticsRequestContext): Promise<readonly SavedDashboard[]>;
  save(ctx: AnalyticsRequestContext, saved: SavedDashboard): Promise<SavedDashboard>;
  archiveSaved(
    ctx: AnalyticsRequestContext,
    savedDashboardId: SavedDashboardId,
  ): Promise<SavedDashboard>;

  /** Optional embed session issuance — may return undefined when planned-only. */
  issueEmbed?(
    ctx: AnalyticsRequestContext,
    request: OpenDashboardRequest,
  ): Promise<DashboardEmbedding | undefined>;
}

export type {
  AnalyticsDashboardId,
  AnalyticsDatasetId,
  AnalyticsReportId,
  DashboardCategoryId,
  DashboardPermissionId,
  SavedDashboardId,
  OpenDashboardResult,
};
