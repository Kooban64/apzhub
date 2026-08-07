/**
 * UI-only Analytics permission helpers.
 * Server remains authoritative — these only hide/disable controls.
 *
 * APZ-ANALYTICS-NATIVE-001-N02: consume APZHUB session grants via hydration.
 * Never hardcode `analytics.*` as a UI default. Never map engine roles.
 *
 * Identity: questions & decisions (Enterprise Decision Support).
 * Presentation assets (datasets/reports) and operator surfaces stay below
 * the default product boundary (`analytics.admin` or explicit grants).
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
  const parts = required.split(".");
  if (parts.length >= 3) {
    const midWildcard = `${parts[0]}.${parts[1]}.*`;
    if (granted.has(midWildcard)) return true;
  }
  return false;
}

export function hasAnalyticsPermission(
  source: AnalyticsPermissionSource,
  permission: string,
): boolean {
  return matches(asSet(source), permission);
}

/** Default product identity — enter through insight / questions. */
export function canViewAnalytics(source: AnalyticsPermissionSource): boolean {
  return (
    hasAnalyticsPermission(source, "analytics.view") ||
    hasAnalyticsPermission(source, "analytics.admin")
  );
}

/** @deprecated Prefer canViewAnalytics — dashboard is presentation, not identity. */
export function canViewAnalyticsDashboards(source: AnalyticsPermissionSource): boolean {
  return (
    canViewAnalytics(source) ||
    hasAnalyticsPermission(source, "analytics.dashboard.view")
  );
}

/** Operator identity — presentation assets & operator tools below boundary. */
export function canAdminAnalytics(source: AnalyticsPermissionSource): boolean {
  return hasAnalyticsPermission(source, "analytics.admin");
}

/** Define KPIs and record decision timeline (Wave A). */
export function canManageDecisionIntelligence(
  source: AnalyticsPermissionSource,
): boolean {
  return (
    canAdminAnalytics(source) || hasAnalyticsPermission(source, "analytics.manage")
  );
}

export function canViewAnalyticsDatasets(source: AnalyticsPermissionSource): boolean {
  return (
    canAdminAnalytics(source) ||
    hasAnalyticsPermission(source, "analytics.dataset.view")
  );
}

export function canViewAnalyticsReports(source: AnalyticsPermissionSource): boolean {
  return (
    canAdminAnalytics(source) || hasAnalyticsPermission(source, "analytics.report.run")
  );
}

export function canManageAnalyticsSaved(source: AnalyticsPermissionSource): boolean {
  return (
    hasAnalyticsPermission(source, "analytics.saved.manage") ||
    hasAnalyticsPermission(source, "analytics.manage") ||
    canAdminAnalytics(source)
  );
}

export function canViewAnalyticsHealth(source: AnalyticsPermissionSource): boolean {
  return canAdminAnalytics(source);
}
