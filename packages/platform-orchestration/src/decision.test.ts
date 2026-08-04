import { describe, expect, it } from "vitest";

import {
  BUILTIN_DECISION_PROFILE_IDS,
  DECISION_EVENT_TYPES,
  createPlatformOrchestration,
  type CreateDecisionPackageInput,
} from "./index";

function baseInput(
  overrides: Partial<CreateDecisionPackageInput> = {},
): CreateDecisionPackageInput {
  return {
    profileId: "pull_request",
    qualityFlowRef: "qf_demo",
    policySelectionRef: "sel_demo",
    impact: {
      impactCorrelationRef: "imp_demo",
      overallConfidence: 0.8,
      confidenceSummary: "Impact confidence high",
      confidenceSources: ["graph_coverage", "historical"],
      riskLevel: "low",
      riskSummary: "Low impact risk",
      riskFactors: ["few_nodes"],
    },
    governance: {
      governanceDecisionRef: "gov_demo",
      compositionSatisfied: true,
      residualRisk: "low",
      outstandingGates: [],
      requiredHumanApprovals: [],
      governanceSummary: "All gates satisfied",
    },
    approval: {
      approvalBundleRef: "ab_demo",
      finalStatus: "approved",
      outstandingAuthorities: [],
      conditions: [],
      exceptions: [],
    },
    tenantId: "tenant_a",
    projectId: "proj_a",
    actorId: "actor_bot",
    ...overrides,
  };
}

describe("APZQEP-165 QO-009 Enterprise Quality Decision Engine", () => {
  it("seeds built-in decision profiles and creates a GO Decision Package", async () => {
    const events: string[] = [];
    const platform = await createPlatformOrchestration({
      publishEvent: (e) => {
        events.push(e.type);
      },
    });

    expect(platform.decisions.profiles.count()).toBe(
      BUILTIN_DECISION_PROFILE_IDS.length,
    );
    expect(platform.contracts.get("orchestration.decision.v1")?.kind).toBe("decision");
    expect(platform.container.has("orchestration.decision.engine")).toBe(true);

    const pkg = platform.decisions.createDecisionPackage(baseInput());
    expect(pkg.platformConclusion).toBe("GO");
    expect(pkg.advisory).toBe(true);
    expect(pkg.confidenceSummary.overallConfidence).toBe(0.8);
    expect(pkg.residualRisk.residualRiskLevel).toBe("low");
    expect(pkg.explainability.why.length).toBeGreaterThan(0);
    expect(pkg.explainability.upstreamRefs.governanceDecisionRef).toBe("gov_demo");
    expect(events).toContain(DECISION_EVENT_TYPES.packageCreated);

    expect(platform.decisions.getDecisionOutcome(pkg.decisionPackageId)).toBe("GO");
    expect(platform.decisions.getHistory(pkg.decisionPackageId).length).toBeGreaterThan(
      0,
    );
    expect(platform.decisions.diagnostics().decisionCount).toBe(1);
    expect(platform.decisions.diagnostics().ready).toBe(true);
  });

  it("returns NO_GO when governance is unsatisfied on a strict profile", async () => {
    const platform = await createPlatformOrchestration();
    const pkg = platform.decisions.createDecisionPackage(
      baseInput({
        profileId: "production_release",
        governance: {
          governanceDecisionRef: "gov_fail",
          compositionSatisfied: false,
          residualRisk: "high",
          outstandingGates: ["gate_security"],
          requiredHumanApprovals: ["cab"],
          governanceSummary: "Security gate open",
        },
        approval: {
          approvalBundleRef: "ab_pend",
          finalStatus: "pending",
          outstandingAuthorities: ["cab"],
          conditions: [],
          exceptions: [],
        },
        impact: {
          impactCorrelationRef: "imp_r",
          overallConfidence: 0.9,
          confidenceSummary: "ok",
          confidenceSources: ["impact"],
          riskLevel: "high",
          riskSummary: "high",
          riskFactors: ["security"],
        },
      }),
    );
    expect(pkg.platformConclusion).toBe("NO_GO");
    expect(pkg.outstandingItems).toContain("governance:gate_security");
    expect(pkg.explainability.outstandingItems.length).toBeGreaterThan(0);
  });

  it("returns CONDITIONAL_GO when conditions exist and profile allows it", async () => {
    const platform = await createPlatformOrchestration();
    const pkg = platform.decisions.createDecisionPackage(
      baseInput({
        profileId: "release_candidate",
        approval: {
          approvalBundleRef: "ab_cond",
          finalStatus: "conditionally_approved",
          outstandingAuthorities: [],
          conditions: ["monitor_canary"],
          exceptions: [],
        },
      }),
    );
    expect(pkg.platformConclusion).toBe("CONDITIONAL_GO");
    expect(pkg.outstandingItems).toContain("condition:monitor_canary");
  });

  it("defers when approvals outstanding and profile requests deferral", async () => {
    const platform = await createPlatformOrchestration();
    const pkg = platform.decisions.createDecisionPackage(
      baseInput({
        profileId: "release_candidate",
        approval: {
          approvalBundleRef: "ab_wait",
          finalStatus: "pending",
          outstandingAuthorities: ["release_manager"],
          conditions: [],
          exceptions: [],
        },
      }),
    );
    expect(pkg.platformConclusion).toBe("DEFERRED");
  });

  it("honours lifecycle hints for SUPERSEDED and CANCELLED", async () => {
    const platform = await createPlatformOrchestration();
    const superseded = platform.decisions.createDecisionPackage(
      baseInput({ lifecycleHint: "superseded" }),
    );
    expect(superseded.platformConclusion).toBe("SUPERSEDED");

    const cancelled = platform.decisions.createDecisionPackage(
      baseInput({ lifecycleHint: "cancelled" }),
    );
    expect(cancelled.platformConclusion).toBe("CANCELLED");
  });

  it("composes confidence and residual risk without re-evaluating upstream engines", async () => {
    const platform = await createPlatformOrchestration();
    const pkg = platform.decisions.createDecisionPackage(
      baseInput({
        impact: {
          impactCorrelationRef: "imp_x",
          overallConfidence: 0.55,
          confidenceSummary: "Medium confidence from impact",
          confidenceSources: ["distance", "coverage"],
          riskLevel: "medium",
          riskSummary: "Medium risk",
          riskFactors: ["many_edges"],
        },
        governance: {
          governanceDecisionRef: "gov_x",
          compositionSatisfied: true,
          residualRisk: "high",
          outstandingGates: [],
          requiredHumanApprovals: [],
          governanceSummary: "Satisfied with residual high",
        },
      }),
    );

    expect(pkg.confidenceSummary.overallConfidence).toBe(0.55);
    expect(pkg.confidenceSummary.confidenceExplanation).toContain("Medium confidence");
    expect(pkg.residualRisk.residualRiskLevel).toBe("high");
    expect(pkg.residualRisk.contributingFactors).toContain("governance_risk:high");

    // Architecture conformance: decision surface has no evaluate/deploy APIs
    expect(
      typeof (platform.decisions as unknown as { evaluatePolicy?: unknown })
        .evaluatePolicy,
    ).toBe("undefined");
    expect(
      typeof (platform.decisions as unknown as { evaluateGate?: unknown }).evaluateGate,
    ).toBe("undefined");
    expect(typeof (platform.decisions as unknown as { deploy?: unknown }).deploy).toBe(
      "undefined",
    );
    expect(
      typeof (platform.decisions as unknown as { approveRelease?: unknown })
        .approveRelease,
    ).toBe("undefined");
  });

  it("rejects inactive custom profiles and reads package APIs", async () => {
    const platform = await createPlatformOrchestration();
    platform.decisions.registerProfile({
      profileId: "custom_strict",
      name: "Custom Strict",
      version: "1.0.0",
      documentationRef: "docs://custom_strict",
      lifecycleState: "retired",
      thresholds: {
        minOverallConfidence: 0.99,
        maxResidualRisk: "low",
        requireGovernanceSatisfied: true,
        requireApprovalComplete: true,
        deferWhenApprovalsOutstanding: false,
        allowConditionalGo: false,
      },
    });

    expect(() =>
      platform.decisions.createDecisionPackage(
        baseInput({ profileId: "custom_strict" }),
      ),
    ).toThrow(/not active/);

    const pkg = platform.decisions.createDecisionPackage(
      baseInput({ profileId: "nightly" }),
    );
    expect(
      platform.decisions.getConfidenceSummary(pkg.decisionPackageId).overallConfidence,
    ).toBe(0.8);
    expect(
      platform.decisions.getResidualRisk(pkg.decisionPackageId).residualRiskLevel,
    ).toBe("low");
    expect(platform.decisions.getExplainability(pkg.decisionPackageId).conclusion).toBe(
      "GO",
    );
    expect(
      platform.decisions.getDecisionPackage(pkg.decisionPackageId).decisionPackageId,
    ).toBe(pkg.decisionPackageId);
  });
});
