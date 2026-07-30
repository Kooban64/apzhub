/**
 * Domain repository identity catalogue.
 * Behavioural contracts: `domain/ports` (APZQEP-ENG-110C).
 */
export type EvidenceRepositoryId =
  | "EvidenceRepository"
  | "EvidenceCollectionRepository"
  | "EvidenceSetRepository"
  | "EvidenceRelationshipRepository"
  | "EvidenceVersionRepository"
  | "EvidenceAccessGrantRepository"
  | "EvidenceAuditRepository"
  | "EvidenceUnitOfWork";

export interface EvidenceRepositoryScaffold {
  readonly repositoryId: EvidenceRepositoryId;
}

export const EVIDENCE_REPOSITORY_IDS = [
  "EvidenceRepository",
  "EvidenceCollectionRepository",
  "EvidenceSetRepository",
  "EvidenceRelationshipRepository",
  "EvidenceVersionRepository",
  "EvidenceAccessGrantRepository",
  "EvidenceAuditRepository",
  "EvidenceUnitOfWork",
] as const;
