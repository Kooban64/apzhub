/**
 * Safe metadata allowlist / leakage scanner for Documents search (APZSEARCH-012).
 * Metadata-only publication — reject storage keys, credentials, checksum hex, URIs.
 */

/** Explicit allowlist of safe draft.metadata keys for Documents search entities. */
export const DOCUMENTS_SEARCH_SAFE_METADATA_KEYS = [
  "documentType",
  "status",
  "mimeType",
  "byteLength",
  "versionNumber",
  "currentVersionId",
  "label",
  "documentId",
  "folderId",
  "categoryId",
  "parentFolderId",
  "parentCategoryId",
  "documentCount",
  "createdBy",
  "ownerUserId",
  "checksumPresent",
  "legalHold",
  "retentionPolicyKey",
  "retainUntil",
  "generationId",
  "reportType",
  "generatedAt",
  "generationProduct",
  "templateId",
  "templateVersion",
  "templateProduct",
  "path",
  "immutable",
] as const;

export type DocumentsSearchSafeMetadataKey =
  (typeof DOCUMENTS_SEARCH_SAFE_METADATA_KEYS)[number];

const FORBIDDEN_KEY_PATTERN =
  /storageKey|bucket|region|providerId|filesystem|path|signedUrl|etag|encryption|secret|token|credential|password|objectKey|s3:\/\/|\/tmp\/|checksum.?hex/i;

/**
 * Note: bare `path` is in FORBIDDEN_KEY_PATTERN for custom/unknown metadata scans.
 * Folder logical `path` is only accepted when added via the mapper allowlist after
 * the absolute/storage path safety check (see mapper).
 */

const FORBIDDEN_VALUE_PATTERN =
  /s3:\/\/|https?:\/\/.*[?&](signature|token|credential|X-Amz)|Bearer\s+[A-Za-z0-9._-]+|\/var\/|\/tmp\/|[A-Za-z]:\\|\.pem\b|AKIA[0-9A-Z]{16}/i;

const CHECKSUM_HEX_VALUE = /^[a-f0-9]{32,128}$/i;

export type SafeFieldScanIssue = {
  readonly field: string;
  readonly code: string;
  readonly message: string;
};

export function isSafeMetadataKey(key: string): boolean {
  return (DOCUMENTS_SEARCH_SAFE_METADATA_KEYS as readonly string[]).includes(key);
}

export function isForbiddenMetadataKey(key: string): boolean {
  // Allowlisted keys are always accepted (mapper already scrubbed values).
  if (isSafeMetadataKey(key)) return false;
  return FORBIDDEN_KEY_PATTERN.test(key);
}

export function isForbiddenMetadataValue(value: string): boolean {
  if (!value || value.trim().length === 0) return false;
  if (FORBIDDEN_VALUE_PATTERN.test(value)) return true;
  if (CHECKSUM_HEX_VALUE.test(value.trim())) return true;
  return false;
}

/**
 * Scan custom / arbitrary metadata for storage leakage.
 * Allowlisted keys with safe values pass; everything else is checked strictly.
 */
export function scanMetadataForStorageLeakage(
  metadata: Readonly<Record<string, string>> | undefined,
  fieldPrefix = "metadata",
): SafeFieldScanIssue[] {
  if (!metadata) return [];
  const issues: SafeFieldScanIssue[] = [];
  for (const [key, value] of Object.entries(metadata)) {
    if (isForbiddenMetadataKey(key)) {
      issues.push({
        field: `${fieldPrefix}.${key}`,
        code: "storage_leakage",
        message: `forbidden metadata key: ${key}`,
      });
      continue;
    }
    if (isForbiddenMetadataValue(value)) {
      issues.push({
        field: `${fieldPrefix}.${key}`,
        code: "storage_leakage",
        message: "metadata value looks like storage URI, credential, or checksum hex",
      });
    }
  }
  return issues;
}

/**
 * Filter custom document metadata to safe string pairs only.
 * Rejects forbidden keys and unsafe values (storage URIs, credentials, hex checksums).
 */
export function filterSafeCustomMetadata(
  custom: Readonly<Record<string, string>> | undefined,
): Record<string, string> {
  if (!custom) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(custom)) {
    if (isForbiddenMetadataKey(key)) continue;
    if (isForbiddenMetadataValue(value)) continue;
    // Custom keys outside the allowlist are omitted (fail-closed for search index).
    if (!isSafeMetadataKey(key)) continue;
    out[key] = value;
  }
  return out;
}
