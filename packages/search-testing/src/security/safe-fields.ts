/**
 * Safe metadata allowlist / leakage scanner for Testing search (APZSEARCH-013).
 * Metadata-only publication — reject storage keys, credentials, checksum hex,
 * report bodies, CI secrets, and evidence binaries.
 */

/** Explicit allowlist of safe draft.metadata keys for Testing search entities. */
export const TESTING_SEARCH_SAFE_METADATA_KEYS = [
  "status",
  "key",
  "priority",
  "severity",
  "kind",
  "type",
  "label",
  "versionNumber",
  "versionLabel",
  "ownerUserId",
  "assigneeId",
  "planId",
  "suiteId",
  "caseId",
  "sessionId",
  "executionId",
  "runId",
  "stepId",
  "releaseId",
  "certificationRecordId",
  "gateId",
  "subjectKind",
  "subjectId",
  "adapterKind",
  "externalRunRef",
  "importId",
  "overallResult",
  "approvalState",
  "lifecycleStatus",
  "verificationState",
  "mimeType",
  "contentType",
  "checksumPresent",
  "sizePresent",
  "ordinal",
  "caseCount",
  "coveredCount",
  "totalCount",
  "percentage",
  "scopeKind",
  "refId",
  "stageKind",
  "verdict",
  "recommendationCode",
  "overallLevel",
  "overallScore",
  "metricKey",
  "direction",
  "periodKind",
  "trendKind",
  "reportType",
  "outputFormat",
  "templateId",
  "requestId",
  "preview",
  "revision",
  "byteLength",
  "generatedAt",
  "generatedBy",
  "productLabel",
  "releaseLabel",
  "gateKey",
  "required",
  "enabled",
  "immutable",
  "isDecision",
  "isAutomatic",
  "linkCount",
  "evidenceCount",
  "requirementCount",
  "suiteCount",
  "providerKind",
  "internalRef",
  "externalRef",
  "decisionStatus",
  "decidedAt",
  "decidedByUserId",
  "title",
  "name",
] as const;

export type TestingSearchSafeMetadataKey =
  (typeof TESTING_SEARCH_SAFE_METADATA_KEYS)[number];

const FORBIDDEN_KEY_PATTERN =
  /storageKey|storageRef|bucket|region|providerId|filesystem|signedUrl|etag|encryption|secret|token|credential|password|objectKey|payloadFingerprint|checksumHex|bytesBase64|body|screenshot|pipelineSecret|ciSecret|logBody|s3:\/\/|\/tmp\//i;

const FORBIDDEN_VALUE_PATTERN =
  /s3:\/\/|https?:\/\/.*[?&](signature|token|credential|X-Amz)|Bearer\s+[A-Za-z0-9._-]+|\/var\/|\/tmp\/|[A-Za-z]:\\|\.pem\b|AKIA[0-9A-Z]{16}/i;

const CHECKSUM_HEX_VALUE = /^[a-f0-9]{32,128}$/i;

export type SafeFieldScanIssue = {
  readonly field: string;
  readonly code: string;
  readonly message: string;
};

export function isSafeMetadataKey(key: string): boolean {
  return (TESTING_SEARCH_SAFE_METADATA_KEYS as readonly string[]).includes(key);
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
 * Scan custom / arbitrary metadata for storage / secret leakage.
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
        message:
          "metadata value looks like storage URI, credential, or checksum hex",
      });
    }
  }
  return issues;
}

/**
 * Filter custom metadata to safe string pairs only.
 * Rejects forbidden keys and unsafe values; omits non-allowlisted keys.
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
