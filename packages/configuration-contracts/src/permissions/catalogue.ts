/**
 * Platform Configuration permissions (APZCONFIG-001).
 * No UI — catalogue for later Gateway / Authorization wiring.
 */

export const PLATFORM_CONFIGURATION_PERMISSIONS = [
  "configuration.*",
  "configuration.read",
  "configuration.manage",
  "configuration.version",
  "configuration.validation",
  "configuration.audit",
] as const;

export type PlatformConfigurationPermission =
  (typeof PLATFORM_CONFIGURATION_PERMISSIONS)[number];

export const PLATFORM_CONFIGURATION_PERMISSION_WILDCARD = "configuration.*" as const;

export function isPlatformConfigurationPermission(value: string): boolean {
  return (PLATFORM_CONFIGURATION_PERMISSIONS as readonly string[]).includes(value);
}

export type ConfigurationPermissionOp =
  "read" | "manage" | "version" | "validation" | "audit";

export function hasConfigurationPermission(
  permissions: readonly string[],
  op: ConfigurationPermissionOp,
): boolean {
  if (permissions.includes("configuration.*")) return true;
  return permissions.includes(`configuration.${op}`);
}
