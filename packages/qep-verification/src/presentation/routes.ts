/** APZQEP-ENG-040C — Verification Workbench routes (ARCH-010). */

export const QEP_VERIFICATION_BASE_PATH = "/workspace/qep/verification";

const RESERVED = new Set([
  "queue",
  "team",
  "search",
  "history",
  "dashboard",
  "new",
  "supersede",
]);

export const QEP_VERIFICATION_ROUTES = {
  home: QEP_VERIFICATION_BASE_PATH,
  explorer: QEP_VERIFICATION_BASE_PATH,
  queue: `${QEP_VERIFICATION_BASE_PATH}/queue`,
  team: `${QEP_VERIFICATION_BASE_PATH}/team`,
  search: `${QEP_VERIFICATION_BASE_PATH}/search`,
  history: `${QEP_VERIFICATION_BASE_PATH}/history`,
  dashboard: `${QEP_VERIFICATION_BASE_PATH}/dashboard`,
  new: `${QEP_VERIFICATION_BASE_PATH}/new`,
  supersede: `${QEP_VERIFICATION_BASE_PATH}/supersede`,
  detail: (id: string) => `${QEP_VERIFICATION_BASE_PATH}/${encodeURIComponent(id)}`,
  detailHistory: (id: string) =>
    `${QEP_VERIFICATION_BASE_PATH}/history?id=${encodeURIComponent(id)}`,
} as const;

export function isQepVerificationRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_VERIFICATION_BASE_PATH ||
    normalized.startsWith(`${QEP_VERIFICATION_BASE_PATH}/`)
  );
}

export function isQepVerificationQueueRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_VERIFICATION_ROUTES.queue;
}

export function isQepVerificationTeamRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_VERIFICATION_ROUTES.team;
}

export function isQepVerificationSearchRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_VERIFICATION_ROUTES.search;
}

export function isQepVerificationHistoryRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_VERIFICATION_ROUTES.history;
}

export function isQepVerificationDashboardRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_VERIFICATION_ROUTES.dashboard;
}

export function isQepVerificationNewRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_VERIFICATION_ROUTES.new;
}

export function isQepVerificationSupersedeRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_VERIFICATION_ROUTES.supersede;
}

/**
 * Parse Verification id from `/workspace/qep/verification/:id`.
 * Reserved segments are never treated as ids.
 */
export function parseQepVerificationRouteId(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (
    !isQepVerificationRoute(normalized) ||
    normalized === QEP_VERIFICATION_BASE_PATH
  ) {
    return null;
  }
  const prefix = `${QEP_VERIFICATION_BASE_PATH}/`;
  if (!normalized.startsWith(prefix)) return null;
  const remainder = normalized.slice(prefix.length);
  const segment = remainder.split("/")[0] ?? "";
  if (!segment || RESERVED.has(segment)) return null;
  return decodeURIComponent(segment) || null;
}
