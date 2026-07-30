/**
 * APZQEP-ENG-110F — Evidence Workbench routes (OES-ENG-091A PART-04 §3).
 */

export const QEP_EVIDENCE_BASE_PATH = "/workspace/qep/evidence";

const RESERVED = new Set(["explorer", "collections", "sets", "new", "items"]);

export const QEP_EVIDENCE_ROUTES = {
  home: QEP_EVIDENCE_BASE_PATH,
  explorer: `${QEP_EVIDENCE_BASE_PATH}/explorer`,
  collections: `${QEP_EVIDENCE_BASE_PATH}/collections`,
  new: `${QEP_EVIDENCE_BASE_PATH}/new`,
  detail: (id: string) => `${QEP_EVIDENCE_BASE_PATH}/items/${encodeURIComponent(id)}`,
  provenance: (id: string) =>
    `${QEP_EVIDENCE_BASE_PATH}/items/${encodeURIComponent(id)}/provenance`,
  versions: (id: string) =>
    `${QEP_EVIDENCE_BASE_PATH}/items/${encodeURIComponent(id)}/versions`,
  relationships: (id: string) =>
    `${QEP_EVIDENCE_BASE_PATH}/items/${encodeURIComponent(id)}/relationships`,
  collectionDetail: (id: string) =>
    `${QEP_EVIDENCE_BASE_PATH}/collections/${encodeURIComponent(id)}`,
  setDetail: (id: string) => `${QEP_EVIDENCE_BASE_PATH}/sets/${encodeURIComponent(id)}`,
} as const;

export function isQepEvidenceRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_EVIDENCE_BASE_PATH ||
    normalized.startsWith(`${QEP_EVIDENCE_BASE_PATH}/`)
  );
}

export function isQepEvidenceHomeRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_EVIDENCE_ROUTES.home;
}

export function isQepEvidenceExplorerRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_EVIDENCE_ROUTES.explorer;
}

export function isQepEvidenceCollectionsRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_EVIDENCE_ROUTES.collections ||
    normalized.startsWith(`${QEP_EVIDENCE_ROUTES.collections}/`)
  );
}

export function isQepEvidenceNewRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_EVIDENCE_ROUTES.new;
}

export function parseQepEvidenceRouteId(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const prefix = `${QEP_EVIDENCE_BASE_PATH}/items/`;
  if (!normalized.startsWith(prefix)) return null;
  const remainder = normalized.slice(prefix.length);
  const segment = remainder.split("/")[0] ?? "";
  if (!segment || RESERVED.has(segment)) return null;
  return decodeURIComponent(segment) || null;
}

export type QepEvidenceDetailMode =
  "detail" | "provenance" | "versions" | "relationships";

export function parseQepEvidenceDetailMode(
  pathname: string,
): QepEvidenceDetailMode | null {
  const id = parseQepEvidenceRouteId(pathname);
  if (!id) return null;
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const encoded = `${QEP_EVIDENCE_BASE_PATH}/items/${encodeURIComponent(id)}`;
  const raw = `${QEP_EVIDENCE_BASE_PATH}/items/${id}`;
  const base = normalized.startsWith(encoded)
    ? encoded
    : normalized.startsWith(raw)
      ? raw
      : null;
  if (!base) return "detail";
  const rest = normalized.slice(base.length).replace(/^\//, "");
  if (!rest) return "detail";
  const mode = rest.split("/")[0] ?? "";
  if (mode === "provenance") return "provenance";
  if (mode === "versions") return "versions";
  if (mode === "relationships") return "relationships";
  return "detail";
}

export function parseQepEvidenceCollectionId(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const prefix = `${QEP_EVIDENCE_BASE_PATH}/collections/`;
  if (!normalized.startsWith(prefix)) return null;
  const segment = normalized.slice(prefix.length).split("/")[0] ?? "";
  if (!segment || segment === "collections") return null;
  return decodeURIComponent(segment) || null;
}

export function parseQepEvidenceSetId(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const prefix = `${QEP_EVIDENCE_BASE_PATH}/sets/`;
  if (!normalized.startsWith(prefix)) return null;
  const segment = normalized.slice(prefix.length).split("/")[0] ?? "";
  if (!segment) return null;
  return decodeURIComponent(segment) || null;
}
