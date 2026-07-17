/** Platform Operations route helpers (M8-03). */

export const PLATFORM_OPERATIONS_BASE = "/workspace/operations";

export const PLATFORM_OPERATIONS_SECTIONS = [
  "dashboard",
  "tenants",
  "users",
  "roles",
  "permissions",
  "products",
  "services",
  "modules",
  "provisioning",
  "governance",
  "capabilities",
  "diagnostics",
  "audit",
  "health",
  "security",
  "resilience",
  "configuration",
  "personalisation",
  "feature-flags",
] as const;

export type PlatformOperationsSection = (typeof PLATFORM_OPERATIONS_SECTIONS)[number];

export function resolvePlatformOperationsSection(
  pathname: string,
): PlatformOperationsSection {
  const normalized = pathname.replace(/\/$/, "");
  if (normalized === PLATFORM_OPERATIONS_BASE) {
    return "dashboard";
  }

  const suffix = normalized.slice(PLATFORM_OPERATIONS_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (
    PLATFORM_OPERATIONS_SECTIONS.includes(section as PlatformOperationsSection) &&
    section !== "dashboard"
  ) {
    return section as PlatformOperationsSection;
  }

  return "dashboard";
}

export function isPlatformOperationsRoute(pathname: string): boolean {
  return (
    pathname === PLATFORM_OPERATIONS_BASE ||
    pathname.startsWith(`${PLATFORM_OPERATIONS_BASE}/`)
  );
}
