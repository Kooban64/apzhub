/** Catalogues and limits — APZQEP-ENG-050A / ARCH-011. */

export const SPECIFICATION_TITLE_MAX = 240;
export const SPECIFICATION_TEXT_MAX = 8000;
export const SPECIFICATION_TAG_MAX = 64;
export const SPECIFICATION_NUMBER_MAX = 64;

export const SPECIFICATION_STATUSES = [
  "draft",
  "under_review",
  "approved",
  "rejected",
  "withdrawn",
  "superseded",
  "cancelled",
  "retired",
] as const;

export const SPECIFICATION_TYPES = [
  "functional",
  "regression",
  "integration",
  "api",
  "performance",
  "load",
  "stress",
  "security",
  "accessibility",
  "usability",
  "compliance",
  "database",
  "infrastructure",
  "mobile",
  "desktop",
  "web",
  "cloud",
] as const;

export const SPECIFICATION_PRIORITIES = ["critical", "high", "medium", "low"] as const;

export const SPECIFICATION_COMPLEXITIES = [
  "trivial",
  "simple",
  "moderate",
  "complex",
  "epic",
] as const;

export const SPECIFICATION_REFERENCE_KINDS = [
  "requirement",
  "trace_link",
  "verification",
  "test_case",
  "test_suite",
  "execution",
  "evidence",
  "external_reference",
] as const;

export const MUTABLE_STATUSES = ["draft"] as const;

export const IMMUTABLE_STATUSES = [
  "approved",
  "superseded",
  "retired",
  "withdrawn",
  "cancelled",
] as const;
