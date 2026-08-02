export const QEP_EXECUTION_WORKSPACE_BASE_PATH =
  "/workspace/qep/execution-workspace" as const;

export const QEP_EXECUTION_WORKSPACE_ROUTES = {
  home: QEP_EXECUTION_WORKSPACE_BASE_PATH,
  detail: (sessionId: string) => `${QEP_EXECUTION_WORKSPACE_BASE_PATH}/${sessionId}`,
} as const;

export function isQepExecutionWorkspaceRoute(pathname: string): boolean {
  return (
    pathname === QEP_EXECUTION_WORKSPACE_BASE_PATH ||
    pathname.startsWith(`${QEP_EXECUTION_WORKSPACE_BASE_PATH}/`)
  );
}

export function parseQepExecutionSessionRouteId(pathname: string): string | undefined {
  const prefix = `${QEP_EXECUTION_WORKSPACE_BASE_PATH}/`;
  if (!pathname.startsWith(prefix)) return undefined;
  const rest = pathname.slice(prefix.length);
  if (!rest) return undefined;
  const id = rest.split("/")[0];
  return id || undefined;
}
