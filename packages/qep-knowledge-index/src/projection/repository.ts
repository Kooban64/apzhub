import type { KnowledgeEntityKind, KnowledgeIndexDocument } from "../domain/types";

export type ProjectionRepository = {
  upsert(document: KnowledgeIndexDocument): Promise<void>;
  remove(options: {
    readonly tenantId: string;
    readonly entityKind: KnowledgeEntityKind;
    readonly entityId: string;
  }): Promise<boolean>;
  get(options: {
    readonly tenantId: string;
    readonly entityKind: KnowledgeEntityKind;
    readonly entityId: string;
  }): Promise<KnowledgeIndexDocument | undefined>;
  list(options?: {
    readonly tenantId?: string;
    readonly entityKind?: KnowledgeEntityKind;
  }): Promise<readonly KnowledgeIndexDocument[]>;
  clear(options?: { readonly tenantId?: string }): Promise<number>;
  count(options?: {
    readonly tenantId?: string;
    readonly entityKind?: KnowledgeEntityKind;
  }): Promise<number>;
};

function docKey(
  tenantId: string,
  entityKind: KnowledgeEntityKind,
  entityId: string,
): string {
  return `${tenantId}:${entityKind}:${entityId}`;
}

export type InMemoryProjectionRepository = ProjectionRepository & {
  snapshot(): readonly KnowledgeIndexDocument[];
};

export function createInMemoryProjectionRepository(
  seed: readonly KnowledgeIndexDocument[] = [],
): InMemoryProjectionRepository {
  const rows = new Map<string, KnowledgeIndexDocument>(
    seed.map((d) => [docKey(d.tenantId, d.entityKind, d.entityId), d]),
  );

  return {
    async upsert(document) {
      rows.set(
        docKey(document.tenantId, document.entityKind, document.entityId),
        document,
      );
    },
    async remove({ tenantId, entityKind, entityId }) {
      return rows.delete(docKey(tenantId, entityKind, entityId));
    },
    async get({ tenantId, entityKind, entityId }) {
      return rows.get(docKey(tenantId, entityKind, entityId));
    },
    async list(options = {}) {
      return [...rows.values()].filter((d) => {
        if (options.tenantId && d.tenantId !== options.tenantId) return false;
        if (options.entityKind && d.entityKind !== options.entityKind) {
          return false;
        }
        return true;
      });
    },
    async clear(options = {}) {
      if (!options.tenantId) {
        const n = rows.size;
        rows.clear();
        return n;
      }
      let n = 0;
      for (const [key, doc] of rows) {
        if (doc.tenantId === options.tenantId) {
          rows.delete(key);
          n += 1;
        }
      }
      return n;
    },
    async count(options = {}) {
      return (await this.list(options)).length;
    },
    snapshot() {
      return [...rows.values()];
    },
  };
}
