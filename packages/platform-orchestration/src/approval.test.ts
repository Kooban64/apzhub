import { describe, expect, it } from "vitest";
import {
  APPROVAL_EVENT_TYPES,
  createPlatformOrchestration,
  isOrchestrationError,
} from "./index";

function seedAuthorities(
  approvals: Awaited<ReturnType<typeof createPlatformOrchestration>>["approvals"],
) {
  const doc = "docs/products/apzqep/v1.1/apzqep-165-qo-008/";
  for (const [id, name] of [
    ["release_manager", "Release Manager"],
    ["product_owner", "Product Owner"],
    ["cab", "CAB"],
    ["product_board", "Product Board"],
    ["security_officer", "Security Officer"],
  ] as const) {
    approvals.registerAuthority({
      authorityId: id,
      name,
      scope: "enterprise",
      delegationSupported: id === "release_manager",
      escalationSupported: id === "release_manager",
    });
  }

  approvals.registerTemplate({
    templateId: "tpl_production",
    name: "Production Approval",
    version: "1.0.0",
    requiredAuthorities: ["release_manager", "product_owner"],
    decisionRule: { type: "all_required" },
    sodRules: [
      { type: "independent_approval" },
      { type: "two_person_approval" },
      { type: "no_self_approval" },
      { type: "mandatory_authority", authorityId: "release_manager" },
    ],
    documentationRef: doc,
  });

  approvals.registerTemplate({
    templateId: "tpl_emergency",
    name: "Emergency Approval",
    version: "1.0.0",
    requiredAuthorities: ["release_manager", "product_owner"],
    decisionRule: {
      type: "emergency_override",
      authorityId: "release_manager",
    },
    sodRules: [{ type: "emergency_authority", authorityId: "release_manager" }],
    documentationRef: doc,
  });

  approvals.registerTemplate({
    templateId: "tpl_board",
    name: "Board + CAB",
    version: "1.0.0",
    requiredAuthorities: ["cab", "product_board"],
    decisionRule: { type: "all_required" },
    sodRules: [
      { type: "mandatory_authority", authorityId: "cab" },
      { type: "mandatory_authority", authorityId: "product_board" },
      { type: "independent_approval" },
    ],
    documentationRef: doc,
  });

  approvals.registerTemplate({
    templateId: "tpl_delegate",
    name: "Delegatable RM",
    version: "1.0.0",
    requiredAuthorities: ["release_manager"],
    decisionRule: { type: "all_required" },
    sodRules: [{ type: "time_limited_delegation", maxHours: 48 }],
    escalationRules: [
      {
        fromAuthorityId: "release_manager",
        toAuthorityId: "product_owner",
        afterHours: 24,
        reason: "RM unavailable",
      },
    ],
    documentationRef: doc,
  });
}

describe("APZQEP-165 QO-008 Approval Decision Platform", () => {
  it("creates an approval bundle from opaque governance refs only", async () => {
    const events: string[] = [];
    const platform = await createPlatformOrchestration({
      publishEvent: (e) => {
        events.push(e.type);
      },
    });
    seedAuthorities(platform.approvals);

    const bundle = platform.approvals.createApprovalBundle({
      templateId: "tpl_production",
      tenantId: "tenant_a",
      projectId: "proj_a",
      actorId: "system",
      subject: {
        governanceDecisionRef: "gov_opaque_123",
        qualityFlowRef: "qf_opaque_9",
        changeOwnerActorId: "dev_alice",
      },
    });

    expect(bundle.governanceDecisionRef).toBe("gov_opaque_123");
    expect(bundle.qualityFlowRef).toBe("qf_opaque_9");
    expect(bundle.finalStatus).toBe("pending");
    expect(bundle.requiredAuthorities).toContain("release_manager");
    expect(events).toContain(APPROVAL_EVENT_TYPES.bundleCreated);
    // Must not interpret subject beyond refs
    expect(JSON.stringify(bundle)).not.toContain("evaluateGate");
  });

  it("records authority decisions and reaches approved with SoD", async () => {
    const platform = await createPlatformOrchestration();
    seedAuthorities(platform.approvals);
    const bundle = platform.approvals.createApprovalBundle({
      templateId: "tpl_production",
      tenantId: "tenant_a",
      subject: {
        governanceDecisionRef: "gov_1",
        changeOwnerActorId: "dev_alice",
      },
    });

    const afterRm = platform.approvals.submitDecision(bundle.bundleId, {
      authorityId: "release_manager",
      state: "approved",
      actorId: "user_jane",
      comments: "Looks good",
    });
    expect(afterRm.finalStatus).toBe("pending");

    const afterPo = platform.approvals.submitDecision(bundle.bundleId, {
      authorityId: "product_owner",
      state: "approved",
      actorId: "user_john",
      conditions: ["monitor rollout"],
    });
    expect(afterPo.finalStatus).toBe("approved");
    expect(afterPo.conditions).toContain("monitor rollout");
    expect(platform.approvals.getOutstandingAuthorities(bundle.bundleId)).toHaveLength(
      0,
    );

    const explain = platform.approvals.getExplainability(bundle.bundleId);
    expect(explain.decisions.length).toBe(2);
    expect(explain.reasons.some((r) => r.includes("does not evaluate"))).toBe(true);
  });

  it("enforces no_self_approval and independent_approval", async () => {
    const platform = await createPlatformOrchestration();
    seedAuthorities(platform.approvals);
    const bundle = platform.approvals.createApprovalBundle({
      templateId: "tpl_production",
      tenantId: "tenant_a",
      subject: {
        governanceDecisionRef: "gov_2",
        changeOwnerActorId: "dev_alice",
      },
    });

    try {
      platform.approvals.submitDecision(bundle.bundleId, {
        authorityId: "release_manager",
        state: "approved",
        actorId: "dev_alice",
      });
      expect.fail("self approval should fail");
    } catch (error) {
      expect(isOrchestrationError(error)).toBe(true);
    }

    platform.approvals.submitDecision(bundle.bundleId, {
      authorityId: "release_manager",
      state: "approved",
      actorId: "user_jane",
    });
    try {
      platform.approvals.submitDecision(bundle.bundleId, {
        authorityId: "product_owner",
        state: "approved",
        actorId: "user_jane",
      });
      expect.fail("same actor dual approval should fail");
    } catch (error) {
      expect(isOrchestrationError(error)).toBe(true);
    }
  });

  it("supports emergency authority override and rejection", async () => {
    const platform = await createPlatformOrchestration();
    seedAuthorities(platform.approvals);

    const emergency = platform.approvals.createApprovalBundle({
      templateId: "tpl_emergency",
      tenantId: "tenant_a",
      subject: {
        governanceDecisionRef: "gov_e",
        emergency: true,
      },
    });
    const done = platform.approvals.submitDecision(emergency.bundleId, {
      authorityId: "release_manager",
      state: "approved",
      actorId: "user_oncall",
      exceptions: ["hotfix window"],
    });
    expect(done.finalStatus).toBe("approved");
    expect(done.exceptions).toContain("hotfix window");

    const rejectBundle = platform.approvals.createApprovalBundle({
      templateId: "tpl_board",
      tenantId: "tenant_a",
      subject: { governanceDecisionRef: "gov_r" },
    });
    const rejected = platform.approvals.submitDecision(rejectBundle.bundleId, {
      authorityId: "cab",
      state: "rejected",
      actorId: "user_cab",
      comments: "Insufficient evidence package",
    });
    expect(rejected.finalStatus).toBe("rejected");
  });

  it("supports delegation without workflow logic", async () => {
    const platform = await createPlatformOrchestration();
    seedAuthorities(platform.approvals);
    // product_owner needed as delegation target — already registered
    const bundle = platform.approvals.createApprovalBundle({
      templateId: "tpl_delegate",
      tenantId: "tenant_a",
      subject: { governanceDecisionRef: "gov_d" },
    });

    const delegated = platform.approvals.submitDecision(bundle.bundleId, {
      authorityId: "release_manager",
      state: "delegated",
      actorId: "user_jane",
      delegatedToAuthorityId: "product_owner",
      delegatedToActorId: "user_john",
    });
    expect(delegated.requiredAuthorities).toContain("product_owner");
    expect(delegated.finalStatus).toBe("pending");

    const approved = platform.approvals.submitDecision(bundle.bundleId, {
      authorityId: "product_owner",
      state: "approved",
      actorId: "user_john",
    });
    expect(approved.finalStatus).toBe("approved");
    expect(platform.approvals.diagnostics().delegationCount).toBe(1);
  });

  it("integrates with governance decision refs and exposes APIs", async () => {
    const platform = await createPlatformOrchestration();
    seedAuthorities(platform.approvals);

    // Create a real governance decision only to obtain an opaque ref — approvals must not call evaluate*
    platform.governance.registerGate({
      gateId: "gate_info",
      name: "Info",
      version: "1",
      category: { family: "informational", label: "execution_summary" },
      criteria: { type: "always_satisfied" },
      documentationRef: "docs://g",
    });
    platform.governance.registerTemplate({
      templateId: "custom",
      name: "Custom",
      documentationRef: "docs://t",
      composition: { mode: "all", gateIds: ["gate_info"] },
    });
    const gov = platform.governance.evaluateTemplate("custom", {
      tenantId: "tenant_a",
      qualityFlowId: "qf_ref_1",
    });

    const bundle = platform.approvals.createApprovalBundle({
      templateId: "tpl_production",
      tenantId: "tenant_a",
      additionalAuthorities: gov.requiredHumanApprovals,
      subject: {
        governanceDecisionRef: gov.decisionId,
        qualityFlowRef: gov.qualityFlowId,
        changeOwnerActorId: "dev_x",
      },
    });

    expect(bundle.governanceDecisionRef).toBe(gov.decisionId);
    expect(platform.approvals.getBundle(bundle.bundleId).bundleId).toBe(
      bundle.bundleId,
    );
    expect(platform.approvals.getFinalStatus(bundle.bundleId)).toBe("pending");
    expect(platform.approvals.getHistory(bundle.bundleId).length).toBeGreaterThan(0);
    expect(platform.container.has("orchestration.approval.engine")).toBe(true);
    expect(
      typeof (platform.approvals as unknown as { evaluateGate?: unknown }).evaluateGate,
    ).toBe("undefined");
    expect(
      typeof (platform.approvals as unknown as { evaluatePolicy?: unknown })
        .evaluatePolicy,
    ).toBe("undefined");
  });
});
