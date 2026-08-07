import { beforeEach, describe, expect, it } from "vitest";

import { computeBusinessProcessMonitoring } from "./compute-monitoring";
import {
  createBusinessProcessService,
  getMemoryBusinessProcessStore,
  resetMemoryBusinessProcessStoreForTests,
  setBusinessProcessStoreForTests,
} from "./index";

const ctx = {
  userId: "user_steward",
  tenantId: "tenant_1",
  correlationId: "c1",
  requestId: "r1",
  permissions: ["workflow.view", "workflow.admin"],
};

describe("BusinessProcessService", () => {
  beforeEach(() => {
    resetMemoryBusinessProcessStoreForTests();
    setBusinessProcessStoreForTests(getMemoryBusinessProcessStore());
  });

  it("seeds the workflow template library", async () => {
    const service = createBusinessProcessService();
    const templates = await service.listTemplates(ctx);
    expect(templates.length).toBe(8);
    expect(templates.map((t) => t.key)).toEqual(
      expect.arrayContaining([
        "project-approval",
        "change-request",
        "incident-resolution",
        "employee-onboarding",
        "procurement",
        "leave-approval",
        "contract-review",
        "quality-review",
      ]),
    );
  });

  it("designs journeys with stages, transitions, and ownership", async () => {
    const service = createBusinessProcessService();
    const journey = await service.createJourney(ctx, {
      name: "Project Approval",
      summary: "Approve project proposals",
      processOwner: "PMO Lead",
      businessSteward: "Delivery Steward",
      reviewCycleDays: 90,
      outcomes: ["Approved", "Declined"],
      stages: [
        {
          name: "Submitted",
          order: 1,
          responsibility: "Requester",
          entryCondition: "Proposal available",
        },
        {
          name: "Decision",
          order: 2,
          responsibility: "Approver",
          exitCondition: "Decision recorded",
        },
      ],
    });

    const updated = await service.updateJourney(ctx, journey.id, {
      transitions: [
        {
          fromStageId: journey.stages[0]!.id,
          toStageId: journey.stages[1]!.id,
          name: "Decide",
          outcome: "Complete",
        },
      ],
    });

    expect(updated.processOwner).toBe("PMO Lead");
    expect(updated.businessSteward).toBe("Delivery Steward");
    expect(updated.stages).toHaveLength(2);
    expect(updated.stages[0]?.entryCondition).toBe("Proposal available");
    expect(updated.transitions[0]?.fromStageId).toBe(journey.stages[0]!.id);
    expect(updated.version).toBe(2);
  });

  it("governs publication with audit history", async () => {
    const service = createBusinessProcessService();
    const journey = await service.instantiateTemplate(ctx, "leave-approval", {
      processOwner: "HR Lead",
      businessSteward: "People Ops",
    });
    expect(journey.publicationStatus).toBe("draft");

    const reviewed = await service.transitionGovernance(ctx, journey.id, {
      publicationStatus: "review",
      notes: "Ready for board review",
    });
    expect(reviewed.publicationStatus).toBe("review");

    const approved = await service.transitionGovernance(ctx, journey.id, {
      publicationStatus: "approved",
    });
    expect(approved.publicationStatus).toBe("approved");

    const audit = await service.listAudit(ctx, journey.id);
    expect(audit.some((e) => e.action === "governance_transition")).toBe(true);
    expect(audit.some((e) => e.toStatus === "approved")).toBe(true);
  });

  it("monitors active and overdue process instances", async () => {
    const service = createBusinessProcessService();
    const journey = await service.instantiateTemplate(ctx, "incident-resolution", {
      processOwner: "Service Lead",
      businessSteward: "Ops Steward",
    });
    await service.transitionGovernance(ctx, journey.id, {
      publicationStatus: "approved",
    });

    const instance = await service.createInstance(ctx, {
      journeyId: journey.id,
      title: "Priority incident",
      dueAt: "2000-01-01T00:00:00.000Z",
    });
    expect(instance.status).toBe("active");

    const monitoring = await service.getMonitoring(ctx, journey.id);
    expect(monitoring.activeInstances).toBe(1);
    expect(monitoring.overdueTransitions).toBe(1);
    expect(monitoring.byStage.length).toBeGreaterThan(0);

    await service.updateInstance(ctx, instance.id, { status: "completed" });
    const after = await service.getMonitoring(ctx, journey.id);
    expect(after.completedCount).toBe(1);
    expect(after.activeInstances).toBe(0);
  });

  it("flags stalled stages with transparent rules", () => {
    const monitoring = computeBusinessProcessMonitoring({
      journeyId: "bpj_1",
      instances: [
        {
          id: "bpinst_1",
          tenantId: "tenant_1",
          journeyId: "bpj_1",
          title: "Stalled work",
          currentStageId: "stage_1",
          status: "active",
          enteredStageAt: "2000-01-01T00:00:00.000Z",
          createdAt: "2000-01-01T00:00:00.000Z",
          updatedAt: "2000-01-01T00:00:00.000Z",
        },
      ],
    });
    expect(monitoring.stalledStages).toBe(1);
  });
});
