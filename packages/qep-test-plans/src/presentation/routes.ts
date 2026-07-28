/** APZQEP-ENG-070A — Test Plans Workbench routes (OES-ARCH-014 / OES-ENG-070A). */

export const QEP_TEST_PLANS_BASE_PATH = "/workspace/qep/test-plans";

const RESERVED = new Set([
  "dashboard",
  "explorer",
  "review",
  "search",
  "new",
  "plans",
]);

export const QEP_TEST_PLAN_ROUTES = {
  home: QEP_TEST_PLANS_BASE_PATH,
  dashboard: QEP_TEST_PLANS_BASE_PATH,
  explorer: `${QEP_TEST_PLANS_BASE_PATH}/explorer`,
  review: `${QEP_TEST_PLANS_BASE_PATH}/review`,
  search: `${QEP_TEST_PLANS_BASE_PATH}/search`,
  new: `${QEP_TEST_PLANS_BASE_PATH}/new`,
  detail: (id: string) => `${QEP_TEST_PLANS_BASE_PATH}/plans/${encodeURIComponent(id)}`,
  history: (id: string) =>
    `${QEP_TEST_PLANS_BASE_PATH}/plans/${encodeURIComponent(id)}/history`,
  versions: (id: string) =>
    `${QEP_TEST_PLANS_BASE_PATH}/plans/${encodeURIComponent(id)}/versions`,
  items: (id: string) => `${QEP_TEST_PLANS_BASE_PATH}/plans/${encodeURIComponent(id)}/items`,
  relationships: (id: string) =>
    `${QEP_TEST_PLANS_BASE_PATH}/plans/${encodeURIComponent(id)}/relationships`,
  compare: (id: string, fromRev?: string, toRev?: string) => {
    const base = `${QEP_TEST_PLANS_BASE_PATH}/plans/${encodeURIComponent(id)}/compare`;
    if (fromRev === undefined && toRev === undefined) return base;
    const params = new URLSearchParams();
    if (fromRev !== undefined) params.set("from", fromRev);
    if (toRev !== undefined) params.set("to", toRev);
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  },
  audit: (id: string) => `${QEP_TEST_PLANS_BASE_PATH}/plans/${encodeURIComponent(id)}/audit`,
  edit: (id: string) => `${QEP_TEST_PLANS_BASE_PATH}/plans/${encodeURIComponent(id)}/edit`,
} as const;

export function isQepTestPlansRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_TEST_PLANS_BASE_PATH ||
    normalized.startsWith(`${QEP_TEST_PLANS_BASE_PATH}/`)
  );
}

export function isQepTestPlansDashboardRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_TEST_PLAN_ROUTES.dashboard ||
    normalized === `${QEP_TEST_PLANS_BASE_PATH}/dashboard`
  );
}

export function isQepTestPlansExplorerRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TEST_PLAN_ROUTES.explorer;
}

export function isQepTestPlansReviewRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TEST_PLAN_ROUTES.review;
}

export function isQepTestPlansSearchRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TEST_PLAN_ROUTES.search;
}

export function isQepTestPlansNewRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TEST_PLAN_ROUTES.new;
}

/**
 * Parse Plan id from `/workspace/qep/test-plans/plans/:id[...]`.
 */
export function parseQepTestPlanRouteId(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const prefix = `${QEP_TEST_PLANS_BASE_PATH}/plans/`;
  if (!normalized.startsWith(prefix)) return null;
  const remainder = normalized.slice(prefix.length);
  const segment = remainder.split("/")[0] ?? "";
  if (!segment || RESERVED.has(segment)) return null;
  return decodeURIComponent(segment) || null;
}

export type QepTestPlanDetailMode =
  | "detail"
  | "history"
  | "versions"
  | "items"
  | "relationships"
  | "compare"
  | "audit"
  | "edit";

export function parseQepTestPlanDetailMode(pathname: string): QepTestPlanDetailMode | null {
  const id = parseQepTestPlanRouteId(pathname);
  if (!id) return null;
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const prefix = `${QEP_TEST_PLANS_BASE_PATH}/plans/${encodeURIComponent(id)}`;
  const rawPrefix = `${QEP_TEST_PLANS_BASE_PATH}/plans/${id}`;
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
  if (mode === "versions") return "versions";
  if (mode === "items") return "items";
  if (mode === "relationships") return "relationships";
  if (mode === "compare") return "compare";
  if (mode === "audit") return "audit";
  if (mode === "edit") return "edit";
  return "detail";
}
