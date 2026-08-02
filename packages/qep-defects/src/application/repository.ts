import type {
  DefectAggregate,
  DefectLifecycleState,
  DefectNode,
  DefectPriority,
  DefectSeverity,
} from "../domain/types";

export type DefectListFilter = {
  readonly tenantId: string;
  readonly projectId?: string;
  readonly status?: DefectLifecycleState;
  readonly severity?: DefectSeverity;
  readonly priority?: DefectPriority;
  readonly assigneeId?: string;
  readonly reporterId?: string;
  readonly sessionId?: string;
  readonly suiteId?: string;
  readonly query?: string;
  readonly includeArchived?: boolean;
  readonly sortBy?: "title" | "updatedAt" | "createdAt" | "severity" | "priority";
  readonly sortDirection?: "asc" | "desc";
};

export type DefectRepository = {
  get(tenantId: string, defectId: string): Promise<DefectAggregate | undefined>;
  save(aggregate: DefectAggregate): Promise<void>;
  list(filter: DefectListFilter): Promise<readonly DefectNode[]>;
};

const SEVERITY_RANK: Record<string, number> = {
  critical: 4,
  major: 3,
  minor: 2,
  trivial: 1,
};

const PRIORITY_RANK: Record<string, number> = {
  p0: 5,
  p1: 4,
  p2: 3,
  p3: 2,
  p4: 1,
};

export function createInMemoryDefectRepository(
  initial: readonly DefectAggregate[] = [],
): DefectRepository {
  const byKey = new Map<string, DefectAggregate>();
  const key = (tenantId: string, defectId: string) => `${tenantId}:${defectId}`;

  for (const agg of initial) {
    byKey.set(key(agg.defect.tenantId, agg.defect.defectId), agg);
  }

  return {
    async get(tenantId, defectId) {
      return byKey.get(key(tenantId, defectId));
    },
    async save(aggregate) {
      byKey.set(key(aggregate.defect.tenantId, aggregate.defect.defectId), aggregate);
    },
    async list(filter) {
      let items = [...byKey.values()]
        .map((a) => a.defect)
        .filter((d) => d.tenantId === filter.tenantId);

      if (!filter.includeArchived) {
        items = items.filter((d) => d.status !== "archived");
      }
      if (filter.projectId) {
        items = items.filter((d) => d.projectId === filter.projectId);
      }
      if (filter.status) {
        items = items.filter((d) => d.status === filter.status);
      }
      if (filter.severity) {
        items = items.filter((d) => d.severity === filter.severity);
      }
      if (filter.priority) {
        items = items.filter((d) => d.priority === filter.priority);
      }
      if (filter.assigneeId) {
        items = items.filter((d) => d.assigneeId === filter.assigneeId);
      }
      if (filter.reporterId) {
        items = items.filter((d) => d.reporterId === filter.reporterId);
      }
      if (filter.sessionId) {
        items = items.filter((d) => d.executionOrigin?.sessionId === filter.sessionId);
      }
      if (filter.suiteId) {
        items = items.filter((d) => d.executionOrigin?.suiteId === filter.suiteId);
      }
      if (filter.query?.trim()) {
        const q = filter.query.trim().toLowerCase();
        items = items.filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q) ||
            d.tags.some((t) => t.toLowerCase().includes(q)),
        );
      }

      const sortBy = filter.sortBy ?? "updatedAt";
      const dir = filter.sortDirection === "asc" ? 1 : -1;
      items.sort((a, b) => {
        if (sortBy === "severity") {
          return (
            ((SEVERITY_RANK[a.severity] ?? 0) - (SEVERITY_RANK[b.severity] ?? 0)) * dir
          );
        }
        if (sortBy === "priority") {
          return (
            ((PRIORITY_RANK[a.priority] ?? 0) - (PRIORITY_RANK[b.priority] ?? 0)) * dir
          );
        }
        return String(a[sortBy] ?? "").localeCompare(String(b[sortBy] ?? "")) * dir;
      });
      return items;
    },
  };
}
