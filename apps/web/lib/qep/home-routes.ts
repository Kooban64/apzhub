/** Home / Command Centre routes — SPR-APZQEP-201. */

export const QEP_HOME_BASE_PATH = "/workspace/qep/home" as const;

export const QEP_HOME_ROUTES = {
  home: QEP_HOME_BASE_PATH,
} as const;

export function isQepHomeRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === "/workspace/qep" ||
    normalized === QEP_HOME_BASE_PATH ||
    normalized.startsWith(`${QEP_HOME_BASE_PATH}/`)
  );
}
