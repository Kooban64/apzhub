export const QEP_QUALITY_RISK_BASE_PATH = "/workspace/qep/risk" as const;
export const QEP_QUALITY_GATES_BASE_PATH = "/workspace/qep/quality-gates" as const;

export function isQepQualityRiskRoute(pathname: string): boolean {
  return (
    pathname === QEP_QUALITY_RISK_BASE_PATH ||
    pathname.startsWith(`${QEP_QUALITY_RISK_BASE_PATH}/`)
  );
}

export function isQepQualityGatesRoute(pathname: string): boolean {
  return (
    pathname === QEP_QUALITY_GATES_BASE_PATH ||
    pathname.startsWith(`${QEP_QUALITY_GATES_BASE_PATH}/`)
  );
}

export function parseQepQualityRiskRouteId(pathname: string): string | undefined {
  if (!pathname.startsWith(`${QEP_QUALITY_RISK_BASE_PATH}/`)) return undefined;
  const id = pathname
    .slice(`${QEP_QUALITY_RISK_BASE_PATH}/`.length)
    .split("/")[0]
    ?.trim();
  return id || undefined;
}

export function parseQepQualityGateRouteId(pathname: string): string | undefined {
  if (!pathname.startsWith(`${QEP_QUALITY_GATES_BASE_PATH}/`)) return undefined;
  const id = pathname
    .slice(`${QEP_QUALITY_GATES_BASE_PATH}/`.length)
    .split("/")[0]
    ?.trim();
  return id || undefined;
}
