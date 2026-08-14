export const QEP_PORTFOLIO_BASE_PATH = "/workspace/qep/portfolio" as const;

export const QEP_PORTFOLIO_ROUTES = {
  home: QEP_PORTFOLIO_BASE_PATH,
  /** Flagship F14 — quality project insight. */
  byProject: (projectId: string) =>
    `${QEP_PORTFOLIO_BASE_PATH}?projectId=${encodeURIComponent(projectId)}`,
} as const;

export function isQepPortfolioRoute(pathname: string): boolean {
  return (
    pathname === QEP_PORTFOLIO_BASE_PATH ||
    pathname.startsWith(`${QEP_PORTFOLIO_BASE_PATH}/`)
  );
}
