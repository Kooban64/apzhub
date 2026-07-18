/**
 * Testing (APZ TCMS) searchable entity catalogue (APZSEARCH-013).
 * Source product is always `testing`.
 * Metadata-only — never binaries, storage refs, CI secrets, or report bodies.
 */

export const TESTING_SEARCH_ENTITY_TYPES = [
  // Manual
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
  // Automation
  "automation_run",
  "automation_suite",
  "imported_result",
  "coverage_summary",
  // Certification
  "certification",
  "certification_gate",
  "certification_approval",
  "certification_evidence",
  "certification_decision",
  // Release
  "release",
  "release_candidate",
  "release_package",
  "release_scope",
  "release_approval",
  "release_decision",
  "release_manifest",
  "release_summary",
  // Engineering intelligence (Engineering Score → engineering_snapshot)
  "engineering_snapshot",
  "engineering_trend",
  "benchmark",
  "historical_snapshot",
  "risk_summary",
  // Quality (additional to automation coverage_summary / manual defect)
  "quality_summary",
  "quality_coverage_summary",
  "defect_summary",
  // Reporting metadata
  "report_metadata",
  "report_template",
  // Pipeline metadata
  "pipeline",
  "pipeline_run",
  "pipeline_import",
] as const;

export type TestingSearchEntityType = (typeof TESTING_SEARCH_ENTITY_TYPES)[number];

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
