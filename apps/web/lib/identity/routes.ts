/**
 * Platform Identity Administration route helpers —
 * HTTP (APZIDENTITY-003) + workspace (APZIDENTITY-004).
 * Metadata / lifecycle only — no authentication, provisioning, or directory sync.
 */

export const IDENTITY_API_BASE = "/api/v1/identity";

/** Workspace base path for the Identity Administration Workbench. */
export const IDENTITY_WORKSPACE_BASE = "/workspace/identity";

export const IDENTITY_SECTIONS = [
  "overview",
  "users",
  "groups",
  "roles",
  "organisations",
  "tenants",
  "departments",
  "positions",
  "memberships",
  "service-assignments",
  "invitations",
  "policies",
  "audit",
  "history",
  "references",
  "diagnostics",
] as const;

export type IdentitySection = (typeof IDENTITY_SECTIONS)[number];

/**
 * Forbidden HTTP segments — auth/provisioning related ONLY. Never shipped under
 * /api/v1/identity. Note: users/roles/tenants/organisations are identity metadata
 * and are explicitly ALLOWED — they are not forbidden segments.
 */
export const IDENTITY_FORBIDDEN_HTTP_SEGMENTS = [
  "login",
  "logout",
  "password",
  "passwords",
  "session",
  "sessions",
  "oauth",
  "oidc",
  "saml",
  "scim",
  "ldap",
  "mfa",
  "token",
  "tokens",
  "provision",
  "provisioning",
  "entra",
  "directory-sync",
  "workbench",
  "execute",
  "runtime",
  "ai",
  "assist",
  "events",
  "stream",
] as const;

export function isIdentityApiPath(pathname: string): boolean {
  return pathname === IDENTITY_API_BASE || pathname.startsWith(`${IDENTITY_API_BASE}/`);
}

export function assertIdentityApiPath(pathname: string): void {
  if (!isIdentityApiPath(pathname)) {
    throw new Error("Identity client may only call /api/v1/identity");
  }
  for (const segment of IDENTITY_FORBIDDEN_HTTP_SEGMENTS) {
    if (pathname.includes(`/${segment}/`) || pathname.endsWith(`/${segment}`)) {
      throw new Error(`Forbidden identity HTTP segment: ${segment}`);
    }
  }
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isIdentityRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return (
    normalized === IDENTITY_WORKSPACE_BASE ||
    normalized.startsWith(`${IDENTITY_WORKSPACE_BASE}/`)
  );
}

export function resolveIdentitySection(pathname: string): IdentitySection {
  const normalized = normalizePath(pathname);
  if (normalized === IDENTITY_WORKSPACE_BASE) return "overview";
  const suffix = normalized.slice(IDENTITY_WORKSPACE_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (IDENTITY_SECTIONS.includes(section as IdentitySection)) {
    return section as IdentitySection;
  }
  return "overview";
}

export function identitySectionPath(section?: IdentitySection): string {
  if (!section || section === "overview") {
    return `${IDENTITY_WORKSPACE_BASE}/overview`;
  }
  return `${IDENTITY_WORKSPACE_BASE}/${section}`;
}
