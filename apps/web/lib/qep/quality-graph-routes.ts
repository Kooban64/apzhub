export const QEP_QUALITY_GRAPH_BASE_PATH = "/workspace/qep/quality-graph" as const;

export const QEP_QUALITY_GRAPH_ROUTES = {
  home: QEP_QUALITY_GRAPH_BASE_PATH,
  byChange: (changeEventId: string) =>
    `${QEP_QUALITY_GRAPH_BASE_PATH}/${encodeURIComponent(changeEventId)}`,
} as const;

export function isQepQualityGraphRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_QUALITY_GRAPH_BASE_PATH ||
    normalized.startsWith(`${QEP_QUALITY_GRAPH_BASE_PATH}/`)
  );
}

export function parseQepQualityGraphChangeId(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const prefix = `${QEP_QUALITY_GRAPH_BASE_PATH}/`;
  if (!normalized.startsWith(prefix)) return null;
  const id = normalized.slice(prefix.length).split("/")[0];
  return id ? decodeURIComponent(id) : null;
}
