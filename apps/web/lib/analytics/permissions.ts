/**
 * UI-only Analytics permission helpers.
 * Server remains authoritative — these only hide/disable controls.
 */

export type AnalyticsPermissionSource =
  readonly string[] | ReadonlySet<string> | undefined | null;

function asSet(source: AnalyticsPermissionSource): ReadonlySet<string> {
  if (!source) return new Set();
  if (source instanceof Set) return source;
  return new Set(source);
}

function matches(granted: ReadonlySet<string>, required: string): boolean {
  if (granted.has("*") || granted.has("analytics.*")) return true;
  if (granted.has(required)) return true;
  if (granted.has("analytics.view")) {
    return (
      required === "analytics.dashboard.view" ||
      required === "analytics.dataset.view" ||
      required === "analytics.kpi.view" ||
      required === "analytics.view"
    );
  }
  if (granted.has("analytics.manage")) {
    return (
      required === "analytics.saved.manage" ||
      required === "analytics.dashboard.share" ||
      required === "analytics.dashboard.embed" ||
      required === "analytics.manage"
    );
  }
  return false;
}

export function hasAnalyticsPermission(
  source: AnalyticsPermissionSource,
  permission: string,
): boolean {
  return matches(asSet(source), permission);
}

export function canViewAnalyticsDashboards(source: AnalyticsPermissionSource): boolean {
  return (
    hasAnalyticsPermission(source, "analytics.dashboard.view") ||
    hasAnalyticsPermission(source, "analytics.view")
  );
}

export function canViewAnalyticsDatasets(source: AnalyticsPermissionSource): boolean {
  return (
    hasAnalyticsPermission(source, "analytics.dataset.view") ||
    hasAnalyticsPermission(source, "analytics.view")
  );
}

export function canViewAnalyticsReports(source: AnalyticsPermissionSource): boolean {
  return (
    hasAnalyticsPermission(source, "analytics.report.run") ||
    hasAnalyticsPermission(source, "analytics.view")
  );
}

export function canManageAnalyticsSaved(source: AnalyticsPermissionSource): boolean {
  return (
    hasAnalyticsPermission(source, "analytics.saved.manage") ||
    hasAnalyticsPermission(source, "analytics.manage")
  );
}
