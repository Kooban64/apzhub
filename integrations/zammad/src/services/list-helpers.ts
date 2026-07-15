import type { ZammadListResult } from "../internal/zammad-api-types";
import type { PageRequest, PageResult, SortField } from "../models/query";

export function buildZammadListQuery(
  page?: PageRequest,
  sort?: readonly SortField<string>[],
  extra?: Record<string, string | number | boolean>,
): Record<string, string | number | boolean> {
  const perPage = page?.perPage ?? 25;
  const currentPage = page?.page ?? 1;
  const sortBy = sort?.[0]?.field;
  const orderBy = sort?.[0]?.direction;

  return {
    page: currentPage,
    per_page: perPage,
    ...(sortBy ? { sort_by: sortBy } : {}),
    ...(orderBy ? { order_by: orderBy } : {}),
    ...extra,
  };
}

export function mapArrayPageResult<TItem>(
  list: ZammadListResult<unknown>,
  mapItem: (item: unknown) => TItem,
  page: PageRequest = {},
): PageResult<TItem> {
  const perPage = page.perPage ?? list.perPage ?? 25;
  const currentPage = page.page ?? list.page ?? 1;
  const totalCount = list.totalCount;

  return {
    items: list.items.map((item) => mapItem(item)),
    totalCount,
    page: currentPage,
    perPage,
    hasNextPage: currentPage * perPage < totalCount,
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

export function paginateInMemory<T>(
  items: readonly T[],
  page: PageRequest = {},
): PageResult<T> {
  const perPage = page.perPage ?? 25;
  const currentPage = page.page ?? 1;
  const start = (currentPage - 1) * perPage;
  const slice = items.slice(start, start + perPage);

  return {
    items: slice,
    totalCount: items.length,
    page: currentPage,
    perPage,
    hasNextPage: start + perPage < items.length,
  };
}
