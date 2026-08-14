/** Release Readiness routes — SPR-APZQEP-201. */

export const QEP_RELEASE_READINESS_BASE_PATH =
  "/workspace/qep/release-readiness" as const;

export const QEP_RELEASE_READINESS_ROUTES = {
  home: QEP_RELEASE_READINESS_BASE_PATH,
} as const;

export function isQepReleaseReadinessRoute(pathname: string): boolean {
  return (
    pathname === QEP_RELEASE_READINESS_BASE_PATH ||
    pathname.startsWith(`${QEP_RELEASE_READINESS_BASE_PATH}/`)
  );
}
