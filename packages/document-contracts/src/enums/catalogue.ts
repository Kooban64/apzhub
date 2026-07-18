/**
 * Document Platform enums (APZDOCS-001).
 * Classification and lifecycle are catalogues only — no policy/workflow engines.
 */

export const DOCUMENT_STATUSES = [
  "draft",
  "active",
  "archived",
  "retained",
  "deleted",
  "restored",
  "expired",
] as const;

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

/** Lifecycle states mirror status for domain clarity. */
export const DOCUMENT_LIFECYCLE_STATES = DOCUMENT_STATUSES;
export type DocumentLifecycleState = DocumentStatus;

export const DOCUMENT_CLASSIFICATIONS = [
  "public",
  "internal",
  "confidential",
  "restricted",
  "legal",
  "financial",
  "compliance",
  "evidence",
  "generated_report",
  "template",
  "attachment",
  "custom",
] as const;

export type DocumentClassificationCode = (typeof DOCUMENT_CLASSIFICATIONS)[number];

export const DOCUMENT_TYPES = [
  "file",
  "report",
  "template",
  "attachment",
  "evidence",
  "policy",
  "contract",
  "record",
  "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_RELATIONSHIP_KINDS = [
  "related_to",
  "derived_from",
  "references",
  "attached_to",
  "generated_from",
  "supersedes",
  "evidence_for",
  "belongs_to_project",
  "belongs_to_support",
  "belongs_to_testing",
  "belongs_to_release",
  "belongs_to_report",
  "custom",
] as const;

export type DocumentRelationshipKind = (typeof DOCUMENT_RELATIONSHIP_KINDS)[number];

export const DOCUMENT_CONSUMER_PRODUCTS = [
  "projects",
  "support",
  "testing",
  "reports",
  "releases",
  "evidence",
  "documents",
  "analytics",
  "workflow",
  "other",
] as const;

export type DocumentConsumerProduct = (typeof DOCUMENT_CONSUMER_PRODUCTS)[number];

export const DOCUMENT_PERMISSION_ACTIONS = [
  "read",
  "write",
  "manage",
  "classify",
  "retention",
  "audit",
] as const;

export type DocumentPermissionAction = (typeof DOCUMENT_PERMISSION_ACTIONS)[number];
