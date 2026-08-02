export const QEP_SUITES_BASE_PATH = "/workspace/qep/suites" as const;

export const QEP_SUITE_ROUTES = {
  home: QEP_SUITES_BASE_PATH,
  new: `${QEP_SUITES_BASE_PATH}/new`,
  detail: (suiteId: string) => `${QEP_SUITES_BASE_PATH}/${suiteId}`,
} as const;

export function isQepSuitesRoute(pathname: string): boolean {
  return (
    pathname === QEP_SUITES_BASE_PATH || pathname.startsWith(`${QEP_SUITES_BASE_PATH}/`)
  );
}

export function isQepSuitesNewRoute(pathname: string): boolean {
  return pathname === QEP_SUITE_ROUTES.new;
}

export function parseQepSuiteRouteId(pathname: string): string | undefined {
  const prefix = `${QEP_SUITES_BASE_PATH}/`;
  if (!pathname.startsWith(prefix)) return undefined;
  const rest = pathname.slice(prefix.length);
  if (!rest || rest === "new") return undefined;
  const id = rest.split("/")[0];
  return id || undefined;
}
