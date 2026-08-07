import { beforeEach, describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  createProjectsTeamDirectoryService,
  resetProjectsTeamDirectoryStoreForTests,
} from "./create-projects-team-directory-service";
import { getMemoryProjectsTeamDirectoryStore } from "./memory-store";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant_team",
    userId: "user_pmo",
    organisationId: "org_team",
    correlationId: "corr_team",
    permissions: ["projects.*"],
  };
}

function teamService() {
  return createProjectsTeamDirectoryService(getMemoryProjectsTeamDirectoryStore());
}

describe("Projects Team Directory (P2)", () => {
  beforeEach(() => {
    resetProjectsTeamDirectoryStoreForTests();
  });

  it("creates reusable delivery teams with membership", async () => {
    const svc = teamService();
    const team = await svc.createTeam(ctx(), {
      name: "Payments Squad",
      leadUserId: "user_lead",
      skillTags: ["payments", "pci"],
    });
    expect(team.id).toMatch(/^edt_/);
    expect(team.status).toBe("active");
    const membership = await svc.addMembership(ctx(), team.id, {
      userId: "user_dev",
      roleInTeam: "member",
      allocationPercent: 80,
    });
    expect(membership.teamId).toBe(team.id);
    const listed = await svc.listTeams(ctx());
    expect(listed.map((t) => t.id)).toContain(team.id);
  });

  it("deactivates teams so they leave the active directory", async () => {
    const svc = teamService();
    const team = await svc.createTeam(ctx(), {
      name: "Sunset Squad",
      leadUserId: "user_lead",
    });
    await svc.updateTeam(ctx(), team.id, { status: "inactive" });
    const listed = await svc.listTeams(ctx());
    expect(listed.map((t) => t.id)).not.toContain(team.id);
  });
});
