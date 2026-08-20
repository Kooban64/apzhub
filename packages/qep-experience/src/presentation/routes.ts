export const QEP_EXPERIENCE_WORKSPACE_BASE_PATH = "/workspace/qep" as const;

export const QEP_EXPLORATORY_SESSIONS_BASE_PATH =
  `${QEP_EXPERIENCE_WORKSPACE_BASE_PATH}/exploratory-sessions` as const;
export const QEP_EXPERIENCE_PLANS_BASE_PATH =
  `${QEP_EXPERIENCE_WORKSPACE_BASE_PATH}/ui-ux-plans` as const;

export function isQepExploratorySessionsRoute(pathname: string): boolean {
  const n = pathname.replace(/\/+$/, "") || "/";
  return (
    n === QEP_EXPLORATORY_SESSIONS_BASE_PATH ||
    n.startsWith(`${QEP_EXPLORATORY_SESSIONS_BASE_PATH}/`)
  );
}

export function isQepExperiencePlansRoute(pathname: string): boolean {
  const n = pathname.replace(/\/+$/, "") || "/";
  return (
    n === QEP_EXPERIENCE_PLANS_BASE_PATH ||
    n.startsWith(`${QEP_EXPERIENCE_PLANS_BASE_PATH}/`)
  );
}

export function parseQepExploratorySessionRouteId(pathname: string): string | null {
  const match = pathname.match(/\/workspace\/qep\/exploratory-sessions\/([^/]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function parseQepExperiencePlanRouteId(pathname: string): string | null {
  const match = pathname.match(/\/workspace\/qep\/ui-ux-plans\/([^/]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
