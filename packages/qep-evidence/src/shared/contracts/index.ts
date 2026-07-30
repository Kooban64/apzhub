/**
 * Shared contract identity scaffolds — no runtime behaviour (APZQEP-ENG-110A).
 */
export type EvidenceSharedContractId =
  | "EvidenceDtoContract"
  | "EvidenceAccessCheckContract"
  | "EvidenceReferenceContract"
  | "EvidenceErrorCategoryContract";

export interface EvidenceSharedContractScaffold {
  readonly contractId: EvidenceSharedContractId;
}

export const EVIDENCE_ERROR_CATEGORIES = [
  "validation",
  "unauthenticated",
  "forbidden",
  "not_found",
  "conflict",
  "precondition_failed",
  "integrity_failed",
  "gone",
] as const;

export type EvidenceApiErrorCategory = (typeof EVIDENCE_ERROR_CATEGORIES)[number];

export const EVIDENCE_PERMISSIONS = [
  "qep.evidence.read",
  "qep.evidence.create",
  "qep.evidence.download",
  "qep.evidence.associate",
  "qep.evidence.classify",
  "qep.evidence.review",
  "qep.evidence.seal",
  "qep.evidence.hold",
  "qep.evidence.archive",
  "qep.evidence.dispose",
  "qep.evidence.verify",
  "qep.evidence.audit",
  "qep.evidence.access_check",
  "qep.evidence.collection.manage",
  "qep.evidence.admin",
] as const;

export type EvidencePermission = (typeof EVIDENCE_PERMISSIONS)[number];
