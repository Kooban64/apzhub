/**
 * Value object identity scaffolds — no behaviour (APZQEP-ENG-110A).
 */
export type EvidenceValueObjectId =
  | "EvidenceStatus"
  | "EvidenceContent"
  | "EvidenceIntegrity"
  | "EvidenceClassification"
  | "EvidenceSource"
  | "EvidenceOwnership"
  | "EvidenceRetention"
  | "EvidenceReference";

export interface EvidenceValueObjectScaffold {
  readonly valueObjectId: EvidenceValueObjectId;
}

export const EVIDENCE_VALUE_OBJECT_IDS = [
  "EvidenceStatus",
  "EvidenceContent",
  "EvidenceIntegrity",
  "EvidenceClassification",
  "EvidenceSource",
  "EvidenceOwnership",
  "EvidenceRetention",
  "EvidenceReference",
] as const;

/** Consumer-side pointer shape reserved for integrations — no runtime behaviour. */
export interface EvidenceReferenceScaffold {
  readonly kind: "EvidenceReference";
}
