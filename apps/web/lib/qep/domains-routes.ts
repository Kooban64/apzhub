export const QEP_DOMAINS_BASE_PATH = "/workspace/qep/domains" as const;

export const QEP_DOMAINS_ROUTES = {
  home: QEP_DOMAINS_BASE_PATH,
} as const;

export function isQepDomainsRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_DOMAINS_BASE_PATH ||
    normalized.startsWith(`${QEP_DOMAINS_BASE_PATH}/`)
  );
}
