import { describe, expect, it } from "vitest";
import {
  POLICY_SELECTION_EVENT_TYPES,
  createPlatformOrchestration,
  evaluateCondition,
  isOrchestrationError,
  type ImpactCorrelationResult,
  type PolicyProfileId,
} from "./index";

async function seedImpactKnowledge(
  impact: Awaited<ReturnType<typeof createPlatformOrchestration>>["impact"],
) {
  await impact.registerAsset({
    assetId: "file_core",
    assetType: "file",
    name: "core.ts",
    evidenceQuality: 0.7,
  });
  await impact.registerAsset({
    assetId: "req_billing",
    assetType: "requirement",
    name: "Billing",
    evidenceQuality: 0.8,
  });
  await impact.registerAsset({
    assetId: "suite_billing",
    assetType: "test_suite",
    name: "Billing suite",
  });
  await impact.registerRelationship({
    relationshipId: "rel_file_req",
    fromAssetId: "file_core",
    toAssetId: "req_billing",
    kind: "implements",
    strength: 0.9,
    reason: "File implements billing requirement",
  });
  await impact.registerRelationship({
    relationshipId: "rel_req_suite",
    fromAssetId: "req_billing",
    toAssetId: "suite_billing",
    kind: "covers",
    strength: 0.85,
    reason: "Suite covers billing requirement",
  });
}

async function correlate(
  impact: Awaited<ReturnType<typeof createPlatformOrchestration>>["impact"],
): Promise<ImpactCorrelationResult> {
  return await impact.createCorrelation({
    change: {
      changeId: "chg_pol",
      changeKind: "pull_request",
      tenantId: "tenant_a",
      projectId: "proj_a",
      triggerId: "trig_pol",
      correlationId: "corr_pol",
      qualityFlowId: "qf_pol",
      occurredAt: new Date().toISOString(),
      magnitude: "large",
      seedAssetIds: ["file_core"],
    },
    maxDepth: 4,
  });
}

async function seedPolicies(
  engine: Awaited<ReturnType<typeof createPlatformOrchestration>>["policySelection"],
) {
  engine.registerRule({
    ruleId: "rule_smoke",
    name: "Smoke required",
    version: "1.0.0",
    condition: { type: "always" },
    severity: "mandatory",
    activityKind: "smoke_testing",
    activityClassification: "required",
    expectedConfidenceContribution: 0.2,
    estimatedDurationMinutes: 10,
    explanation: "Smoke testing is always required for this policy",
  });
  engine.registerRule({
    ruleId: "rule_regression",
    name: "Regression on risk",
    version: "1.0.0",
    condition: { type: "risk_at_least", level: "medium" },
    severity: "mandatory",
    activityKind: "regression_testing",
    activityClassification: "required",
    expectedConfidenceContribution: 0.25,
    estimatedDurationMinutes: 45,
    explanation: "Medium+ risk requires regression testing",
  });
  engine.registerRule({
    ruleId: "rule_security",
    name: "Security on requirement impact",
    version: "1.0.0",
    condition: {
      type: "and",
      conditions: [
        { type: "impact_includes_asset_type", assetType: "requirement" },
        { type: "magnitude_at_least", magnitude: "medium" },
      ],
    },
    severity: "blocking",
    activityKind: "security_testing",
    activityClassification: "blocking",
    expectedConfidenceContribution: 0.2,
    estimatedDurationMinutes: 60,
    explanation:
      "Requirement impact at medium+ magnitude blocks without security testing",
  });
  engine.registerRule({
    ruleId: "rule_exploratory",
    name: "Optional exploratory",
    version: "1.0.0",
    condition: { type: "profile_is", profileId: "pull_request" },
    severity: "advisory",
    activityKind: "exploratory_testing",
    activityClassification: "optional",
    expectedConfidenceContribution: 0.1,
    estimatedDurationMinutes: 30,
    explanation: "Exploratory testing recommended for pull requests",
  });
  engine.registerRule({
    ruleId: "rule_deferred_perf",
    name: "Defer performance",
    version: "1.0.0",
    condition: { type: "confidence_at_least", threshold: 0 },
    severity: "info",
    activityKind: "performance_testing",
    activityClassification: "deferred",
    expectedConfidenceContribution: 0.05,
    estimatedDurationMinutes: 90,
    explanation: "Performance testing deferred to nightly/regression profiles",
  });
  engine.registerRule({
    ruleId: "rule_low_risk_skip",
    name: "High confidence skip marker",
    version: "1.0.0",
    condition: { type: "confidence_below", threshold: 0.01 },
    severity: "info",
    activityKind: "manual_test_suite",
    activityClassification: "optional",
    expectedConfidenceContribution: 0.05,
    estimatedDurationMinutes: 20,
    explanation: "Only when impact confidence is extremely low",
  });

  await engine.registerPolicy({
    policyId: "pol_pr_governance",
    name: "PR Governance",
    version: "1.0.0",
    owner: "apzqep",
    scope: "pull_request",
    documentationRef: "docs/products/apzqep/v1.1/apzqep-165-qo-006/",
    ruleIds: [
      "rule_smoke",
      "rule_regression",
      "rule_security",
      "rule_exploratory",
      "rule_deferred_perf",
      "rule_low_risk_skip",
    ],
  });

  engine.registerProfile({
    profileId: "pull_request",
    name: "Pull Request",
    description: "Governed PR quality selection",
    policyIds: ["pol_pr_governance"],
    confidenceTarget: 0.7,
    requiresHumanApproval: false,
    documentationRef: "docs/products/apzqep/v1.1/apzqep-165-qo-006/",
  });

  engine.registerProfile({
    profileId: "developer_commit",
    name: "Developer Commit",
    policyIds: ["pol_pr_governance"],
    confidenceTarget: 0.4,
    documentationRef: "docs/products/apzqep/v1.1/apzqep-165-qo-006/",
  });
}

describe("APZQEP-165 QO-006 Policy & Quality Selection Engine", () => {
  it("registers immutable policies, independent rules, and profiles", async () => {
    const platform = await createPlatformOrchestration();
    await seedPolicies(platform.policySelection);
    expect(platform.policySelection.policies.count()).toBe(1);
    expect(platform.policySelection.rules.count()).toBe(6);
    expect(platform.policySelection.profiles.count()).toBe(2);
    const policy = platform.policySelection.policies.get("pol_pr_governance");
    expect(Object.isFrozen(policy)).toBe(true);
  });

  it("evaluates declarative conditions and covers all condition types", async () => {
    const platform = await createPlatformOrchestration();
    await seedImpactKnowledge(platform.impact);
    const impact = await correlate(platform.impact);
    const ctx = { impact, profileId: "pull_request" as PolicyProfileId };

    expect(evaluateCondition({ type: "always" }, ctx).matched).toBe(true);
    expect(
      evaluateCondition({ type: "risk_at_least", level: "low" }, ctx).matched,
    ).toBe(true);
    expect(
      evaluateCondition({ type: "confidence_below", threshold: 1 }, ctx).matched,
    ).toBe(true);
    expect(
      evaluateCondition({ type: "confidence_at_least", threshold: 0 }, ctx).matched,
    ).toBe(true);
    expect(
      evaluateCondition(
        { type: "impact_includes_asset_type", assetType: "requirement" },
        ctx,
      ).matched,
    ).toBe(true);
    expect(
      evaluateCondition({ type: "impact_node_count_at_least", count: 1 }, ctx).matched,
    ).toBe(true);
    expect(
      evaluateCondition({ type: "magnitude_at_least", magnitude: "medium" }, ctx)
        .matched,
    ).toBe(true);
    expect(
      evaluateCondition({ type: "profile_is", profileId: "pull_request" }, ctx).matched,
    ).toBe(true);
    expect(
      evaluateCondition(
        {
          type: "or",
          conditions: [
            { type: "profile_is", profileId: "nightly" },
            { type: "always" },
          ],
        },
        ctx,
      ).matched,
    ).toBe(true);
  });

  it("produces an advisory selection decision with explainability", async () => {
    const events: string[] = [];
    const platform = await createPlatformOrchestration({
      publishEvent: (e) => {
        events.push(e.type);
      },
    });
    await seedImpactKnowledge(platform.impact);
    await seedPolicies(platform.policySelection);
    const impact = await correlate(platform.impact);

    const decision = await platform.policySelection.evaluatePolicyProfile({
      profileId: "pull_request",
      impact,
      qualityFlowId: "qf_pol",
      actorId: "actor_1",
    });

    expect(decision.advisory).toBe(true);
    expect(
      decision.requiredActivities.some((a) => a.activityKind === "smoke_testing"),
    ).toBe(true);
    expect(
      decision.requiredActivities.some((a) => a.activityKind === "regression_testing"),
    ).toBe(true);
    expect(
      decision.blockingActivities.some((a) => a.activityKind === "security_testing"),
    ).toBe(true);
    expect(
      decision.optionalActivities.some((a) => a.activityKind === "exploratory_testing"),
    ).toBe(true);
    expect(
      decision.deferredActivities.some((a) => a.activityKind === "performance_testing"),
    ).toBe(true);
    expect(decision.requiresHumanApproval).toBe(true); // blocking present
    expect(decision.requiredConfidence).toBe(0.7);
    expect(decision.expectedConfidence).toBeGreaterThan(0);
    expect(decision.selectionExplanation).toContain("Advisory");

    const explain = platform.policySelection.getExplainability(decision.decisionId);
    expect(explain.policiesEvaluated).toContain("pol_pr_governance");
    expect(explain.rulesEvaluated.length).toBeGreaterThan(0);
    expect(explain.reasons.length).toBeGreaterThan(0);
    expect(explain.selectedActivities).toContain("smoke_testing");
    expect(events).toContain(POLICY_SELECTION_EVENT_TYPES.decisionProduced);
  });

  it("covers policy evaluation APIs and append-only history", async () => {
    const platform = await createPlatformOrchestration();
    await seedImpactKnowledge(platform.impact);
    await seedPolicies(platform.policySelection);
    const impact = await correlate(platform.impact);

    const policyEval = platform.policySelection.evaluatePolicy(
      "pol_pr_governance",
      impact,
      "pull_request",
    );
    expect(policyEval.matched).toBe(true);
    expect(policyEval.ruleResults.length).toBe(6);

    const ruleEvals = platform.policySelection.evaluateRules(impact, "pull_request");
    expect(ruleEvals.length).toBe(6);

    const target = platform.policySelection.getConfidenceTarget("pull_request");
    expect(target.requiredConfidence).toBe(0.7);

    const d1 = await platform.policySelection.produceSelectionDecision({
      profileId: "pull_request",
      impact,
    });
    const before = platform.policySelection.getHistory().length;
    await platform.policySelection.produceSelectionDecision({
      profileId: "developer_commit",
      impact,
    });
    expect(platform.policySelection.getHistory().length).toBe(before + 1);
    expect(platform.policySelection.getDecision(d1.decisionId).decisionId).toBe(
      d1.decisionId,
    );
  });

  it("integrates with impact, quality flow context, and capability catalogue without execution", async () => {
    const platform = await createPlatformOrchestration();
    await seedImpactKnowledge(platform.impact);
    await seedPolicies(platform.policySelection);
    platform.capabilities.register({
      capabilityId: "cap_selection",
      name: "Selection helper",
      version: "1.0.0",
      provider: "platform-automation",
      supportedContractVersions: ["1"],
      supportedQualityFlowStages: ["test_selection"],
      documentationRef: "docs://sel",
      contractIds: ["sel.v1"],
    });
    await platform.qualityFlows.registerDefinition({
      flowId: "qf_pol",
      name: "Policy flow",
      version: "1.0.0",
      owner: "apzqep",
      documentationRef: "docs://qf",
      supportedCapabilityStages: ["test_selection"],
    });

    const impact = await correlate(platform.impact);
    const decision = await platform.policySelection.produceSelectionDecision({
      profileId: "pull_request",
      impact,
      qualityFlowId: "qf_pol",
    });

    expect(decision.qualityFlowId).toBe("qf_pol");
    expect(decision.impactCorrelationId).toBe(impact.correlationId);
    expect(platform.policySelection.discoverSelectionCapabilities()).toHaveLength(1);
    expect(platform.qualityFlows.listInstances()).toHaveLength(0);
    expect(
      typeof (platform.policySelection as unknown as { execute?: unknown }).execute,
    ).toBe("undefined");
    expect(
      typeof (platform.policySelection as unknown as { invoke?: unknown }).invoke,
    ).toBe("undefined");
  });

  it("rejects unknown rule references and exposes diagnostics", async () => {
    const platform = await createPlatformOrchestration();
    try {
      await platform.policySelection.registerPolicy({
        policyId: "pol_bad",
        name: "Bad",
        version: "1",
        owner: "x",
        scope: "x",
        documentationRef: "docs://x",
        ruleIds: ["missing_rule"],
      });
      expect.fail("should reject missing rule");
    } catch (error) {
      expect(isOrchestrationError(error)).toBe(true);
    }

    await seedPolicies(platform.policySelection);
    await seedImpactKnowledge(platform.impact);
    const impact = await correlate(platform.impact);
    await platform.policySelection.produceSelectionDecision({
      profileId: "pull_request",
      impact,
    });
    const diag = platform.policySelection.diagnostics();
    expect(diag.policyCount).toBe(1);
    expect(diag.ruleCount).toBe(6);
    expect(diag.profileCount).toBe(2);
    expect(diag.decisionCount).toBe(1);
    expect(diag.ready).toBe(true);
    expect(platform.container.has("orchestration.policy_selection.engine")).toBe(true);
  });
});
