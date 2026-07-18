import type { PlanePaginatedResponse } from "../internal/plane-api-types";
import type { PageRequest, PageResult, SortField } from "../models/query";

export function buildPlaneListQuery(
  page?: PageRequest,
  sort?: readonly SortField<string>[],
  extra?: Record<string, string | boolean>,
) {
  const perPage = page?.perPage ?? 25;
  const orderBy = sort
    ?.map((entry) => `${entry.direction === "desc" ? "-" : ""}${entry.field}`)
    .join(",");

  return {
    per_page: perPage,
    cursor: page?.cursor,
    order_by: orderBy || undefined,
    ...extra,
  };
}

export function mapPaginatedResult<TPlane, TCanonical>(
  response: PlanePaginatedResponse<TPlane>,
  mapItem: (item: TPlane) => TCanonical,
  page: PageRequest = {},
): PageResult<TCanonical> {
  const perPage = page.perPage ?? 25;
  const currentPage = page.page ?? 1;
  const totalCount =
    response.total_count ??
    response.total_results ??
    response.count ??
    response.results.length;

  return {
    items: response.results.map((item: TPlane) => mapItem(item)),
    totalCount,
    page: currentPage,
    perPage,
    hasNextPage: Boolean(response.next_page_results ?? response.next_cursor),
    nextCursor: response.next_cursor ?? undefined,
  };
}

export function applyClientFilters<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
): readonly T[] {
  return items.filter(predicate);
}

export function applyClientSort<T>(
  items: readonly T[],
  sort: readonly SortField<string>[],
  getField: (item: T, field: string) => string | number,
): readonly T[] {
  if (sort.length === 0) {
    return items;
  }

  const [primary] = sort;
  if (!primary) {
    return items;
  }

  const { field, direction } = primary;
  return [...items].sort((left, right) => {
    const leftValue = getField(left, field);
    const rightValue = getField(right, field);
    if (leftValue < rightValue) return direction === "asc" ? -1 : 1;
    if (leftValue > rightValue) return direction === "asc" ? 1 : -1;
    return 0;
  });
}
