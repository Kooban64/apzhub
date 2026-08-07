import type { KnowledgeObject } from "@apzhub/platform-service-contracts";

export type OrganisationalMemoryStore = {
  list(tenantId: string, kind?: string): Promise<KnowledgeObject[]>;
  get(tenantId: string, id: string): Promise<KnowledgeObject | null>;
  upsert(item: KnowledgeObject): Promise<KnowledgeObject>;
};

function k(tenantId: string, id: string) {
  return `${tenantId}|${id}`;
}

export function createMemoryOrganisationalMemoryStore(): OrganisationalMemoryStore {
  const objects = new Map<string, KnowledgeObject>();

  return {
    async list(tenantId, kind) {
      return [...objects.values()]
        .filter(
          (item) =>
            item.tenantId === tenantId && (kind === undefined || item.kind === kind),
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async get(tenantId, id) {
      return objects.get(k(tenantId, id)) ?? null;
    },
    async upsert(item) {
      const frozen = Object.freeze({
        ...item,
        body: Object.freeze({ ...item.body }),
        tags: Object.freeze([...item.tags]),
        relatedProducts: Object.freeze([...item.relatedProducts]),
        relatedCapabilities: Object.freeze([...item.relatedCapabilities]),
        versionHistory: Object.freeze(
          item.versionHistory.map((entry) => Object.freeze({ ...entry })),
        ),
      });
      objects.set(k(item.tenantId, item.id), frozen);
      return frozen;
    },
  };
}

let singleton: OrganisationalMemoryStore | undefined;

export function getMemoryOrganisationalMemoryStore(): OrganisationalMemoryStore {
  if (!singleton) singleton = createMemoryOrganisationalMemoryStore();
  return singleton;
}

export function resetMemoryOrganisationalMemoryStoreForTests(): void {
  singleton = createMemoryOrganisationalMemoryStore();
}
