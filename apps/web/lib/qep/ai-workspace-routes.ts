export const QEP_AI_WORKSPACE_BASE_PATH = "/workspace/qep/ai-workspace";

export const QEP_AI_WORKSPACE_ROUTES = {
  home: QEP_AI_WORKSPACE_BASE_PATH,
  sessions: `${QEP_AI_WORKSPACE_BASE_PATH}/sessions`,
} as const;

export function isQepAiWorkspaceRoute(pathname: string): boolean {
  return (
    pathname === QEP_AI_WORKSPACE_BASE_PATH ||
    pathname.startsWith(`${QEP_AI_WORKSPACE_BASE_PATH}/`)
  );
}
