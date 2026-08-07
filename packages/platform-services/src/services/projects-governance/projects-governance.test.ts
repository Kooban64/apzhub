import { beforeEach, describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  createProjectsGovernanceService,
  resetProjectsGovernanceStoreForTests,
} from "./create-projects-governance-service";
import { getMemoryProjectsGovernanceStore } from "./memory-store";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant_gov",
    userId: "user_admin",
    organisationId: "org_gov",
    correlationId: "corr_gov",
    permissions: ["projects.admin"],
  };
}

describe("Projects Governance (P3)", () => {
  beforeEach(() => {
    resetProjectsGovernanceStoreForTests();
  });

  it("requires simulation confirmation before publish", async () => {
    const svc = createProjectsGovernanceService(getMemoryProjectsGovernanceStore());
    const draft = await svc.createProfile(ctx(), {
      key: "org_strict",
      name: "Org Strict",
      milestoneDateToleranceDays: 2,
    });
    expect(draft.status).toBe("draft");
    await expect(svc.publishProfile(ctx(), draft.id)).rejects.toThrow(
      /simulation_confirmation_required/,
    );
    const sim = await svc.simulateProfilePublish(ctx(), draft.id);
    expect(sim.nonRetroactive).toBe(true);
    const published = await svc.publishProfile(ctx(), draft.id, {
      confirmSimulation: true,
    });
    expect(published.status).toBe("published");
    expect(published.version).toBe(2);
  });

  it("lists system profiles alongside org drafts", async () => {
    const svc = createProjectsGovernanceService(getMemoryProjectsGovernanceStore());
    await svc.createProfile(ctx(), { key: "org_a", name: "Org A" });
    const all = await svc.listAllProfiles(ctx());
    expect(all.some((p) => p.id.startsWith("gprof_system_"))).toBe(true);
    expect(all.some((p) => p.key === "org_a")).toBe(true);
  });

  it("resolves effective config with inheritance layers", async () => {
    const svc = createProjectsGovernanceService(getMemoryProjectsGovernanceStore());
    const effective = await svc.getEffectiveConfig(ctx(), {
      scopeType: "project",
      scopeId: "proj_1",
      boundProfileId: "gprof_system_regulatory",
    });
    expect(effective.profile?.id).toBe("gprof_system_regulatory");
    expect(effective.layers.some((l) => l.scopeType === "platform")).toBe(true);
  });
});
