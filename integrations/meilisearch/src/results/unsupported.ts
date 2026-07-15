/** Adapter-local unsupported features (analogous to GitHub Actions UNSUPPORTED). */

export const NOT_SUPPORTED = "NOT_SUPPORTED" as const;

export const MEILISEARCH_UNSUPPORTED_OPERATIONS = [
  "semantic_search",
  "vector_search",
  "fuzzy_search",
  "ai_ranking",
  "ocr",
] as const;

export type MeilisearchUnsupportedOperation =
  (typeof MEILISEARCH_UNSUPPORTED_OPERATIONS)[number];

export const MEILISEARCH_UNSUPPORTED_FEATURES = [
  "semantic",
  "vector",
  "fuzzy",
  "ai",
  "ocr",
] as const;

export type MeilisearchUnsupportedFeature =
  (typeof MEILISEARCH_UNSUPPORTED_FEATURES)[number];

export function isMeilisearchUnsupportedOperation(
  value: string,
): value is MeilisearchUnsupportedOperation {
  return (MEILISEARCH_UNSUPPORTED_OPERATIONS as readonly string[]).includes(value);
}
