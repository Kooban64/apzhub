/**
 * Documents searchable entity catalogue (APZSEARCH-012).
 * Source product is always `documents`.
 * Metadata-only — never binary content, storage refs, or checksum hex.
 */

export const DOCUMENTS_SEARCH_ENTITY_TYPES = [
  "document",
  "document_version",
  "document_collection",
  "document_folder",
  "document_category",
  "document_tag",
] as const;

export type DocumentsSearchEntityType = (typeof DOCUMENTS_SEARCH_ENTITY_TYPES)[number];

export function isDocumentsSearchEntityType(
  value: string,
): value is DocumentsSearchEntityType {
  return (DOCUMENTS_SEARCH_ENTITY_TYPES as readonly string[]).includes(value);
}

/** Detect storage / credential leakage patterns in identifiers or metadata keys. */
const STORAGE_ID_LEAK =
  /storageKey|bucket|region|providerId|filesystem|signedUrl|etag|encryption|secret|token|credential|password|objectKey|s3:\/\/|\/tmp\/|checksum.?hex/i;

export function looksLikeStorageLeak(value: string): boolean {
  return STORAGE_ID_LEAK.test(value);
}

export function assertPlatformEntityId(id: string, field = "id"): void {
  if (!id || id.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  if (looksLikeStorageLeak(id)) {
    throw new Error(
      `${field} must be a platform canonical id — storage/credential identifiers are forbidden`,
    );
  }
}
