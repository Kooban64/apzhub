/**
 * In-memory version + storage-object repositories (APZDOCS-002).
 * Enforces content immutability after create.
 */

import type {
  DocumentContentVersionRecord,
  DocumentId,
  DocumentStorageObjectRecord,
  DocumentVersionId,
} from "@apzhub/document-contracts";
import type {
  DocumentStorageObjectRepositoryPort,
  DocumentVersionRepositoryPort,
} from "@apzhub/document-core";

export type DocumentVersionInMemoryStores = {
  readonly versions: Map<string, DocumentContentVersionRecord>;
  readonly storageObjects: Map<string, DocumentStorageObjectRecord>;
};

export function createEmptyDocumentVersionInMemoryStores(): DocumentVersionInMemoryStores {
  return {
    versions: new Map(),
    storageObjects: new Map(),
  };
}

function versionKey(tenantId: string, versionId: string): string {
  return `${tenantId}:${versionId}`;
}

export function createInMemoryDocumentVersionRepositories(
  stores: DocumentVersionInMemoryStores = createEmptyDocumentVersionInMemoryStores(),
): {
  versions: DocumentVersionRepositoryPort;
  storageObjects: DocumentStorageObjectRepositoryPort;
} {
  return {
    versions: {
      async create(ctx, version) {
        if (version.tenantId !== ctx.tenantId) throw new Error("tenant_mismatch");
        if (!version.immutable) {
          throw new Error("Content versions must be immutable");
        }
        const key = versionKey(ctx.tenantId, version.id);
        if (stores.versions.has(key)) {
          throw new Error("Version already exists");
        }
        stores.versions.set(key, version);
        return version;
      },
      async get(ctx, documentId, versionId) {
        const row = stores.versions.get(versionKey(ctx.tenantId, versionId));
        if (!row || row.documentId !== documentId) return null;
        if (
          ctx.organisationId &&
          row.organisationId &&
          row.organisationId !== ctx.organisationId
        ) {
          return null;
        }
        return row;
      },
      async listByDocument(ctx, documentId: DocumentId) {
        return [...stores.versions.values()]
          .filter(
            (row) => row.tenantId === ctx.tenantId && row.documentId === documentId,
          )
          .sort((a, b) => a.versionNumber - b.versionNumber);
      },
      async nextVersionNumber(ctx, documentId) {
        const existing = await this.listByDocument(ctx, documentId);
        return existing.length === 0
          ? 1
          : Math.max(...existing.map((row) => row.versionNumber)) + 1;
      },
      async findByChecksum(ctx, checksumHex) {
        return [...stores.versions.values()].filter(
          (row) =>
            row.tenantId === ctx.tenantId &&
            row.checksumHex.toLowerCase() === checksumHex.toLowerCase(),
        );
      },
      async updateStatus(ctx, documentId, versionId, status, options) {
        const key = versionKey(ctx.tenantId, versionId);
        const existing = stores.versions.get(key);
        if (!existing || existing.documentId !== documentId) {
          throw new Error(`document_version not found: ${versionId}`);
        }
        if (
          options?.expectedRevision !== undefined &&
          existing.revision !== options.expectedRevision
        ) {
          throw new Error("revision_conflict");
        }
        // Immutability: never change checksum, storageKey, byteLength, mimeType.
        const updated: DocumentContentVersionRecord = {
          ...existing,
          storageStatus: status,
          verifiedAt: options?.verifiedAt ?? existing.verifiedAt,
          revision: existing.revision + 1,
        };
        stores.versions.set(key, updated);
        return updated;
      },
    },
    storageObjects: {
      async create(ctx, record) {
        if (record.tenantId !== ctx.tenantId) throw new Error("tenant_mismatch");
        stores.storageObjects.set(`${ctx.tenantId}:${record.id}`, record);
        return record;
      },
      async getByVersion(ctx, versionId: DocumentVersionId) {
        return (
          [...stores.storageObjects.values()].find(
            (row) => row.tenantId === ctx.tenantId && row.versionId === versionId,
          ) ?? null
        );
      },
      async updateStatus(ctx, id, status, options) {
        const key = `${ctx.tenantId}:${id}`;
        const existing = stores.storageObjects.get(key);
        if (!existing) throw new Error(`storage_object not found: ${id}`);
        if (
          options?.expectedRevision !== undefined &&
          existing.revision !== options.expectedRevision
        ) {
          throw new Error("revision_conflict");
        }
        const updated: DocumentStorageObjectRecord = {
          ...existing,
          status,
          verifiedAt: options?.verifiedAt ?? existing.verifiedAt,
          updatedAt: new Date().toISOString(),
          revision: existing.revision + 1,
        };
        stores.storageObjects.set(key, updated);
        return updated;
      },
      async listReconciliationCandidates(ctx) {
        return [...stores.storageObjects.values()].filter(
          (row) =>
            row.tenantId === ctx.tenantId &&
            (row.status === "failed" ||
              row.status === "reconciliation_required" ||
              row.status === "writing"),
        );
      },
    },
  };
}
