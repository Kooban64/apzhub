/**
 * Specification identity scaffolds — no behaviour (APZQEP-ENG-110A).
 */
export type EvidenceSpecificationId =
  | "EvidenceSealableSpecification"
  | "EvidenceDisposableSpecification"
  | "EvidenceMutableContentSpecification";

export interface EvidenceSpecificationScaffold {
  readonly specificationId: EvidenceSpecificationId;
}

export const EVIDENCE_SPECIFICATION_IDS = [
  "EvidenceSealableSpecification",
  "EvidenceDisposableSpecification",
  "EvidenceMutableContentSpecification",
] as const;
