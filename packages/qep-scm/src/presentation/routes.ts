export const QEP_SCM_BASE_PATH = "/workspace/qep/scm" as const;

export const QEP_SCM_ROUTES = {
  home: QEP_SCM_BASE_PATH,
  providers: `${QEP_SCM_BASE_PATH}/providers`,
  repositories: `${QEP_SCM_BASE_PATH}/repositories`,
  repository: (repositoryId: string) =>
    `${QEP_SCM_BASE_PATH}/repositories/${repositoryId}`,
  webhooks: `${QEP_SCM_BASE_PATH}/webhooks`,
  provider: (providerId: string) => `${QEP_SCM_BASE_PATH}/providers/${providerId}`,
} as const;

export function isQepScmRoute(pathname: string): boolean {
  return pathname === QEP_SCM_BASE_PATH || pathname.startsWith(`${QEP_SCM_BASE_PATH}/`);
}

export function parseQepScmRepositoryId(pathname: string): string | undefined {
  const match = pathname.match(/\/workspace\/qep\/scm\/repositories\/([^/]+)/);
  return match?.[1];
}
