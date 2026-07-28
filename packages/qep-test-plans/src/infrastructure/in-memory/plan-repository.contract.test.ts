import { describe, expect, it } from "vitest";

import {
  createTestPlan,
  updateTestPlanContent,
} from "../../domain/test-plan/test-plan";
import {
  PlanConcurrencyError,
  PlanConflictError,
  PlanNotFoundError,
} from "../../shared/errors";
import {
  createEmptyTestPlanStore,
  createInMemoryTestPlanRepository,
} from "./plan-repository";

const TENANT = "tenant_plan_contract";
const ACTOR = "user_plan_contract";
const CORR = "corr_plan_contract";
const NOW = "2026-07-27T10:00:00.000Z";
const LATER = "2026-07-27T11:00:00.000Z";

function draftPlan(id: string, number = "TP-CONTRACT-001") {
  return createTestPlan({
    id,
    tenantId: TENANT,
    number,
    title: "Contract plan",
    ownerId: ACTOR,
    scope: { class: "release" },
    objective: "Contract objective",
    createdAt: NOW,
    createdBy: ACTOR,
    correlationId: CORR,
  });
}

describe("TestPlanRepository contract (in-memory)", () => {
  it("implements create -> get -> save with optimistic revision", async () => {
    const store = createEmptyTestPlanStore();
    const repo = createInMemoryTestPlanRepository(store);

    const created = await repo.create(draftPlan("tpl_contract_1"));
    expect(created.status).toBe("draft");
    expect(created.revision).toBe(1);
    expect(await repo.get(TENANT, created.id)).toEqual(created);
    expect(await repo.exists(TENANT, created.id)).toBe(true);
    expect(await repo.existsByNumber(TENANT, "TP-CONTRACT-001")).toBe(true);
    expect((await repo.getByNumber(TENANT, "TP-CONTRACT-001"))?.id).toBe(created.id);

    const mutated = updateTestPlanContent(
      created,
      { actorId: ACTOR, changedAt: LATER },
      { title: "Updated contract title" },
    );
    const saved = await repo.save(mutated, created.revision);
    expect(saved.revision).toBe(2);
    expect(saved.title).toBe("Updated contract title");
    expect((await repo.listHistory(TENANT, created.id)).length).toBeGreaterThan(1);
  });

  it("throws revision conflict and not-found for invalid saves", async () => {
    const store = createEmptyTestPlanStore();
    const repo = createInMemoryTestPlanRepository(store);
    const created = await repo.create(draftPlan("tpl_contract_rev"));

    const mutated = updateTestPlanContent(
      created,
      { actorId: ACTOR, changedAt: LATER },
      { title: "Updated title" },
    );

    await expect(repo.save(mutated, 99)).rejects.toThrow(PlanConcurrencyError);
    await expect(repo.save({ ...mutated, id: "tpl_missing" }, 1)).rejects.toThrow(
      PlanNotFoundError,
    );
  });

  it("throws conflict when creating a duplicate plan id or number", async () => {
    const store = createEmptyTestPlanStore();
    const repo = createInMemoryTestPlanRepository(store);
    await repo.create(draftPlan("tpl_dup"));
    await expect(repo.create(draftPlan("tpl_dup"))).rejects.toThrow(PlanConflictError);
    await expect(
      repo.create(draftPlan("tpl_dup_number", "TP-CONTRACT-001")),
    ).rejects.toThrow(PlanConflictError);
  });

  it("lists plans filtered by status, owner, and text query, excluding terminal by default", async () => {
    const store = createEmptyTestPlanStore();
    const repo = createInMemoryTestPlanRepository(store);
    await repo.create(draftPlan("tpl_list_a", "TP-LIST-001"));
    await repo.create(draftPlan("tpl_list_b", "TP-LIST-002"));

    const byStatus = await repo.list(TENANT, { status: "draft" });
    expect(byStatus).toHaveLength(2);

    const byOwner = await repo.list(TENANT, { ownerId: ACTOR });
    expect(byOwner).toHaveLength(2);

    const byQuery = await repo.list(TENANT, { query: "TP-LIST-002" });
    expect(byQuery).toHaveLength(1);

    const cancelled = await repo.get(TENANT, "tpl_list_b");
    expect(cancelled).not.toBeNull();
  });

  it("lists revisions for a plan", async () => {
    const store = createEmptyTestPlanStore();
    const repo = createInMemoryTestPlanRepository(store);
    const created = await repo.create(draftPlan("tpl_revisions"));
    expect(await repo.listRevisions(TENANT, created.id)).toEqual([]);
  });
});
