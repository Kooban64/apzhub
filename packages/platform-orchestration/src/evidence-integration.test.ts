import { describe, expect, it } from "vitest";

import {
  EVIDENCE_INTEGRATION_EVENT_TYPES,
  REPORT_PROFILE_KINDS,
  createPlatformOrchestration,
} from "./index";

describe("APZQEP-165 QO-014 Enterprise Evidence & Reporting Integration", () => {
  it("creates an Evidence Integration Package with references only", async () => {
    const platform = await createPlatformOrchestration();
    expect(platform.contracts.get("orchestration.evidence_integration.v1")?.kind).toBe(
      "evidence_integration",
    );
    expect(platform.container.has("orchestration.evidence_integration.engine")).toBe(
      true,
    );

    const pkg = await platform.evidenceIntegration.createEvidenceIntegrationPackage({
      qualityFlowRef: "qf_1",
      impactGraphRef: "imp_1",
      governanceDecisionRef: "gov_1",
      approvalBundleRef: "apb_1",
      decisionPackageRef: "dp_1",
      automationCoordinationPackageRef: "acp_1",
      sourceChangePackageRef: "scp_1",
      enrichmentPackageRef: "qiep_1",
      evidenceRefs: ["ev:artefact:1", "ev:artefact:2"],
      reportRefs: ["rpt:ext:1"],
      auditRefs: ["audit:1"],
      tenantId: "tenant_a",
      projectId: "proj_a",
      actorId: "actor_evidence",
    });

    expect(pkg.referencesOnly).toBe(true);
    expect(pkg.copiesEvidence).toBe(false);
    expect(pkg.reportIsEvidence).toBe(false);
    expect(pkg.integrationStatus).toBe("complete");
    expect(pkg.decisionPackageRef).toBe("dp_1");
    expect(pkg.enrichmentPackageRef).toBe("qiep_1");
    expect(pkg.evidenceRefs).toEqual(["ev:artefact:1", "ev:artefact:2"]);
    expect(pkg.traceability.immutable).toBe(true);
    expect(pkg.traceability.artefactRefs).toContain("dp_1");
    expect(pkg.traceability.artefactRefs).toContain("qiep_1");

    // Package must not embed artefact bodies — only opaque string refs.
    expect(JSON.stringify(pkg)).not.toMatch(/"body"|"content"|"payloadHtml"/i);

    expect(
      platform.events.queryEvents({
        eventType: EVIDENCE_INTEGRATION_EVENT_TYPES.integrationCreated,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.events.queryEvents({
        eventType: EVIDENCE_INTEGRATION_EVENT_TYPES.packageCompleted,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("exposes declarative Report Profiles and assembles view-only reports", async () => {
    const platform = await createPlatformOrchestration();
    const profiles = platform.evidenceIntegration.listReportProfiles();
    expect(profiles).toHaveLength(REPORT_PROFILE_KINDS.length);
    expect(profiles.every((p) => p.immutable && p.presentationExternal)).toBe(true);

    const pkg = await platform.evidenceIntegration.createEvidenceIntegrationPackage({
      qualityFlowRef: "qf_r",
      decisionPackageRef: "dp_r",
      impactGraphRef: "imp_r",
      enrichmentPackageRef: "qiep_r",
      evidenceRefs: ["ev:1"],
      tenantId: "t1",
    });

    const view = await platform.evidenceIntegration.generateReportView({
      evidenceIntegrationPackageId: pkg.evidenceIntegrationPackageId,
      profileKind: "executive",
      tenantId: "t1",
      actorId: "actor_r",
    });

    expect(view.viewOnly).toBe(true);
    expect(view.isEvidence).toBe(false);
    expect(view.presentationExternal).toBe(true);
    expect(view.profile.kind).toBe("executive");
    expect(view.includedRefs.decision_package).toContain("dp_r");
    expect(view.includedRefs.enrichment_package).toContain("qiep_r");
    // Executive profile excludes source_change by design
    expect(view.includedRefs.source_change_package).toHaveLength(0);

    expect(
      platform.events.queryEvents({
        eventType: EVIDENCE_INTEGRATION_EVENT_TYPES.reportGenerated,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.events.queryEvents({
        eventType: EVIDENCE_INTEGRATION_EVENT_TYPES.profileApplied,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("preserves end-to-end traceability from report to artefacts", async () => {
    const platform = await createPlatformOrchestration();
    const pkg = await platform.evidenceIntegration.createEvidenceIntegrationPackage({
      qualityFlowRef: "qf_t",
      governanceDecisionRef: "gov_t",
      approvalBundleRef: "apb_t",
      decisionPackageRef: "dp_t",
      automationCoordinationPackageRef: "acp_t",
      sourceChangePackageRef: "scp_t",
      enrichmentPackageRef: "qiep_t",
      evidenceRefs: ["ev:t"],
      auditRefs: ["audit:t"],
      tenantId: "t1",
    });

    const view = await platform.evidenceIntegration.generateReportView({
      evidenceIntegrationPackageId: pkg.evidenceIntegrationPackageId,
      profileKind: "audit",
      tenantId: "t1",
    });

    const trace = platform.evidenceIntegration.queryTraceability(
      pkg.evidenceIntegrationPackageId,
    );
    expect(trace.evidenceIntegrationPackageId).toBe(pkg.evidenceIntegrationPackageId);
    expect(trace.artefactRefs).toEqual(
      expect.arrayContaining([
        "qf_t",
        "gov_t",
        "apb_t",
        "dp_t",
        "acp_t",
        "scp_t",
        "qiep_t",
      ]),
    );
    expect(trace.evidenceRefs).toContain("ev:t");
    expect(view.evidenceIntegrationPackageId).toBe(pkg.evidenceIntegrationPackageId);
    expect(view.traceabilityId).toBeTruthy();
  });

  it("never exposes APIs that create, alter, or evaluate evidence/governance", async () => {
    const platform = await createPlatformOrchestration();
    const eng = platform.evidenceIntegration as unknown as Record<string, unknown>;
    expect(typeof eng.createEvidence).toBe("undefined");
    expect(typeof eng.modifyEvidence).toBe("undefined");
    expect(typeof eng.evaluateGovernance).toBe("undefined");
    expect(typeof eng.evaluateDecision).toBe("undefined");
    expect(typeof eng.renderDashboard).toBe("undefined");
    expect(typeof eng.runAnalytics).toBe("undefined");

    const pkg = await platform.evidenceIntegration.createEvidenceIntegrationPackage({
      qualityFlowRef: "qf_arch",
      decisionPackageRef: "dp_arch",
      evidenceRefs: ["ev:arch"],
      tenantId: "t1",
    });
    expect(pkg.copiesEvidence).toBe(false);
    expect(pkg.reportIsEvidence).toBe(false);
    expect(platform.evidenceIntegration.diagnostics().ready).toBe(true);
    expect(platform.evidenceIntegration.diagnostics().referenceIntegrityOk).toBe(true);
  });

  it("supports custom profiles and reporting history without making reports evidence", async () => {
    const platform = await createPlatformOrchestration();
    const pkg = await platform.evidenceIntegration.createEvidenceIntegrationPackage({
      qualityFlowRef: "qf_c",
      decisionPackageRef: "dp_c",
      evidenceRefs: ["ev:c"],
      tenantId: "t1",
    });

    const view = await platform.evidenceIntegration.generateReportView({
      evidenceIntegrationPackageId: pkg.evidenceIntegrationPackageId,
      profileKind: "custom",
      customInclusionSlots: ["quality_flow", "decision_package", "evidence"],
      customProfileName: "Team Custom",
      tenantId: "t1",
    });

    expect(view.profile.kind).toBe("custom");
    expect(view.profile.name).toBe("Team Custom");
    expect(view.includedRefs.quality_flow).toContain("qf_c");
    expect(view.includedRefs.decision_package).toContain("dp_c");
    expect(view.isEvidence).toBe(false);

    const history = platform.evidenceIntegration.getReportingHistory(
      pkg.evidenceIntegrationPackageId,
    );
    expect(history.some((h) => h.action === "report_view_generated")).toBe(true);
  });
});
