/**
 * Platform Observability permissions (APZOBSERVE-001).
 * Catalogue only — Gateway / Authorization wiring deferred to APZOBSERVE-002.
 */

export const PLATFORM_OBSERVE_PERMISSIONS = [
  "observe.*",
  "observe.read",
  "observe.manage",
  "observe.health",
  "observe.metrics",
  "observe.logs",
  "observe.traces",
  "observe.alerts",
  "observe.diagnostics",
] as const;

export type PlatformObservePermission =
  (typeof PLATFORM_OBSERVE_PERMISSIONS)[number];

export const PLATFORM_OBSERVE_PERMISSION_WILDCARD = "observe.*" as const;

export function isPlatformObservePermission(value: string): boolean {
  return (PLATFORM_OBSERVE_PERMISSIONS as readonly string[]).includes(value);
}

export type ObservePermissionOp =
  | "read"
  | "manage"
  | "health"
  | "metrics"
  | "logs"
  | "traces"
  | "alerts"
  | "diagnostics";

export function hasObservePermission(
  permissions: readonly string[],
  op: ObservePermissionOp,
): boolean {
  if (permissions.includes("observe.*")) return true;
  return permissions.includes(`observe.${op}`);
}
