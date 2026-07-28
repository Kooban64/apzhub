/** APZQEP-ENG-030C — Traceability Workbench routes (ARCH-008). */

export const QEP_TRACEABILITY_BASE_PATH = "/workspace/qep/traceability";
export const QEP_TRACE_LINKS_BASE_PATH = `${QEP_TRACEABILITY_BASE_PATH}/trace-links`;
export const QEP_TRACE_MATRIX_PATH = `${QEP_TRACEABILITY_BASE_PATH}/matrix`;
export const QEP_TRACE_TAXONOMY_PATH = `${QEP_TRACEABILITY_BASE_PATH}/taxonomy`;

export const QEP_TRACEABILITY_ROUTES = {
  home: QEP_TRACEABILITY_BASE_PATH,
  list: QEP_TRACE_LINKS_BASE_PATH,
  new: `${QEP_TRACE_LINKS_BASE_PATH}/new`,
  supersede: `${QEP_TRACE_LINKS_BASE_PATH}/supersede`,
  detail: (id: string) => `${QEP_TRACE_LINKS_BASE_PATH}/${encodeURIComponent(id)}`,
  history: (id: string) =>
    `${QEP_TRACE_LINKS_BASE_PATH}/${encodeURIComponent(id)}/history`,
  matrix: QEP_TRACE_MATRIX_PATH,
  taxonomy: QEP_TRACE_TAXONOMY_PATH,
} as const;

export function isQepTraceabilityRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_TRACEABILITY_BASE_PATH ||
    normalized.startsWith(`${QEP_TRACEABILITY_BASE_PATH}/`)
  );
}

export function isQepTraceLinksRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_TRACE_LINKS_BASE_PATH ||
    normalized.startsWith(`${QEP_TRACE_LINKS_BASE_PATH}/`)
  );
}

export function isQepTraceLinksNewRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TRACEABILITY_ROUTES.new;
}

export function isQepTraceLinksSupersedeRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TRACEABILITY_ROUTES.supersede;
}

export function isQepTraceMatrixRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TRACE_MATRIX_PATH;
}

export function isQepTraceTaxonomyRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TRACE_TAXONOMY_PATH;
}

export function isQepTraceHistoryRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return /\/history$/.test(normalized) && isQepTraceLinksRoute(normalized);
}

/**
 * Parse Trace Link id from detail/history routes.
 * Reserved segments `new`, `supersede` are never treated as ids.
 */
export function parseQepTraceLinkRouteId(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (!isQepTraceLinksRoute(normalized) || normalized === QEP_TRACE_LINKS_BASE_PATH) {
    return null;
  }
  if (
    isQepTraceLinksNewRoute(normalized) ||
    isQepTraceLinksSupersedeRoute(normalized)
  ) {
    return null;
  }
  const prefix = `${QEP_TRACE_LINKS_BASE_PATH}/`;
  const remainder = normalized.slice(prefix.length);
  if (!remainder || remainder === "new" || remainder === "supersede") {
    return null;
  }
  const segments = remainder.split("/");
  const id = decodeURIComponent(segments[0] ?? "");
  return id || null;
}
