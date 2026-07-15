/**
 * Permission pattern matching aligned with @apzhub/platform-authorization.
 * Kept local so the production provider can evaluate snapshots without
 * requiring the authorization package for every unit test path.
 */
export function permissionPatternMatches(granted: string, requested: string): boolean {
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

export function anyPermissionMatches(
  granted: readonly string[],
  requested: string,
): boolean {
  return granted.some((pattern) => permissionPatternMatches(pattern, requested));
}
