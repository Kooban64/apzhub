import { beforeEach, describe, expect, it } from "vitest";

import {
  createOperationalFrictionService,
  resetMemoryOperationalFrictionStoreForTests,
  setOperationalFrictionStoreForTests,
  getMemoryOperationalFrictionStore,
} from "./index";

const ctx = {
  userId: "user_board",
  tenantId: "tenant_1",
  correlationId: "c1",
  requestId: "r1",
  permissions: ["admin.read", "admin.manage"],
};

describe("OperationalFrictionService", () => {
  beforeEach(() => {
    resetMemoryOperationalFrictionStoreForTests();
    setOperationalFrictionStoreForTests(getMemoryOperationalFrictionStore());
  });

  it("creates friction with five-question fields and audit", async () => {
    const service = createOperationalFrictionService();
    const created = await service.create(ctx, {
      title: "PMs miss delivery risk",
      reporter: "Product Board",
      productsAffected: ["projects", "workflow"],
      userRole: "Project Manager",
      frustration: "Project managers cannot easily see delivery risk.",
      whoExperiences: "Project Manager",
      evidence: "Repeated weekly observations in delivery reviews.",
      nonEngineeringOptions:
        "Training on existing health views was tried; insufficient.",
      smallestCapability: "Surface top delivery-risk signals on project overview.",
      source: "manual",
    });

    expect(created.frustration).toContain("delivery risk");
    expect(created.boardDecision).toBe("needs_more_evidence");
    expect(created.engineeringStatus).toBe("no_engineering");

    const audit = await service.listAudit(ctx, created.id);
    expect(audit[0]?.action).toBe("created");
  });

  it("updates board decision, engineering status, and outcomes", async () => {
    const service = createOperationalFrictionService();
    const created = await service.create(ctx, {
      title: "Support loses related tickets",
      reporter: "Ops lead",
      productsAffected: ["support"],
      userRole: "Support Agent",
      frustration: "Support agents spend too long finding related tickets.",
      whoExperiences: "Support Agent",
      evidence: "Agent interviews + handle-time observation.",
      nonEngineeringOptions: "Checklist in docs did not reduce handle time.",
      smallestCapability: "Show related open tickets on request detail.",
      boardDecision: "accepted",
      engineeringStatus: "apzqep_candidate",
      source: "support",
    });

    const updated = await service.update(ctx, created.id, {
      engineeringStatus: "delivered",
      outcomeFaster: true,
      outcomeClearer: true,
      outcomeSafer: false,
      outcomeBetterDecision: true,
      outcomeNotes: "Handle time down in pilot pod.",
    });

    expect(updated.engineeringStatus).toBe("delivered");
    expect(updated.outcomeFaster).toBe(true);
    const audit = await service.listAudit(ctx, created.id);
    expect(audit.some((entry) => entry.action === "updated")).toBe(true);
  });
});
