/**
 * In-memory Document Platform repositories (APZDOCS-001).
 * Metadata only — never stores binary blobs.
 */

import type {
  Document,
  DocumentAudit,
  DocumentId,
  DocumentMetadata,
  DocumentRelationship,
  DocumentRequestContext,
  DocumentTag,
  DocumentTagId,
} from "@apzhub/document-contracts";
import { asDocumentTagId } from "@apzhub/document-contracts";
import type {
  DocumentAuditRepositoryPort,
  DocumentMetadataRepositoryPort,
  DocumentRelationshipRepositoryPort,
  DocumentRepositoryPort,
  DocumentTagRepositoryPort,
} from "@apzhub/document-core";

export type DocumentInMemoryStores = {
  readonly documents: Map<string, Document>;
  readonly metadata: Map<string, DocumentMetadata>;
  readonly tags: Map<string, DocumentTag>;
  readonly relationships: Map<string, DocumentRelationship>;
  readonly audits: Map<string, DocumentAudit>;
};

export function createEmptyDocumentInMemoryStores(): DocumentInMemoryStores {
  return {
    documents: new Map(),
    metadata: new Map(),
    tags: new Map(),
    relationships: new Map(),
    audits: new Map(),
  };
}

function assertTenant(ctx: DocumentRequestContext, tenantId: string): void {
  if (tenantId !== ctx.tenantId) {
    throw new Error("tenant_mismatch");
  }
}

export function createInMemoryDocumentRepositories(
  stores: DocumentInMemoryStores,
): {
  documents: DocumentRepositoryPort;
  metadata: DocumentMetadataRepositoryPort;
  tags: DocumentTagRepositoryPort;
  relationships: DocumentRelationshipRepositoryPort;
  audits: DocumentAuditRepositoryPort;
} {
  return {
    documents: {
      async create(ctx, document) {
        assertTenant(ctx, document.tenantId);
        stores.documents.set(document.id, document);
        return document;
      },
      async get(ctx, documentId) {
        const row = stores.documents.get(documentId) ?? null;
        if (row && row.tenantId !== ctx.tenantId) return null;
        return row;
      },
      async update(ctx, document) {
        assertTenant(ctx, document.tenantId);
        stores.documents.set(document.id, document);
        return document;
      },
      async list(ctx) {
        return [...stores.documents.values()].filter(
          (row) => row.tenantId === ctx.tenantId,
        );
      },
    },
    metadata: {
      async upsert(ctx, metadata) {
        assertTenant(ctx, metadata.tenantId);
        stores.metadata.set(metadata.documentId, metadata);
        return metadata;
      },
      async getByDocumentId(ctx, documentId) {
        const row = stores.metadata.get(documentId) ?? null;
        if (row && row.tenantId !== ctx.tenantId) return null;
        return row;
      },
    },
    tags: {
      async list(ctx) {
        return [...stores.tags.values()].filter(
          (row) => row.tenantId === ctx.tenantId,
        );
      },
      async get(ctx, tagId) {
        const row = stores.tags.get(tagId) ?? null;
        if (row && row.tenantId !== ctx.tenantId) return null;
        return row;
      },
      async ensure(ctx, name) {
        const normalized = name.trim().toLowerCase();
        if (!normalized) {
          throw new Error("tag name is required");
        }
        for (const existing of stores.tags.values()) {
          if (
            existing.tenantId === ctx.tenantId &&
            existing.name.toLowerCase() === normalized
          ) {
            return existing;
          }
        }
        const tag: DocumentTag = {
          id: asDocumentTagId(`tag_${stores.tags.size + 1}_${normalized}`),
          tenantId: ctx.tenantId,
          name: name.trim(),
          createdAt: new Date().toISOString(),
        };
        stores.tags.set(tag.id, tag);
        return tag;
      },
    },
    relationships: {
      async create(ctx, relationship) {
        assertTenant(ctx, relationship.tenantId);
        stores.relationships.set(relationship.id, relationship);
        return relationship;
      },
      async listByDocument(ctx, documentId: DocumentId) {
        return [...stores.relationships.values()].filter(
          (row) =>
            row.tenantId === ctx.tenantId &&
            (row.sourceDocumentId === documentId ||
              row.targetDocumentId === documentId),
        );
      },
    },
    audits: {
      async append(ctx, audit) {
        assertTenant(ctx, audit.tenantId);
        stores.audits.set(audit.id, audit);
        return audit;
      },
      async listByDocument(ctx, documentId) {
        return [...stores.audits.values()]
          .filter(
            (row) =>
              row.tenantId === ctx.tenantId && row.documentId === documentId,
          )
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      },
    },
  };
}

export type InMemoryDocumentRepositories = ReturnType<
  typeof createInMemoryDocumentRepositories
>;

export function createDocumentPlatformReposFromMemory(
  stores: DocumentInMemoryStores = createEmptyDocumentInMemoryStores(),
): InMemoryDocumentRepositories {
  return createInMemoryDocumentRepositories(stores);
}

/** Type guard helper for tests — tag id branding. */
export function asStoredTagId(value: string): DocumentTagId {
  return asDocumentTagId(value);
}
