export const QEP_DASHBOARDS_BASE_PATH = "/workspace/qep/dashboards" as const;

export const QEP_DASHBOARDS_ROUTES = {
  home: QEP_DASHBOARDS_BASE_PATH,
  landing: (audience: string) => `${QEP_DASHBOARDS_BASE_PATH}/${audience}`,
  dashboard: (dashboardId: string) => `${QEP_DASHBOARDS_BASE_PATH}/view/${dashboardId}`,
  pinned: `${QEP_DASHBOARDS_BASE_PATH}/pinned`,
  visualizations: `${QEP_DASHBOARDS_BASE_PATH}/visualizations`,
} as const;

export function isQepDashboardsRoute(pathname: string): boolean {
  return (
    pathname === QEP_DASHBOARDS_BASE_PATH ||
    pathname.startsWith(`${QEP_DASHBOARDS_BASE_PATH}/`)
  );
}

export function parseQepDashboardId(pathname: string): string | undefined {
  const match = pathname.match(/\/workspace\/qep\/dashboards\/view\/([^/]+)/);
  return match?.[1];
}

export function parseQepDashboardAudience(pathname: string): string | undefined {
  const match = pathname.match(
    /\/workspace\/qep\/dashboards\/(executive|engineering|qa|project|portfolio|operations|release|compliance|automation|repository|evidence|quality-intelligence|pinned|visualizations)(?:\/|$)/,
  );
  return match?.[1];
}
