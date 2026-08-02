import type {
  ExecutionSessionAggregate,
  ExecutionSessionNode,
  ExecutionSessionState,
} from "../domain/types";

export type ExecutionSessionListFilter = {
  readonly tenantId: string;
  readonly projectId?: string;
  readonly status?: ExecutionSessionState;
  readonly ownerId?: string;
  readonly assigneeId?: string;
  readonly planId?: string;
  readonly handoffId?: string;
  readonly query?: string;
  readonly includeArchived?: boolean;
  readonly sortBy?: "name" | "updatedAt" | "createdAt" | "percentComplete";
  readonly sortDirection?: "asc" | "desc";
};

export type ExecutionSessionRepository = {
  get(
    tenantId: string,
    sessionId: string,
  ): Promise<ExecutionSessionAggregate | undefined>;
  findByHandoff(
    tenantId: string,
    handoffId: string,
  ): Promise<ExecutionSessionAggregate | undefined>;
  save(aggregate: ExecutionSessionAggregate): Promise<void>;
  list(filter: ExecutionSessionListFilter): Promise<readonly ExecutionSessionNode[]>;
};

export function createInMemoryExecutionSessionRepository(
  initial: readonly ExecutionSessionAggregate[] = [],
): ExecutionSessionRepository {
  const byKey = new Map<string, ExecutionSessionAggregate>();
  const key = (tenantId: string, sessionId: string) => `${tenantId}:${sessionId}`;

  for (const agg of initial) {
    byKey.set(key(agg.session.tenantId, agg.session.sessionId), agg);
  }

  return {
    async get(tenantId, sessionId) {
      return byKey.get(key(tenantId, sessionId));
    },
    async findByHandoff(tenantId, handoffId) {
      return [...byKey.values()].find(
        (a) =>
          a.session.tenantId === tenantId && a.session.planning.handoffId === handoffId,
      );
    },
    async save(aggregate) {
      byKey.set(
        key(aggregate.session.tenantId, aggregate.session.sessionId),
        aggregate,
      );
    },
    async list(filter) {
      let items = [...byKey.values()]
        .map((a) => a.session)
        .filter((s) => s.tenantId === filter.tenantId);

      if (!filter.includeArchived) {
        items = items.filter((s) => s.status !== "archived");
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
      if (filter.assigneeId) {
        items = items.filter(
          (s) =>
            s.assigneeIds.includes(filter.assigneeId!) ||
            s.ownerId === filter.assigneeId,
        );
      }
      if (filter.planId) {
        items = items.filter((s) => s.planning.planId === filter.planId);
      }
      if (filter.handoffId) {
        items = items.filter((s) => s.planning.handoffId === filter.handoffId);
      }
      if (filter.query?.trim()) {
        const q = filter.query.trim().toLowerCase();
        items = items.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.planning.suiteName.toLowerCase().includes(q) ||
            s.planning.planName.toLowerCase().includes(q),
        );
      }

      const sortBy = filter.sortBy ?? "updatedAt";
      const dir = filter.sortDirection === "asc" ? 1 : -1;
      items.sort((a, b) => {
        if (sortBy === "percentComplete") {
          return (a.progress.percentComplete - b.progress.percentComplete) * dir;
        }
        return String(a[sortBy] ?? "").localeCompare(String(b[sortBy] ?? "")) * dir;
      });
      return items;
    },
  };
}
