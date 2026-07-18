/**
 * Safe metadata allowlist / leakage scanner for Reporting search (APZSEARCH-014).
 * Metadata-only — reject rendered bodies, parametersJson values, checksum hex, binary.
 */

/** Explicit allowlist of safe draft.metadata keys for Reporting search entities. */
export const REPORTING_SEARCH_SAFE_METADATA_KEYS = [
  "reportType",
  "outputFormat",
  "byteLength",
  "checksumPresent",
  "templateId",
  "requestId",
  "preview",
  "version",
  "revision",
  "generatedAt",
  "generatedBy",
  "archivedAt",
  "parentId",
  "definitionId",
  "placeholderCount",
  "generationCount",
  "lastGeneratedAt",
  "builtin",
  "status",
  "consumerId",
  "profileId",
  "categoryId",
  "organisationId",
] as const;

export type ReportingSearchSafeMetadataKey =
  (typeof REPORTING_SEARCH_SAFE_METADATA_KEYS)[number];

const FORBIDDEN_KEY_PATTERN =
  /parametersJson|checksum.?hex|renderedBody|body|content|sections|header|footer|branding|pdf|docx|html|markdown|csv|jsonContent|storageKey|bucket|signedUrl|secret|token|credential|password|objectKey|s3:\/\/|\/tmp\//i;

const FORBIDDEN_VALUE_PATTERN =
  /s3:\/\/|https?:\/\/.*[?&](signature|token|credential|X-Amz)|Bearer\s+[A-Za-z0-9._-]+|\/var\/|\/tmp\/|[A-Za-z]:\\|\.pem\b|AKIA[0-9A-Z]{16}|<!DOCTYPE|<html\b|%PDF-/i;

const CHECKSUM_HEX_VALUE = /^[a-f0-9]{32,128}$/i;

export type SafeFieldScanIssue = {
  readonly field: string;
  readonly code: string;
  readonly message: string;
};

export function isSafeMetadataKey(key: string): boolean {
  return (REPORTING_SEARCH_SAFE_METADATA_KEYS as readonly string[]).includes(key);
}

export function isForbiddenMetadataKey(key: string): boolean {
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
 * Scan custom / arbitrary metadata for rendered-content / storage leakage.
 * Allowlisted keys with safe values pass; everything else is checked strictly.
 */
export function scanMetadataForReportingLeakage(
  metadata: Readonly<Record<string, string>> | undefined,
  fieldPrefix = "metadata",
): SafeFieldScanIssue[] {
  if (!metadata) return [];
  const issues: SafeFieldScanIssue[] = [];
  for (const [key, value] of Object.entries(metadata)) {
    if (isForbiddenMetadataKey(key)) {
      issues.push({
        field: `${fieldPrefix}.${key}`,
        code: "content_leakage",
        message: `forbidden metadata key: ${key}`,
      });
      continue;
    }
    if (isForbiddenMetadataValue(value)) {
      issues.push({
        field: `${fieldPrefix}.${key}`,
        code: "content_leakage",
        message:
          "metadata value looks like rendered content, credential, or checksum hex",
      });
    }
  }
  return issues;
}

/**
 * Filter custom metadata to safe string pairs only.
 * Rejects forbidden keys and unsafe values.
 */
export function filterSafeCustomMetadata(
  custom: Readonly<Record<string, string>> | undefined,
): Record<string, string> {
  if (!custom) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(custom)) {
    if (isForbiddenMetadataKey(key)) continue;
    if (isForbiddenMetadataValue(value)) continue;
    if (!isSafeMetadataKey(key)) continue;
    out[key] = value;
  }
  return out;
}
