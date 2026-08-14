export const QEP_QUALITY_JOURNEY_BASE_PATH = "/workspace/qep/quality-journey" as const;

export const QEP_QUALITY_JOURNEY_ROUTES = {
  home: QEP_QUALITY_JOURNEY_BASE_PATH,
  /** Flagship F8 — guided change quality journey. */
  byChange: (changeEventId: string) =>
    `${QEP_QUALITY_JOURNEY_BASE_PATH}?changeEventId=${encodeURIComponent(changeEventId)}`,
} as const;

export function isQepQualityJourneyRoute(pathname: string): boolean {
  return (
    pathname === QEP_QUALITY_JOURNEY_BASE_PATH ||
    pathname.startsWith(`${QEP_QUALITY_JOURNEY_BASE_PATH}/`)
  );
}
