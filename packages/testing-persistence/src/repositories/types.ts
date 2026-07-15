export type SortDirection = "asc" | "desc";

export interface SortSpec {
  readonly field: string;
  readonly direction?: SortDirection;
}

export interface ListQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly sort?: SortSpec;
  readonly includeArchived?: boolean;
  readonly search?: string;
  readonly filters?: Readonly<Record<string, string | number | boolean | undefined>>;
}

export interface PageResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export function normalizeListQuery(
  query?: ListQuery,
): Required<Pick<ListQuery, "page" | "pageSize" | "includeArchived">> & ListQuery {
  return {
    page: Math.max(1, query?.page ?? 1),
    pageSize: Math.min(200, Math.max(1, query?.pageSize ?? 50)),
    includeArchived: query?.includeArchived ?? false,
    sort: query?.sort,
    search: query?.search,
    filters: query?.filters,
  };
}

export function paginateItems<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): PageResult<T> {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

export function compareValues(
  a: unknown,
  b: unknown,
  direction: SortDirection = "asc",
): number {
  const mul = direction === "desc" ? -1 : 1;
  if (a == null && b == null) return 0;
  if (a == null) return -1 * mul;
  if (b == null) return 1 * mul;
  if (typeof a === "number" && typeof b === "number") return (a - b) * mul;
  return String(a).localeCompare(String(b)) * mul;
}

export function matchesSearch(
  record: Readonly<Record<string, unknown>>,
  search: string | undefined,
  fields: readonly string[],
): boolean {
  if (!search || search.trim().length === 0) return true;
  const needle = search.trim().toLowerCase();
  return fields.some((field) => {
    const value = record[field];
    return typeof value === "string" && value.toLowerCase().includes(needle);
  });
}

export function matchesFilters(
  record: Readonly<Record<string, unknown>>,
  filters: Readonly<Record<string, string | number | boolean | undefined>> | undefined,
): boolean {
  if (!filters) return true;
  return Object.entries(filters).every(([key, expected]) => {
    if (expected === undefined) return true;
    return record[key] === expected;
  });
}
