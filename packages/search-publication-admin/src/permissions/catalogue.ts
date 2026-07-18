/**
 * Publication administration permissions (APZSEARCH-017).
 * Owned by this package — Search Platform contracts remain frozen.
 */

export const SEARCH_PUBLICATION_PERMISSIONS = [
  "search.publication.read",
  "search.publication.retry",
  "search.publication.deadletter",
  "search.publication.admin",
  "search.publication.diagnostics",
] as const;

export type SearchPublicationPermission =
  (typeof SEARCH_PUBLICATION_PERMISSIONS)[number];

export function isSearchPublicationPermission(
  value: string,
): value is SearchPublicationPermission {
  return (SEARCH_PUBLICATION_PERMISSIONS as readonly string[]).includes(value);
}

/** Admin implies all publication ops permissions. */
export function expandSearchPublicationPermissions(
  granted: readonly string[],
): ReadonlySet<string> {
  const set = new Set(granted);
  if (set.has("*") || set.has("search.*") || set.has("search.publication.admin")) {
    for (const key of SEARCH_PUBLICATION_PERMISSIONS) {
      set.add(key);
    }
  }
  return set;
}
