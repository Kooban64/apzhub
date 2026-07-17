/**
 * Platform Identity Administration permissions (APZIDENTITY-001).
 * Catalogue only — Gateway / Authorization wiring deferred to APZIDENTITY-002.
 */

export const PLATFORM_IDENTITY_PERMISSIONS = [
  "identity.*",
  "identity.read",
  "identity.manage",
  "identity.user",
  "identity.group",
  "identity.role",
  "identity.organization",
  "identity.tenant",
  "identity.assignment",
  "identity.audit",
] as const;

export type PlatformIdentityPermission =
  (typeof PLATFORM_IDENTITY_PERMISSIONS)[number];

export const PLATFORM_IDENTITY_PERMISSION_WILDCARD = "identity.*" as const;

export function isPlatformIdentityPermission(value: string): boolean {
  return (PLATFORM_IDENTITY_PERMISSIONS as readonly string[]).includes(value);
}

export type IdentityPermissionOp =
  | "read"
  | "manage"
  | "user"
  | "group"
  | "role"
  | "organization"
  | "tenant"
  | "assignment"
  | "audit";

export function hasIdentityPermission(
  permissions: readonly string[],
  op: IdentityPermissionOp,
): boolean {
  if (permissions.includes("identity.*")) return true;
  return permissions.includes(`identity.${op}`);
}
