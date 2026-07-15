/**
 * Testing (APZ TCMS) searchable entity catalogue (APZSEARCH-013).
 * Source product is always `testing`.
 * Metadata-only — never binaries, storage refs, CI secrets, or report bodies.
 */

export const TESTING_SEARCH_ENTITY_TYPES = [
  "test_plan",
  "test_suite",
  "test_case",
  "test_execution",
  "test_run",
  "execution_step",
  "evidence",
  "approval",
  "requirement",
  "defect",
  "automation_run",
  "automation_suite",
  "imported_result",
  "coverage_summary",
  "certification",
  "certification_gate",
  "certification_approval",
  "certification_evidence",
  "certification_decision",
  "release",
  "release_candidate",
  "release_package",
  "release_scope",
  "release_approval",
  "release_decision",
  "release_manifest",
  "release_summary",
  "engineering_snapshot",
  "engineering_trend",
  "benchmark",
  "historical_snapshot",
  "risk_summary",
  "report_metadata",
  "report_template",
] as const;

export type TestingSearchEntityType =
  (typeof TESTING_SEARCH_ENTITY_TYPES)[number];

export function isTestingSearchEntityType(
  value: string,
): value is TestingSearchEntityType {
  return (TESTING_SEARCH_ENTITY_TYPES as readonly string[]).includes(value);
}

/** Detect storage / credential / payload leakage patterns in identifiers or metadata. */
const STORAGE_ID_LEAK =
  /storageKey|storageRef|bucket|region|providerId|filesystem|signedUrl|etag|encryption|secret|token|credential|password|objectKey|payloadFingerprint|checksum.?hex|bytesBase64|s3:\/\/|\/tmp\//i;

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
