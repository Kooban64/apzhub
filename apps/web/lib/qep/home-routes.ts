/** Home / Command Centre routes — SPR-APZQEP-201 · Stream 2 My Work. */

export const QEP_HOME_BASE_PATH = "/workspace/qep/home" as const;
export const QEP_MY_WORK_BASE_PATH = "/workspace/qep/my-work" as const;

export const QEP_HOME_ROUTES = {
  home: QEP_HOME_BASE_PATH,
  myWork: QEP_MY_WORK_BASE_PATH,
} as const;

export function isQepHomeRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === "/workspace/qep" ||
    normalized === QEP_HOME_BASE_PATH ||
    normalized.startsWith(`${QEP_HOME_BASE_PATH}/`)
  );
}

export function isQepMyWorkRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_MY_WORK_BASE_PATH ||
    normalized.startsWith(`${QEP_MY_WORK_BASE_PATH}/`)
  );
}
