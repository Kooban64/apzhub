/** Parse permission namespace from manifest-driven permission keys. */
export function parsePermissionNamespace(permissionKey: string): string {
  const trimmed = permissionKey.trim();
  if (!trimmed || trimmed === "*") {
    return "platform";
  }

  const segment = trimmed.split(".")[0];
  return segment ?? "platform";
}

/** Canonical permission namespaces supported by the platform authorization model. */
export const CANONICAL_PERMISSION_NAMESPACES = [
  "platform",
  "tenant",
  "user",
  "product",
  "workspace",
  "service",
  "law",
  "legal",
  "trust",
  "testing",
  "certification",
  "evidence",
  "traceability",
  "automation",
  "reporting",
  "approval",
  "dashboard",
] as const;

export type CanonicalPermissionNamespace = (typeof CANONICAL_PERMISSION_NAMESPACES)[number];

/**
 * Match a granted permission pattern against a requested permission key.
 * Supports exact match, global wildcard, and namespace wildcard (e.g. law.*).
 */
export function permissionPatternMatches(
  granted: string,
  requested: string,
): boolean {
  if (granted === "*") {
    return true;
  }

  if (granted === requested) {
    return true;
  }

  if (granted.endsWith(".*")) {
    const prefix = granted.slice(0, -2);
    return requested === prefix || requested.startsWith(`${prefix}.`);
  }

  return false;
}

export function normalizePermissionKey(permissionKey: string): string {
  return permissionKey.trim();
}

export function isWildcardPermission(permissionKey: string): boolean {
  return permissionKey === "*" || permissionKey.endsWith(".*");
}
