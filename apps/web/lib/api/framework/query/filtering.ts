/** Filtering helpers for Law API list endpoints (LAW-014-05). */

export interface LawApiFilterSpec {
  /** Query parameter name for free-text search (default: `query`). */
  readonly queryParam?: string;
  /** Enum filter parameter names (e.g. `status`, `clientType`). */
  readonly enumParams?: readonly string[];
}

export interface LawApiParsedFilters {
  readonly query?: string;
  readonly enums: Readonly<Record<string, string | "all">>;
}

function parseEnumFilter(raw: string | null): string | "all" | undefined {
  if (!raw?.trim()) {
    return undefined;
  }

  const first = raw.split(",")[0]?.trim();
  return first || undefined;
}

/**
 * Parse common list filter query parameters.
 * Returns free-text `query` and enum filters as single-value or `all`.
 */
export function parseFiltering(
  searchParams: URLSearchParams,
  spec: LawApiFilterSpec = {},
): LawApiParsedFilters {
  const queryParam = spec.queryParam ?? "query";
  const queryRaw = searchParams.get(queryParam);
  const enums: Record<string, string | "all"> = {};

  for (const param of spec.enumParams ?? []) {
    const value = parseEnumFilter(searchParams.get(param));
    if (value !== undefined) {
      enums[param] = value as string | "all";
    }
  }

  return {
    query: queryRaw?.trim() ? queryRaw.trim() : undefined,
    enums,
  };
}

/** Read a single enum filter value from parsed filters. */
export function getEnumFilter(
  filters: LawApiParsedFilters,
  param: string,
): string | "all" | undefined {
  return filters.enums[param];
}
