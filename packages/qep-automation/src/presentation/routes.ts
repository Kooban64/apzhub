export const QEP_AUTOMATION_BASE_PATH = "/workspace/qep/automation" as const;

export const QEP_AUTOMATION_ROUTES = {
  home: QEP_AUTOMATION_BASE_PATH,
  queue: `${QEP_AUTOMATION_BASE_PATH}/queue`,
  providers: `${QEP_AUTOMATION_BASE_PATH}/providers`,
  history: `${QEP_AUTOMATION_BASE_PATH}/history`,
  execution: (id: string) => `${QEP_AUTOMATION_BASE_PATH}/executions/${id}`,
  provider: (id: string) => `${QEP_AUTOMATION_BASE_PATH}/providers/${id}`,
  evidence: (id: string) => `${QEP_AUTOMATION_BASE_PATH}/executions/${id}/evidence`,
  artifacts: (id: string) => `${QEP_AUTOMATION_BASE_PATH}/executions/${id}/artifacts`,
  timeline: (id: string) => `${QEP_AUTOMATION_BASE_PATH}/executions/${id}/timeline`,
} as const;

export function isQepAutomationRoute(pathname: string): boolean {
  return (
    pathname === QEP_AUTOMATION_BASE_PATH ||
    pathname.startsWith(`${QEP_AUTOMATION_BASE_PATH}/`)
  );
}

export function parseQepAutomationExecutionId(pathname: string): string | undefined {
  const match = pathname.match(/\/workspace\/qep\/automation\/executions\/([^/]+)/);
  return match?.[1];
}
