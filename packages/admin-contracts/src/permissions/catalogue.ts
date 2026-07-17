/**
 * Platform Administration permissions (APZADMIN-001).
 * No UI — catalogue for later Gateway / Authorization wiring.
 */

export const PLATFORM_ADMIN_PERMISSIONS = [
  "admin.*",
  "admin.read",
  "admin.manage",
  "admin.audit",
  "admin.policy",
  "admin.diagnostics",
  "admin.navigation",
  "admin.registration",
] as const;

export type PlatformAdminPermission =
  (typeof PLATFORM_ADMIN_PERMISSIONS)[number];

export const PLATFORM_ADMIN_PERMISSION_WILDCARD = "admin.*" as const;

export function isPlatformAdminPermission(value: string): boolean {
  return (PLATFORM_ADMIN_PERMISSIONS as readonly string[]).includes(value);
}

export type AdminPermissionOp =
  | "read"
  | "manage"
  | "audit"
  | "policy"
  | "diagnostics"
  | "navigation"
  | "registration";

export function hasAdminPermission(
  permissions: readonly string[],
  op: AdminPermissionOp,
): boolean {
  if (permissions.includes("admin.*")) return true;
  return permissions.includes(`admin.${op}`);
}
