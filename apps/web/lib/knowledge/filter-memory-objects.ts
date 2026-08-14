/**
 * Knowledge-scoped find — client filter over Wave A memory lists.
 * Not enterprise search / RAG (out of scope for Memory Companion harden).
 */

export type FilterableMemoryObject = {
  readonly title: string;
  readonly summary: string;
  readonly status: string;
  readonly owner: string;
  readonly tags: readonly string[];
  readonly kind?: string;
};

export function filterMemoryObjects<T extends FilterableMemoryObject>(
  items: readonly T[],
  query: string,
): readonly T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;
  return items.filter((item) => {
    const haystack = [
      item.title,
      item.summary,
      item.status,
      item.owner,
      item.kind ?? "",
      ...item.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}
