/**
 * Illustrative contract shapes for documentation / tests.
 * Not runtime fixtures for Platform Services.
 */

import type { AnalyticsRequestContext } from "../common/context";
import type {
  AnalyticsCapability,
  AnalyticsDashboard,
  AnalyticsDataset,
  AnalyticsHealth,
  DashboardSummary,
  SavedDashboard,
} from "../domain/analytics";
import {
  asAnalyticsCapabilityId,
  asAnalyticsDashboardId,
  asAnalyticsDatasetId,
  asDashboardCategoryId,
  asSavedDashboardId,
} from "../identifiers";

export const EXAMPLE_ANALYTICS_CONTEXT: AnalyticsRequestContext = {
  tenantId: "tenant_example",
  organisationId: "org_example",
  userId: "user_example",
  correlationId: "corr_analytics_example",
  permissions: ["analytics.view", "analytics.dashboard.view"],
};

export const EXAMPLE_DASHBOARD_SUMMARY: DashboardSummary = {
  id: asAnalyticsDashboardId("dash_exec_overview"),
  tenantId: "tenant_example",
  title: "Executive Overview",
  description: "Cross-product executive scorecards",
  categoryId: asDashboardCategoryId("cat_executive"),
  status: "published",
  tags: ["executive"],
  provider: { providerId: "analytics-provider", providerRef: "prov_ref_001" },
  updatedAt: "2026-07-19T10:00:00.000Z",
};

export const EXAMPLE_ANALYTICS_DASHBOARD: AnalyticsDashboard = {
  ...EXAMPLE_DASHBOARD_SUMMARY,
  organisationId: "org_example",
  createdAt: "2026-07-01T10:00:00.000Z",
  updatedAt: "2026-07-19T10:00:00.000Z",
  createdBy: "user_example",
  updatedBy: "user_example",
  revision: 1,
  filters: [],
  parameters: [],
  widgetIds: [],
};

export const EXAMPLE_DATASET: AnalyticsDataset = {
  id: asAnalyticsDatasetId("ds_projects_throughput"),
  tenantId: "tenant_example",
  key: "projects.throughput",
  name: "Projects Throughput",
  status: "published",
  provider: { providerId: "analytics-provider", providerRef: "prov_ds_001" },
  dimensions: ["project", "week"],
  measures: ["completed_issues"],
  createdAt: "2026-07-01T10:00:00.000Z",
  updatedAt: "2026-07-19T10:00:00.000Z",
  createdBy: "user_example",
  updatedBy: "user_example",
  revision: 1,
};

export const EXAMPLE_SAVED_DASHBOARD: SavedDashboard = {
  id: asSavedDashboardId("saved_exec_q3"),
  tenantId: "tenant_example",
  ownerPrincipalId: "user_example",
  dashboardId: asAnalyticsDashboardId("dash_exec_overview"),
  name: "My Q3 Executive",
  filterSnapshot: { period: "2026-Q3" },
  status: "published",
  createdAt: "2026-07-10T10:00:00.000Z",
  updatedAt: "2026-07-19T10:00:00.000Z",
  createdBy: "user_example",
  updatedBy: "user_example",
  revision: 1,
};

export const EXAMPLE_HEALTH: AnalyticsHealth = {
  status: "healthy",
  checkedAt: "2026-07-19T12:00:00.000Z",
  providerStatuses: [
    { providerId: "analytics-provider", status: "healthy", message: "ok" },
  ],
};

export const EXAMPLE_CAPABILITY: AnalyticsCapability = {
  id: asAnalyticsCapabilityId("cap_dashboard_embed"),
  key: "dashboard.embed",
  name: "Dashboard Embedding",
  support: "planned",
  notes: ["Token issuance reserved for Analytics Platform Services"],
};
