import type {
  BulkOperation,
  ProductivitySession,
  SavedSearch,
} from "@apzhub/platform-service-contracts";

type Bucket = {
  savedSearches: Map<string, SavedSearch>;
  bulkOps: Map<string, BulkOperation>;
  sessions: Map<string, ProductivitySession>;
  events: { type: string; payload: Record<string, unknown>; at: string }[];
};

const tenants = new Map<string, Bucket>();

function bucket(tenantId: string): Bucket {
  let b = tenants.get(tenantId);
  if (!b) {
    b = {
      savedSearches: new Map(),
      bulkOps: new Map(),
      sessions: new Map(),
      events: [],
    };
    tenants.set(tenantId, b);
  }
  return b;
}

export type ProjectsProductivityStore = {
  readonly listSavedSearches: (
    tenantId: string,
    ownerUserId: string,
  ) => Promise<readonly SavedSearch[]>;
  readonly getSavedSearch: (
    tenantId: string,
    id: string,
  ) => Promise<SavedSearch | null>;
  readonly upsertSavedSearch: (
    tenantId: string,
    row: SavedSearch,
  ) => Promise<SavedSearch>;
  readonly deleteSavedSearch: (tenantId: string, id: string) => Promise<boolean>;
  readonly getBulkOperation: (
    tenantId: string,
    id: string,
  ) => Promise<BulkOperation | null>;
  readonly upsertBulkOperation: (
    tenantId: string,
    row: BulkOperation,
  ) => Promise<BulkOperation>;
  readonly listSessions: (
    tenantId: string,
    ownerUserId: string,
  ) => Promise<readonly ProductivitySession[]>;
  readonly getSession: (
    tenantId: string,
    id: string,
  ) => Promise<ProductivitySession | null>;
  readonly upsertSession: (
    tenantId: string,
    row: ProductivitySession,
  ) => Promise<ProductivitySession>;
  readonly publishEvent: (
    tenantId: string,
    type: string,
    payload: Record<string, unknown>,
  ) => Promise<void>;
};

let override: ProjectsProductivityStore | null = null;

export function setProjectsProductivityStoreForTests(
  store: ProjectsProductivityStore | null,
): void {
  override = store;
}

export function resetProjectsProductivityStoreForTests(): void {
  tenants.clear();
  override = null;
}

export function getMemoryProjectsProductivityStore(): ProjectsProductivityStore {
  return {
    async listSavedSearches(tenantId, ownerUserId) {
      return [...bucket(tenantId).savedSearches.values()]
        .filter((s) => s.ownerUserId === ownerUserId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async getSavedSearch(tenantId, id) {
      return bucket(tenantId).savedSearches.get(id) ?? null;
    },
    async upsertSavedSearch(tenantId, row) {
      bucket(tenantId).savedSearches.set(row.id, row);
      return row;
    },
    async deleteSavedSearch(tenantId, id) {
      return bucket(tenantId).savedSearches.delete(id);
    },
    async getBulkOperation(tenantId, id) {
      return bucket(tenantId).bulkOps.get(id) ?? null;
    },
    async upsertBulkOperation(tenantId, row) {
      bucket(tenantId).bulkOps.set(row.id, row);
      return row;
    },
    async listSessions(tenantId, ownerUserId) {
      return [...bucket(tenantId).sessions.values()]
        .filter((s) => s.ownerUserId === ownerUserId)
        .sort((a, b) => b.lastResumedAt.localeCompare(a.lastResumedAt));
    },
    async getSession(tenantId, id) {
      return bucket(tenantId).sessions.get(id) ?? null;
    },
    async upsertSession(tenantId, row) {
      bucket(tenantId).sessions.set(row.id, row);
      return row;
    },
    async publishEvent(tenantId, type, payload) {
      bucket(tenantId).events.push({
        type,
        payload,
        at: new Date().toISOString(),
      });
    },
  };
}

export function resolveProjectsProductivityStore(
  store?: ProjectsProductivityStore,
): ProjectsProductivityStore {
  if (store) return store;
  if (override) return override;
  return getMemoryProjectsProductivityStore();
}
