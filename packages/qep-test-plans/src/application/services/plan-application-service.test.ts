import { beforeEach, describe, expect, it } from "vitest";

import type { QepRequestContext } from "@apzhub/qep-contracts";

import {
  createQepTestPlanPersistenceForTest,
  type QepTestPlanRepositories,
} from "../../infrastructure/factories";
import {
  PlanConcurrencyError,
  PlanForbiddenError,
  PlanNotFoundError,
} from "../../shared/errors";
import {
  createPlanApplicationService,
  type CreatePlanCommandInput,
  type PlanApplicationService,
} from "./plan-application-service";

const TENANT = "tenant_plan_app_svc";
const ACTOR = "user_plan_app_svc";
const CORR = "corr_plan_app_svc";

const FULL_CTX: QepRequestContext = {
  tenantId: TENANT,
  userId: ACTOR,
  correlationId: CORR,
};

const READ_ONLY_CTX: QepRequestContext = {
  ...FULL_CTX,
  permissions: ["qep.plan.read"],
};

function baseCreateInput(overrides: Partial<CreatePlanCommandInput> = {}): CreatePlanCommandInput {
  return {
    title: "Application service plan",
    objective: "Application service objective",
    scope: { class: "release", label: "Release 1" },
    ...overrides,
  };
}

function buildService(): {
  service: PlanApplicationService;
  repos: QepTestPlanRepositories;
} {
  const repos = createQepTestPlanPersistenceForTest({ allowInMemoryPersistence: true });
  let counter = 0;
  let numberCounter = 0;
  const service = createPlanApplicationService({
    plans: repos.plans,
    now: () => "2026-07-27T12:00:00.000Z",
    id: () => `tpltest${++counter}`,
    allocateNumber: () => `TP-APP-${String(++numberCounter).padStart(3, "0")}`,
  });
  return { service, repos };
}

async function driveToApproved(service: PlanApplicationService, overrides: Partial<CreatePlanCommandInput> = {}) {
  const created = await service.createPlan(FULL_CTX, baseCreateInput(overrides));
  const withItem = await service.addItem(FULL_CTX, created.id, {
    specificationId: "tsp_app_1",
    specificationVersionPin: "1.0",
    expectedRevision: created.revision,
  });
  const submitted = await service.submitForReview(FULL_CTX, created.id, {
    expectedRevision: withItem.revision,
  });
  return service.approve(FULL_CTX, created.id, {
    allowSelfApproval: true,
    expectedRevision: submitted.revision,
  });
}

describe("PlanApplicationService", () => {
  let service: PlanApplicationService;

  beforeEach(() => {
    ({ service } = buildService());
  });

  it("creates a Test Plan in draft and enforces the create permission", async () => {
    await expect(service.createPlan(READ_ONLY_CTX, baseCreateInput())).rejects.toThrow(
      PlanForbiddenError,
    );

    const created = await service.createPlan(FULL_CTX, baseCreateInput());
    expect(created.status).toBe("draft");
    expect(created.number).toBe("TP-APP-001");
    expect(created.ownerId).toBe(ACTOR);
  });

  it("drives the full lifecycle: draft -> review -> approve -> ready -> in_execution -> completed -> archived", async () => {
    const approved = await driveToApproved(service);
    expect(approved.status).toBe("approved");
    expect(approved.versionLabel).toBe("1.0");

    const ready = await service.markReady(FULL_CTX, approved.id, {
      expectedRevision: approved.revision,
    });
    expect(ready.status).toBe("ready");

    const executing = await service.startExecution(FULL_CTX, approved.id, {
      expectedRevision: ready.revision,
    });
    expect(executing.status).toBe("in_execution");

    const completed = await service.complete(FULL_CTX, approved.id, {
      expectedRevision: executing.revision,
    });
    expect(completed.status).toBe("completed");

    const archived = await service.archive(FULL_CTX, approved.id, {
      expectedRevision: completed.revision,
    });
    expect(archived.status).toBe("archived");
  });

  it("rejects a plan under review and allows returning to draft", async () => {
    const created = await service.createPlan(FULL_CTX, baseCreateInput());
    const withItem = await service.addItem(FULL_CTX, created.id, {
      specificationId: "tsp_reject_1",
      specificationVersionPin: "1.0",
      expectedRevision: created.revision,
    });
    const submitted = await service.submitForReview(FULL_CTX, created.id, {
      expectedRevision: withItem.revision,
    });

    const rejected = await service.reject(FULL_CTX, created.id, {
      comment: "Needs more detail",
      expectedRevision: submitted.revision,
    });
    expect(rejected.status).toBe("rejected");

    const backToDraft = await service.returnToDraft(FULL_CTX, created.id, {
      expectedRevision: rejected.revision,
    });
    expect(backToDraft.status).toBe("draft");
  });

  it("cancels a draft plan", async () => {
    const created = await service.createPlan(FULL_CTX, baseCreateInput());
    const cancelled = await service.cancel(FULL_CTX, created.id, {
      expectedRevision: created.revision,
    });
    expect(cancelled.status).toBe("cancelled");
  });

  it("manages plan items: add, update, reorder, remove", async () => {
    const created = await service.createPlan(FULL_CTX, baseCreateInput());

    const withItem1 = await service.addItem(FULL_CTX, created.id, {
      id: "tpi_manage_1",
      specificationId: "tsp_manage_1",
      expectedRevision: created.revision,
    });
    expect(withItem1.items).toHaveLength(1);

    const withItem2 = await service.addItem(FULL_CTX, created.id, {
      id: "tpi_manage_2",
      specificationId: "tsp_manage_2",
      expectedRevision: withItem1.revision,
    });
    expect(withItem2.items).toHaveLength(2);

    const updated = await service.updateItem(FULL_CTX, created.id, "tpi_manage_1", {
      notes: "Updated note",
      expectedRevision: withItem2.revision,
    });
    expect(updated.items.find((item) => item.id === "tpi_manage_1")?.notes).toBe("Updated note");

    const reordered = await service.reorderItems(FULL_CTX, created.id, {
      orderedItemIds: ["tpi_manage_2", "tpi_manage_1"],
      expectedRevision: updated.revision,
    });
    expect(reordered.items.find((item) => item.id === "tpi_manage_2")?.sequence).toBe(0);

    const removed = await service.removeItem(FULL_CTX, created.id, "tpi_manage_1", {
      expectedRevision: reordered.revision,
    });
    expect(removed.items.find((item) => item.id === "tpi_manage_1")?.itemStatus).toBe("removed");
  });

  it("updates content, metadata, ownership, assignment, and schedule", async () => {
    const created = await service.createPlan(FULL_CTX, baseCreateInput());

    const contentUpdated = await service.updateContent(FULL_CTX, created.id, {
      title: "Updated title",
      expectedRevision: created.revision,
    });
    expect(contentUpdated.title).toBe("Updated title");

    const metadataUpdated = await service.updateMetadata(FULL_CTX, created.id, {
      metadata: { risk: "medium" },
      expectedRevision: contentUpdated.revision,
    });
    expect(metadataUpdated.metadata?.risk).toBe("medium");

    const ownershipUpdated = await service.transferOwnership(FULL_CTX, created.id, {
      ownerId: "new_owner",
      expectedRevision: metadataUpdated.revision,
    });
    expect(ownershipUpdated.ownerId).toBe("new_owner");

    const assignmentUpdated = await service.updateAssignment(FULL_CTX, created.id, {
      leadId: "lead_1",
      assigneeIds: ["assignee_1"],
      expectedRevision: ownershipUpdated.revision,
    });
    expect(assignmentUpdated.assignment.leadId).toBe("lead_1");

    const scheduleUpdated = await service.updateSchedule(FULL_CTX, created.id, {
      plannedStart: "2026-08-01T00:00:00.000Z",
      plannedEnd: "2026-08-31T00:00:00.000Z",
      expectedRevision: assignmentUpdated.revision,
    });
    expect(scheduleUpdated.schedule.plannedStart).toBe("2026-08-01T00:00:00.000Z");
  });

  it("supersedes an approved plan, creating a successor draft", async () => {
    const approved = await driveToApproved(service);

    const { source, successor } = await service.supersede(FULL_CTX, approved.id, {
      expectedRevision: approved.revision,
    });
    expect(source.status).toBe("superseded");
    expect(source.successorPlanId).toBe(successor.id);
    expect(successor.status).toBe("draft");
    expect(successor.predecessorPlanId).toBe(approved.id);
  });

  it("clones a plan into a new draft", async () => {
    const created = await service.createPlan(FULL_CTX, baseCreateInput());
    const cloned = await service.clone(FULL_CTX, created.id, { title: "Cloned plan" });
    expect(cloned.status).toBe("draft");
    expect(cloned.title).toBe("Cloned plan");
    expect(cloned.number).not.toBe(created.number);
  });

  it("lists, searches, and paginates plans, excluding terminal statuses by default", async () => {
    await service.createPlan(FULL_CTX, baseCreateInput());
    await service.createPlan(
      FULL_CTX,
      baseCreateInput({ title: "Searchable regression plan", scope: { class: "regression" } }),
    );

    const listed = await service.list(FULL_CTX, {});
    expect(listed.items).toHaveLength(2);
    expect(listed.total).toBe(2);

    const searched = await service.search(FULL_CTX, "Searchable");
    expect(searched.items.length).toBeGreaterThanOrEqual(1);

    const byPlanType = await service.list(FULL_CTX, { planType: "regression" });
    expect(byPlanType.items).toHaveLength(1);
  });

  it("lists history and revisions, and computes execution readiness", async () => {
    const approved = await driveToApproved(service);

    const history = await service.listHistory(FULL_CTX, approved.id);
    expect(history.length).toBeGreaterThan(1);

    const revisions = await service.listRevisions(FULL_CTX, approved.id);
    expect(revisions).toHaveLength(1);

    const readiness = await service.getExecutionReadiness(FULL_CTX, approved.id);
    expect(readiness.ready).toBe(true);
  });

  it("throws not-found for unknown plan ids on mutation", async () => {
    await expect(
      service.submitForReview(FULL_CTX, "tpl_does_not_exist", { expectedRevision: 1 }),
    ).rejects.toThrow(PlanNotFoundError);
  });

  it("enforces optimistic concurrency using the client-supplied expectedRevision", async () => {
    const created = await service.createPlan(FULL_CTX, baseCreateInput());

    await expect(
      service.updateContent(FULL_CTX, created.id, {
        title: "Stale update",
        expectedRevision: 99,
      }),
    ).rejects.toThrow(PlanConcurrencyError);

    const updated = await service.updateContent(FULL_CTX, created.id, {
      title: "Fresh update",
      expectedRevision: created.revision,
    });
    expect(updated.title).toBe("Fresh update");
    expect(updated.revision).toBe(created.revision + 1);
  });

  it("gets a plan by id and number, returning null when missing", async () => {
    const created = await service.createPlan(FULL_CTX, baseCreateInput());
    const found = await service.get(READ_ONLY_CTX, created.id);
    expect(found?.id).toBe(created.id);

    const foundByNumber = await service.getByNumber(READ_ONLY_CTX, created.number);
    expect(foundByNumber?.id).toBe(created.id);

    expect(await service.get(READ_ONLY_CTX, "tpl_not_found")).toBeNull();
    expect(await service.getByNumber(READ_ONLY_CTX, "TP-NOT-FOUND")).toBeNull();
  });

  it("supports audit, observation, transaction, and projection hooks", async () => {
    const auditEntries: unknown[] = [];
    const observations: string[] = [];
    const domainEvents: string[] = [];
    let transactionRuns = 0;

    const repos = createQepTestPlanPersistenceForTest({ allowInMemoryPersistence: true });
    const hookedService = createPlanApplicationService({
      plans: repos.plans,
      now: () => "2026-07-27T12:00:00.000Z",
      id: () => "tpl_hooked_1",
      allocateNumber: () => "TP-HOOKED-001",
      audits: {
        append: async (entry) => {
          auditEntries.push(entry);
        },
      },
      onObservation: (event) => {
        observations.push(`${event.operation}:${event.outcome}`);
      },
      onDomainEvent: async (event) => {
        domainEvents.push(event.type);
      },
      onPlanUpserted: async () => {
        throw new Error("projection failed");
      },
      runInTransaction: async (work) => {
        transactionRuns += 1;
        return work();
      },
    });

    const created = await hookedService.createPlan(FULL_CTX, baseCreateInput());
    expect(created.id).toBe("tpl_hooked_1");
    expect(auditEntries.length).toBeGreaterThan(0);
    expect(domainEvents).toContain("qep.plan.created");
    expect(observations.some((entry) => entry.endsWith(":success"))).toBe(true);
    expect(transactionRuns).toBeGreaterThan(0);

    await expect(
      hookedService.createPlan(READ_ONLY_CTX, baseCreateInput({ title: "Forbidden" })),
    ).rejects.toThrow(PlanForbiddenError);
    expect(observations.some((entry) => entry.endsWith(":error"))).toBe(true);
  });

  it("allows wildcard permissions to bypass explicit grants", async () => {
    const wildcardCtx: QepRequestContext = {
      ...FULL_CTX,
      permissions: ["qep.plan.*"],
    };
    const created = await service.createPlan(wildcardCtx, baseCreateInput({ title: "Wildcard plan" }));
    expect(created.title).toBe("Wildcard plan");
  });

  it("supports an injectable assertPermission hook", async () => {
    const calls: Array<readonly string[]> = [];
    const repos = createQepTestPlanPersistenceForTest({ allowInMemoryPersistence: true });
    const customService = createPlanApplicationService({
      plans: repos.plans,
      now: () => "2026-07-27T12:00:00.000Z",
      allocateNumber: () => "TP-CUSTOM-001",
      assertPermission: (_ctx, requiredOneOf) => {
        calls.push(requiredOneOf);
      },
    });

    await customService.createPlan(READ_ONLY_CTX, baseCreateInput());
    expect(calls).toContainEqual(["qep.plan.create"]);
  });
});
