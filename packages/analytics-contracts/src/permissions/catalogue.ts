/**
 * Analytics Platform permission catalogue (APZHUB-PLATFORM-ANALYTICS-003).
 * Aligned with platform AuthZ — evaluation remains in Platform PermissionService.
 * This catalogue is the Analytics operation surface only.
 */

export const PLATFORM_ANALYTICS_PERMISSIONS = [
  "analytics.*",
  "analytics.view",
  "analytics.manage",
  "analytics.admin",
  "analytics.dashboard.view",
  "analytics.dataset.view",
  "analytics.kpi.view",
  "analytics.report.run",
  "analytics.saved.manage",
  "analytics.dashboard.share",
  "analytics.dashboard.embed",
] as const;

export type PlatformAnalyticsPermission =
  (typeof PLATFORM_ANALYTICS_PERMISSIONS)[number];

export const PLATFORM_ANALYTICS_PERMISSION_WILDCARD = "analytics.*" as const;

export function isPlatformAnalyticsPermission(value: string): boolean {
  return (PLATFORM_ANALYTICS_PERMISSIONS as readonly string[]).includes(value);
}

/** Named operations from Owner programme (human → permission key). */
export const ANALYTICS_PERMISSION_OPERATIONS = {
  viewDashboard: "analytics.dashboard.view",
  viewDataset: "analytics.dataset.view",
  viewKpi: "analytics.kpi.view",
  runReport: "analytics.report.run",
  manageSavedDashboards: "analytics.saved.manage",
  shareDashboard: "analytics.dashboard.share",
  embedDashboard: "analytics.dashboard.embed",
  administerAnalytics: "analytics.admin",
} as const;

export type AnalyticsPermissionOperationKey =
  keyof typeof ANALYTICS_PERMISSION_OPERATIONS;

export type AnalyticsPermissionOp =
  | "view"
  | "manage"
  | "admin"
  | "dashboard.view"
  | "dataset.view"
  | "kpi.view"
  | "report.run"
  | "saved.manage"
  | "dashboard.share"
  | "dashboard.embed";

export function hasAnalyticsPermission(
  permissions: readonly string[],
  op: AnalyticsPermissionOp,
): boolean {
  if (permissions.includes("analytics.*")) return true;
  if (
    op === "view" ||
    op === "dashboard.view" ||
    op === "dataset.view" ||
    op === "kpi.view"
  ) {
    if (permissions.includes("analytics.view")) return true;
  }
  if (
    op === "manage" ||
    op === "saved.manage" ||
    op === "dashboard.share" ||
    op === "dashboard.embed"
  ) {
    if (permissions.includes("analytics.manage")) return true;
  }
  if (op === "admin") {
    if (permissions.includes("analytics.admin")) return true;
  }
  return permissions.includes(`analytics.${op}`);
}

export function hasAnalyticsNamedOperation(
  permissions: readonly string[],
  named: AnalyticsPermissionOperationKey,
): boolean {
  const key = ANALYTICS_PERMISSION_OPERATIONS[named];
  if (permissions.includes("analytics.*")) return true;
  if (named === "administerAnalytics" && permissions.includes("analytics.admin")) {
    return true;
  }
  if (
    (named === "viewDashboard" || named === "viewDataset" || named === "viewKpi") &&
    permissions.includes("analytics.view")
  ) {
    return true;
  }
  if (
    (named === "manageSavedDashboards" ||
      named === "shareDashboard" ||
      named === "embedDashboard") &&
    permissions.includes("analytics.manage")
  ) {
    return true;
  }
  return permissions.includes(key);
}
