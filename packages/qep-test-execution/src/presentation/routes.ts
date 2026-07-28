/**
 * APZQEP-ENG-100E — Test Execution Workbench routes (OES-ENG-090A PART-04 §3).
 */

export const QEP_TEST_EXECUTION_BASE_PATH = "/workspace/qep/test-execution";

const RESERVED = new Set(["explorer", "assigned", "review", "new", "executions"]);

export const QEP_TEST_EXECUTION_ROUTES = {
  home: QEP_TEST_EXECUTION_BASE_PATH,
  explorer: `${QEP_TEST_EXECUTION_BASE_PATH}/explorer`,
  assigned: `${QEP_TEST_EXECUTION_BASE_PATH}/assigned`,
  review: `${QEP_TEST_EXECUTION_BASE_PATH}/review`,
  new: `${QEP_TEST_EXECUTION_BASE_PATH}/new`,
  detail: (id: string) =>
    `${QEP_TEST_EXECUTION_BASE_PATH}/executions/${encodeURIComponent(id)}`,
  history: (id: string) =>
    `${QEP_TEST_EXECUTION_BASE_PATH}/executions/${encodeURIComponent(id)}/history`,
} as const;

export function isQepTestExecutionRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_TEST_EXECUTION_BASE_PATH ||
    normalized.startsWith(`${QEP_TEST_EXECUTION_BASE_PATH}/`)
  );
}

export function isQepTestExecutionHomeRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TEST_EXECUTION_ROUTES.home;
}

export function isQepTestExecutionExplorerRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TEST_EXECUTION_ROUTES.explorer;
}

export function isQepTestExecutionAssignedRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TEST_EXECUTION_ROUTES.assigned;
}

export function isQepTestExecutionReviewRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TEST_EXECUTION_ROUTES.review;
}

export function isQepTestExecutionNewRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TEST_EXECUTION_ROUTES.new;
}

/**
 * Parse Test Execution id from `/workspace/qep/test-execution/executions/:id[...]`.
 */
export function parseQepTestExecutionRouteId(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const prefix = `${QEP_TEST_EXECUTION_BASE_PATH}/executions/`;
  if (!normalized.startsWith(prefix)) return null;
  const remainder = normalized.slice(prefix.length);
  const segment = remainder.split("/")[0] ?? "";
  if (!segment || RESERVED.has(segment)) return null;
  return decodeURIComponent(segment) || null;
}

export type QepTestExecutionDetailMode = "detail" | "history";

export function parseQepTestExecutionDetailMode(
  pathname: string,
): QepTestExecutionDetailMode | null {
  const id = parseQepTestExecutionRouteId(pathname);
  if (!id) return null;
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const prefix = `${QEP_TEST_EXECUTION_BASE_PATH}/executions/${encodeURIComponent(id)}`;
  const rawPrefix = `${QEP_TEST_EXECUTION_BASE_PATH}/executions/${id}`;
  const base =
    normalized.startsWith(prefix) || normalized.startsWith(rawPrefix)
      ? normalized.startsWith(prefix)
        ? prefix
        : rawPrefix
      : null;
  if (!base) return "detail";
  const rest = normalized.slice(base.length).replace(/^\//, "");
  if (!rest) return "detail";
  const mode = rest.split("/")[0] ?? "";
  if (mode === "history") return "history";
  return "detail";
}
