export const QEP_EARLY_CHECK_BASE_PATH = "/workspace/qep/early-check" as const;

export const QEP_EARLY_CHECK_ROUTES = {
  home: QEP_EARLY_CHECK_BASE_PATH,
  /** Flagship F13 — Developer Early Check for a durable change. */
  byChange: (changeEventId: string) =>
    `${QEP_EARLY_CHECK_BASE_PATH}?changeEventId=${encodeURIComponent(changeEventId)}`,
} as const;

export function isQepEarlyCheckRoute(pathname: string): boolean {
  return (
    pathname === QEP_EARLY_CHECK_BASE_PATH ||
    pathname.startsWith(`${QEP_EARLY_CHECK_BASE_PATH}/`)
  );
}
