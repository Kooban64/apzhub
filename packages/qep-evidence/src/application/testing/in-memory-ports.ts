/**
 * In-memory port fakes for Application tests — APZQEP-ENG-110D.
 * Not a storage technology selection. Not production infrastructure.
 */

import { randomUUID } from "node:crypto";

import type { EvidenceCollection } from "../../domain/evidence/collection";
import type { Evidence, EvidenceVersion } from "../../domain/evidence/evidence";
import type { EvidenceRelationship } from "../../domain/evidence/relationship";
import type { EvidenceSet } from "../../domain/evidence/set";
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
import { EvidenceConcurrencyError } from "../../shared/errors";
import type {
  AuditPort,
  ClockPort,
  IdPort,
  StorageContentMetadata,
  StorageGetResult,
  StoragePort,
  StoragePutInput,
  StoragePutResult,
  StorageStreamHandle,
} from "../ports";

function asStoredEvidence(evidence: Evidence): StoredEvidence {
  return { ...evidence, uncommittedEvents: [] };
}

function asStoredCollection(collection: EvidenceCollection): StoredEvidenceCollection {
  return { ...collection, uncommittedEvents: [] };
}

function asStoredSet(set: EvidenceSet): StoredEvidenceSet {
  return { ...set, uncommittedEvents: [] };
}

function asStoredRelationship(
  relationship: EvidenceRelationship,
): StoredEvidenceRelationship {
  return { ...relationship, uncommittedEvents: [] };
}

function pageOf<T>(items: readonly T[], page?: PageRequest): Page<T> {
  const offset = page?.offset ?? 0;
  const limit = page?.limit ?? items.length;
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
  };
}

export function createInMemoryEvidenceRepository(): EvidenceRepository & {
  readonly store: Map<string, StoredEvidence>;
} {
  const store = new Map<string, StoredEvidence>();
  const key = (tenantId: string, id: string) => `${tenantId}:${id}`;

  return {
    portId: "EvidenceRepository",
    store,
    async save(evidence, expectedRevision) {
      const k = key(evidence.tenantId, evidence.id);
      const current = store.get(k);
      if (!current) {
        if (expectedRevision !== 0) {
          throw new EvidenceConcurrencyError(evidence.id, expectedRevision, -1);
        }
      } else if (current.revision !== expectedRevision) {
        throw new EvidenceConcurrencyError(
          evidence.id,
          expectedRevision,
          current.revision,
        );
      }
      const stored = asStoredEvidence(evidence);
      store.set(k, stored);
      return stored;
    },
    async getById(tenantId, id) {
      return store.get(key(tenantId, id)) ?? null;
    },
    async list(tenantId, filter: EvidenceListFilter = {}, page) {
      let items = [...store.values()].filter((item) => item.tenantId === tenantId);
      if (filter.projectId) {
        items = items.filter((item) => item.projectId === filter.projectId);
      }
      if (filter.workspaceId) {
        items = items.filter((item) => item.workspaceId === filter.workspaceId);
      }
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        items = items.filter((item) => statuses.includes(item.status));
      }
      if (filter.classification) {
        items = items.filter(
          (item) => item.classification?.category === filter.classification,
        );
      }
      if (filter.ownerId) {
        items = items.filter((item) => item.ownership.ownerId === filter.ownerId);
      }
      if (filter.legalHold !== undefined) {
        items = items.filter((item) => item.retention.legalHold === filter.legalHold);
      }
      return pageOf(items, page);
    },
  };
}

export function createInMemoryCollectionRepository(): EvidenceCollectionRepository & {
  readonly store: Map<string, StoredEvidenceCollection>;
} {
  const store = new Map<string, StoredEvidenceCollection>();
  const key = (tenantId: string, id: string) => `${tenantId}:${id}`;
  return {
    portId: "EvidenceCollectionRepository",
    store,
    async save(collection, expectedRevision) {
      const k = key(collection.tenantId, collection.id);
      const current = store.get(k);
      if (!current) {
        if (expectedRevision !== 0) {
          throw new EvidenceConcurrencyError(collection.id, expectedRevision, -1);
        }
      } else if (current.revision !== expectedRevision) {
        throw new EvidenceConcurrencyError(
          collection.id,
          expectedRevision,
          current.revision,
        );
      }
      const stored = asStoredCollection(collection);
      store.set(k, stored);
      return stored;
    },
    async getById(tenantId, id) {
      return store.get(key(tenantId, id)) ?? null;
    },
    async list(tenantId, projectId, page) {
      let items = [...store.values()].filter((item) => item.tenantId === tenantId);
      if (projectId) {
        items = items.filter((item) => item.projectId === projectId);
      }
      return pageOf(items, page);
    },
  };
}

export function createInMemorySetRepository(): EvidenceSetRepository & {
  readonly store: Map<string, StoredEvidenceSet>;
} {
  const store = new Map<string, StoredEvidenceSet>();
  const key = (tenantId: string, id: string) => `${tenantId}:${id}`;
  return {
    portId: "EvidenceSetRepository",
    store,
    async insert(set) {
      const k = key(set.tenantId, set.id);
      if (store.has(k)) {
        throw new EvidenceConcurrencyError(set.id, 0, 1);
      }
      const stored = asStoredSet(set);
      store.set(k, stored);
      return stored;
    },
    async getById(tenantId, id) {
      return store.get(key(tenantId, id)) ?? null;
    },
    async listByCollection(tenantId, collectionId) {
      return [...store.values()].filter(
        (item) =>
          item.tenantId === tenantId && item.sourceCollectionId === collectionId,
      );
    },
  };
}

export function createInMemoryRelationshipRepository(): EvidenceRelationshipRepository & {
  readonly store: Map<string, StoredEvidenceRelationship>;
} {
  const store = new Map<string, StoredEvidenceRelationship>();
  const key = (tenantId: string, id: string) => `${tenantId}:${id}`;
  return {
    portId: "EvidenceRelationshipRepository",
    store,
    async save(relationship) {
      const stored = asStoredRelationship(relationship);
      store.set(key(relationship.tenantId, relationship.id), stored);
      return stored;
    },
    async getById(tenantId, id) {
      return store.get(key(tenantId, id)) ?? null;
    },
    async listByEvidence(tenantId, evidenceId) {
      return [...store.values()].filter(
        (item) => item.tenantId === tenantId && item.evidenceId === evidenceId,
      );
    },
    async listByTarget(tenantId, targetCapability, targetId) {
      return [...store.values()].filter(
        (item) =>
          item.tenantId === tenantId &&
          item.targetCapability === targetCapability &&
          item.targetId === targetId,
      );
    },
    async delete(tenantId, relationshipId) {
      store.delete(key(tenantId, relationshipId));
    },
  };
}

export function createInMemoryVersionRepository(
  evidenceRepo: EvidenceRepository,
): EvidenceVersionRepository {
  return {
    portId: "EvidenceVersionRepository",
    async listByEvidence(tenantId, evidenceId) {
      const evidence = await evidenceRepo.getById(tenantId, evidenceId);
      return evidence?.versions ?? [];
    },
    async getVersion(tenantId, evidenceId, version) {
      const versions = await this.listByEvidence(tenantId, evidenceId);
      return versions.find((item: EvidenceVersion) => item.version === version) ?? null;
    },
  };
}

export function createInMemoryAccessGrantRepository(): EvidenceAccessGrantRepository & {
  readonly store: Map<string, EvidenceAccessGrant>;
} {
  const store = new Map<string, EvidenceAccessGrant>();
  return {
    portId: "EvidenceAccessGrantRepository",
    store,
    async save(grant) {
      store.set(`${grant.tenantId}:${grant.id}`, grant);
      return grant;
    },
    async revoke(tenantId, grantId, revokedAt) {
      const key = `${tenantId}:${grantId}`;
      const current = store.get(key);
      if (current) {
        store.set(key, { ...current, revokedAt });
      }
    },
    async findGrants(tenantId, query) {
      return [...store.values()].filter((grant) => {
        if (grant.tenantId !== tenantId) return false;
        if (grant.revokedAt) return false;
        if (grant.principalId !== query.principalId) return false;
        if (query.evidenceId && grant.evidenceId !== query.evidenceId) return false;
        if (query.scope && grant.scope !== query.scope) return false;
        return true;
      });
    },
  };
}

export function createInMemoryAuditRepository(): EvidenceAuditRepository & {
  readonly records: EvidenceAuditRecord[];
} {
  const records: EvidenceAuditRecord[] = [];
  return {
    portId: "EvidenceAuditRepository",
    records,
    async append(record) {
      records.push(record);
    },
    async listByEvidence(tenantId, evidenceId, page) {
      const items = records.filter(
        (item) => item.tenantId === tenantId && item.evidenceId === evidenceId,
      );
      return pageOf(items, page);
    },
  };
}

export function createInMemoryStoragePort(): StoragePort & {
  readonly blobs: Map<string, { bytes: Uint8Array; meta: StorageContentMetadata }>;
} {
  const blobs = new Map<string, { bytes: Uint8Array; meta: StorageContentMetadata }>();
  const key = (tenantId: string, locator: string) => `${tenantId}:${locator}`;
  let seq = 0;

  return {
    portId: "StoragePort",
    blobs,
    async put(input: StoragePutInput): Promise<StoragePutResult> {
      seq += 1;
      const storageLocator = `mem://${seq}`;
      const meta: StorageContentMetadata = {
        storageLocator,
        tenantId: input.tenantId,
        mediaType: input.mediaType,
        byteSize: input.bytes.byteLength,
        contentHash: input.contentHash,
        hashAlgorithm: input.hashAlgorithm,
        createdAt: new Date().toISOString(),
      };
      blobs.set(key(input.tenantId, storageLocator), {
        bytes: input.bytes,
        meta,
      });
      return {
        storageLocator,
        byteSize: input.bytes.byteLength,
        mediaType: input.mediaType,
      };
    },
    async get(tenantId, storageLocator): Promise<StorageGetResult> {
      const found = blobs.get(key(tenantId, storageLocator));
      if (!found) {
        throw new Error(`Storage locator not found: ${storageLocator}`);
      }
      return {
        bytes: found.bytes,
        mediaType: found.meta.mediaType,
        byteSize: found.meta.byteSize,
      };
    },
    async openStream(tenantId, storageLocator): Promise<StorageStreamHandle> {
      const found = await this.get(tenantId, storageLocator);
      return {
        kind: "storage-stream",
        storageLocator,
        mediaType: found.mediaType,
        byteSize: found.byteSize,
      };
    },
    async update(tenantId, storageLocator, input) {
      const k = key(tenantId, storageLocator);
      const existing = blobs.get(k);
      if (!existing) {
        throw new Error(`Storage locator not found: ${storageLocator}`);
      }
      const meta: StorageContentMetadata = {
        ...existing.meta,
        mediaType: input.mediaType,
        byteSize: input.bytes.byteLength,
        contentHash: input.contentHash,
        hashAlgorithm: input.hashAlgorithm,
      };
      blobs.set(k, { bytes: input.bytes, meta });
      return {
        storageLocator,
        byteSize: input.bytes.byteLength,
        mediaType: input.mediaType,
      };
    },
    async archive(tenantId, storageLocator) {
      const k = key(tenantId, storageLocator);
      const existing = blobs.get(k);
      if (!existing) return;
      blobs.set(k, {
        ...existing,
        meta: { ...existing.meta, archivedAt: new Date().toISOString() },
      });
    },
    async dispose(tenantId, storageLocator) {
      blobs.delete(key(tenantId, storageLocator));
    },
    async delete(tenantId, storageLocator) {
      await this.dispose(tenantId, storageLocator);
    },
    async exists(tenantId, storageLocator) {
      return blobs.has(key(tenantId, storageLocator));
    },
    async getMetadata(tenantId, storageLocator) {
      return blobs.get(key(tenantId, storageLocator))?.meta ?? null;
    },
  };
}

export function createInMemoryClockPort(
  fixedNow = "2026-07-30T12:00:00.000Z",
): ClockPort {
  return {
    portId: "ClockPort",
    now: () => fixedNow,
  };
}

export function createInMemoryIdPort(): IdPort {
  let n = 0;
  return {
    portId: "IdPort",
    createId(prefix = "id") {
      n += 1;
      return `${prefix}-${n}`;
    },
  };
}

/** Durable ID port for postgres catalogue — avoids restart collisions with sequential IDs. */
export function createUuidIdPort(): IdPort {
  return {
    portId: "IdPort",
    createId(prefix = "id") {
      return `${prefix}-${randomUUID()}`;
    },
  };
}

export function createInMemoryAuditPort(): AuditPort & {
  readonly entries: Array<Parameters<AuditPort["append"]>[0]>;
} {
  const entries: Array<Parameters<AuditPort["append"]>[0]> = [];
  return {
    portId: "AuditPort",
    entries,
    async append(entry) {
      entries.push(entry);
    },
  };
}

export function createInMemoryUnitOfWork(input?: {
  readonly evidence?: EvidenceRepository;
  readonly collections?: EvidenceCollectionRepository;
  readonly sets?: EvidenceSetRepository;
  readonly relationships?: EvidenceRelationshipRepository;
  readonly versions?: EvidenceVersionRepository;
  readonly accessGrants?: EvidenceAccessGrantRepository;
  readonly audit?: EvidenceAuditRepository;
}): EvidenceUnitOfWork {
  const evidence = input?.evidence ?? createInMemoryEvidenceRepository();
  const collections = input?.collections ?? createInMemoryCollectionRepository();
  const sets = input?.sets ?? createInMemorySetRepository();
  const relationships = input?.relationships ?? createInMemoryRelationshipRepository();
  const versions = input?.versions ?? createInMemoryVersionRepository(evidence);
  const accessGrants = input?.accessGrants ?? createInMemoryAccessGrantRepository();
  const audit = input?.audit ?? createInMemoryAuditRepository();

  const uow: EvidenceUnitOfWork = {
    portId: "EvidenceUnitOfWork",
    evidence,
    collections,
    sets,
    relationships,
    versions,
    accessGrants,
    audit,
    async execute(work) {
      return work(uow);
    },
  };
  return uow;
}
