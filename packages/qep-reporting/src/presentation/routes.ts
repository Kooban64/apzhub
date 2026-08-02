export const QEP_ENTERPRISE_REPORTING_BASE_PATH =
  "/workspace/qep/enterprise-reporting" as const;

export const QEP_ENTERPRISE_REPORTING_ROUTES = {
  home: QEP_ENTERPRISE_REPORTING_BASE_PATH,
  dashboards: `${QEP_ENTERPRISE_REPORTING_BASE_PATH}/dashboards`,
  dashboard: (dashboardId: string) =>
    `${QEP_ENTERPRISE_REPORTING_BASE_PATH}/dashboards/${dashboardId}`,
  reports: `${QEP_ENTERPRISE_REPORTING_BASE_PATH}/reports`,
  report: (reportId: string) =>
    `${QEP_ENTERPRISE_REPORTING_BASE_PATH}/reports/${reportId}`,
  templates: `${QEP_ENTERPRISE_REPORTING_BASE_PATH}/templates`,
  template: (templateId: string) =>
    `${QEP_ENTERPRISE_REPORTING_BASE_PATH}/templates/${templateId}`,
  metrics: `${QEP_ENTERPRISE_REPORTING_BASE_PATH}/metrics`,
} as const;

export function isQepEnterpriseReportingRoute(pathname: string): boolean {
  return (
    pathname === QEP_ENTERPRISE_REPORTING_BASE_PATH ||
    pathname.startsWith(`${QEP_ENTERPRISE_REPORTING_BASE_PATH}/`)
  );
}

export function parseQepReportingDashboardId(pathname: string): string | undefined {
  const prefix = `${QEP_ENTERPRISE_REPORTING_ROUTES.dashboards}/`;
  if (!pathname.startsWith(prefix)) return undefined;
  const id = pathname.slice(prefix.length).split("/")[0];
  return id || undefined;
}

export function parseQepReportingReportId(pathname: string): string | undefined {
  const prefix = `${QEP_ENTERPRISE_REPORTING_ROUTES.reports}/`;
  if (!pathname.startsWith(prefix)) return undefined;
  const id = pathname.slice(prefix.length).split("/")[0];
  return id || undefined;
}

export function parseQepReportingTemplateId(pathname: string): string | undefined {
  const prefix = `${QEP_ENTERPRISE_REPORTING_ROUTES.templates}/`;
  if (!pathname.startsWith(prefix)) return undefined;
  const id = pathname.slice(prefix.length).split("/")[0];
  return id || undefined;
}

export function isQepEnterpriseReportingMetricsRoute(pathname: string): boolean {
  return pathname === QEP_ENTERPRISE_REPORTING_ROUTES.metrics;
}
