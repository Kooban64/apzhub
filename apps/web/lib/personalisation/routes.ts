export const PERSONALISATION_WORKSPACE_BASE = "/workspace/personalisation";

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isPersonalisationRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return (
    normalized === PERSONALISATION_WORKSPACE_BASE ||
    normalized.startsWith(`${PERSONALISATION_WORKSPACE_BASE}/`)
  );
}
