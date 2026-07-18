/** Support workspace route helpers (OSS-110-13). */

export const SUPPORT_BASE = "/workspace/support";

export const SUPPORT_SECTIONS = [
  "requests",
  "organizations",
  "groups",
  "users",
  "search",
  "analytics",
] as const;

export type SupportSection = (typeof SUPPORT_SECTIONS)[number];

export type SupportRouteResolution =
  | { readonly kind: "inbox" }
  | { readonly kind: "create" }
  | { readonly kind: "detail"; readonly supportRequestId: string }
  | { readonly kind: "organizations" }
  | { readonly kind: "organization-detail"; readonly organizationId: string }
  | { readonly kind: "groups" }
  | { readonly kind: "group-detail"; readonly groupId: string }
  | { readonly kind: "users" }
  | { readonly kind: "user-detail"; readonly userId: string }
  | { readonly kind: "search" }
  | { readonly kind: "analytics" }
  | { readonly kind: "unknown" };

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isSupportRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return normalized === SUPPORT_BASE || normalized.startsWith(`${SUPPORT_BASE}/`);
}

export function resolveSupportSection(pathname: string): SupportSection {
  const normalized = normalizePath(pathname);
  if (normalized === SUPPORT_BASE || normalized === `${SUPPORT_BASE}/requests`) {
    return "requests";
  }
  const suffix = normalized.slice(SUPPORT_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (SUPPORT_SECTIONS.includes(section as SupportSection)) {
    return section as SupportSection;
  }
  return "requests";
}

/**
 * Parse Support request / entity detail IDs from a pathname.
 * Accepts APZHUB global IDs (`sreq_…`, `sorg_…`, …).
 */
export function parseSupportDetailId(
  pathname: string,
  segment: "requests" | "organizations" | "groups" | "users",
): string | null {
  const normalized = normalizePath(pathname);
  const prefix = `${SUPPORT_BASE}/${segment}/`;
  if (!normalized.startsWith(prefix)) {
    return null;
  }
  const rest = normalized.slice(prefix.length);
  const id = rest.split("/")[0]?.trim();
  if (!id || id === "new" || id === "create") {
    return null;
  }
  return id;
}

export function resolveSupportRoute(pathname: string): SupportRouteResolution {
  const normalized = normalizePath(pathname);
  if (!isSupportRoute(normalized)) {
    return { kind: "unknown" };
  }

  if (normalized === SUPPORT_BASE || normalized === `${SUPPORT_BASE}/requests`) {
    return { kind: "inbox" };
  }

  if (
    normalized === `${SUPPORT_BASE}/requests/new` ||
    normalized === `${SUPPORT_BASE}/requests/create`
  ) {
    return { kind: "create" };
  }

  const requestId = parseSupportDetailId(normalized, "requests");
  if (requestId) {
    return { kind: "detail", supportRequestId: requestId };
  }

  if (normalized === `${SUPPORT_BASE}/organizations`) {
    return { kind: "organizations" };
  }
  const organizationId = parseSupportDetailId(normalized, "organizations");
  if (organizationId) {
    return { kind: "organization-detail", organizationId };
  }

  if (normalized === `${SUPPORT_BASE}/groups`) {
    return { kind: "groups" };
  }
  const groupId = parseSupportDetailId(normalized, "groups");
  if (groupId) {
    return { kind: "group-detail", groupId };
  }

  if (normalized === `${SUPPORT_BASE}/users`) {
    return { kind: "users" };
  }
  const userId = parseSupportDetailId(normalized, "users");
  if (userId) {
    return { kind: "user-detail", userId };
  }

  if (normalized === `${SUPPORT_BASE}/search`) {
    return { kind: "search" };
  }

  if (normalized === `${SUPPORT_BASE}/analytics`) {
    return { kind: "analytics" };
  }

  return { kind: "unknown" };
}

export function supportRequestDetailPath(supportRequestId: string): string {
  return `${SUPPORT_BASE}/requests/${supportRequestId}`;
}

export function supportRequestCreatePath(): string {
  return `${SUPPORT_BASE}/requests/new`;
}
