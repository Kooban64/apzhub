export const QEP_MCP_BASE_PATH = "/workspace/qep/mcp-dx";

export const QEP_MCP_ROUTES = {
  home: QEP_MCP_BASE_PATH,
} as const;

export function isQepMcpRoute(pathname: string): boolean {
  return pathname === QEP_MCP_BASE_PATH || pathname.startsWith(`${QEP_MCP_BASE_PATH}/`);
}
