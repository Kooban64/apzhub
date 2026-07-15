/**
 * Deterministic canonical collection → provider index name mapping (APZSEARCH-006).
 * Internal only — never leak provider index uids in public gateway responses.
 */

export type SearchIndexNamingOptions = {
  readonly indexPrefix: string;
  /** Optional tenant segment for defense-in-depth naming (not a security substitute). */
  readonly tenantId?: string;
  readonly includeTenantInName?: boolean;
};

const SAFE = /[^a-zA-Z0-9_-]+/g;

function sanitizeSegment(value: string): string {
  const cleaned = value.replace(SAFE, "_").replace(/^_+|_+$/g, "");
  return cleaned.length > 0 ? cleaned.slice(0, 96) : "x";
}

/**
 * Maps a canonical platform collection id to an internal Meilisearch index uid.
 */
export function toProviderIndexUid(
  canonicalCollectionId: string,
  options: SearchIndexNamingOptions,
): string {
  const prefix = sanitizeSegment(options.indexPrefix.replace(/_+$/, "")) || "apzhub";
  const collection = sanitizeSegment(canonicalCollectionId);
  if (options.includeTenantInName && options.tenantId) {
    const tenant = sanitizeSegment(options.tenantId);
    return `${prefix}_${tenant}_${collection}`.toLowerCase();
  }
  return `${prefix}_${collection}`.toLowerCase();
}

/**
 * Maps a canonical platform document id to a provider document primary key.
 * Keeps platform ids opaque to the engine while remaining deterministic.
 */
export function toProviderDocumentId(canonicalDocumentId: string): string {
  return sanitizeSegment(canonicalDocumentId);
}

/**
 * Reverse-friendly public index id: keep canonical collection id as the
 * public reference; never expose the provider uid.
 */
export function toPublicIndexId(canonicalCollectionId: string): string {
  return sanitizeSegment(canonicalCollectionId);
}
