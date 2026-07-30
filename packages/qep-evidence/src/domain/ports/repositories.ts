/**
 * Domain repository ports — APZQEP-ENG-110C.
 * Interfaces only. Implementations live in infrastructure adapters.
 * Dependency direction: Infrastructure → Domain (never reverse).
 */

import type { EvidenceCollection } from "../evidence/collection";
import type { Evidence, EvidenceVersion } from "../evidence/evidence";
import type { EvidenceRelationship } from "../evidence/relationship";
import type { EvidenceSet } from "../evidence/set";
import type { EvidenceStatus } from "../evidence/value-objects";

export type PageRequest = {
  readonly limit?: number;
  readonly offset?: number;
};

export type Page<T> = {
  readonly items: readonly T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
};

export type EvidenceListFilter = {
  readonly projectId?: string;
  readonly workspaceId?: string;
  readonly status?: EvidenceStatus | readonly EvidenceStatus[];
  readonly classification?: string;
  readonly ownerId?: string;
  readonly legalHold?: boolean;
};

/** Stored aggregate omits uncommitted domain events. */
export type StoredEvidence = Omit<Evidence, "uncommittedEvents"> & {
  readonly uncommittedEvents: readonly [];
};

export type StoredEvidenceCollection = Omit<EvidenceCollection, "uncommittedEvents"> & {
  readonly uncommittedEvents: readonly [];
};

export type StoredEvidenceSet = Omit<EvidenceSet, "uncommittedEvents"> & {
  readonly uncommittedEvents: readonly [];
};

export type StoredEvidenceRelationship = Omit<
  EvidenceRelationship,
  "uncommittedEvents"
> & {
  readonly uncommittedEvents: readonly [];
};

/**
 * Evidence aggregate persistence contract.
 * Concurrent save with stale revision SHALL fail with conflict (adapter responsibility).
 */
export type EvidenceRepository = {
  readonly portId: "EvidenceRepository";
  save(evidence: Evidence, expectedRevision: number): Promise<StoredEvidence>;
  getById(tenantId: string, id: string): Promise<StoredEvidence | null>;
  list(
    tenantId: string,
    filter?: EvidenceListFilter,
    page?: PageRequest,
  ): Promise<Page<StoredEvidence>>;
};

export type EvidenceCollectionRepository = {
  readonly portId: "EvidenceCollectionRepository";
  save(
    collection: EvidenceCollection,
    expectedRevision: number,
  ): Promise<StoredEvidenceCollection>;
  getById(tenantId: string, id: string): Promise<StoredEvidenceCollection | null>;
  list(
    tenantId: string,
    projectId?: string,
    page?: PageRequest,
  ): Promise<Page<StoredEvidenceCollection>>;
};

/** EvidenceSet is insert-once (immutable membership). */
export type EvidenceSetRepository = {
  readonly portId: "EvidenceSetRepository";
  insert(set: EvidenceSet): Promise<StoredEvidenceSet>;
  getById(tenantId: string, id: string): Promise<StoredEvidenceSet | null>;
  listByCollection(
    tenantId: string,
    collectionId: string,
  ): Promise<readonly StoredEvidenceSet[]>;
};

export type EvidenceRelationshipRepository = {
  readonly portId: "EvidenceRelationshipRepository";
  save(relationship: EvidenceRelationship): Promise<StoredEvidenceRelationship>;
  getById(tenantId: string, id: string): Promise<StoredEvidenceRelationship | null>;
  listByEvidence(
    tenantId: string,
    evidenceId: string,
  ): Promise<readonly StoredEvidenceRelationship[]>;
  listByTarget(
    tenantId: string,
    targetCapability: string,
    targetId: string,
  ): Promise<readonly StoredEvidenceRelationship[]>;
  delete(tenantId: string, relationshipId: string): Promise<void>;
};

/**
 * Optional dedicated version history access.
 * Versions also embed on Evidence aggregate; this port supports query-side history.
 */
export type EvidenceVersionRepository = {
  readonly portId: "EvidenceVersionRepository";
  listByEvidence(
    tenantId: string,
    evidenceId: string,
  ): Promise<readonly EvidenceVersion[]>;
  getVersion(
    tenantId: string,
    evidenceId: string,
    version: number,
  ): Promise<EvidenceVersion | null>;
};

export type EvidenceAccessGrant = {
  readonly id: string;
  readonly tenantId: string;
  readonly evidenceId?: string;
  readonly scope?: string;
  readonly principalId: string;
  readonly action: string;
  readonly effect: "allow";
  readonly createdAt: string;
  readonly createdBy: string;
  readonly revokedAt?: string;
};

export type EvidenceAccessGrantRepository = {
  readonly portId: "EvidenceAccessGrantRepository";
  save(grant: EvidenceAccessGrant): Promise<EvidenceAccessGrant>;
  revoke(tenantId: string, grantId: string, revokedAt: string): Promise<void>;
  findGrants(
    tenantId: string,
    query: {
      readonly evidenceId?: string;
      readonly scope?: string;
      readonly principalId: string;
    },
  ): Promise<readonly EvidenceAccessGrant[]>;
};

export type EvidenceAuditRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly evidenceId: string;
  readonly action: string;
  readonly actorId: string;
  readonly outcome: "allowed" | "denied";
  readonly correlationId?: string;
  readonly occurredAt: string;
  readonly details?: Readonly<Record<string, unknown>>;
};

export type EvidenceAuditRepository = {
  readonly portId: "EvidenceAuditRepository";
  append(record: EvidenceAuditRecord): Promise<void>;
  listByEvidence(
    tenantId: string,
    evidenceId: string,
    page?: PageRequest,
  ): Promise<Page<EvidenceAuditRecord>>;
};

/**
 * Coordinates multi-repository operations conceptually.
 * No transaction manager implementation under ENG-110C.
 */
export type EvidenceUnitOfWork = {
  readonly portId: "EvidenceUnitOfWork";
  readonly evidence: EvidenceRepository;
  readonly collections: EvidenceCollectionRepository;
  readonly sets: EvidenceSetRepository;
  readonly relationships: EvidenceRelationshipRepository;
  readonly versions: EvidenceVersionRepository;
  readonly accessGrants: EvidenceAccessGrantRepository;
  readonly audit: EvidenceAuditRepository;
  /**
   * Execute work within a conceptual unit of work.
   * Skeleton adapters SHALL reject with PersistenceNotImplementedError.
   */
  execute<T>(work: (uow: EvidenceUnitOfWork) => Promise<T>): Promise<T>;
};
