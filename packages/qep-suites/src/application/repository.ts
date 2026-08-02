import type { SuiteAggregate, SuiteLifecycleState, SuiteNode } from "../domain/types";

export type SuiteListFilter = {
  readonly tenantId: string;
  readonly projectId?: string;
  readonly status?: SuiteLifecycleState;
  readonly query?: string;
  readonly tags?: readonly string[];
  readonly ownerId?: string;
  readonly parentSuiteId?: string | null;
  readonly includeDeleted?: boolean;
  readonly sortBy?: "name" | "updatedAt" | "createdAt" | "priority";
  readonly sortDirection?: "asc" | "desc";
};

export type SuiteRepository = {
  get(tenantId: string, suiteId: string): Promise<SuiteAggregate | undefined>;
  save(aggregate: SuiteAggregate): Promise<void>;
  list(filter: SuiteListFilter): Promise<readonly SuiteNode[]>;
  listChildren(tenantId: string, parentSuiteId: string): Promise<readonly SuiteNode[]>;
};

export function createInMemorySuiteRepository(
  initial: readonly SuiteAggregate[] = [],
): SuiteRepository {
  const byKey = new Map<string, SuiteAggregate>();
  const key = (tenantId: string, suiteId: string): string => `${tenantId}:${suiteId}`;

  for (const agg of initial) {
    byKey.set(key(agg.suite.tenantId, agg.suite.suiteId), agg);
  }

  return {
    async get(tenantId, suiteId) {
      return byKey.get(key(tenantId, suiteId));
    },
    async save(aggregate) {
      byKey.set(key(aggregate.suite.tenantId, aggregate.suite.suiteId), aggregate);
    },
    async list(filter) {
      let items = [...byKey.values()]
        .map((a) => a.suite)
        .filter((s) => s.tenantId === filter.tenantId);

      if (!filter.includeDeleted) {
        items = items.filter((s) => s.status !== "deleted");
      }
      if (filter.projectId) {
        items = items.filter((s) => s.projectId === filter.projectId);
      }
      if (filter.status) {
        items = items.filter((s) => s.status === filter.status);
      }
      if (filter.ownerId) {
        items = items.filter((s) => s.ownerId === filter.ownerId);
      }
      if (filter.parentSuiteId === null) {
        items = items.filter((s) => !s.parentSuiteId);
      } else if (filter.parentSuiteId) {
        items = items.filter((s) => s.parentSuiteId === filter.parentSuiteId);
      }
      if (filter.tags?.length) {
        items = items.filter((s) => filter.tags!.every((t) => s.tags.includes(t)));
      }
      if (filter.query?.trim()) {
        const q = filter.query.trim().toLowerCase();
        items = items.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q)),
        );
      }

      const sortBy = filter.sortBy ?? "updatedAt";
      const dir = filter.sortDirection === "asc" ? 1 : -1;
      items.sort((a, b) => {
        const av = String(a[sortBy] ?? "");
        const bv = String(b[sortBy] ?? "");
        return av.localeCompare(bv) * dir;
      });
      return items;
    },
    async listChildren(tenantId, parentSuiteId) {
      return this.list({ tenantId, parentSuiteId });
    },
  };
}
