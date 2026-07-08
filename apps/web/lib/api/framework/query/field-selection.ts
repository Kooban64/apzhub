/** Field selection and expansion helpers (LAW-014-05). */

export interface LawApiParsedFieldSelection {
  readonly fields: readonly string[] | null;
  readonly includes: readonly string[] | null;
}

function parseCommaSeparated(raw: string | null): readonly string[] | null {
  if (!raw?.trim()) {
    return null;
  }

  const values = raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return values.length > 0 ? values : null;
}

/**
 * Parse `fields` query parameter for sparse fieldsets.
 * Returns `null` when absent (meaning full resource).
 */
export function parseFieldSelection(
  searchParams: URLSearchParams,
): readonly string[] | null {
  return parseCommaSeparated(searchParams.get("fields"));
}

/**
 * Parse `include` query parameter for related resource expansion.
 * Returns `null` when absent (meaning no expansions).
 */
export function parseIncludes(searchParams: URLSearchParams): readonly string[] | null {
  return parseCommaSeparated(searchParams.get("include"));
}

/** Parse both `fields` and `include` in one call. */
export function parseFieldSelectionAndIncludes(
  searchParams: URLSearchParams,
): LawApiParsedFieldSelection {
  return {
    fields: parseFieldSelection(searchParams),
    includes: parseIncludes(searchParams),
  };
}
