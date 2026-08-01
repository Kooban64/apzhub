/**
 * Persistence adapter layer — APZQEP-ENG-110C.
 * Contracts, mappers, and non-functional skeletons only.
 * No schema, migrations, SQL, or provider I/O.
 */

export * from "./models";
export * from "./mappers";
export * from "./repository-adapters";
export * from "./persistence-events";
export * from "./create-evidence-persistence";

export type PersistenceAdapterScaffoldId =
  | "EvidenceMetadataPersistenceAdapter"
  | "EvidenceRelationshipPersistenceAdapter"
  | "EvidenceAccessGrantPersistenceAdapter"
  | "EvidenceRepositorySkeleton"
  | "EvidenceCollectionRepositorySkeleton"
  | "EvidenceSetRepositorySkeleton"
  | "EvidenceRelationshipRepositorySkeleton"
  | "EvidenceVersionRepositorySkeleton"
  | "EvidenceAccessGrantRepositorySkeleton"
  | "EvidenceAuditRepositorySkeleton"
  | "EvidenceUnitOfWorkSkeleton";

export interface PersistenceAdapterScaffold {
  readonly adapterId: PersistenceAdapterScaffoldId;
}

export const PERSISTENCE_ADAPTER_SCAFFOLD_IDS = [
  "EvidenceMetadataPersistenceAdapter",
  "EvidenceRelationshipPersistenceAdapter",
  "EvidenceAccessGrantPersistenceAdapter",
  "EvidenceRepositorySkeleton",
  "EvidenceCollectionRepositorySkeleton",
  "EvidenceSetRepositorySkeleton",
  "EvidenceRelationshipRepositorySkeleton",
  "EvidenceVersionRepositorySkeleton",
  "EvidenceAccessGrantRepositorySkeleton",
  "EvidenceAuditRepositorySkeleton",
  "EvidenceUnitOfWorkSkeleton",
] as const;
