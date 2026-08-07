import { beforeEach, describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import { computeObjectiveProgress } from "./compute-objective-progress";
import { computePortfolioWeightedConfidence } from "./compute-portfolio-confidence";
import {
  createProjectsPortfolioService,
  resetProjectsPortfolioStoreForTests,
} from "./create-projects-portfolio-service";
import { getMemoryProjectsPortfolioStore } from "./memory-store";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant_pf",
    userId: "user_pmo",
    organisationId: "org_pf",
    correlationId: "corr_pf",
    permissions: ["projects.*"],
  };
}

function portfolioService() {
  return createProjectsPortfolioService(getMemoryProjectsPortfolioStore());
}

describe("Projects Portfolio (PX-02)", () => {
  beforeEach(() => {
    resetProjectsPortfolioStoreForTests();
  });

  it("creates initiative, programme, objective hierarchy", async () => {
    const svc = portfolioService();
    const ini = await svc.createInitiative(ctx(), {
      name: "Payments Modernisation",
      sponsorUserId: "user_sponsor",
    });
    const prg = await svc.createProgramme(ctx(), {
      name: "Card Issuing",
      ownerUserId: "user_pm",
      strategicInitiativeId: ini.id,
      strategicImportance: "critical",
      memberProjectIds: ["proj_1"],
    });
    const obj = await svc.createObjective(ctx(), {
      name: "Reduce card fraud",
      statement: "Cut fraud losses 40%",
      ownerUserId: "user_sponsor",
      initiativeIds: [ini.id],
      programmeIds: [prg.id],
      contributingProjectIds: ["proj_1"],
    });
    expect(ini.id).toMatch(/^ini_/);
    expect(prg.strategicInitiativeId).toBe(ini.id);
    expect(obj.contributingProjectIds).toContain("proj_1");
    const refreshed = await svc.getInitiative(ctx(), ini.id);
    expect(refreshed?.programmeIds).toContain(prg.id);
  });

  it("derives objective progress from evidence loader — ignores manual progress", async () => {
    const portfolio = createProjectsPortfolioService(
      getMemoryProjectsPortfolioStore(),
      {
        loadEvidence: async () => ({
          milestones: [{ status: "achieved" }, { status: "achieved" }],
          commitments: [{ status: "done" }],
        }),
      },
    );
    const obj = await portfolio.createObjective(ctx(), {
      name: "Evidence objective",
      statement: "Must be evidence-driven",
      ownerUserId: "user_sponsor",
      contributingProjectIds: ["proj_1"],
    });
    expect(obj.progress).toBe(0);
    const refreshed = await portfolio.getObjective(ctx(), obj.id);
    expect(refreshed?.progress).toBe(100);
    expect(refreshed?.status).toBe("achieved");
    const updated = await portfolio.updateObjective(ctx(), obj.id, {
      name: "Evidence objective renamed",
    });
    expect(updated.progress).toBe(100);
    expect(computeObjectiveProgress({ milestones: [], commitments: [] }).progress).toBe(
      0,
    );
  });

  it("moves project membership between programmes", async () => {
    const svc = portfolioService();
    const a = await svc.createProgramme(ctx(), {
      name: "A",
      ownerUserId: "user_pm",
      memberProjectIds: ["proj_x"],
    });
    const b = await svc.createProgramme(ctx(), {
      name: "B",
      ownerUserId: "user_pm",
      memberProjectIds: [],
    });
    await svc.moveProject(ctx(), {
      projectId: "proj_x",
      toProgrammeId: b.id,
    });
    expect((await svc.getProgramme(ctx(), a.id))?.memberProjectIds).not.toContain(
      "proj_x",
    );
    expect((await svc.getProgramme(ctx(), b.id))?.memberProjectIds).toContain("proj_x");
  });

  it("computes weighted confidence not arithmetic mean", () => {
    const result = computePortfolioWeightedConfidence([
      {
        id: "p1",
        name: "Critical low",
        confidenceScore: 30,
        importance: "critical",
        dependenciesBroken: 2,
        exceptionsCritical: 1,
        exceptionsMajor: 0,
        programmeCritical: true,
      },
      {
        id: "p2",
        name: "Healthy normal",
        confidenceScore: 90,
        importance: "low",
        dependenciesBroken: 0,
        exceptionsCritical: 0,
        exceptionsMajor: 0,
      },
    ]);
    // Mean would be 60; weighted + penalties should be lower.
    expect(result.score).toBeLessThan(60);
    expect(result.contributors.length).toBeGreaterThan(0);
    expect(result.band).toBe("Low");
  });
});
