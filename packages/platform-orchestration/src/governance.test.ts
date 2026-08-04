import { describe, expect, it } from "vitest";
import {
  COMPOSITION_MODES,
  GOVERNANCE_EVENT_TYPES,
  canTransitionGateStatus,
  createPlatformOrchestration,
  evaluateComposition,
  type GateComposition,
  type GateEvaluationResult,
  type GateStatus,
} from "./index";

function seedGates(
  gov: Awaited<ReturnType<typeof createPlatformOrchestration>>["governance"],
) {
  const doc = "docs/products/apzqep/v1.1/apzqep-165-qo-007/";
  gov.registerGate({
    gateId: "gate_evidence",
    name: "Evidence Integrity",
    version: "1.0.0",
    category: { family: "mandatory", label: "evidence_integrity" },
    criteria: { type: "evidence_integrity_ok" },
    documentationRef: doc,
    governingPolicyId: "pol_pr_governance",
    overrideEligible: false,
  });
  gov.registerGate({
    gateId: "gate_security",
    name: "Security Requirement Satisfied",
    version: "1.0.0",
    category: { family: "mandatory", label: "security" },
    criteria: {
      type: "and",
      criteria: [
        {
          type: "activity_selected",
          activityKind: "security_testing",
          requireBlockingOrRequired: true,
        },
        { type: "evidence_ref_present", refKey: "security" },
      ],
    },
    documentationRef: doc,
    governingRuleId: "rule_security",
    dependencies: ["gate_evidence"],
  });
  gov.registerGate({
    gateId: "gate_a11y",
    name: "Accessibility Requirement Satisfied",
    version: "1.0.0",
    category: { family: "mandatory", label: "accessibility" },
    criteria: {
      type: "or",
      criteria: [
        { type: "evidence_ref_present", refKey: "accessibility" },
        {
          type: "activity_selected",
          activityKind: "accessibility_testing",
        },
      ],
    },
    documentationRef: doc,
  });
  gov.registerGate({
    gateId: "gate_quality_score",
    name: "Quality Score Advisory",
    version: "1.0.0",
    category: { family: "advisory", label: "quality_score" },
    criteria: { type: "selection_expected_confidence_at_least", threshold: 0.5 },
    documentationRef: doc,
  });
  gov.registerGate({
    gateId: "gate_duration",
    name: "Estimated Duration Info",
    version: "1.0.0",
    category: { family: "informational", label: "estimated_duration" },
    criteria: { type: "always_satisfied" },
    documentationRef: doc,
  });
  gov.registerGate({
    gateId: "gate_rm",
    name: "Release Manager Approval",
    version: "1.0.0",
    category: { family: "human", label: "release_manager" },
    criteria: {
      type: "human_approval_recorded",
      approverRole: "release_manager",
    },
    documentationRef: doc,
    requiredApprovers: ["release_manager"],
    overrideEligible: true,
  });
  gov.registerGate({
    gateId: "gate_risk",
    name: "Risk Bound",
    version: "1.0.0",
    category: { family: "mandatory", label: "compliance" },
    criteria: { type: "impact_risk_at_most", level: "critical" },
    documentationRef: doc,
  });
}

function stubResult(gateId: string, status: GateStatus): GateEvaluationResult {
  return {
    gateId,
    gateVersion: "1.0.0",
    name: gateId,
    category: { family: "mandatory", label: "coverage" },
    status,
    matched: status === "satisfied",
    reason: status,
    evidenceRefs: [],
    activitiesConsidered: [],
    outstandingWork: [],
    overrideEligible: false,
    requiredApprovers: [],
    residualRisk: status === "failed" ? "high" : "low",
  };
}

describe("APZQEP-165 QO-007 Quality Governance Engine", () => {
  it("covers all composition modes", () => {
    expect(COMPOSITION_MODES).toEqual([
      "all",
      "any",
      "minimum",
      "weighted",
      "sequential",
      "conditional",
    ]);

    const map = new Map<string, GateEvaluationResult>([
      ["a", stubResult("a", "satisfied")],
      ["b", stubResult("b", "failed")],
      ["c", stubResult("c", "satisfied")],
      ["d", stubResult("d", "waived")],
    ]);

    const modes: GateComposition[] = [
      { mode: "all", gateIds: ["a", "c"] },
      { mode: "all", gateIds: ["a", "b"] },
      { mode: "any", gateIds: ["b", "c"] },
      { mode: "minimum", gateIds: ["a", "b", "c"], count: 2 },
      {
        mode: "weighted",
        items: [
          { gateId: "a", weight: 0.6 },
          { gateId: "b", weight: 0.6 },
        ],
        threshold: 0.5,
      },
      { mode: "sequential", gateIds: ["a", "c", "d"] },
      { mode: "sequential", gateIds: ["a", "b"] },
      {
        mode: "conditional",
        ifGateId: "a",
        thenGateIds: ["c"],
        elseGateIds: ["b"],
      },
      {
        mode: "conditional",
        ifGateId: "b",
        thenGateIds: ["c"],
        elseGateIds: ["d"],
      },
    ];

    for (const composition of modes) {
      const result = evaluateComposition(composition, map);
      expect(typeof result.satisfied).toBe("boolean");
      expect(result.summary.length).toBeGreaterThan(0);
    }

    expect(
      evaluateComposition({ mode: "all", gateIds: ["a", "c"] }, map).satisfied,
    ).toBe(true);
    expect(
      evaluateComposition({ mode: "all", gateIds: ["a", "b"] }, map).satisfied,
    ).toBe(false);
    expect(
      evaluateComposition({ mode: "any", gateIds: ["b", "c"] }, map).satisfied,
    ).toBe(true);
    expect(
      evaluateComposition({ mode: "minimum", gateIds: ["a", "b", "c"], count: 2 }, map)
        .satisfied,
    ).toBe(true);
    expect(
      evaluateComposition(
        {
          mode: "weighted",
          items: [
            { gateId: "a", weight: 0.6 },
            { gateId: "b", weight: 0.6 },
          ],
          threshold: 0.5,
        },
        map,
      ).satisfied,
    ).toBe(true);
    expect(
      evaluateComposition({ mode: "sequential", gateIds: ["a", "c", "d"] }, map)
        .satisfied,
    ).toBe(true);
    expect(
      evaluateComposition({ mode: "sequential", gateIds: ["a", "b"] }, map).satisfied,
    ).toBe(false);
  });

  it("evaluates gates from selection, impact, and evidence references only", async () => {
    const events: string[] = [];
    const platform = await createPlatformOrchestration({
      publishEvent: (e) => {
        events.push(e.type);
      },
    });
    seedGates(platform.governance);

    platform.impact.registerAsset({
      assetId: "file_x",
      assetType: "file",
      name: "x.ts",
    });
    const impact = platform.impact.createCorrelation({
      change: {
        changeId: "chg_g",
        changeKind: "pull_request",
        tenantId: "tenant_a",
        correlationId: "corr_g",
        occurredAt: new Date().toISOString(),
        magnitude: "medium",
        seedAssetIds: ["file_x"],
      },
    });

    // Minimal selection stub via policy engine would be heavy; use produceSelection after seeding policies lightly
    platform.policySelection.registerRule({
      ruleId: "rule_sec",
      name: "Sec",
      version: "1",
      condition: { type: "always" },
      severity: "blocking",
      activityKind: "security_testing",
      activityClassification: "blocking",
      explanation: "security required",
      expectedConfidenceContribution: 0.3,
    });
    platform.policySelection.registerRule({
      ruleId: "rule_smoke",
      name: "Smoke",
      version: "1",
      condition: { type: "always" },
      severity: "mandatory",
      activityKind: "smoke_testing",
      activityClassification: "required",
      explanation: "smoke",
      expectedConfidenceContribution: 0.2,
    });
    platform.policySelection.registerPolicy({
      policyId: "pol_g",
      name: "Gov policy",
      version: "1",
      owner: "apzqep",
      scope: "pr",
      documentationRef: "docs://p",
      ruleIds: ["rule_sec", "rule_smoke"],
    });
    platform.policySelection.registerProfile({
      profileId: "pull_request",
      name: "PR",
      policyIds: ["pol_g"],
      confidenceTarget: 0.6,
      documentationRef: "docs://pr",
    });
    const selection = platform.policySelection.produceSelectionDecision({
      profileId: "pull_request",
      impact,
    });

    platform.governance.registerTemplate({
      templateId: "pull_request",
      name: "PR Governance",
      policyProfileId: "pull_request",
      documentationRef: "docs/products/apzqep/v1.1/apzqep-165-qo-007/",
      composition: {
        mode: "all",
        gateIds: [
          "gate_evidence",
          "gate_security",
          "gate_a11y",
          "gate_quality_score",
          "gate_duration",
          "gate_risk",
        ],
      },
    });

    const decision = platform.governance.evaluateTemplate("pull_request", {
      tenantId: "tenant_a",
      selection,
      impact,
      qualityFlowId: "qf_g",
      evidenceRefs: [
        {
          evidenceId: "ev_sec",
          kind: "security",
          ref: "evidence://security/1",
          relatedGateHints: ["security"],
          integrityOk: true,
        },
        {
          evidenceId: "ev_a11y",
          kind: "accessibility",
          ref: "evidence://a11y/1",
          relatedGateHints: ["accessibility"],
          integrityOk: true,
        },
      ],
    });

    expect(decision.advisory).toBe(true);
    expect(decision.governanceSummary).toContain("not a release approval");
    expect(decision.satisfiedGates).toContain("gate_evidence");
    expect(decision.satisfiedGates).toContain("gate_security");
    expect(decision.satisfiedGates).toContain("gate_a11y");
    expect(decision.compositionSatisfied).toBe(true);
    expect(events).toContain(GOVERNANCE_EVENT_TYPES.decisionProduced);

    const explain = platform.governance.getExplainability(decision.decisionId);
    expect(explain.length).toBeGreaterThan(0);
    expect(explain.every((e) => e.evaluationReason.length > 0)).toBe(true);
  });

  it("keeps human gates pending until approval records exist", async () => {
    const platform = await createPlatformOrchestration();
    seedGates(platform.governance);
    platform.governance.registerTemplate({
      templateId: "production_release",
      name: "Production",
      policyProfileId: "production_release",
      documentationRef: "docs://prod",
      composition: {
        mode: "sequential",
        gateIds: ["gate_duration", "gate_rm"],
      },
    });

    const pending = platform.governance.evaluateTemplate("production_release", {
      tenantId: "tenant_a",
    });
    expect(pending.compositionSatisfied).toBe(false);
    expect(pending.requiredHumanApprovals).toContain("release_manager");
    expect(pending.outstandingGates).toContain("gate_rm");

    const approved = platform.governance.evaluateTemplate("production_release", {
      tenantId: "tenant_a",
      humanApprovals: [
        {
          approvalId: "ap1",
          approverRole: "release_manager",
          actorId: "user_1",
          decidedAt: new Date().toISOString(),
          outcome: "approved",
        },
      ],
    });
    expect(approved.compositionSatisfied).toBe(true);
    expect(approved.satisfiedGates).toContain("gate_rm");
  });

  it("exposes APIs, history, residual risk, and status transitions", async () => {
    const platform = await createPlatformOrchestration();
    seedGates(platform.governance);
    platform.governance.registerTemplate({
      templateId: "custom",
      name: "Custom",
      documentationRef: "docs://c",
      composition: { mode: "any", gateIds: ["gate_duration", "gate_quality_score"] },
    });

    const decision = platform.governance.evaluateTemplate("custom", {
      tenantId: "tenant_a",
    });
    expect(
      platform.governance.getGovernanceDecision(decision.decisionId).decisionId,
    ).toBe(decision.decisionId);
    expect(platform.governance.getResidualRisk(decision.decisionId)).toBe(
      decision.residualRisk,
    );
    expect(platform.governance.getHistory().length).toBeGreaterThan(0);
    expect(platform.governance.getOutstandingGates(decision.decisionId)).toBeTruthy();
    expect(canTransitionGateStatus("pending", "satisfied")).toBe(true);
    expect(canTransitionGateStatus("cancelled", "satisfied")).toBe(false);
    expect(platform.governance.canTransitionStatus("failed", "waived")).toBe(true);
    expect(platform.governance.diagnostics().gateCount).toBeGreaterThan(0);
    expect(platform.container.has("orchestration.governance.engine")).toBe(true);
    expect(
      typeof (platform.governance as unknown as { execute?: unknown }).execute,
    ).toBe("undefined");
  });

  it("supports remaining composition templates without provider logic", async () => {
    const platform = await createPlatformOrchestration();
    seedGates(platform.governance);

    const compositions: Array<{
      id: Parameters<typeof platform.governance.registerTemplate>[0]["templateId"];
      composition: GateComposition;
    }> = [
      {
        id: "developer_commit",
        composition: {
          mode: "minimum",
          gateIds: ["gate_duration", "gate_risk"],
          count: 1,
        },
      },
      {
        id: "nightly",
        composition: {
          mode: "weighted",
          items: [
            { gateId: "gate_duration", weight: 0.4 },
            { gateId: "gate_risk", weight: 0.7 },
          ],
          threshold: 0.5,
        },
      },
      {
        id: "regression",
        composition: {
          mode: "conditional",
          ifGateId: "gate_duration",
          thenGateIds: ["gate_risk"],
          elseGateIds: ["gate_quality_score"],
        },
      },
      {
        id: "hotfix",
        composition: { mode: "any", gateIds: ["gate_risk", "gate_duration"] },
      },
      {
        id: "compliance_audit",
        composition: { mode: "all", gateIds: ["gate_risk", "gate_duration"] },
      },
      {
        id: "release_candidate",
        composition: {
          mode: "sequential",
          gateIds: ["gate_duration", "gate_risk"],
        },
      },
    ];

    for (const item of compositions) {
      platform.governance.registerTemplate({
        templateId: item.id,
        name: item.id,
        documentationRef: "docs://t",
        composition: item.composition,
      });
      const decision = platform.governance.evaluateTemplate(item.id, {
        tenantId: "tenant_a",
      });
      expect(decision.compositionMode).toBe(item.composition.mode);
      expect(decision.advisory).toBe(true);
    }
  });
});
