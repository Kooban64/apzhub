/** APZQEP-ENG-050C — Test Specifications Workbench routes (OES-ARCH-012). */

export const QEP_TEST_SPECIFICATIONS_BASE_PATH = "/workspace/qep/test-specifications";

const RESERVED = new Set([
  "dashboard",
  "explorer",
  "review",
  "search",
  "new",
  "specifications",
]);

export const QEP_TEST_SPECIFICATION_ROUTES = {
  home: QEP_TEST_SPECIFICATIONS_BASE_PATH,
  dashboard: QEP_TEST_SPECIFICATIONS_BASE_PATH,
  explorer: `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/explorer`,
  review: `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/review`,
  search: `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/search`,
  new: `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/new`,
  detail: (id: string) =>
    `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/specifications/${encodeURIComponent(id)}`,
  history: (id: string) =>
    `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/specifications/${encodeURIComponent(id)}/history`,
  versions: (id: string) =>
    `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/specifications/${encodeURIComponent(id)}/versions`,
  relationships: (id: string) =>
    `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/specifications/${encodeURIComponent(id)}/relationships`,
  compare: (id: string, withId: string) =>
    `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/specifications/${encodeURIComponent(id)}/compare?with=${encodeURIComponent(withId)}`,
  edit: (id: string) =>
    `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/specifications/${encodeURIComponent(id)}/edit`,
} as const;

export function isQepTestSpecificationsRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_TEST_SPECIFICATIONS_BASE_PATH ||
    normalized.startsWith(`${QEP_TEST_SPECIFICATIONS_BASE_PATH}/`)
  );
}

export function isQepTestSpecificationsDashboardRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_TEST_SPECIFICATION_ROUTES.dashboard ||
    normalized === `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/dashboard`
  );
}

export function isQepTestSpecificationsExplorerRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TEST_SPECIFICATION_ROUTES.explorer;
}

export function isQepTestSpecificationsReviewRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TEST_SPECIFICATION_ROUTES.review;
}

export function isQepTestSpecificationsSearchRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TEST_SPECIFICATION_ROUTES.search;
}

export function isQepTestSpecificationsNewRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_TEST_SPECIFICATION_ROUTES.new;
}

/**
 * Parse Specification id from
 * `/workspace/qep/test-specifications/specifications/:id[...]`.
 */
export function parseQepTestSpecificationRouteId(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const prefix = `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/specifications/`;
  if (!normalized.startsWith(prefix)) return null;
  const remainder = normalized.slice(prefix.length);
  const segment = remainder.split("/")[0] ?? "";
  if (!segment || RESERVED.has(segment)) return null;
  return decodeURIComponent(segment) || null;
}

export type QepTestSpecificationDetailMode =
  | "detail"
  | "history"
  | "versions"
  | "relationships"
  | "compare"
  | "edit";

export function parseQepTestSpecificationDetailMode(
  pathname: string,
): QepTestSpecificationDetailMode | null {
  const id = parseQepTestSpecificationRouteId(pathname);
  if (!id) return null;
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const prefix = `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/specifications/${encodeURIComponent(id)}`;
  // decodeURIComponent may differ from raw path encoding — also try raw id segment
  const rawPrefix = `${QEP_TEST_SPECIFICATIONS_BASE_PATH}/specifications/${id}`;
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
  if (mode === "relationships") return "relationships";
  if (mode === "compare") return "compare";
  if (mode === "edit") return "edit";
  return "detail";
}
