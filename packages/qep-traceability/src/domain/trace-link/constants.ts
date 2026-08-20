/** APZQEP-ENG-030A Part 1 — Traceability Engine domain constants (ARCH-007). */

export const TRACE_LIFECYCLE_STATES = [
  "draft",
  "validated",
  "approved",
  "retired",
  "superseded",
] as const;

/** Normative Trace Types (ARCH-007 §5.2). Extensible via taxonomy governance. */
export const TRACE_TYPES = [
  "projects_relationship",
  "requirement_specified_by",
  "requirement_tested_by",
  "requirement_executed_by",
  "testcase_executed_by",
  "requirement_evidenced_by",
  "execution_evidenced_by",
  "requirement_defected_by",
  "execution_defected_by",
  "requirement_risk_related",
  "requirement_verified_by",
  "activity_produces_result",
  "requirement_certified_by",
  "evidence_supports_certification",
  "requirement_documented_by",
  "requirement_references_external",
] as const;

export const TRACE_ENDPOINT_KINDS = [
  "requirement",
  "requirement_content_version",
  "requirement_baseline",
  "requirement_relationship",
  "test_specification",
  "test_case",
  "acceptance_criterion",
  "test_execution",
  "evidence",
  "defect",
  "risk",
  "verification_activity",
  "verification_result",
  "certification_artefact",
  "document",
  "external_reference",
  "exploratory_session",
  "experience_plan",
  "experience_verification",
  "quality_observation",
  "quality_issue",
  "test_plan",
  "suite",
  "user_story",
] as const;

export const TRACE_DIRECTIONS = ["forward", "reverse", "symmetric"] as const;

export const TRACE_SCOPE_KINDS = [
  "product",
  "project",
  "release",
  "baseline",
  "tenant_global",
] as const;

export const TRACE_STRENGTHS = ["mandatory", "recommended", "informative"] as const;

export const TRACE_CONFIDENCES = [
  "authoritative",
  "asserted",
  "inferred",
  "provisional",
] as const;

export const TRACE_ORIGINS = [
  "user",
  "import",
  "system_rule",
  "ai_suggestion",
  "migration",
] as const;

export const TRACE_GOVERNANCE_CLASSES = [
  "mandatory_for_coverage",
  "recommended",
  "informative",
  "projection_only",
] as const;

export const TRACE_CYCLE_POLICIES = ["forbidden", "warn", "allow"] as const;

export const TRACE_RATIONALE_MAX_LENGTH = 4_000;

export const TRACE_METADATA_MAX_ENTRIES = 64;
export const TRACE_METADATA_KEY_MAX_LENGTH = 128;
export const TRACE_METADATA_VALUE_MAX_LENGTH = 2_000;
