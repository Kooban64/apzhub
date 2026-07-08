/** Sorting helpers for Law API list endpoints (LAW-014-05). */

export interface LawApiSortingOptions {
  readonly defaultSort?: readonly string[];
}

/** Parse comma-separated `sort` query parameter (supports `-field` for descending). */
export function parseSorting(
  searchParams: URLSearchParams,
  options: LawApiSortingOptions = {},
): readonly string[] {
  const raw = searchParams.get("sort");
  const defaultSort = options.defaultSort ?? [];

  if (!raw?.trim()) {
    return defaultSort.length > 0 ? defaultSort : [];
  }

  return raw
    .split(",")
    .map((field) => field.trim())
    .filter((field) => field.length > 0);
}

export type LawApiSortComparator<T> = (left: T, right: T) => number;

/**
 * Sort items using field comparators. Unknown fields are skipped.
 * Each sort field may be prefixed with `-` for descending order.
 */
export function sortItems<T>(
  items: readonly T[],
  sortFields: readonly string[],
  comparators: Readonly<Record<string, LawApiSortComparator<T>>>,
  defaultSort: readonly string[] = [],
): T[] {
  const sorted = [...items];
  const fields = sortFields.length > 0 ? sortFields : defaultSort;

  if (fields.length === 0) {
    return sorted;
  }

  sorted.sort((left, right) => {
    for (const field of fields) {
      const descending = field.startsWith("-");
      const key = descending ? field.slice(1) : field;
      const compare = comparators[key];
      if (!compare) {
        continue;
      }

      const cmp = compare(left, right);
      if (cmp !== 0) {
        return descending ? -cmp : cmp;
      }
    }

    return 0;
  });

  return sorted;
}

/** Locale-aware string comparator for sort helpers. */
export function compareStrings(left: string, right: string): number {
  return left.localeCompare(right);
}
