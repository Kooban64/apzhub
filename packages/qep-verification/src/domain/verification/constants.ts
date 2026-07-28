/** APZQEP-ENG-040A — Verification Engine domain constants (ARCH-009). */

export const VERIFICATION_STATUSES = [
  "draft",
  "requested",
  "assigned",
  "in_progress",
  "verified",
  "rejected",
  "expired",
  "withdrawn",
  "superseded",
  "cancelled",
  "retired",
] as const;

/** Outcome is distinct from status — status is lifecycle position, outcome is the decision. */
export const VERIFICATION_OUTCOMES = [
  "verified",
  "failed",
  "partially_verified",
  "blocked",
  "deferred",
  "waived",
  "inconclusive",
] as const;

export const VERIFICATION_SUBJECT_KINDS = [
  "requirement",
  "requirement_content_version",
  "requirement_baseline",
  "trace_link",
  "test_specification",
  "test_case",
  "test_execution",
  "evidence",
  "certification_artefact",
  "document",
  "external_reference",
] as const;

export const VERIFICATION_AUTHORITY_KINDS = ["user", "role", "system", "delegated"] as const;

export const VERIFICATION_SCOPE_KINDS = [
  "product",
  "project",
  "release",
  "baseline",
  "tenant_global",
] as const;

export const VERIFICATION_PRIORITIES = ["critical", "high", "medium", "low"] as const;

export const VERIFICATION_ORIGINS = [
  "user",
  "import",
  "system_rule",
  "ai_suggestion",
  "migration",
] as const;

/** Alias — origin and source are the same concept for Verification provenance. */
export const VERIFICATION_SOURCES = VERIFICATION_ORIGINS;

export const VERIFICATION_RATIONALE_MAX_LENGTH = 4_000;
export const VERIFICATION_REASON_MAX_LENGTH = 2_000;
export const VERIFICATION_COMMENT_MAX_LENGTH = 2_000;
export const VERIFICATION_RESULT_SUMMARY_MAX_LENGTH = 1_000;

export const VERIFICATION_METADATA_MAX_ENTRIES = 64;
export const VERIFICATION_METADATA_KEY_MAX_LENGTH = 128;
export const VERIFICATION_METADATA_VALUE_MAX_LENGTH = 2_000;
