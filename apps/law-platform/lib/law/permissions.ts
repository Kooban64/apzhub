/**
 * UI-only Law permission helpers.
 * Server remains authoritative — these only hide/disable controls.
 *
 * APZ-LAW-NATIVE-001-N02: consume APZHUB session grants via hydration.
 * Never hardcode `legal.*` / `law.*` as a UI default. Never map engine roles.
 *
 * Identity: enterprise governance (Governance Companion).
 * Practice-management surfaces stay below the default product boundary.
 */

export type LawPermissionSource =
  readonly string[] | ReadonlySet<string> | undefined | null;

function asSet(source: LawPermissionSource): ReadonlySet<string> {
  if (!source) return new Set();
  if (source instanceof Set) return source;
  return new Set(source);
}

function matches(granted: ReadonlySet<string>, required: string): boolean {
  if (granted.has("*") || granted.has("law.*") || granted.has("legal.*")) {
    return true;
  }
  if (granted.has(required)) return true;
  const parts = required.split(".");
  if (parts.length >= 3) {
    const midWildcard = `${parts[0]}.${parts[1]}.*`;
    if (granted.has(midWildcard)) return true;
  }
  return false;
}

export function hasLawPermission(
  source: LawPermissionSource,
  permission: string,
): boolean {
  return matches(asSet(source), permission);
}

/** Default product identity — enter through governance. */
export function canViewLaw(source: LawPermissionSource): boolean {
  return hasLawPermission(source, "law.view") || hasLawPermission(source, "law.admin");
}

/**
 * Practice / firm-administration identity — below product boundary.
 * Matters, clients, trust, billing, and similar surfaces.
 */
export function canAdminLawPractice(source: LawPermissionSource): boolean {
  return (
    hasLawPermission(source, "law.admin") || hasLawPermission(source, "legal.admin")
  );
}

/** Explicit practice keys still honoured for Law Operator roles. */
export function canViewLawPracticeSurface(
  source: LawPermissionSource,
  practicePermission: string,
): boolean {
  return canAdminLawPractice(source) || hasLawPermission(source, practicePermission);
}
