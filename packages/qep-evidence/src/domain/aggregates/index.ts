/**
 * Aggregate root identity scaffolds — no behaviour (APZQEP-ENG-110A).
 */
export type EvidenceAggregateId = "Evidence";
export type EvidenceCollectionAggregateId = "EvidenceCollection";
export type EvidenceSetAggregateId = "EvidenceSet";
export type EvidenceRelationshipAggregateId = "EvidenceRelationship";

export interface EvidenceAggregateRoot {
  readonly aggregateId: EvidenceAggregateId;
}

export interface EvidenceCollectionAggregateRoot {
  readonly aggregateId: EvidenceCollectionAggregateId;
}

export interface EvidenceSetAggregateRoot {
  readonly aggregateId: EvidenceSetAggregateId;
}

export interface EvidenceRelationshipAggregateRoot {
  readonly aggregateId: EvidenceRelationshipAggregateId;
}

export const EVIDENCE_AGGREGATE_IDS = [
  "Evidence",
  "EvidenceCollection",
  "EvidenceSet",
  "EvidenceRelationship",
] as const;
