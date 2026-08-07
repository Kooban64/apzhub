import { beforeEach, describe, expect, it } from "vitest";

import {
  createProjectsDeliveryService,
  getMemoryProjectsDeliveryStore,
  resetMemoryProjectsDeliveryStoreForTests,
  setProjectsDeliveryStoreForTests,
} from "./index";

const ctx = {
  userId: "user_pm",
  tenantId: "tenant_1",
  correlationId: "c1",
  requestId: "r1",
  permissions: ["projects.read", "projects.manage"],
};

const projectId = "proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

describe("ProjectsDeliveryService", () => {
  beforeEach(() => {
    resetMemoryProjectsDeliveryStoreForTests();
    setProjectsDeliveryStoreForTests(getMemoryProjectsDeliveryStore());
  });

  it("manages milestones with owners, deps, and progress", async () => {
    const service = createProjectsDeliveryService();
    const ms = await service.createMilestone(ctx, projectId, {
      name: "Alpha release",
      targetDate: "2099-12-01T00:00:00.000Z",
      owner: "Ada",
      progressPercent: 25,
      dependencyIds: [],
    });
    expect(ms.name).toBe("Alpha release");
    expect(ms.progressPercent).toBe(25);

    const updated = await service.updateMilestone(ctx, projectId, ms.id, {
      progressPercent: 100,
      status: "achieved",
      achievementEvidence: [{ type: "verification_note", label: "Release signed off" }],
    });
    expect(updated.status).toBe("achieved");
    expect(updated.achievementEvidence.length).toBe(1);
    expect((await service.listMilestones(ctx, projectId)).length).toBe(1);
  });

  it("rejects silent milestone date moves beyond tolerance", async () => {
    const service = createProjectsDeliveryService();
    const ms = await service.createMilestone(ctx, projectId, {
      name: "Gate",
      targetDate: "2099-01-01T00:00:00.000Z",
      baselineDueAt: "2099-01-01T00:00:00.000Z",
    });
    await expect(
      service.updateMilestone(ctx, projectId, ms.id, {
        targetDate: "2099-03-01T00:00:00.000Z",
      }),
    ).rejects.toThrow(/date_reason_required/);
  });

  it("manages risk, decision, and action registers", async () => {
    const service = createProjectsDeliveryService();
    const risk = await service.createRisk(ctx, projectId, {
      title: "Vendor delay",
      description: "Key vendor may slip",
      probability: "high",
      impact: "critical",
      mitigation: "Parallel track with alternate vendor",
      owner: "Ben",
      reviewDate: "2099-06-01T00:00:00.000Z",
    });
    expect(risk.status).toBe("open");

    const decision = await service.createDecision(ctx, projectId, {
      decision: "Use alternate vendor for phase 2",
      rationale: "Reduce schedule risk",
      owner: "Cara",
      outcome: "Accepted",
      relatedWork: risk.id,
    });
    expect(decision.relatedWork).toBe(risk.id);

    const action = await service.createAction(ctx, projectId, {
      title: "Confirm alternate vendor SOW",
      owner: "Ben",
      dueDate: "2099-05-15T00:00:00.000Z",
    });
    expect(action.status).toBe("open");

    await service.updateAction(ctx, projectId, action.id, { status: "done" });
    expect((await service.listActions(ctx, projectId))[0]?.status).toBe("done");
    expect((await service.listDecisions(ctx, projectId)).length).toBe(1);
  });

  it("computes transparent health and delivery dashboard", async () => {
    const service = createProjectsDeliveryService();
    await service.createMilestone(ctx, projectId, {
      name: "Missed gate",
      targetDate: "2000-01-01T00:00:00.000Z",
      progressPercent: 10,
    });
    await service.createRisk(ctx, projectId, {
      title: "Critical path risk",
      description: "Blocks go-live",
      probability: "critical",
      impact: "critical",
      mitigation: "Escalate daily",
      owner: "Dana",
    });
    await service.createAction(ctx, projectId, {
      title: "Unblock dependency",
      owner: "Eli",
      dueDate: "2000-01-02T00:00:00.000Z",
    });
    await service.createDecision(ctx, projectId, {
      decision: "Hold launch",
      rationale: "Health red",
      owner: "Cara",
      outcome: "Deferred",
    });

    const health = await service.getHealth(ctx, projectId);
    expect(health.status).toBe("red");
    expect(health.reasons.length).toBeGreaterThan(0);

    const dashboard = await service.getDashboard(ctx, projectId);
    expect(dashboard.health.status).toBe("red");
    expect(dashboard.blockers.length).toBeGreaterThan(0);
    expect(dashboard.openRisks).toBe(1);
    expect(dashboard.overdueActions).toBe(1);
    expect(dashboard.recentDecisions.length).toBe(1);
  });

  it("reports green when indicators are healthy", async () => {
    const service = createProjectsDeliveryService();
    await service.createMilestone(ctx, projectId, {
      name: "On track",
      targetDate: "2099-12-01T00:00:00.000Z",
      progressPercent: 80,
    });
    const health = await service.getHealth(ctx, projectId);
    expect(health.status).toBe("green");
  });
});
