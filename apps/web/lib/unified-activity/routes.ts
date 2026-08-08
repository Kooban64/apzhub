export const ACTIVITY_WORKSPACE_BASE = "/workspace/activity";

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isActivityRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return (
    normalized === ACTIVITY_WORKSPACE_BASE ||
    normalized.startsWith(`${ACTIVITY_WORKSPACE_BASE}/`)
  );
}
