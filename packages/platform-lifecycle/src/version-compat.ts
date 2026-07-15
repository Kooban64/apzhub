/** Minimal semver compatibility checks (aligned with @apzhub/platform-runtime/version-manager). */

export function satisfiesPlatformVersion(
  constraint: string | undefined,
  platformVersion: string,
): boolean {
  if (!constraint) {
    return true;
  }

  const trimmed = constraint.trim();
  const minMatch = /^>=\s*(.+)$/.exec(trimmed);
  if (minMatch?.[1]) {
    return compareSemver(platformVersion, minMatch[1]) >= 0;
  }

  return compareSemver(platformVersion, trimmed) === 0;
}

function compareSemver(a: string, b: string): number {
  const parse = (value: string) => value.split("-")[0]?.split(".").map(Number) ?? [];
  const [aMajor = 0, aMinor = 0, aPatch = 0] = parse(a);
  const [bMajor = 0, bMinor = 0, bPatch = 0] = parse(b);

  if (aMajor !== bMajor) {
    return aMajor - bMajor;
  }
  if (aMinor !== bMinor) {
    return aMinor - bMinor;
  }
  return aPatch - bPatch;
}
