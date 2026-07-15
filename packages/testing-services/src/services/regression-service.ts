import type { RegressionService, RegressionSuite } from "@apzhub/testing-contracts";
import {
  asRegressionSuiteId,
  asTestPlanId,
  asTestSuiteId,
  type RegressionSuiteId,
  type TestPlanId,
  type TestSuiteId,
} from "@apzhub/testing-contracts";
import type { RegressionSetRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { assertNonEmpty } from "../validation/domain-validation";
import { requireFound } from "./errors";
import type { ServiceRuntime } from "./types";

function toDomain(row: RegressionSetRecord): RegressionSuite {
  return {
    id: asRegressionSuiteId(row.id),
    tenantId: row.tenantId,
    key: row.key,
    name: row.name,
    description: row.description,
    suiteIds: row.suiteIds.map((id) => asTestSuiteId(id)),
    planId: row.planId ? asTestPlanId(row.planId) : undefined,
    ownerId: row.ownerId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createRegressionService(rt: ServiceRuntime): RegressionService {
  return {
    async list(ctx) {
      const page = await rt.persistence.regressionSets.list(toRepositoryContext(ctx));
      return page.items.map(toDomain);
    },
    async get(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.regressionSets.get(toRepositoryContext(ctx), id),
          "regression_set",
          id,
        ),
      );
    },
    async create(ctx, input) {
      assertNonEmpty(input.key, "key");
      assertNonEmpty(input.name, "name");
      const row = await rt.persistence.regressionSets.create(toRepositoryContext(ctx), {
        key: input.key,
        name: input.name,
        description: input.description,
        planId: input.planId,
        suiteIds: (input.suiteIds as readonly string[]) ?? [],
        ownerId: input.ownerId,
        organisationId: ctx.organisationId,
      });
      rt.events.record({
        eventType: "regression_set.created",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { regressionSetId: row.id },
      });
      return toDomain(row);
    },
    async update(ctx, id, input) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.regressionSets.get(rctx, id),
        "regression_set",
        id,
      );
      const row = await rt.persistence.regressionSets.update(rctx, id, existing.revision, {
        name: input.name,
        description: input.description,
        planId: input.planId,
        suiteIds: input.suiteIds as readonly string[] | undefined,
        ownerId: input.ownerId,
      });
      rt.events.record({
        eventType: "regression_set.updated",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { regressionSetId: row.id },
      });
      return toDomain(row);
    },
    async archive(ctx, id: RegressionSuiteId) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.regressionSets.get(rctx, id),
        "regression_set",
        id,
      );
      return toDomain(
        await rt.persistence.regressionSets.archive(rctx, id, existing.revision),
      );
    },
    async addSuite(ctx, id, suiteId: TestSuiteId) {
      const current = await this.get(ctx, id);
      if (current.suiteIds.includes(suiteId)) return current;
      return this.update(ctx, id, { suiteIds: [...current.suiteIds, suiteId] });
    },
    async removeSuite(ctx, id, suiteId: TestSuiteId) {
      const current = await this.get(ctx, id);
      return this.update(ctx, id, {
        suiteIds: current.suiteIds.filter((s) => s !== suiteId),
      });
    },
    async assignPlan(ctx, id, planId: TestPlanId | null) {
      return this.update(ctx, id, { planId: planId ?? undefined });
    },
    async assignOwner(ctx, id, ownerId: string) {
      assertNonEmpty(ownerId, "ownerId");
      return this.update(ctx, id, { ownerId });
    },
  };
}
