import { describe, expect, it } from "vitest";

import { WORKSPACE_EVENT_TYPES, createPlatformOrchestration } from "./index";

describe("APZQEP-165 QO-017 Enterprise Workspace & Operations Experience", () => {
  it("creates a composition-only Workspace Experience Package", async () => {
    const platform = await createPlatformOrchestration();
    expect(platform.contracts.get("orchestration.workspace_experience.v1")?.kind).toBe(
      "workspace_experience",
    );
    expect(platform.container.has("orchestration.workspace_experience.engine")).toBe(
      true,
    );

    const pkg = platform.workspaceExperience.createWorkspaceExperiencePackage({
      executiveExperiencePackageRef: "eep_1",
      operationalReadinessPackageRef: "orp_1",
      evidenceIntegrationPackageRef: "eip_1",
      layoutKind: "operations_console",
      roleHint: "platform_operator",
      personaHint: "qa_director",
      sessionRef: "sess_1",
      tenantId: "tenant_a",
      projectId: "proj_a",
      actorId: "actor_ws",
    });

    expect(pkg.compositionOnly).toBe(true);
    expect(pkg.ownsBusinessState).toBe(false);
    expect(pkg.assemblesBusinessLogic).toBe(false);
    expect(pkg.influencesDecisions).toBe(false);
    expect(pkg.experienceStatus).toBe("composed");
    expect(pkg.executiveExperiencePackageRef).toBe("eep_1");
    expect(pkg.operationalReadinessPackageRef).toBe("orp_1");
    expect(pkg.evidenceIntegrationPackageRef).toBe("eip_1");
    expect(pkg.composition.ownsBusinessState).toBe(false);
    expect(pkg.layouts[0]?.kind).toBe("operations_console");

    expect(
      platform.events.queryEvents({
        eventType: WORKSPACE_EVENT_TYPES.experienceCreated,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.events.queryEvents({
        eventType: WORKSPACE_EVENT_TYPES.navigationComposed,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.events.queryEvents({
        eventType: WORKSPACE_EVENT_TYPES.packageCompleted,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("exposes layout, navigation, context, and history reads", async () => {
    const platform = await createPlatformOrchestration();
    const pkg = platform.workspaceExperience.createWorkspaceExperiencePackage({
      operationalReadinessPackageRef: "orp_r",
      evidenceIntegrationPackageRef: "eip_r",
      layoutKind: "readiness_focus",
      tenantId: "t1",
    });

    expect(
      platform.workspaceExperience.getWorkspaceLayouts(
        pkg.workspaceExperiencePackageId,
      )[0]?.kind,
    ).toBe("readiness_focus");
    expect(
      platform.workspaceExperience.getNavigationModel().entryPoints.length,
    ).toBeGreaterThan(0);
    const ctx = platform.workspaceExperience.getWorkspaceContext(
      pkg.workspaceExperiencePackageId,
    );
    expect(ctx.operationalContext.operationalReadinessPackageRef).toBe("orp_r");
    expect(ctx.roleContext.capabilityHints).toContain("ops.view");
    expect(
      platform.workspaceExperience.getWorkspaceHistory(pkg.workspaceExperiencePackageId)
        .length,
    ).toBeGreaterThan(0);
  });

  it("marks partial/empty composition when upstream refs are missing", async () => {
    const platform = await createPlatformOrchestration();
    const partial = platform.workspaceExperience.createWorkspaceExperiencePackage({
      operationalReadinessPackageRef: "orp_only",
      tenantId: "t1",
    });
    expect(partial.experienceStatus).toBe("partial");

    const empty = platform.workspaceExperience.createWorkspaceExperiencePackage({
      tenantId: "t1",
    });
    expect(empty.experienceStatus).toBe("empty");
  });

  it("never exposes business, governance, automation, or dashboard APIs", async () => {
    const platform = await createPlatformOrchestration();
    const eng = platform.workspaceExperience as unknown as Record<string, unknown>;
    expect(typeof eng.executeOrchestration).toBe("undefined");
    expect(typeof eng.evaluateGovernance).toBe("undefined");
    expect(typeof eng.executeAutomation).toBe("undefined");
    expect(typeof eng.modifyEvidence).toBe("undefined");
    expect(typeof eng.renderDashboard).toBe("undefined");
    expect(typeof eng.generateReport).toBe("undefined");
    expect(typeof eng.createEvidence).toBe("undefined");

    const pkg = platform.workspaceExperience.createWorkspaceExperiencePackage({
      executiveExperiencePackageRef: "eep_a",
      operationalReadinessPackageRef: "orp_a",
      evidenceIntegrationPackageRef: "eip_a",
      tenantId: "t1",
    });
    expect(pkg.ownsBusinessState).toBe(false);
    expect(JSON.stringify(pkg).toLowerCase()).not.toMatch(
      /\b(evaluatepolicy|runplaywright|deploycluster)\b/,
    );
    expect(platform.workspaceExperience.diagnostics().ready).toBe(true);
  });

  it("supports superseding layout composition via a new package", async () => {
    const platform = await createPlatformOrchestration();
    const first = platform.workspaceExperience.createWorkspaceExperiencePackage({
      executiveExperiencePackageRef: "eep_s",
      operationalReadinessPackageRef: "orp_s",
      layoutKind: "operator_home",
      tenantId: "t1",
    });
    const second = platform.workspaceExperience.createWorkspaceExperiencePackage({
      executiveExperiencePackageRef: "eep_s",
      operationalReadinessPackageRef: "orp_s",
      evidenceIntegrationPackageRef: "eip_s",
      layoutKind: "evidence_focus",
      supersedesPackageId: first.workspaceExperiencePackageId,
      tenantId: "t1",
    });

    expect(second.supersedesPackageId).toBe(first.workspaceExperiencePackageId);
    expect(second.layouts[0]?.kind).toBe("evidence_focus");
    expect(first.layouts[0]?.kind).toBe("operator_home");
    expect(
      platform.events.queryEvents({
        eventType: WORKSPACE_EVENT_TYPES.layoutUpdated,
      }).length,
    ).toBeGreaterThan(0);
  });
});
