/**
 * Dependency registration — APZQEP-ENG-110C/110D.
 * Placeholder persistence adapters + Application factory wiring.
 * Runtime persistence / transport remain inactive.
 */

import {
  createEvidenceApplicationServices,
  type EvidenceApplicationServices,
} from "../../application/services/create-application-services";
import type {
  EvidenceAccessGrantRepository,
  EvidenceAuditRepository,
  EvidenceCollectionRepository,
  EvidenceRelationshipRepository,
  EvidenceRepository,
  EvidenceSetRepository,
  EvidenceUnitOfWork,
  EvidenceVersionRepository,
} from "../../domain/ports/repositories";
import type { ClockPort, IdPort, StoragePort } from "../../application/ports";
import {
  EvidenceAccessGrantRepositorySkeleton,
  EvidenceAuditRepositorySkeleton,
  EvidenceCollectionRepositorySkeleton,
  EvidenceRelationshipRepositorySkeleton,
  EvidenceRepositorySkeleton,
  EvidenceSetRepositorySkeleton,
  EvidenceUnitOfWorkSkeleton,
  EvidenceVersionRepositorySkeleton,
} from "../persistence/repository-adapters";
import { StoragePortAdapterSkeleton } from "../storage/storage-port-adapter";

export type EvidencePersistenceRegistry = {
  readonly programme: "APZQEP-ENG-110C";
  readonly activated: false;
  readonly evidenceRepository: EvidenceRepository;
  readonly evidenceCollectionRepository: EvidenceCollectionRepository;
  readonly evidenceSetRepository: EvidenceSetRepository;
  readonly evidenceRelationshipRepository: EvidenceRelationshipRepository;
  readonly evidenceVersionRepository: EvidenceVersionRepository;
  readonly evidenceAccessGrantRepository: EvidenceAccessGrantRepository;
  readonly evidenceAuditRepository: EvidenceAuditRepository;
  readonly unitOfWork: EvidenceUnitOfWork;
  readonly storagePort: StoragePort;
};

export function createEvidencePersistenceRegistry(): EvidencePersistenceRegistry {
  return {
    programme: "APZQEP-ENG-110C",
    activated: false,
    evidenceRepository: EvidenceRepositorySkeleton,
    evidenceCollectionRepository: EvidenceCollectionRepositorySkeleton,
    evidenceSetRepository: EvidenceSetRepositorySkeleton,
    evidenceRelationshipRepository: EvidenceRelationshipRepositorySkeleton,
    evidenceVersionRepository: EvidenceVersionRepositorySkeleton,
    evidenceAccessGrantRepository: EvidenceAccessGrantRepositorySkeleton,
    evidenceAuditRepository: EvidenceAuditRepositorySkeleton,
    unitOfWork: EvidenceUnitOfWorkSkeleton,
    storagePort: StoragePortAdapterSkeleton,
  };
}

export const EVIDENCE_PERSISTENCE_REGISTRY_PLACEHOLDER =
  createEvidencePersistenceRegistry();

export type EvidenceApplicationRegistry = {
  readonly programme: "APZQEP-ENG-110E";
  readonly activated: false;
  readonly createServices: typeof createEvidenceApplicationServices;
  readonly securityEnforcedByDefault: true;
};

/**
 * Application + security DI registration. Callers supply working port implementations
 * (e.g. in-memory test doubles). Skeleton ports must not be activated for runtime.
 */
export function createEvidenceApplicationRegistry(): EvidenceApplicationRegistry {
  return {
    programme: "APZQEP-ENG-110E",
    activated: false,
    createServices: createEvidenceApplicationServices,
    securityEnforcedByDefault: true,
  };
}

export const EVIDENCE_APPLICATION_REGISTRY_PLACEHOLDER =
  createEvidenceApplicationRegistry();

/** Convenience for tests/local orchestration with explicit ports. */
export function buildEvidenceApplicationServices(input: {
  readonly uow: EvidenceUnitOfWork;
  readonly storage: StoragePort;
  readonly clock: ClockPort;
  readonly ids: IdPort;
}): EvidenceApplicationServices {
  return createEvidenceApplicationServices(input);
}
