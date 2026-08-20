import {
  QEP_APPLICATIONS_BASE_PATH,
  isQepApplicationsRoute,
  isQepPortfolioAliasRoute,
  parseQepApplicationRouteId,
} from "@apzhub/qep-applications/presentation";

export const QEP_PORTFOLIO_BASE_PATH = QEP_APPLICATIONS_BASE_PATH;

export const QEP_PORTFOLIO_ROUTES = {
  home: QEP_PORTFOLIO_BASE_PATH,
  byProject: (projectId: string) =>
    `${QEP_PORTFOLIO_BASE_PATH}/${encodeURIComponent(projectId)}`,
} as const;

export function isQepPortfolioRoute(pathname: string): boolean {
  return isQepApplicationsRoute(pathname) || isQepPortfolioAliasRoute(pathname);
}

export { parseQepApplicationRouteId, isQepApplicationsRoute, isQepPortfolioAliasRoute };
