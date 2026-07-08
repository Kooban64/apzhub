export const DASHBOARD_MODULE_BASE_ROUTE = "/workspace/law/dashboard";

export function isDashboardModuleRoute(pathname: string): boolean {
  return (
    pathname === DASHBOARD_MODULE_BASE_ROUTE ||
    pathname.startsWith(`${DASHBOARD_MODULE_BASE_ROUTE}/`)
  );
}

export function dashboardRoute(): string {
  return DASHBOARD_MODULE_BASE_ROUTE;
}
