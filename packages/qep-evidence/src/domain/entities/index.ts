/**
 * Entity identity scaffolds — no behaviour (APZQEP-ENG-110A).
 */
export type EvidenceEntityId =
  "EvidenceVersion" | "EvidenceDisposition" | "EvidenceProvenanceEvent";

export interface EvidenceEntityScaffold {
  readonly entityId: EvidenceEntityId;
}

export const EVIDENCE_ENTITY_IDS = [
  "EvidenceVersion",
  "EvidenceDisposition",
  "EvidenceProvenanceEvent",
] as const;
