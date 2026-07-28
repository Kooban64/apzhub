import { describe, expect, it } from "vitest";

import {
  addPlanItem,
  approvePlan,
  createTestPlan,
  submitForReview,
} from "../../domain/test-plan/test-plan";
import {
  createEmptyTestPlanStore,
  createInMemoryTestPlanRepository,
} from "../../infrastructure/in-memory/plan-repository";
import { toPlanDto } from "./plan-dto-adapter";

const TENANT = "tenant_dto_adapter";
const ACTOR = "user_dto_adapter";
const CORR = "corr_dto_adapter";
const NOW = "2026-07-27T12:00:00.000Z";
const LATER = "2026-07-27T13:00:00.000Z";

describe("toPlanDto", () => {
  it("maps a stored plan to a platform DTO with available actions", async () => {
    const repo = createInMemoryTestPlanRepository(createEmptyTestPlanStore());
    const draft = createTestPlan({
      id: "tpl_dto_1",
      tenantId: TENANT,
      number: "TP-DTO-001",
      title: "DTO plan",
      ownerId: ACTOR,
      scope: { class: "release", label: "R1" },
      description: "Description",
      objective: "Objective",
      priority: "high",
      createdAt: NOW,
      createdBy: ACTOR,
      correlationId: CORR,
      externalReferences: ["ext-1"],
    });
    const stored = await repo.create(draft);

    const withItem = addPlanItem(
      stored,
      { actorId: ACTOR, changedAt: LATER },
      {
        id: "tpi_1",
        specificationId: "tsp_1",
        specificationVersionPin: "1.0",
        sequence: 0,
      },
    );
    const storedWithItem = await repo.save(withItem, stored.revision);

    const submitted = submitForReview(storedWithItem, {
      actorId: ACTOR,
      changedAt: LATER,
    });
    const storedSubmitted = await repo.save(submitted, storedWithItem.revision);

    const approved = approvePlan(storedSubmitted, {
      actorId: ACTOR,
      changedAt: LATER,
      allowSelfApproval: true,
    });
    const storedApproved = await repo.save(approved, storedSubmitted.revision);

    const dto = toPlanDto(storedApproved);
    expect(dto.id).toBe("tpl_dto_1");
    expect(dto.tenantId).toBe(TENANT);
    expect(dto.number).toBe("TP-DTO-001");
    expect(dto.title).toBe("DTO plan");
    expect(dto.description).toBe("Description");
    expect(dto.objective).toBe("Objective");
    expect(dto.scope).toEqual({
      class: "release",
      label: "R1",
      externalRef: undefined,
    });
    expect(dto.status).toBe("approved");
    expect(dto.priority).toBe("high");
    expect(dto.planType).toBe("release");
    expect(dto.ownerId).toBe(ACTOR);
    expect(dto.versionLabel).toBe("1.0");
    expect(dto.items).toHaveLength(1);
    expect(dto.items[0]?.specificationId).toBe("tsp_1");
    expect(dto.approvals).toHaveLength(1);
    expect(dto.approvals[0]?.decision).toBe("approved");
    expect(dto.revisions).toHaveLength(1);
    expect(dto.externalReferences).toEqual(["ext-1"]);
    expect(dto.metrics.totalItems).toBe(1);
    expect(dto.historySummaries.length).toBeGreaterThan(1);
    expect(dto.availableActions).toContain("markReady");
    expect(dto.availableActions).toContain("supersede");

    const readOnly = toPlanDto(storedApproved, ["qep.plan.read"]);
    expect(readOnly.availableActions).toEqual([]);

    const readyOnly = toPlanDto(storedApproved, ["qep.plan.ready"]);
    expect(readyOnly.availableActions).toEqual(["markReady"]);
  });

  it("has no approvals or revisions for a freshly created draft plan", async () => {
    const repo = createInMemoryTestPlanRepository(createEmptyTestPlanStore());
    const draft = createTestPlan({
      id: "tpl_dto_draft",
      tenantId: TENANT,
      number: "TP-DTO-002",
      title: "Draft only",
      ownerId: ACTOR,
      scope: { class: "sprint" },
      createdAt: NOW,
      createdBy: ACTOR,
      correlationId: CORR,
    });
    const stored = await repo.create(draft);
    const dto = toPlanDto(stored);

    expect(dto.approvals).toEqual([]);
    expect(dto.revisions).toEqual([]);
    expect(dto.availableActions).toContain("updateContent");
    expect(dto.availableActions).toContain("submitForReview");
  });
});
