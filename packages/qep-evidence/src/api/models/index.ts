/**
 * API contract identities — APZQEP-ENG-110F / OES-ENG-091A PART-04.
 */

export const EVIDENCE_API_ACTION_KEYS = [
  "validate",
  "classify",
  "requestReview",
  "approve",
  "reject",
  "quarantine",
  "seal",
  "replaceContent",
  "applyLegalHold",
  "releaseLegalHold",
  "archive",
  "dispose",
  "updateMetadata",
] as const;

export type EvidenceApiActionKey = (typeof EVIDENCE_API_ACTION_KEYS)[number];

export const EVIDENCE_API_MODEL_IDS = [
  "EvidenceCaptureRequest",
  "EvidenceDto",
  "EvidenceAccessCheckRequest",
  "EvidenceAccessCheckResponse",
  "EvidenceCollectionDto",
  "EvidenceSetDto",
] as const;
