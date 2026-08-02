import type {
  ExecutionPlanAggregate,
  ExecutionPlanLifecycleState,
  ExecutionPlanNode,
  ReadinessState,
} from "../domain/types";

export type ExecutionPlanListFilter = {
  readonly tenantId: string;
  readonly projectId?: string;
  readonly status?: ExecutionPlanLifecycleState;
  readonly readinessState?: ReadinessState;
  readonly suiteId?: string;
  readonly ownerId?: string;
  readonly assigneeId?: string;
  readonly query?: string;
  readonly includeArchived?: boolean;
  readonly sortBy?: "name" | "updatedAt" | "createdAt" | "priority" | "plannedStartAt";
  readonly sortDirection?: "asc" | "desc";
};

export type ExecutionPlanRepository = {
  get(tenantId: string, planId: string): Promise<ExecutionPlanAggregate | undefined>;
  save(aggregate: ExecutionPlanAggregate): Promise<void>;
  list(filter: ExecutionPlanListFilter): Promise<readonly ExecutionPlanNode[]>;
};

function isAssignee(plan: ExecutionPlanNode, userId: string): boolean {
  return (
    plan.ownerId === userId ||
    plan.assignments.testLeadId === userId ||
    plan.assignments.testerIds.includes(userId) ||
    plan.assignments.reviewerIds.includes(userId) ||
    plan.assignments.approverIds.includes(userId) ||
    plan.assignments.observerIds.includes(userId)
  );
}

export function createInMemoryExecutionPlanRepository(
  initial: readonly ExecutionPlanAggregate[] = [],
): ExecutionPlanRepository {
  const byKey = new Map<string, ExecutionPlanAggregate>();
  const key = (tenantId: string, planId: string) => `${tenantId}:${planId}`;

  for (const agg of initial) {
    byKey.set(key(agg.plan.tenantId, agg.plan.planId), agg);
  }

  return {
    async get(tenantId, planId) {
      return byKey.get(key(tenantId, planId));
    },
    async save(aggregate) {
      byKey.set(key(aggregate.plan.tenantId, aggregate.plan.planId), aggregate);
    },
    async list(filter) {
      let items = [...byKey.values()]
        .map((a) => a.plan)
        .filter((p) => p.tenantId === filter.tenantId);

      if (!filter.includeArchived) {
        items = items.filter((p) => p.status !== "archived" && p.status !== "retired");
      }
      if (filter.projectId) {
        items = items.filter((p) => p.projectId === filter.projectId);
      }
      if (filter.status) {
        items = items.filter((p) => p.status === filter.status);
      }
      if (filter.readinessState) {
        items = items.filter(
          (p) => p.readiness.readinessState === filter.readinessState,
        );
      }
      if (filter.suiteId) {
        items = items.filter((p) => p.suiteRef.suiteId === filter.suiteId);
      }
      if (filter.ownerId) {
        items = items.filter((p) => p.ownerId === filter.ownerId);
      }
      if (filter.assigneeId) {
        items = items.filter((p) => isAssignee(p, filter.assigneeId!));
      }
      if (filter.query?.trim()) {
        const q = filter.query.trim().toLowerCase();
        items = items.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.suiteRef.suiteName.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q)),
        );
      }

      const sortBy = filter.sortBy ?? "updatedAt";
      const dir = filter.sortDirection === "asc" ? 1 : -1;
      items.sort((a, b) => {
        let av = "";
        let bv = "";
        if (sortBy === "plannedStartAt") {
          av = a.schedule.plannedStartAt ?? "";
          bv = b.schedule.plannedStartAt ?? "";
        } else {
          av = String(a[sortBy] ?? "");
          bv = String(b[sortBy] ?? "");
        }
        return av.localeCompare(bv) * dir;
      });
      return items;
    },
  };
}
