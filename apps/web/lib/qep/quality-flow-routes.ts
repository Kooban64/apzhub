/** Quality Flow Workspace routes — QX-P1-03 / Owner Direction. */

export const QEP_QUALITY_FLOWS_BASE_PATH = "/workspace/qep/quality-flows" as const;

export const QEP_QUALITY_FLOWS_ROUTES = {
  home: QEP_QUALITY_FLOWS_BASE_PATH,
  waiting: `${QEP_QUALITY_FLOWS_BASE_PATH}/waiting`,
  exceptions: `${QEP_QUALITY_FLOWS_BASE_PATH}/exceptions`,
  decisions: `${QEP_QUALITY_FLOWS_BASE_PATH}/decisions`,
  instance: (id: string) => `${QEP_QUALITY_FLOWS_BASE_PATH}/flows/${id}`,
  timeline: (id: string) => `${QEP_QUALITY_FLOWS_BASE_PATH}/flows/${id}/timeline`,
} as const;

export function isQepQualityFlowsRoute(pathname: string): boolean {
  return (
    pathname === QEP_QUALITY_FLOWS_BASE_PATH ||
    pathname.startsWith(`${QEP_QUALITY_FLOWS_BASE_PATH}/`)
  );
}

export function parseQepQualityFlowInstanceId(pathname: string): string | undefined {
  const match = pathname.match(/\/workspace\/qep\/quality-flows\/flows\/([^/]+)/);
  return match?.[1];
}
