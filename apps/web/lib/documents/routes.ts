/** Platform Documents workspace route helpers (APZDOCS-005). */

export const DOCUMENTS_BASE = "/workspace/documents";

export const DOCUMENTS_SECTIONS = [
  "overview",
  "documents",
  "versions",
  "collections",
  "folders",
  "tags",
  "relationships",
  "retention",
  "audit",
  "diagnostics",
  "metadata",
] as const;

export type DocumentsSection = (typeof DOCUMENTS_SECTIONS)[number];

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isDocumentsRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return normalized === DOCUMENTS_BASE || normalized.startsWith(`${DOCUMENTS_BASE}/`);
}

export function resolveDocumentsSection(pathname: string): DocumentsSection {
  const normalized = normalizePath(pathname);
  if (normalized === DOCUMENTS_BASE) return "overview";
  const suffix = normalized.slice(DOCUMENTS_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (DOCUMENTS_SECTIONS.includes(section as DocumentsSection)) {
    return section as DocumentsSection;
  }
  return "overview";
}

export function documentsSectionPath(section?: DocumentsSection): string {
  if (!section || section === "overview") {
    return `${DOCUMENTS_BASE}/overview`;
  }
  return `${DOCUMENTS_BASE}/${section}`;
}
