export const EVIDENCE_STATUSES = [
  "captured",
  "validated",
  "classified",
  "associated",
  "in_review",
  "approved",
  "rejected",
  "quarantined",
  "sealed",
  "retained",
  "archived",
  "disposed",
] as const;

export const COLLECTION_STATUSES = ["open", "ready_to_seal", "sealed_as_set"] as const;

export const EVIDENCE_SOURCES = [
  "manual_upload",
  "automation",
  "external_ingestion",
  "system_export",
] as const;

export const EVIDENCE_CLASSIFICATIONS = [
  "screenshot",
  "log",
  "report",
  "observation",
  "export",
  "structured_payload",
  "pii_bearing",
  "other",
] as const;

/**
 * Domain verification states (content integrity).
 * Application Integrity Platform maps these to product statuses
 * (ESTABLISHED / VERIFIED / MISMATCH / CONTENT_MISSING / …).
 */
export const VERIFICATION_STATES = [
  "unverified",
  "verified",
  "failed",
  "content_missing",
] as const;

export const HASH_ALGORITHMS = ["sha256"] as const;

export const CONTENT_MUTABLE_STATUSES = [
  "captured",
  "validated",
  "classified",
  "associated",
  "in_review",
  "approved",
  "rejected",
  "quarantined",
  "retained",
] as const;

export const DISPOSE_ELIGIBLE_STATUSES = [
  "approved",
  "sealed",
  "retained",
  "archived",
] as const;

export const TERMINAL_STATUSES = ["disposed"] as const;

export const REASON_MIN = 3;
export const TEXT_MAX = 4000;
export const ID_MAX = 128;
export const HASH_HEX_LENGTH = 64;
