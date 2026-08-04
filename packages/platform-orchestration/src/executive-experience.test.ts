import { describe, expect, it } from "vitest";

import {
  EXECUTIVE_EXPERIENCE_EVENT_TYPES,
  EXECUTIVE_PERSONA_KINDS,
  createPlatformOrchestration,
} from "./index";

describe("APZQEP-165 QO-015 Enterprise Executive Experience Integration", () => {
  it("creates a projection-only Executive Experience Package", async () => {
    const platform = await createPlatformOrchestration();
    expect(platform.contracts.get("orchestration.executive_experience.v1")?.kind).toBe(
      "executive_experience",
    );
    expect(platform.container.has("orchestration.executive_experience.engine")).toBe(
      true,
    );

    const pkg = platform.executiveExperience.createExecutiveExperiencePackage({
      personaKind: "ceo",
      evidenceIntegrationPackageRef: "eip_1",
      decisionPackageRef: "dp_1",
      approvalBundleRef: "apb_1",
      enrichmentPackageRef: "qiep_1",
      reportProfileRefs: ["report_profile_executive"],
      tenantId: "tenant_a",
      projectId: "proj_a",
      actorId: "actor_exec",
    });

    expect(pkg.projectionOnly).toBe(true);
    expect(pkg.presentationExternal).toBe(true);
    expect(pkg.influencesDecisions).toBe(false);
    expect(pkg.copiesEvidence).toBe(false);
    expect(pkg.experienceStatus).toBe("projected");
    expect(pkg.persona.kind).toBe("ceo");
    expect(pkg.decisionPackageRef).toBe("dp_1");
    expect(pkg.evidenceIntegrationPackageRef).toBe("eip_1");
    expect(pkg.approvalBundleRef).toBe("apb_1");
    expect(pkg.enrichmentPackageRef).toBe("qiep_1");
    expect(pkg.projection.rendersNothing).toBe(true);
    expect(pkg.presentationPreferences.renderingExternal).toBe(true);

    expect(
      platform.events.queryEvents({
        eventType: EXECUTIVE_EXPERIENCE_EVENT_TYPES.experienceCreated,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.events.queryEvents({
        eventType: EXECUTIVE_EXPERIENCE_EVENT_TYPES.personaApplied,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.events.queryEvents({
        eventType: EXECUTIVE_EXPERIENCE_EVENT_TYPES.packageCompleted,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("exposes declarative executive personas with consumption preferences only", async () => {
    const platform = await createPlatformOrchestration();
    const personas = platform.executiveExperience.listExecutivePersonas();
    expect(personas).toHaveLength(EXECUTIVE_PERSONA_KINDS.length);
    expect(personas.every((p) => p.immutable && p.projectionOnly)).toBe(true);

    const cto = platform.executiveExperience.getExecutivePersona("cto");
    expect(cto.defaultReportProfileKinds).toContain("executive");
    expect(cto.defaultArtefactSlots).toContain("decision_package");
  });

  it("builds projection models without rendering or metrics", async () => {
    const platform = await createPlatformOrchestration();
    const pkg = platform.executiveExperience.createExecutiveExperiencePackage({
      personaKind: "compliance_officer",
      decisionPackageRef: "dp_c",
      approvalBundleRef: "apb_c",
      evidenceIntegrationPackageRef: "eip_c",
      tenantId: "t1",
    });

    const projection = platform.executiveExperience.getProjectionModel(
      pkg.executiveExperiencePackageId,
    );
    expect(projection.personaKind).toBe("compliance_officer");
    expect(projection.projectionOnly).toBe(true);
    expect(projection.rendersNothing).toBe(true);
    expect(projection.includedArtefacts.decision_package).toContain("dp_c");
    expect(projection.includedArtefacts.approval_bundle).toContain("apb_c");
    expect(JSON.stringify(pkg).toLowerCase()).not.toMatch(
      /\b(renderdashboard|chartjs|d3\.js|recharts|plotly)\b/,
    );
  });

  it("never exposes APIs that render, report, calculate, or influence decisions", async () => {
    const platform = await createPlatformOrchestration();
    const eng = platform.executiveExperience as unknown as Record<string, unknown>;
    expect(typeof eng.renderDashboard).toBe("undefined");
    expect(typeof eng.generateReport).toBe("undefined");
    expect(typeof eng.calculateMetrics).toBe("undefined");
    expect(typeof eng.createEvidence).toBe("undefined");
    expect(typeof eng.evaluateGovernance).toBe("undefined");
    expect(typeof eng.evaluateDecision).toBe("undefined");
    expect(typeof eng.visualize).toBe("undefined");

    const pkg = platform.executiveExperience.createExecutiveExperiencePackage({
      personaKind: "qa_director",
      decisionPackageRef: "dp_q",
      evidenceIntegrationPackageRef: "eip_q",
      tenantId: "t1",
    });
    expect(pkg.influencesDecisions).toBe(false);
    expect(platform.executiveExperience.diagnostics().ready).toBe(true);
  });

  it("supports custom personas and superseding projections via new packages", async () => {
    const platform = await createPlatformOrchestration();
    const first = platform.executiveExperience.createExecutiveExperiencePackage({
      personaKind: "programme_manager",
      decisionPackageRef: "dp_p",
      evidenceIntegrationPackageRef: "eip_p",
      tenantId: "t1",
    });
    const second = platform.executiveExperience.createExecutiveExperiencePackage({
      personaKind: "custom",
      customPersonaName: "Risk Board",
      customArtefactSlots: ["decision_package", "approval_bundle"],
      customReportProfileKinds: ["audit"],
      decisionPackageRef: "dp_p",
      approvalBundleRef: "apb_p",
      supersedesPackageId: first.executiveExperiencePackageId,
      tenantId: "t1",
    });

    expect(second.persona.kind).toBe("custom");
    expect(second.persona.name).toBe("Risk Board");
    expect(second.supersedesPackageId).toBe(first.executiveExperiencePackageId);
    expect(
      platform.events.queryEvents({
        eventType: EXECUTIVE_EXPERIENCE_EVENT_TYPES.projectionUpdated,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.executiveExperience.getExperienceHistory(
        second.executiveExperiencePackageId,
      ).length,
    ).toBeGreaterThan(0);
  });
});
