/** Platform Search workspace route helpers (APZSEARCH-007). */

export const SEARCH_BASE = "/workspace/search";

export const SEARCH_SECTIONS = [
  "overview",
  "query",
  "providers",
  "configurations",
  "collections",
  "sources",
  "scopes",
  "profiles",
  "audit",
  "diagnostics",
  "publication",
] as const;

export type SearchSection = (typeof SEARCH_SECTIONS)[number];

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isSearchRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return normalized === SEARCH_BASE || normalized.startsWith(`${SEARCH_BASE}/`);
}

export function resolveSearchSection(pathname: string): SearchSection {
  const normalized = normalizePath(pathname);
  if (normalized === SEARCH_BASE) return "overview";
  const suffix = normalized.slice(SEARCH_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (SEARCH_SECTIONS.includes(section as SearchSection)) {
    return section as SearchSection;
  }
  return "overview";
}

export function searchSectionPath(section?: SearchSection): string {
  if (!section || section === "overview") {
    return `${SEARCH_BASE}/overview`;
  }
  return `${SEARCH_BASE}/${section}`;
}
