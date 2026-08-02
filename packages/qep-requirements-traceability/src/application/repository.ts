import type {
  RequirementAggregate,
  RequirementCategory,
  RequirementLifecycleState,
  RequirementNode,
  RequirementPriority,
  RequirementRisk,
} from "../domain/types";

export type RequirementListFilter = {
  readonly tenantId: string;
  readonly projectId?: string;
  readonly status?: RequirementLifecycleState;
  readonly category?: RequirementCategory;
  readonly priority?: RequirementPriority;
  readonly risk?: RequirementRisk;
  readonly ownerId?: string;
  readonly suiteId?: string;
  readonly query?: string;
  readonly uncoveredOnly?: boolean;
  readonly highRiskOnly?: boolean;
  readonly includeArchived?: boolean;
  readonly sortBy?: "title" | "updatedAt" | "createdAt" | "priority" | "risk";
  readonly sortDirection?: "asc" | "desc";
};

export type RequirementRepository = {
  get(
    tenantId: string,
    requirementId: string,
  ): Promise<RequirementAggregate | undefined>;
  save(aggregate: RequirementAggregate): Promise<void>;
  list(filter: RequirementListFilter): Promise<readonly RequirementNode[]>;
};

const PRIORITY_RANK: Record<string, number> = {
  p0: 5,
  p1: 4,
  p2: 3,
  p3: 2,
  p4: 1,
};

const RISK_RANK: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function createInMemoryRequirementRepository(
  initial: readonly RequirementAggregate[] = [],
): RequirementRepository {
  const byKey = new Map<string, RequirementAggregate>();
  const key = (tenantId: string, requirementId: string) =>
    `${tenantId}:${requirementId}`;

  for (const agg of initial) {
    byKey.set(key(agg.requirement.tenantId, agg.requirement.requirementId), agg);
  }

  return {
    async get(tenantId, requirementId) {
      return byKey.get(key(tenantId, requirementId));
    },
    async save(aggregate) {
      byKey.set(
        key(aggregate.requirement.tenantId, aggregate.requirement.requirementId),
        aggregate,
      );
    },
    async list(filter) {
      let items = [...byKey.values()]
        .map((a) => a.requirement)
        .filter((r) => r.tenantId === filter.tenantId);

      if (!filter.includeArchived) {
        items = items.filter((r) => r.status !== "archived" && r.status !== "retired");
      }
      if (filter.projectId) {
        items = items.filter((r) => r.projectId === filter.projectId);
      }
      if (filter.status) {
        items = items.filter((r) => r.status === filter.status);
      }
      if (filter.category) {
        items = items.filter((r) => r.category === filter.category);
      }
      if (filter.priority) {
        items = items.filter((r) => r.priority === filter.priority);
      }
      if (filter.risk) {
        items = items.filter((r) => r.risk === filter.risk);
      }
      if (filter.ownerId) {
        items = items.filter((r) => r.ownerId === filter.ownerId);
      }
      if (filter.suiteId) {
        items = items.filter((r) =>
          r.suiteLinks.some((l) => l.suiteId === filter.suiteId),
        );
      }
      if (filter.uncoveredOnly) {
        items = items.filter((r) => r.suiteLinks.length === 0);
      }
      if (filter.highRiskOnly) {
        items = items.filter((r) => r.risk === "critical" || r.risk === "high");
      }
      if (filter.query?.trim()) {
        const q = filter.query.trim().toLowerCase();
        items = items.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.tags.some((t) => t.toLowerCase().includes(q)),
        );
      }

      const sortBy = filter.sortBy ?? "updatedAt";
      const dir = filter.sortDirection === "asc" ? 1 : -1;
      items.sort((a, b) => {
        if (sortBy === "priority") {
          return (
            ((PRIORITY_RANK[a.priority] ?? 0) - (PRIORITY_RANK[b.priority] ?? 0)) * dir
          );
        }
        if (sortBy === "risk") {
          return ((RISK_RANK[a.risk] ?? 0) - (RISK_RANK[b.risk] ?? 0)) * dir;
        }
        return String(a[sortBy] ?? "").localeCompare(String(b[sortBy] ?? "")) * dir;
      });
      return items;
    },
  };
}
