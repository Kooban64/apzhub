export const QEP_CERTIFICATION_BASE_PATH = "/workspace/qep/certification" as const;
/** F5 demo alias — same workbench as certification. */
export const QEP_RC_BASE_PATH = "/workspace/qep/rc" as const;

export const QEP_CERTIFICATION_ROUTES = {
  home: QEP_CERTIFICATION_BASE_PATH,
  rcHome: QEP_RC_BASE_PATH,
  evaluation: (id: string) => `${QEP_CERTIFICATION_BASE_PATH}/${id}`,
  rcEvaluation: (id: string) => `${QEP_RC_BASE_PATH}/${id}`,
  byChange: (changeEventId: string) =>
    `${QEP_RC_BASE_PATH}?changeEventId=${encodeURIComponent(changeEventId)}`,
} as const;

export function isQepCertificationRoute(pathname: string): boolean {
  return (
    pathname === QEP_CERTIFICATION_BASE_PATH ||
    pathname.startsWith(`${QEP_CERTIFICATION_BASE_PATH}/`) ||
    pathname === QEP_RC_BASE_PATH ||
    pathname.startsWith(`${QEP_RC_BASE_PATH}/`)
  );
}

export function parseQepCertificationEvaluationId(
  pathname: string,
): string | undefined {
  for (const base of [QEP_CERTIFICATION_BASE_PATH, QEP_RC_BASE_PATH]) {
    if (!pathname.startsWith(`${base}/`)) continue;
    const rest = pathname.slice(`${base}/`.length);
    const id = rest.split("/")[0]?.trim();
    if (id && id.length > 0) return id;
  }
  return undefined;
}
