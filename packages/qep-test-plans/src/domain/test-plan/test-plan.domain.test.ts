import { describe, expect, it } from "vitest";

import {
  InvalidPlanStateError,
  PlanConcurrencyError,
  PlanInvariantViolationError,
  PlanLineageError,
  PlanReadinessError,
  PlanValidationError,
} from "../../shared/errors";
import { PLAN_DOMAIN_EVENT_TYPES } from "./plan-events";
import { PlanMetricsCalculator, PlanReadinessService } from "./plan-domain-service";
import {
  ApprovalPolicy,
  ArchivalPolicy,
  AssignmentPolicy,
  ContentPolicy,
  SchedulingPolicy,
} from "./plan-policy";
import {
  addPlanItem,
  approvePlan,
  archivePlan,
  cancelPlan,
  cloneTestPlan,
  completePlan,
  createTestPlan,
  getApprovalState,
  getExecutionReadiness,
  markReady,
  rejectPlan,
  removePlanItem,
  reorderPlanItems,
  returnToDraft,
  startExecution,
  submitForReview,
  supersedePlan,
  transferOwnership,
  updateAssignment,
  updatePlanItem,
  updateSchedule,
  updateTestPlanContent,
  updateTestPlanMetadata,
  type CommandContext,
  type TestPlan,
} from "./test-plan";

const NOW = "2026-07-27T10:00:00.000Z";
const LATER = "2026-07-27T11:00:00.000Z";
const ACTOR = "user_owner";
const REVIEWER = "user_reviewer";
const TENANT = "tenant_1";

function ctx(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    actorId: ACTOR,
    changedAt: LATER,
    ...overrides,
  };
}

function basePlan(
  overrides: Partial<Parameters<typeof createTestPlan>[0]> = {},
): TestPlan {
  return createTestPlan({
    id: "plan_1",
    tenantId: TENANT,
    number: "TP-001",
    title: "Release validation plan",
    ownerId: ACTOR,
    scope: { class: "release", externalRef: "rel_1" },
    objective: "Validate release candidate",
    createdAt: NOW,
    createdBy: ACTOR,
    correlationId: "corr_1",
    ...overrides,
  });
}

function withIncludedItem(plan: TestPlan, pin?: string): TestPlan {
  const cleared = { ...plan, uncommittedEvents: [] };
  return addPlanItem(cleared, ctx({ changedAt: NOW }), {
    id: "item_1",
    specificationId: "spec_1",
    sequence: 0,
    itemStatus: "included",
    ...(pin ? { specificationVersionPin: pin } : {}),
  });
}

function readyForReview(plan: TestPlan): TestPlan {
  return withIncludedItem(plan);
}

function approvedPlan(plan: TestPlan, pin = "1.0.0"): TestPlan {
  let current = withIncludedItem(plan, pin);
  current = submitForReview(current, ctx());
  current = approvePlan(current, { ...ctx(), actorId: REVIEWER });
  return current;
}

describe("TestPlan domain — create", () => {
  it("creates a draft plan with initial revision and version label", () => {
    const plan = basePlan();
    expect(plan.status).toBe("draft");
    expect(plan.revision).toBe(1);
    expect(plan.versionLabel).toBe("0.1");
    expect(plan.priority).toBe("medium");
    expect(plan.metrics.totalItems).toBe(0);
    expect(plan.uncommittedEvents).toHaveLength(1);
    expect(plan.uncommittedEvents[0]?.type).toBe("qep.plan.created");
    expect(plan.history.entries).toHaveLength(1);
  });

  it("rejects invalid plan number charset", () => {
    expect(() =>
      createTestPlan({
        id: "plan_x",
        tenantId: TENANT,
        number: "bad number!",
        title: "Title",
        ownerId: ACTOR,
        scope: { class: "release" },
        createdAt: NOW,
        createdBy: ACTOR,
      }),
    ).toThrow(PlanValidationError);
  });

  it("rejects custom scope without label at create", () => {
    expect(() =>
      createTestPlan({
        id: "plan_x",
        tenantId: TENANT,
        number: "TP-002",
        title: "Title",
        ownerId: ACTOR,
        scope: { class: "custom" },
        createdAt: NOW,
        createdBy: ACTOR,
      }),
    ).toThrow(PlanValidationError);
  });
});

describe("TestPlan domain — content and metadata", () => {
  it("updates content in draft", () => {
    const plan = updateTestPlanContent(basePlan(), ctx(), {
      title: "Updated title",
      objective: "Updated objective",
    });
    expect(plan.title).toBe("Updated title");
    expect(plan.revision).toBe(2);
    expect(plan.uncommittedEvents[0]?.type).toBe("qep.plan.updated");
  });

  it("updates metadata in draft", () => {
    const plan = updateTestPlanMetadata(basePlan(), ctx(), { tag: "alpha" });
    expect(plan.metadata).toEqual({ tag: "alpha" });
  });

  it("forbids content edits when approved", () => {
    const plan = approvedPlan(basePlan());
    expect(() => updateTestPlanContent(plan, ctx(), { title: "Nope" })).toThrow(
      InvalidPlanStateError,
    );
  });

  it("allows content edits when rejected", () => {
    let plan = readyForReview(basePlan());
    plan = submitForReview(plan, ctx());
    plan = rejectPlan(plan, { ...ctx(), actorId: REVIEWER }, "Needs more detail");
    plan = updateTestPlanContent(plan, ctx(), { objective: "Revised objective" });
    expect(plan.objective).toBe("Revised objective");
  });
});

describe("TestPlan domain — items", () => {
  it("adds, updates, reorders, and removes items", () => {
    let plan = basePlan();
    plan = addPlanItem(plan, ctx(), {
      id: "item_1",
      specificationId: "spec_1",
      sequence: 0,
    });
    plan = addPlanItem(plan, ctx(), {
      id: "item_2",
      specificationId: "spec_2",
      sequence: 1,
      itemStatus: "optional",
    });
    expect(plan.metrics.totalItems).toBe(2);
    expect(plan.metrics.includedCount).toBe(1);
    plan = updatePlanItem(plan, ctx(), "item_1", {
      specificationVersionPin: "1.0.0",
      notes: "Pinned",
    });
    expect(plan.items[0]?.specificationVersionPin).toBe("1.0.0");
    plan = reorderPlanItems(plan, ctx(), ["item_2", "item_1"]);
    expect(plan.items.find((i) => i.id === "item_2")?.sequence).toBe(0);
    plan = removePlanItem(plan, ctx(), "item_2");
    expect(plan.items.find((i) => i.id === "item_2")?.itemStatus).toBe("removed");
    expect(plan.metrics.totalItems).toBe(1);
  });

  it("rejects duplicate spec+pin pairs", () => {
    const plan = addPlanItem(basePlan(), ctx(), {
      id: "item_1",
      specificationId: "spec_1",
      specificationVersionPin: "1.0",
      sequence: 0,
    });
    expect(() =>
      addPlanItem(plan, ctx(), {
        id: "item_2",
        specificationId: "spec_1",
        specificationVersionPin: "1.0",
        sequence: 1,
      }),
    ).toThrow(PlanInvariantViolationError);
  });

  it("rejects testCaseId in v1", () => {
    expect(() =>
      addPlanItem(basePlan(), ctx(), {
        id: "item_1",
        specificationId: "spec_1",
        sequence: 0,
        testCaseId: "case_1",
      }),
    ).toThrow(PlanValidationError);
  });

  it("emits item lifecycle events", () => {
    let plan = addPlanItem(basePlan(), ctx(), {
      id: "item_1",
      specificationId: "spec_1",
      sequence: 0,
    });
    expect(plan.uncommittedEvents.at(-1)?.type).toBe("qep.plan.item.added");
    plan = updatePlanItem(plan, ctx(), "item_1", { notes: "x" });
    expect(plan.uncommittedEvents.at(-1)?.type).toBe("qep.plan.item.updated");
    plan = removePlanItem(plan, ctx(), "item_1");
    expect(plan.uncommittedEvents.at(-1)?.type).toBe("qep.plan.item.removed");
  });
});

describe("TestPlan domain — assignment, schedule, ownership", () => {
  it("updates assignment in approved status", () => {
    let plan = approvedPlan(basePlan());
    plan = updateAssignment(plan, ctx(), {
      leadId: "lead_1",
      assigneeIds: ["a1", "a2"],
    });
    expect(plan.assignment.leadId).toBe("lead_1");
    expect(plan.assignment.assigneeIds).toEqual(["a1", "a2"]);
  });

  it("forbids assignment edits in review", () => {
    let plan = readyForReview(basePlan());
    plan = submitForReview(plan, ctx());
    expect(() => updateAssignment(plan, ctx(), { leadId: "lead_1" })).toThrow(
      InvalidPlanStateError,
    );
  });

  it("updates schedule with valid dates in ready status", () => {
    let plan = approvedPlan(basePlan());
    plan = markReady(plan, ctx());
    plan = updateSchedule(plan, ctx(), {
      plannedStart: "2026-08-01T00:00:00.000Z",
      plannedEnd: "2026-08-31T00:00:00.000Z",
    });
    expect(plan.schedule.plannedStart).toBe("2026-08-01T00:00:00.000Z");
  });

  it("rejects invalid schedule ordering", () => {
    expect(() =>
      updateSchedule(basePlan(), ctx(), {
        plannedStart: "2026-08-31T00:00:00.000Z",
        plannedEnd: "2026-08-01T00:00:00.000Z",
      }),
    ).toThrow(PlanValidationError);
  });

  it("transfers ownership only in draft or rejected", () => {
    let plan = transferOwnership(basePlan(), ctx(), "new_owner");
    expect(plan.ownerId).toBe("new_owner");
    plan = approvedPlan(plan);
    expect(() => transferOwnership(plan, ctx(), "other")).toThrow(
      InvalidPlanStateError,
    );
  });
});

describe("TestPlan domain — review lifecycle", () => {
  it("submits draft for review when preconditions pass", () => {
    let plan = readyForReview(basePlan());
    plan = submitForReview(plan, ctx());
    expect(plan.status).toBe("review");
    expect(plan.uncommittedEvents[0]?.type).toBe("qep.plan.review.requested");
    expect(getApprovalState(plan)).toBe("pending_review");
  });

  it("fails submit without objective", () => {
    const plan = addPlanItem(
      createTestPlan({
        id: "plan_1",
        tenantId: TENANT,
        number: "TP-003",
        title: "Title",
        ownerId: ACTOR,
        scope: { class: "release" },
        createdAt: NOW,
        createdBy: ACTOR,
      }),
      ctx({ changedAt: NOW }),
      { id: "item_1", specificationId: "spec_1", sequence: 0 },
    );
    expect(() => submitForReview(plan, ctx())).toThrow(PlanValidationError);
  });

  it("fails submit without included items", () => {
    expect(() => submitForReview(basePlan(), ctx())).toThrow(
      PlanInvariantViolationError,
    );
  });

  it("approves plan, seals version 1.0, and records revision", () => {
    let plan = readyForReview(basePlan());
    plan = submitForReview(plan, ctx());
    plan = approvePlan(plan, { ...ctx(), actorId: REVIEWER, comment: "LGTM" });
    expect(plan.status).toBe("approved");
    expect(plan.versionLabel).toBe("1.0");
    expect(plan.revisions).toHaveLength(1);
    expect(plan.approvals).toHaveLength(1);
    expect(plan.uncommittedEvents[0]?.type).toBe("qep.plan.approved");
  });

  it("denies self-approval by default", () => {
    let plan = readyForReview(basePlan());
    plan = submitForReview(plan, ctx());
    expect(() => approvePlan(plan, ctx())).toThrow(PlanInvariantViolationError);
    plan = approvePlan(plan, { ...ctx(), allowSelfApproval: true });
    expect(plan.status).toBe("approved");
  });

  it("rejects with minimum comment length", () => {
    let plan = readyForReview(basePlan());
    plan = submitForReview(plan, ctx());
    expect(() => rejectPlan(plan, { ...ctx(), actorId: REVIEWER }, "no")).toThrow(
      PlanValidationError,
    );
    plan = rejectPlan(plan, { ...ctx(), actorId: REVIEWER }, "Insufficient coverage");
    expect(plan.status).toBe("rejected");
    expect(plan.uncommittedEvents[0]?.type).toBe("qep.plan.rejected");
  });

  it("returns rejected plan to draft", () => {
    let plan = readyForReview(basePlan());
    plan = submitForReview(plan, ctx());
    plan = rejectPlan(plan, { ...ctx(), actorId: REVIEWER }, "Revise scope");
    plan = returnToDraft(plan, ctx());
    expect(plan.status).toBe("draft");
  });
});

describe("TestPlan domain — execution readiness", () => {
  it("evaluates readiness reason codes", () => {
    let plan = readyForReview(basePlan());
    plan = submitForReview(plan, ctx());
    plan = approvePlan(plan, { ...ctx(), actorId: REVIEWER });
    const failing = getExecutionReadiness(plan);
    expect(failing.ready).toBe(false);
    expect(failing.reasons).toContain("MISSING_VERSION_PIN");

    const pinned = approvedPlan(basePlan());
    const passing = getExecutionReadiness(pinned);
    expect(passing.ready).toBe(true);
    expect(passing.reasons).toHaveLength(0);
  });

  it("markReady requires readiness pass", () => {
    let plan = readyForReview(basePlan());
    plan = submitForReview(plan, ctx());
    plan = approvePlan(plan, { ...ctx(), actorId: REVIEWER });
    expect(() => markReady(plan, ctx())).toThrow(PlanReadinessError);
    plan = markReady(approvedPlan(basePlan()), ctx());
    expect(plan.status).toBe("ready");
    expect(plan.uncommittedEvents[0]?.type).toBe("qep.plan.ready");
  });

  it("startExecution re-checks readiness", () => {
    let plan = approvedPlan(basePlan());
    plan = markReady(plan, ctx());
    plan = startExecution(plan, ctx());
    expect(plan.status).toBe("in_execution");
    expect(plan.uncommittedEvents[0]?.type).toBe("qep.plan.started");
  });

  it("readiness service reports custom scope label requirement", () => {
    const readiness = PlanReadinessService.evaluate({
      status: "approved",
      title: "T",
      objective: "O",
      scope: { class: "custom" },
      items: [
        {
          id: "i1",
          specificationId: "s1",
          sequence: 0,
          itemStatus: "included",
          specificationVersionPin: "1.0",
        },
      ],
      context: "markReady",
    });
    expect(readiness.reasons).toContain("HAS_INVALID_CUSTOM_SCOPE");
  });
});

describe("TestPlan domain — completion and archival", () => {
  it("completes and archives plan", () => {
    let plan = approvedPlan(basePlan());
    plan = markReady(plan, ctx());
    plan = startExecution(plan, ctx());
    plan = completePlan(plan, ctx());
    expect(plan.status).toBe("completed");
    plan = archivePlan(plan, ctx());
    expect(plan.status).toBe("archived");
    expect(() => updateSchedule(plan, ctx(), { plannedStart: NOW })).toThrow(
      InvalidPlanStateError,
    );
  });

  it("forbids archive from non-completed status", () => {
    expect(() => archivePlan(approvedPlan(basePlan()), ctx())).toThrow(
      InvalidPlanStateError,
    );
  });
});

describe("TestPlan domain — cancel", () => {
  it("cancels from eligible states", () => {
    const plan = cancelPlan(readyForReview(basePlan()), ctx());
    expect(plan.status).toBe("cancelled");
    expect(plan.uncommittedEvents[0]?.type).toBe("qep.plan.cancelled");
  });

  it("forbids cancel from in_execution", () => {
    let plan = approvedPlan(basePlan());
    plan = markReady(plan, ctx());
    plan = startExecution(plan, ctx());
    expect(() => cancelPlan(plan, ctx())).toThrow(InvalidPlanStateError);
  });
});

describe("TestPlan domain — clone and supersede", () => {
  it("clones plan as draft with copy title and cleared schedule dates", () => {
    let source = approvedPlan(basePlan());
    source = updateSchedule(source, ctx(), {
      plannedStart: "2026-08-01T00:00:00.000Z",
      plannedEnd: "2026-08-31T00:00:00.000Z",
    });
    const clone = cloneTestPlan(source, ctx(), { id: "plan_2", number: "TP-002" });
    expect(clone.status).toBe("draft");
    expect(clone.title).toBe("Copy of Release validation plan");
    expect(clone.schedule.plannedStart).toBeUndefined();
    expect(clone.approvals).toHaveLength(0);
    expect(clone.history.entries).toHaveLength(1);
    expect(clone.items.length).toBeGreaterThan(0);
    expect(clone.uncommittedEvents[0]?.type).toBe("qep.plan.created");
  });

  it("supersedes eligible plan and creates successor lineage", () => {
    const source = approvedPlan(basePlan());
    const { source: superseded, successor } = supersedePlan(source, ctx(), {
      successorId: "plan_2",
      successorNumber: "TP-002",
    });
    expect(superseded.status).toBe("superseded");
    expect(superseded.successorPlanId).toBe("plan_2");
    expect(successor.status).toBe("draft");
    expect(successor.predecessorPlanId).toBe("plan_1");
    expect(successor.predecessorSealedVersionLabel).toBe("1.0");
    expect(superseded.uncommittedEvents[0]?.type).toBe("qep.plan.superseded");
    expect(successor.uncommittedEvents[0]?.type).toBe("qep.plan.created");
  });

  it("successor approve seals next major version from predecessor", () => {
    const source = approvedPlan(basePlan());
    const { successor } = supersedePlan(source, ctx(), {
      successorId: "plan_2",
      successorNumber: "TP-002",
    });
    let next = addPlanItem(successor, ctx(), {
      id: "item_new",
      specificationId: "spec_9",
      sequence: 1,
    });
    next = submitForReview(next, ctx());
    next = approvePlan(next, { ...ctx(), actorId: REVIEWER });
    expect(next.versionLabel).toBe("2.0");
  });

  it("forbids double supersede", () => {
    const source = approvedPlan(basePlan());
    const first = supersedePlan(source, ctx(), {
      successorId: "plan_2",
      successorNumber: "TP-002",
    });
    expect(() =>
      supersedePlan(first.source, ctx(), {
        successorId: "plan_3",
        successorNumber: "TP-003",
      }),
    ).toThrow(PlanLineageError);
  });
});

describe("TestPlan domain — concurrency and events", () => {
  it("throws on revision mismatch", () => {
    const plan = basePlan();
    expect(() =>
      updateTestPlanContent(plan, { ...ctx(), expectedRevision: 99 }, { title: "X" }),
    ).toThrow(PlanConcurrencyError);
  });

  it("clears uncommitted events at command start", () => {
    const plan = basePlan();
    expect(plan.uncommittedEvents).toHaveLength(1);
    const updated = updateTestPlanContent(plan, ctx(), { title: "New" });
    expect(updated.uncommittedEvents).toHaveLength(1);
    expect(updated.uncommittedEvents[0]?.type).toBe("qep.plan.updated");
  });

  it("increments revision on every mutation", () => {
    let plan = basePlan();
    plan = updateTestPlanContent(plan, ctx(), { title: "A" });
    plan = updateTestPlanContent(plan, ctx(), { title: "B" });
    expect(plan.revision).toBe(3);
  });

  it("exports full event catalogue", () => {
    expect(PLAN_DOMAIN_EVENT_TYPES).toEqual([
      "qep.plan.created",
      "qep.plan.updated",
      "qep.plan.review.requested",
      "qep.plan.approved",
      "qep.plan.rejected",
      "qep.plan.ready",
      "qep.plan.started",
      "qep.plan.completed",
      "qep.plan.archived",
      "qep.plan.cancelled",
      "qep.plan.superseded",
      "qep.plan.item.added",
      "qep.plan.item.updated",
      "qep.plan.item.removed",
    ]);
  });
});

describe("TestPlan domain — policies and metrics", () => {
  it("metrics calculator counts item buckets", () => {
    const metrics = PlanMetricsCalculator.recompute([
      {
        id: "1",
        specificationId: "s1",
        sequence: 0,
        itemStatus: "included",
        specificationVersionPin: "1.0",
      },
      {
        id: "2",
        specificationId: "s2",
        sequence: 1,
        itemStatus: "optional",
      },
      {
        id: "3",
        specificationId: "s3",
        sequence: 2,
        itemStatus: "removed",
      },
    ]);
    expect(metrics).toEqual({
      totalItems: 2,
      includedCount: 1,
      optionalCount: 1,
      deferredCount: 0,
      pinnedIncludedCount: 1,
    });
  });

  it("policy helpers enforce editable matrices", () => {
    expect(() => ContentPolicy.assertEditable("approved")).toThrow(
      InvalidPlanStateError,
    );
    expect(() => SchedulingPolicy.assertEditable("review")).toThrow(
      InvalidPlanStateError,
    );
    expect(() => AssignmentPolicy.assertEditable("in_execution")).toThrow(
      InvalidPlanStateError,
    );
    expect(() => ArchivalPolicy.assertCanArchive("ready")).toThrow(
      InvalidPlanStateError,
    );
    expect(() =>
      ApprovalPolicy.assertCanDecide({
        status: "draft",
        ownerId: ACTOR,
        actorId: REVIEWER,
        decision: "approved",
      }),
    ).toThrow(InvalidPlanStateError);
  });
});

describe("TestPlan domain — illegal transitions", () => {
  it("rejects draft to approved", () => {
    expect(() =>
      approvePlan(readyForReview(basePlan()), { ...ctx(), actorId: REVIEWER }),
    ).toThrow(InvalidPlanStateError);
  });

  it("rejects ready to draft", () => {
    let plan = approvedPlan(basePlan());
    plan = markReady(plan, ctx());
    expect(() => returnToDraft(plan, ctx())).toThrow(InvalidPlanStateError);
  });

  it("rejects item edits when approved", () => {
    expect(() =>
      addPlanItem(approvedPlan(basePlan()), ctx(), {
        id: "x",
        specificationId: "spec_x",
        sequence: 9,
      }),
    ).toThrow(InvalidPlanStateError);
  });

  it("rejects startExecution when not ready", () => {
    expect(() => startExecution(approvedPlan(basePlan()), ctx())).toThrow(
      InvalidPlanStateError,
    );
  });
});

describe("TestPlan domain — edge coverage", () => {
  it("validates custom scope label and plan number charset", () => {
    expect(() =>
      createTestPlan({
        id: "p",
        tenantId: TENANT,
        number: "bad number!",
        title: "T",
        ownerId: ACTOR,
        scope: { class: "custom" },
        createdAt: NOW,
        createdBy: ACTOR,
      }),
    ).toThrow(PlanValidationError);

    expect(() =>
      createTestPlan({
        id: "p",
        tenantId: TENANT,
        number: "TP-OK",
        title: "T",
        ownerId: ACTOR,
        scope: { class: "custom", label: "  " },
        createdAt: NOW,
        createdBy: ACTOR,
      }),
    ).toThrow(PlanValidationError);

    const ok = createTestPlan({
      id: "p",
      tenantId: TENANT,
      number: "TP.OK_1",
      title: "T",
      ownerId: ACTOR,
      scope: { class: "custom", label: "Custom cycle" },
      createdAt: NOW,
      createdBy: ACTOR,
    });
    expect(ok.scope.label).toBe("Custom cycle");
  });

  it("rejects empty leadId and validates schedule ordering", () => {
    const plan = basePlan();
    expect(() => updateAssignment(plan, ctx(), { leadId: "   " })).toThrow(
      PlanValidationError,
    );
    expect(() =>
      updateSchedule(plan, ctx(), {
        plannedStart: "2026-08-02T00:00:00.000Z",
        plannedEnd: "2026-08-01T00:00:00.000Z",
      }),
    ).toThrow(PlanValidationError);

    const scheduled = updateSchedule(plan, ctx(), {
      plannedStart: "2026-08-01T00:00:00.000Z",
      plannedEnd: "2026-08-02T00:00:00.000Z",
      milestoneRef: "m1",
      timezone: "UTC",
    });
    expect(scheduled.schedule.milestoneRef).toBe("m1");
  });

  it("rejects testCaseId on items and duplicate spec pins", () => {
    const plan = basePlan();
    expect(() =>
      addPlanItem(plan, ctx(), {
        id: "i1",
        specificationId: "spec_a",
        sequence: 0,
        testCaseId: "case_1",
      }),
    ).toThrow(PlanValidationError);

    const withItem = withIncludedItem(plan, "1.0");
    expect(() =>
      addPlanItem(withItem, ctx(), {
        id: "i2",
        specificationId: "spec_1",
        sequence: 1,
        specificationVersionPin: "1.0",
      }),
    ).toThrow(PlanInvariantViolationError);
  });

  it("supports item update, remove, reorder and metadata", () => {
    let plan = withIncludedItem(basePlan(), "1.0");
    plan = updatePlanItem(plan, ctx(), "item_1", {
      notes: "note",
      itemStatus: "optional",
    });
    expect(plan.items[0]?.itemStatus).toBe("optional");
    expect(plan.uncommittedEvents.some((e) => e.type === "qep.plan.item.updated")).toBe(
      true,
    );

    plan = addPlanItem(plan, ctx(), {
      id: "item_b",
      specificationId: "spec_b",
      sequence: 1,
      itemStatus: "included",
      specificationVersionPin: "2.0",
    });
    plan = reorderPlanItems(plan, ctx(), ["item_b", "item_1"]);
    expect(plan.items.find((i) => i.id === "item_b")?.sequence).toBe(0);
    expect(plan.items.find((i) => i.id === "item_1")?.sequence).toBe(1);

    const removed = removePlanItem(plan, ctx(), "item_b");
    expect(removed.items.find((i) => i.id === "item_b")?.itemStatus).toBe("removed");
    expect(
      removed.uncommittedEvents.some((e) => e.type === "qep.plan.item.removed"),
    ).toBe(true);

    const meta = updateTestPlanMetadata(basePlan(), ctx(), { a: "1" });
    expect(meta.metadata?.a).toBe("1");
  });

  it("allows self-approval when flag set and projects approval state", () => {
    let plan = readyForReview(basePlan());
    plan = submitForReview(plan, ctx());
    const approved = approvePlan(plan, {
      ...ctx(),
      actorId: ACTOR,
      allowSelfApproval: true,
    });
    expect(approved.status).toBe("approved");
    expect(getApprovalState(approved)).toBe("approved");
    expect(getApprovalState(submitForReview(readyForReview(basePlan()), ctx()))).toBe(
      "pending_review",
    );
    expect(getApprovalState(basePlan())).toBe("none");
  });

  it("completes lifecycle archive and cancel paths", () => {
    let plan = approvedPlan(basePlan());
    plan = markReady(plan, ctx());
    plan = startExecution(plan, ctx());
    expect(plan.uncommittedEvents.some((e) => e.type === "qep.plan.started")).toBe(
      true,
    );
    plan = completePlan(plan, ctx());
    expect(plan.status).toBe("completed");
    plan = archivePlan(plan, ctx());
    expect(plan.status).toBe("archived");
    expect(() => updateTestPlanContent(plan, ctx(), { title: "nope" })).toThrow(
      InvalidPlanStateError,
    );

    expect(cancelPlan(basePlan(), ctx()).status).toBe("cancelled");
    expect(
      cancelPlan(submitForReview(readyForReview(basePlan()), ctx()), ctx()).status,
    ).toBe("cancelled");
  });

  it("clone clears schedule and supersede from completed seals next major", () => {
    let plan = updateSchedule(approvedPlan(basePlan()), ctx(), {
      plannedStart: "2026-08-01T00:00:00.000Z",
      plannedEnd: "2026-08-10T00:00:00.000Z",
      milestoneRef: "m1",
    });
    const cloned = cloneTestPlan(plan, ctx(), { id: "clone_1", number: "TP-CLONE" });
    expect(cloned.title.startsWith("Copy of ")).toBe(true);
    expect(cloned.schedule.plannedStart).toBeUndefined();
    expect(cloned.schedule.milestoneRef).toBe("m1");
    expect(cloned.approvals).toHaveLength(0);
    expect(cloned.history.entries).toHaveLength(1);

    plan = markReady(approvedPlan(basePlan()), ctx());
    plan = startExecution(plan, ctx());
    plan = completePlan(plan, ctx());
    const { source, successor } = supersedePlan(plan, ctx(), {
      successorId: "succ_1",
      successorNumber: "TP-SUCC",
    });
    expect(source.status).toBe("superseded");
    expect(successor.predecessorPlanId).toBe(source.id);
    const reapproved = approvePlan(submitForReview(successor, ctx()), {
      ...ctx(),
      actorId: REVIEWER,
    });
    expect(reapproved.versionLabel).toBe("2.0");
  });

  it("readiness surfaces distinct reason codes", () => {
    const draft = basePlan();
    expect(
      PlanReadinessService.evaluate({
        status: draft.status,
        title: draft.title,
        objective: draft.objective,
        scope: draft.scope,
        items: draft.items,
        context: "markReady",
      }).reasons,
    ).toContain("NOT_APPROVED");

    const approvedEmpty = {
      status: "approved" as const,
      title: "T",
      objective: "O",
      scope: { class: "sprint" as const },
      items: [],
      context: "markReady" as const,
    };
    expect(PlanReadinessService.evaluate(approvedEmpty).reasons).toContain(
      "NO_INCLUDED_ITEMS",
    );

    let plan = withIncludedItem(basePlan());
    plan = submitForReview(plan, ctx());
    plan = approvePlan(plan, { ...ctx(), actorId: REVIEWER });
    expect(
      PlanReadinessService.evaluate({
        status: plan.status,
        title: plan.title,
        objective: plan.objective,
        scope: plan.scope,
        items: plan.items,
        context: "markReady",
      }).reasons,
    ).toContain("MISSING_VERSION_PIN");

    const noObj = createTestPlan({
      id: "p2",
      tenantId: TENANT,
      number: "TP-2",
      title: "T",
      ownerId: ACTOR,
      scope: { class: "sprint" },
      createdAt: NOW,
      createdBy: ACTOR,
    });
    expect(
      PlanReadinessService.evaluate({
        status: "approved",
        title: noObj.title,
        objective: noObj.objective,
        scope: noObj.scope,
        items: [
          {
            id: "i",
            specificationId: "s",
            sequence: 0,
            itemStatus: "included",
            specificationVersionPin: "1",
          },
        ],
        context: "markReady",
      }).reasons,
    ).toContain("OBJECTIVE_MISSING");
  });

  it("rejects supersede from draft and transfer ownership outside draft/rejected", () => {
    expect(() =>
      supersedePlan(basePlan(), ctx(), { successorId: "x", successorNumber: "TP-X" }),
    ).toThrow(PlanLineageError);

    const approved = approvedPlan(basePlan());
    expect(() => transferOwnership(approved, ctx(), "other")).toThrow(
      InvalidPlanStateError,
    );
    const transferred = transferOwnership(basePlan(), ctx(), "other_owner");
    expect(transferred.ownerId).toBe("other_owner");
  });
});
