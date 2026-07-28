import type { AnalyticsDashboardListParams } from "./types";

export const analyticsQueryKeys = {
  all: ["analytics"] as const,
  dashboards: (params: AnalyticsDashboardListParams = {}) =>
    [...analyticsQueryKeys.all, "dashboards", params] as const,
  dashboard: (dashboardId: string) =>
    [...analyticsQueryKeys.all, "dashboard", dashboardId] as const,
  categories: () => [...analyticsQueryKeys.all, "categories"] as const,
  datasets: () => [...analyticsQueryKeys.all, "datasets"] as const,
  reports: () => [...analyticsQueryKeys.all, "reports"] as const,
  saved: () => [...analyticsQueryKeys.all, "saved"] as const,
  health: () => [...analyticsQueryKeys.all, "health"] as const,
  readiness: () => [...analyticsQueryKeys.all, "readiness"] as const,
  capabilities: () => [...analyticsQueryKeys.all, "capabilities"] as const,
  search: (q: string) => [...analyticsQueryKeys.all, "search", q] as const,
};
