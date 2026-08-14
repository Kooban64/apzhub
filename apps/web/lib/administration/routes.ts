/** Platform Administration route helpers — HTTP (APZADMIN-003) + workspace (APZADMIN-004). */

export const ADMINISTRATION_API_BASE = "/api/v1/administration";

/** Workspace base path for the Administration Workbench (metadata UI only). */
export const ADMINISTRATION_WORKSPACE_BASE = "/workspace/administration";

export const ADMINISTRATION_SECTIONS = [
  "overview",
  "members",
  "modules",
  "categories",
  "sections",
  "registrations",
  "capabilities",
  "actions",
  "permissions",
  "policies",
  "navigation",
  "shortcuts",
  "dashboards",
  "widgets",
  "references",
  "audit",
  "history",
  "diagnostics",
  "product-learning",
  "friction-register",
] as const;

export type AdministrationSection = (typeof ADMINISTRATION_SECTIONS)[number];

/** Forbidden HTTP segments — never shipped under /api/v1/administration. */
export const ADMINISTRATION_FORBIDDEN_HTTP_SEGMENTS = [
  "execute",
  "runtime",
  "users",
  "roles",
  "tenants",
  "organisations",
  "organizations",
  "provisioning",
  "provision",
  "workbench",
  "probes",
  "live",
  "events",
  "subscribe",
  "stream",
  "ai",
  "assist",
] as const;

export function isAdministrationApiPath(pathname: string): boolean {
  return (
    pathname === ADMINISTRATION_API_BASE ||
    pathname.startsWith(`${ADMINISTRATION_API_BASE}/`)
  );
}

export function assertAdministrationApiPath(pathname: string): void {
  if (!isAdministrationApiPath(pathname)) {
    throw new Error("Administration client may only call /api/v1/administration");
  }
  for (const segment of ADMINISTRATION_FORBIDDEN_HTTP_SEGMENTS) {
    if (pathname.includes(`/${segment}/`) || pathname.endsWith(`/${segment}`)) {
      throw new Error(`Forbidden administration HTTP segment: ${segment}`);
    }
  }
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isAdministrationRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return (
    normalized === ADMINISTRATION_WORKSPACE_BASE ||
    normalized.startsWith(`${ADMINISTRATION_WORKSPACE_BASE}/`)
  );
}

export function resolveAdministrationSection(pathname: string): AdministrationSection {
  const normalized = normalizePath(pathname);
  if (normalized === ADMINISTRATION_WORKSPACE_BASE) return "overview";
  const suffix = normalized.slice(ADMINISTRATION_WORKSPACE_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (ADMINISTRATION_SECTIONS.includes(section as AdministrationSection)) {
    return section as AdministrationSection;
  }
  return "overview";
}

export function administrationSectionPath(section?: AdministrationSection): string {
  if (!section || section === "overview") {
    return `${ADMINISTRATION_WORKSPACE_BASE}/overview`;
  }
  return `${ADMINISTRATION_WORKSPACE_BASE}/${section}`;
}
