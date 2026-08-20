export const QEP_APPLICATIONS_BASE_PATH = "/workspace/qep/applications" as const;
export const QEP_PORTFOLIO_ALIAS_PATH = "/workspace/qep/portfolio" as const;

export const QEP_APPLICATION_ROUTES = {
  home: QEP_APPLICATIONS_BASE_PATH,
  detail: (applicationId: string) =>
    `${QEP_APPLICATIONS_BASE_PATH}/${encodeURIComponent(applicationId)}`,
} as const;

export function isQepApplicationsRoute(pathname: string): boolean {
  return (
    pathname === QEP_APPLICATIONS_BASE_PATH ||
    pathname.startsWith(`${QEP_APPLICATIONS_BASE_PATH}/`)
  );
}

export function isQepPortfolioAliasRoute(pathname: string): boolean {
  return (
    pathname === QEP_PORTFOLIO_ALIAS_PATH ||
    pathname.startsWith(`${QEP_PORTFOLIO_ALIAS_PATH}/`)
  );
}

export function parseQepApplicationRouteId(pathname: string): string | undefined {
  const prefix = `${QEP_APPLICATIONS_BASE_PATH}/`;
  if (!pathname.startsWith(prefix)) return undefined;
  const rest = pathname.slice(prefix.length);
  if (!rest) return undefined;
  const id = rest.split("/")[0];
  return id ? decodeURIComponent(id) : undefined;
}
