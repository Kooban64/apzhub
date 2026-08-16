export const QEP_PR_QUALITY_BASE_PATH = "/workspace/qep/pr-quality" as const;

export const QEP_PR_QUALITY_ROUTES = {
  home: QEP_PR_QUALITY_BASE_PATH,
  byChange: (changeEventId: string) =>
    `${QEP_PR_QUALITY_BASE_PATH}/${encodeURIComponent(changeEventId)}`,
} as const;

export function isQepPrQualityRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_PR_QUALITY_BASE_PATH ||
    normalized.startsWith(`${QEP_PR_QUALITY_BASE_PATH}/`)
  );
}

export function parseQepPrQualityChangeId(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const prefix = `${QEP_PR_QUALITY_BASE_PATH}/`;
  if (!normalized.startsWith(prefix)) return null;
  const id = normalized.slice(prefix.length).split("/")[0];
  return id ? decodeURIComponent(id) : null;
}
