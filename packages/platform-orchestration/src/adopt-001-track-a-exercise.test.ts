/**
 * QX-PR-08 / QX-P1-04 — ADOPT-001 Phase 1 Track A capability exercise.
 * Use existing orchestration surfaces — no redesign.
 */
import { describe, expect, it } from "vitest";

import {
  InMemoryOrchestrationDocumentStore,
  createPlatformOrchestration,
} from "./index";

describe("QX-PR-08 ADOPT-001 Track A capability exercise", () => {
  it("exercises workspace · flows · decisions · evidence · approvals · executive · ops · workspace experience", async () => {
    const orch = await createPlatformOrchestration({
      documentStore: new InMemoryOrchestrationDocumentStore(),
    });

    // Complete workspace / Quality Flows
    await orch.qualityFlows.registerDefinition({
      flowId: "qf_adopt_track_a",
      name: "ADOPT Track A Flow",
      version: "1.0.0",
      owner: "apzqep",
      supportedTriggerTypes: ["manual"],
      lifecycleVersion: "1",
      documentationRef:
        "docs/products/apzqep/apzqep-adopt-001/PHASE-1-PRODUCTION-ADOPTION.md",
    });
    const flow = await orch.qualityFlows.createInstance({
      flowId: "qf_adopt_track_a",
      triggerId: "trg_adopt_a",
      correlationId: "corr_adopt_a",
      tenantId: "tenant_adopt",
      actor: "quality_lead",
    });
    expect(flow.currentState).toBe("registered");
    await orch.qualityFlows.transition(flow.instanceId, {
      toState: "ready",
      actor: "quality_lead",
      reason: "adopt_track_a",
      correlationId: "corr_adopt_a",
    });

    // Approvals
    orch.approvals.registerAuthority({
      authorityId: "release_manager",
      name: "Release Manager",
      scope: "enterprise",
      delegationSupported: false,
      escalationSupported: false,
    });
    await orch.approvals.registerTemplate({
      templateId: "tpl_adopt",
      name: "ADOPT Approval",
      version: "1.0.0",
      requiredAuthorities: ["release_manager"],
      decisionRule: { type: "all_required" },
      documentationRef:
        "docs/products/apzqep/apzqep-adopt-001/PHASE-1-PRODUCTION-ADOPTION.md",
    });
    const bundle = await orch.approvals.createApprovalBundle({
      templateId: "tpl_adopt",
      tenantId: "tenant_adopt",
      subject: {
        governanceDecisionRef: "gov_adopt",
        qualityFlowRef: flow.qualityFlowId,
      },
    });
    await orch.approvals.submitDecision(bundle.bundleId, {
      authorityId: "release_manager",
      actorId: "rm_adopt",
      state: "approved",
    });
    expect(orch.approvals.getBundle(bundle.bundleId).finalStatus).toBe("approved");

    // Evidence
    const evidence = await orch.evidenceIntegration.createEvidenceIntegrationPackage({
      qualityFlowRef: flow.qualityFlowId,
      impactGraphRef: "imp_adopt",
      governanceDecisionRef: "gov_adopt",
      approvalBundleRef: bundle.bundleId,
      decisionPackageRef: "dp_adopt_pending",
      evidenceRefs: ["ev:adopt:1", "ev:adopt:2"],
      reportRefs: ["rpt:adopt:1"],
      auditRefs: ["audit:adopt:1"],
      tenantId: "tenant_adopt",
      actorId: "quality_lead",
    });
    expect(["complete", "partial"]).toContain(evidence.integrationStatus);

    // Decision Packages
    const decision = await orch.decisions.createDecisionPackage({
      profileId: "pull_request",
      qualityFlowRef: flow.qualityFlowId,
      policySelectionRef: "sel_adopt",
      impact: {
        impactCorrelationRef: "imp_adopt",
        overallConfidence: 0.8,
        confidenceSummary: "ok",
        confidenceSources: ["adopt"],
        riskLevel: "low",
        riskSummary: "low",
        riskFactors: [],
      },
      governance: {
        governanceDecisionRef: "gov_adopt",
        compositionSatisfied: true,
        residualRisk: "low",
        outstandingGates: [],
        requiredHumanApprovals: [],
        governanceSummary: "ok",
      },
      approval: {
        approvalBundleRef: bundle.bundleId,
        finalStatus: "approved",
        outstandingAuthorities: [],
        conditions: [],
        exceptions: [],
      },
      tenantId: "tenant_adopt",
      actorId: "quality_lead",
    });
    expect(decision.platformConclusion).toBe("GO");

    // Executive Experience
    const executive = await orch.executiveExperience.createExecutiveExperiencePackage({
      personaKind: "ceo",
      evidenceIntegrationPackageRef: evidence.evidenceIntegrationPackageId,
      decisionPackageRef: decision.decisionPackageId,
      approvalBundleRef: bundle.bundleId,
      tenantId: "tenant_adopt",
      actorId: "exec_adopt",
    });
    expect(executive.executiveExperiencePackageId).toBeTruthy();

    // Operational Platform
    const operational = await orch.operational.createOperationalReadinessPackage({
      executiveExperiencePackageRef: executive.executiveExperiencePackageId,
      evidenceIntegrationPackageRef: evidence.evidenceIntegrationPackageId,
      decisionPackageRef: decision.decisionPackageId,
      tenantId: "tenant_adopt",
      actorId: "ops_adopt",
    });
    expect(operational.operationalReadinessPackageId).toBeTruthy();

    // Workspace Experience
    const workspace = await orch.workspaceExperience.createWorkspaceExperiencePackage({
      executiveExperiencePackageRef: executive.executiveExperiencePackageId,
      operationalReadinessPackageRef: operational.operationalReadinessPackageId,
      evidenceIntegrationPackageRef: evidence.evidenceIntegrationPackageId,
      layoutKind: "operations_console",
      tenantId: "tenant_adopt",
      actorId: "ws_adopt",
    });
    expect(workspace.workspaceExperiencePackageId).toBeTruthy();

    // Contracts prove complete workspace surface is registered
    expect(orch.contracts.get("orchestration.decision.v1")?.kind).toBe("decision");
    expect(orch.contracts.get("orchestration.executive_experience.v1")?.kind).toBe(
      "executive_experience",
    );
  });
});
