import type {
  StoredTestPlan,
  TestPlanListQuery,
  TestPlanRepository,
} from "../../domain/test-plan/plan-repository";
import {
  PlanConcurrencyError,
  PlanConflictError,
  PlanNotFoundError,
} from "../../shared/errors";
import { matchesListFilters, toStoredTestPlan } from "../mappers/plan-mapper";

export type TestPlanInMemoryStore = {
  readonly plans: Map<string, StoredTestPlan>;
};

export function createEmptyTestPlanStore(): TestPlanInMemoryStore {
  return { plans: new Map() };
}

export function createInMemoryTestPlanRepository(
  store: TestPlanInMemoryStore,
): TestPlanRepository {
  return {
    async create(plan) {
      if (store.plans.has(plan.id)) {
        throw new PlanConflictError(`Test Plan already exists: ${plan.id}`);
      }
      for (const row of store.plans.values()) {
        if (row.tenantId === plan.tenantId && row.number === plan.number) {
          throw new PlanConflictError(
            `Test Plan number already exists for tenant: ${plan.number}`,
          );
        }
      }
      const stored = toStoredTestPlan(plan);
      store.plans.set(plan.id, stored);
      return stored;
    },

    async get(tenantId, id) {
      const row = store.plans.get(id);
      return row && row.tenantId === tenantId ? row : null;
    },

    async getByNumber(tenantId, number) {
      for (const row of store.plans.values()) {
        if (row.tenantId === tenantId && row.number === number) {
          return row;
        }
      }
      return null;
    },

    async save(plan, expectedRevision) {
      const existing = store.plans.get(plan.id);
      if (!existing || existing.tenantId !== plan.tenantId) {
        throw new PlanNotFoundError(`Test Plan not found: ${plan.id}`);
      }
      if (existing.revision !== expectedRevision) {
        throw new PlanConcurrencyError(plan.id, expectedRevision, existing.revision);
      }
      const stored = toStoredTestPlan(plan);
      store.plans.set(plan.id, stored);
      return stored;
    },

    async list(tenantId, query: TestPlanListQuery = {}) {
      const rows = [...store.plans.values()]
        .filter((row) => row.tenantId === tenantId)
        .filter((row) => matchesListFilters(row, query))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      const offset = query.offset ?? 0;
      const limit = query.limit ?? rows.length;
      return rows.slice(offset, offset + limit);
    },

    async exists(tenantId, id) {
      const row = store.plans.get(id);
      return Boolean(row && row.tenantId === tenantId);
    },

    async existsByNumber(tenantId, number) {
      for (const row of store.plans.values()) {
        if (row.tenantId === tenantId && row.number === number) {
          return true;
        }
      }
      return false;
    },

    async listHistory(tenantId, id) {
      const row = await this.get(tenantId, id);
      return row?.history.entries ?? [];
    },

    async listRevisions(tenantId, id) {
      const row = await this.get(tenantId, id);
      return row?.revisions ?? [];
    },
  };
}
