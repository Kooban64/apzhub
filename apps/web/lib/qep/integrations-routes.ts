/** Integration Centre routes — SPR-APZQEP-202. */

export const QEP_INTEGRATIONS_BASE_PATH = "/workspace/qep/integrations" as const;

export const QEP_INTEGRATIONS_ROUTES = {
  home: QEP_INTEGRATIONS_BASE_PATH,
} as const;

export function isQepIntegrationsRoute(pathname: string): boolean {
  return (
    pathname === QEP_INTEGRATIONS_BASE_PATH ||
    pathname.startsWith(`${QEP_INTEGRATIONS_BASE_PATH}/`)
  );
}
