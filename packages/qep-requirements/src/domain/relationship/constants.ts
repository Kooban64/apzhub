/** APZQEP-ENG-020F Part 1 — Requirements Relationship Engine domain constants. */

export const RELATIONSHIP_LIFECYCLE_STATES = [
  "draft",
  "active",
  "deprecated",
  "retired",
] as const;

export const RELATIONSHIP_TYPES = [
  "refines",
  "derives_from",
  "depends_on",
  "constrains",
  "conflicts_with",
  "supersedes",
  "relates_to",
] as const;

export const RELATIONSHIP_STRENGTHS = [
  "mandatory",
  "recommended",
  "informational",
] as const;

export const RELATIONSHIP_CRITICALITIES = [
  "critical",
  "high",
  "medium",
  "low",
] as const;

export const RELATIONSHIP_CLASSIFICATIONS = [
  "structural",
  "behavioural",
  "business",
  "regulatory",
  "security",
  "privacy",
  "safety",
  "quality",
  "operational",
  "data",
  "integration",
] as const;

export const RELATIONSHIP_SCOPES = [
  "product",
  "project",
  "release",
  "baseline",
] as const;

export const RELATIONSHIP_ENDPOINT_MODES = [
  "requirement",
  "content_version_pinned",
] as const;

export const RELATIONSHIP_RATIONALE_MAX_LENGTH = 4_000;
