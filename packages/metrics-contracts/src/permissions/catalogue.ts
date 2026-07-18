/**
 * Platform Metrics permissions (APZMETRICS-001).
 * Catalogue only — Gateway / Authorization wiring deferred to APZMETRICS-002.
 */

export const PLATFORM_METRICS_PERMISSIONS = [
  "metrics.*",
  "metrics.read",
  "metrics.manage",
  "metrics.kpi",
  "metrics.definition",
  "metrics.metadata",
  "metrics.classification",
  "metrics.retention",
] as const;

export type PlatformMetricsPermission = (typeof PLATFORM_METRICS_PERMISSIONS)[number];

export const PLATFORM_METRICS_PERMISSION_WILDCARD = "metrics.*" as const;

export function isPlatformMetricsPermission(value: string): boolean {
  return (PLATFORM_METRICS_PERMISSIONS as readonly string[]).includes(value);
}

export type MetricsPermissionOp =
  | "read"
  | "manage"
  | "kpi"
  | "definition"
  | "metadata"
  | "classification"
  | "retention";

export function hasMetricsPermission(
  permissions: readonly string[],
  op: MetricsPermissionOp,
): boolean {
  if (permissions.includes("metrics.*")) return true;
  return permissions.includes(`metrics.${op}`);
}
