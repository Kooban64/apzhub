/**
 * Version Manager — semver validation for capability manifests.
 * Document 024 / ADR-0014 validate-versions step.
 */

const SEMVER_CORE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export function isValidSemver(version: string): boolean {
  return SEMVER_CORE.test(version);
}

/**
 * Minimal platform version check: supports optional leading comparator e.g. ">=0.2.0".
 */
export function isValidPlatformVersionConstraint(constraint: string): boolean {
  const trimmed = constraint.trim();
  const match = /^>=\s*(.+)$/.exec(trimmed);
  if (match?.[1]) {
    return isValidSemver(match[1]);
  }
  return isValidSemver(trimmed);
}

export function satisfiesPlatformVersion(
  constraint: string | undefined,
  platformVersion: string,
): boolean {
  if (!constraint) return true;

  const trimmed = constraint.trim();
  const minMatch = /^>=\s*(.+)$/.exec(trimmed);
  if (minMatch?.[1]) {
    return compareSemver(platformVersion, minMatch[1]) >= 0;
  }

  return compareSemver(platformVersion, trimmed) === 0;
}

export function compareSemver(a: string, b: string): number {
  const parse = (v: string) => v.split("-")[0]?.split(".").map(Number) ?? [];
  const [aMajor = 0, aMinor = 0, aPatch = 0] = parse(a);
  const [bMajor = 0, bMinor = 0, bPatch = 0] = parse(b);

  if (aMajor !== bMajor) return aMajor - bMajor;
  if (aMinor !== bMinor) return aMinor - bMinor;
  return aPatch - bPatch;
}
