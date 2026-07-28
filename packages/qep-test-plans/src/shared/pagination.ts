export function filterAndPaginate<T>(
  items: readonly T[],
  limit = 50,
  offset = 0,
): { items: readonly T[]; total: number; limit: number; offset: number } {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safeOffset = Math.max(offset, 0);
  const slice = items.slice(safeOffset, safeOffset + safeLimit);
  return { items: slice, total: items.length, limit: safeLimit, offset: safeOffset };
}
