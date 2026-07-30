/**
 * Repository adapter skeletons — APZQEP-ENG-110C.
 * Compile-time conformance only. No database access.
 */

import type {
  EvidenceAccessGrant,
  EvidenceAccessGrantRepository,
  EvidenceAuditRecord,
  EvidenceAuditRepository,
  EvidenceCollectionRepository,
  EvidenceListFilter,
  EvidenceRelationshipRepository,
  EvidenceRepository,
  EvidenceSetRepository,
  EvidenceUnitOfWork,
  EvidenceVersionRepository,
  Page,
  PageRequest,
  StoredEvidence,
  StoredEvidenceCollection,
  StoredEvidenceRelationship,
  StoredEvidenceSet,
} from "../../domain/ports/repositories";
import type { EvidenceCollection } from "../../domain/evidence/collection";
import type { Evidence, EvidenceVersion } from "../../domain/evidence/evidence";
import type { EvidenceRelationship } from "../../domain/evidence/relationship";
import type { EvidenceSet } from "../../domain/evidence/set";
import { PersistenceNotImplementedError } from "../../shared/errors";

function notImplemented(adapterId: string, operation: string): Promise<never> {
  return Promise.reject(new PersistenceNotImplementedError(adapterId, operation));
}

export const EvidenceRepositorySkeleton: EvidenceRepository = {
  portId: "EvidenceRepository",
  save(_evidence: Evidence, _expectedRevision: number): Promise<StoredEvidence> {
    return notImplemented("EvidenceRepositorySkeleton", "save");
  },
  getById(_tenantId: string, _id: string): Promise<StoredEvidence | null> {
    return notImplemented("EvidenceRepositorySkeleton", "getById");
  },
  list(
    _tenantId: string,
    _filter?: EvidenceListFilter,
    _page?: PageRequest,
  ): Promise<Page<StoredEvidence>> {
    return notImplemented("EvidenceRepositorySkeleton", "list");
  },
};

export const EvidenceCollectionRepositorySkeleton: EvidenceCollectionRepository = {
  portId: "EvidenceCollectionRepository",
  save(
    _collection: EvidenceCollection,
    _expectedRevision: number,
  ): Promise<StoredEvidenceCollection> {
    return notImplemented("EvidenceCollectionRepositorySkeleton", "save");
  },
  getById(_tenantId: string, _id: string): Promise<StoredEvidenceCollection | null> {
    return notImplemented("EvidenceCollectionRepositorySkeleton", "getById");
  },
  list(
    _tenantId: string,
    _projectId?: string,
    _page?: PageRequest,
  ): Promise<Page<StoredEvidenceCollection>> {
    return notImplemented("EvidenceCollectionRepositorySkeleton", "list");
  },
};

export const EvidenceSetRepositorySkeleton: EvidenceSetRepository = {
  portId: "EvidenceSetRepository",
  insert(_set: EvidenceSet): Promise<StoredEvidenceSet> {
    return notImplemented("EvidenceSetRepositorySkeleton", "insert");
  },
  getById(_tenantId: string, _id: string): Promise<StoredEvidenceSet | null> {
    return notImplemented("EvidenceSetRepositorySkeleton", "getById");
  },
  listByCollection(
    _tenantId: string,
    _collectionId: string,
  ): Promise<readonly StoredEvidenceSet[]> {
    return notImplemented("EvidenceSetRepositorySkeleton", "listByCollection");
  },
};

export const EvidenceRelationshipRepositorySkeleton: EvidenceRelationshipRepository = {
  portId: "EvidenceRelationshipRepository",
  save(_relationship: EvidenceRelationship): Promise<StoredEvidenceRelationship> {
    return notImplemented("EvidenceRelationshipRepositorySkeleton", "save");
  },
  getById(_tenantId: string, _id: string): Promise<StoredEvidenceRelationship | null> {
    return notImplemented("EvidenceRelationshipRepositorySkeleton", "getById");
  },
  listByEvidence(
    _tenantId: string,
    _evidenceId: string,
  ): Promise<readonly StoredEvidenceRelationship[]> {
    return notImplemented("EvidenceRelationshipRepositorySkeleton", "listByEvidence");
  },
  listByTarget(
    _tenantId: string,
    _targetCapability: string,
    _targetId: string,
  ): Promise<readonly StoredEvidenceRelationship[]> {
    return notImplemented("EvidenceRelationshipRepositorySkeleton", "listByTarget");
  },
  delete(_tenantId: string, _relationshipId: string): Promise<void> {
    return notImplemented("EvidenceRelationshipRepositorySkeleton", "delete");
  },
};

export const EvidenceVersionRepositorySkeleton: EvidenceVersionRepository = {
  portId: "EvidenceVersionRepository",
  listByEvidence(
    _tenantId: string,
    _evidenceId: string,
  ): Promise<readonly EvidenceVersion[]> {
    return notImplemented("EvidenceVersionRepositorySkeleton", "listByEvidence");
  },
  getVersion(
    _tenantId: string,
    _evidenceId: string,
    _version: number,
  ): Promise<EvidenceVersion | null> {
    return notImplemented("EvidenceVersionRepositorySkeleton", "getVersion");
  },
};

export const EvidenceAccessGrantRepositorySkeleton: EvidenceAccessGrantRepository = {
  portId: "EvidenceAccessGrantRepository",
  save(_grant: EvidenceAccessGrant): Promise<EvidenceAccessGrant> {
    return notImplemented("EvidenceAccessGrantRepositorySkeleton", "save");
  },
  revoke(_tenantId: string, _grantId: string, _revokedAt: string): Promise<void> {
    return notImplemented("EvidenceAccessGrantRepositorySkeleton", "revoke");
  },
  findGrants(
    _tenantId: string,
    _query: {
      readonly evidenceId?: string;
      readonly scope?: string;
      readonly principalId: string;
    },
  ): Promise<readonly EvidenceAccessGrant[]> {
    return notImplemented("EvidenceAccessGrantRepositorySkeleton", "findGrants");
  },
};

export const EvidenceAuditRepositorySkeleton: EvidenceAuditRepository = {
  portId: "EvidenceAuditRepository",
  append(_record: EvidenceAuditRecord): Promise<void> {
    return notImplemented("EvidenceAuditRepositorySkeleton", "append");
  },
  listByEvidence(
    _tenantId: string,
    _evidenceId: string,
    _page?: PageRequest,
  ): Promise<Page<EvidenceAuditRecord>> {
    return notImplemented("EvidenceAuditRepositorySkeleton", "listByEvidence");
  },
};

export function createEvidenceUnitOfWorkSkeleton(
  overrides?: Partial<Omit<EvidenceUnitOfWork, "portId" | "execute">>,
): EvidenceUnitOfWork {
  const uow: EvidenceUnitOfWork = {
    portId: "EvidenceUnitOfWork",
    evidence: overrides?.evidence ?? EvidenceRepositorySkeleton,
    collections: overrides?.collections ?? EvidenceCollectionRepositorySkeleton,
    sets: overrides?.sets ?? EvidenceSetRepositorySkeleton,
    relationships: overrides?.relationships ?? EvidenceRelationshipRepositorySkeleton,
    versions: overrides?.versions ?? EvidenceVersionRepositorySkeleton,
    accessGrants: overrides?.accessGrants ?? EvidenceAccessGrantRepositorySkeleton,
    audit: overrides?.audit ?? EvidenceAuditRepositorySkeleton,
    execute<T>(_work: (unit: EvidenceUnitOfWork) => Promise<T>): Promise<T> {
      return notImplemented("EvidenceUnitOfWorkSkeleton", "execute");
    },
  };
  return uow;
}

export const EvidenceUnitOfWorkSkeleton = createEvidenceUnitOfWorkSkeleton();
