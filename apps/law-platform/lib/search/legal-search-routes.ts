import {
  appendLegalSearchFiltersToSearchParams,
  parseLegalSearchFiltersFromSearchParams,
  type LegalSearchFilters,
} from "./legal-search-filters";

export const LEGAL_SEARCH_MODULE_BASE_ROUTE = "/workspace/law/search";

export function isLegalSearchModuleRoute(pathname: string): boolean {
  return (
    pathname === LEGAL_SEARCH_MODULE_BASE_ROUTE ||
    pathname.startsWith(`${LEGAL_SEARCH_MODULE_BASE_ROUTE}/`)
  );
}

export function legalSearchListRoute(
  query?: string,
  filters: LegalSearchFilters = {},
): string {
  const params = new URLSearchParams();
  if (query?.trim()) {
    params.set("q", query.trim());
  }
  appendLegalSearchFiltersToSearchParams(params, filters);
  const suffix = params.toString();
  return suffix
    ? `${LEGAL_SEARCH_MODULE_BASE_ROUTE}?${suffix}`
    : LEGAL_SEARCH_MODULE_BASE_ROUTE;
}

export { parseLegalSearchFiltersFromSearchParams };

export function parseLegalSearchRouteSearchParams(params: URLSearchParams): {
  readonly query: string;
  readonly filters: LegalSearchFilters;
} {
  return {
    query: params.get("q") ?? "",
    filters: parseLegalSearchFiltersFromSearchParams(params),
  };
}
