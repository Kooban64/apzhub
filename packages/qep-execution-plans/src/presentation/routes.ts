export const QEP_EXECUTION_PLANS_BASE_PATH = "/workspace/qep/execution-plans" as const;

export const QEP_EXECUTION_PLAN_ROUTES = {
  home: QEP_EXECUTION_PLANS_BASE_PATH,
  new: `${QEP_EXECUTION_PLANS_BASE_PATH}/new`,
  detail: (planId: string) => `${QEP_EXECUTION_PLANS_BASE_PATH}/${planId}`,
} as const;

export function isQepExecutionPlansRoute(pathname: string): boolean {
  return (
    pathname === QEP_EXECUTION_PLANS_BASE_PATH ||
    pathname.startsWith(`${QEP_EXECUTION_PLANS_BASE_PATH}/`)
  );
}

export function isQepExecutionPlansNewRoute(pathname: string): boolean {
  return pathname === QEP_EXECUTION_PLAN_ROUTES.new;
}

export function parseQepExecutionPlanRouteId(pathname: string): string | undefined {
  const prefix = `${QEP_EXECUTION_PLANS_BASE_PATH}/`;
  if (!pathname.startsWith(prefix)) return undefined;
  const rest = pathname.slice(prefix.length);
  if (!rest || rest === "new") return undefined;
  const id = rest.split("/")[0];
  return id || undefined;
}
