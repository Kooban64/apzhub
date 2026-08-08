/**
 * QX-P1-03 closeout evidence — Operational Smoke · Resilience · Performance.
 * Exercises the orchestration surfaces the Quality Flow Workspace exposes.
 * No UI; no new orchestration behaviour.
 */

import { describe, expect, it } from "vitest";

import {
  InMemoryOrchestrationDocumentStore,
  canTransitionQualityFlow,
  createPlatformOrchestration,
  isTerminalQualityFlowState,
  type PlatformOrchestration,
  type QualityFlowInstance,
  type QualityFlowState,
} from "./index";

const ACTOR = "quality_lead";
const TENANT = "tenant_qfw_ops";
const CORR = "corr_qfw_ops";

const WAITING_STATES: readonly QualityFlowState[] = [
  "awaiting_gates",
  "awaiting_approval",
  "recommendation_ready",
];

const EXCEPTION_STATES: readonly QualityFlowState[] = [
  "failed",
  "rejected",
  "timed_out",
  "cancelled",
  "superseded",
];

/** Mirrors apps/web Quality Flow Workspace projection (command centre clarity). */
function projectWorkspace(orch: PlatformOrchestration, instance: QualityFlowInstance) {
  const decisions = orch.decisions
    .listDecisionPackages()
    .filter(
      (p) =>
        p.qualityFlowRef === instance.qualityFlowId ||
        p.qualityFlowRef === instance.instanceId,
    );
  const approvals = orch.approvals
    .listBundles()
    .filter(
      (b) =>
        b.qualityFlowRef === instance.qualityFlowId ||
        b.qualityFlowRef === instance.instanceId,
    );
  const evidencePackages = orch.evidenceIntegration
    .listEvidenceIntegrationPackages()
    .filter(
      (p) =>
        p.qualityFlowRef === instance.qualityFlowId ||
        p.qualityFlowRef === instance.instanceId,
    );
  const outstandingApprovals = approvals.flatMap((b) =>
    orch.approvals.getOutstandingAuthorities(b.bundleId),
  );
  const outstandingEvidence = evidencePackages.flatMap((p) =>
    p.integrationStatus === "partial" || p.integrationStatus === "empty"
      ? [...p.evidenceRefs, `status:${p.integrationStatus}`]
      : [],
  );
  const blockedRelease =
    instance.currentState === "awaiting_gates" ||
    instance.currentState === "awaiting_approval" ||
    instance.currentState === "failed" ||
    instance.currentState === "rejected" ||
    outstandingApprovals.length > 0;

  return {
    stage: instance.currentState,
    paused: instance.paused,
    waiting: WAITING_STATES.includes(instance.currentState) || instance.paused,
    exception: EXCEPTION_STATES.includes(instance.currentState),
    blockedRelease,
    timeline: orch.qualityFlows.getHistory(instance.instanceId),
    allowedTransitions: orch.qualityFlows.allowedTransitions(instance.instanceId),
    decisions,
    approvals,
    outstandingApprovals,
    evidencePackages,
    outstandingEvidence,
    nextAction: nextAction(instance),
  };
}

function nextAction(instance: QualityFlowInstance): string {
  if (instance.paused) return "Resume the flow to continue progression";
  switch (instance.currentState) {
    case "registered":
      return "Advance to ready";
    case "ready":
      return "Trigger the flow";
    case "awaiting_gates":
      return "Resolve outstanding gates";
    case "awaiting_approval":
      return "Complete required approvals";
    case "recommendation_ready":
      return "Review Decision Package and conclude";
    case "failed":
      return "Retry from recovery point or cancel";
    case "completed":
      return "No action — flow completed";
    default:
      if (isTerminalQualityFlowState(instance.currentState)) {
        return "No action — terminal state";
      }
      return "Continue stage progression";
  }
}

async function registerFlow(orch: PlatformOrchestration) {
  return orch.qualityFlows.registerDefinition({
    flowId: "qf_ops_smoke",
    name: "Operational Smoke Flow",
    version: "1.0.0",
    description: "QX-P1-03 operational evidence",
    owner: "apzqep",
    supportedTriggerTypes: ["manual"],
    supportedCapabilityStages: [
      "impact_correlation",
      "quality_gates",
      "human_approval",
      "release_recommendation",
    ],
    lifecycleVersion: "1",
    documentationRef:
      "docs/products/apzqep/engineering/OWNER-REVIEW-QX-P1-03-QUALITY-FLOW-WORKSPACE.md",
    metadata: { domain: "quality", programme: "QX-P1-03" },
  });
}

async function advanceTo(
  orch: PlatformOrchestration,
  instanceId: string,
  target: QualityFlowState,
): Promise<QualityFlowInstance> {
  const path: readonly QualityFlowState[] = [
    "ready",
    "triggered",
    "impact_analysed",
    "selection_complete",
    "capability_coordination",
    "awaiting_gates",
    "awaiting_approval",
    "recommendation_ready",
    "completed",
  ];

  let instance = orch.qualityFlows.getInstance(instanceId);
  if (instance.currentState === "registered" && target !== "registered") {
    instance = await orch.qualityFlows.transition(instanceId, {
      toState: "ready",
      actor: ACTOR,
      reason: "start",
      correlationId: CORR,
    });
  }
  if (target === instance.currentState) return instance;

  for (const state of path) {
    instance = orch.qualityFlows.getInstance(instanceId);
    if (instance.currentState === target) return instance;
    if (canTransitionQualityFlow(instance.currentState, state)) {
      instance = await orch.qualityFlows.transition(instanceId, {
        toState: state,
        actor: ACTOR,
        reason: `progress:${state}`,
        correlationId: CORR,
      });
    }
  }
  return orch.qualityFlows.getInstance(instanceId);
}

describe("QX-P1-03 Quality Flow Workspace — Operational Smoke", () => {
  it("executes create → start → stages → waiting → approval → evidence → decision → completion", async () => {
    const store = new InMemoryOrchestrationDocumentStore();
    const orch = await createPlatformOrchestration({ documentStore: store });
    await registerFlow(orch);

    // Create
    const created = await orch.qualityFlows.createInstance({
      flowId: "qf_ops_smoke",
      triggerId: "trg_manual_1",
      correlationId: CORR,
      tenantId: TENANT,
      actor: ACTOR,
    });
    expect(created.currentState).toBe("registered");
    expect(projectWorkspace(orch, created).nextAction).toBe("Advance to ready");

    // Start + progress to gates (waiting)
    let instance = await advanceTo(orch, created.instanceId, "awaiting_gates");
    let view = projectWorkspace(orch, instance);
    expect(view.waiting).toBe(true);
    expect(view.blockedRelease).toBe(true);
    expect(view.nextAction).toBe("Resolve outstanding gates");
    expect(view.stage).toBe("awaiting_gates");

    // Approval state
    instance = await advanceTo(orch, created.instanceId, "awaiting_approval");
    orch.approvals.registerAuthority({
      authorityId: "release_manager",
      name: "Release Manager",
      scope: "enterprise",
      delegationSupported: false,
      escalationSupported: false,
    });
    await orch.approvals.registerTemplate({
      templateId: "tpl_ops",
      name: "Ops Approval",
      version: "1.0.0",
      requiredAuthorities: ["release_manager"],
      decisionRule: { type: "all_required" },
      documentationRef:
        "docs/products/apzqep/engineering/OWNER-REVIEW-QX-P1-03-QUALITY-FLOW-WORKSPACE.md",
    });
    const bundle = await orch.approvals.createApprovalBundle({
      templateId: "tpl_ops",
      tenantId: TENANT,
      actorId: ACTOR,
      subject: {
        governanceDecisionRef: "gov_ops_1",
        qualityFlowRef: instance.qualityFlowId,
      },
    });
    view = projectWorkspace(orch, orch.qualityFlows.getInstance(created.instanceId));
    expect(view.waiting).toBe(true);
    expect(view.outstandingApprovals).toContain("release_manager");
    expect(view.nextAction).toBe("Complete required approvals");

    await orch.approvals.submitDecision(bundle.bundleId, {
      authorityId: "release_manager",
      actorId: "rm_1",
      state: "approved",
      comments: "gates clear",
    });
    view = projectWorkspace(orch, orch.qualityFlows.getInstance(created.instanceId));
    expect(view.outstandingApprovals).toHaveLength(0);

    // Evidence (missing then complete)
    const emptyEvidence =
      await orch.evidenceIntegration.createEvidenceIntegrationPackage({
        qualityFlowRef: instance.qualityFlowId,
        evidenceRefs: [],
        tenantId: TENANT,
        actorId: ACTOR,
      });
    expect(emptyEvidence.integrationStatus).toBe("empty");
    view = projectWorkspace(orch, orch.qualityFlows.getInstance(created.instanceId));
    expect(view.evidencePackages.some((e) => e.integrationStatus === "empty")).toBe(
      true,
    );

    await orch.evidenceIntegration.createEvidenceIntegrationPackage({
      qualityFlowRef: instance.qualityFlowId,
      evidenceRefs: ["ev:run:1", "ev:artefact:2"],
      tenantId: TENANT,
      actorId: ACTOR,
    });

    // Decision Package
    instance = await advanceTo(orch, created.instanceId, "recommendation_ready");
    const decision = await orch.decisions.createDecisionPackage({
      profileId: "pull_request",
      qualityFlowRef: instance.qualityFlowId,
      policySelectionRef: "sel_ops",
      impact: {
        impactCorrelationRef: "imp_ops",
        overallConfidence: 0.85,
        confidenceSummary: "ok",
        confidenceSources: ["graph"],
        riskLevel: "low",
        riskSummary: "low",
        riskFactors: [],
      },
      governance: {
        governanceDecisionRef: "gov_ops_1",
        compositionSatisfied: true,
        residualRisk: "low",
        outstandingGates: [],
        requiredHumanApprovals: [],
        governanceSummary: "gates satisfied",
      },
      approval: {
        approvalBundleRef: bundle.bundleId,
        finalStatus: "approved",
        outstandingAuthorities: [],
        conditions: [],
        exceptions: [],
      },
      tenantId: TENANT,
      actorId: ACTOR,
    });
    expect(decision.platformConclusion).toBe("GO");
    view = projectWorkspace(orch, orch.qualityFlows.getInstance(created.instanceId));
    expect(view.decisions).toHaveLength(1);
    expect(view.nextAction).toBe("Review Decision Package and conclude");

    // Completion
    instance = await advanceTo(orch, created.instanceId, "completed");
    view = projectWorkspace(orch, instance);
    expect(instance.currentState).toBe("completed");
    expect(view.exception).toBe(false);
    expect(view.nextAction).toBe("No action — flow completed");
    expect(view.timeline.length).toBeGreaterThan(5);
    expect(isTerminalQualityFlowState(instance.currentState)).toBe(true);

    // Durable SoR evidence for the journey
    expect((await store.listByKind("flow_instance")).length).toBeGreaterThan(0);
    expect((await store.listByKind("approval_bundle")).length).toBeGreaterThan(0);
    expect((await store.listByKind("decision_package")).length).toBeGreaterThan(0);
    expect(
      (await store.listByKind("evidence_integration_package")).length,
    ).toBeGreaterThan(0);
  });
});

describe("QX-P1-03 Quality Flow Workspace — Operational Resilience", () => {
  it("remains operationally clear under empty / partial / failed / rejected / cancelled / resumed", async () => {
    const orch = await createPlatformOrchestration({
      documentStore: new InMemoryOrchestrationDocumentStore(),
    });
    await registerFlow(orch);

    // Empty state — command centre has no active flows
    expect(orch.qualityFlows.listInstances()).toHaveLength(0);

    // Partial flow
    const partial = await orch.qualityFlows.createInstance({
      flowId: "qf_ops_smoke",
      triggerId: "trg_partial",
      correlationId: `${CORR}_partial`,
      tenantId: TENANT,
      actor: ACTOR,
    });
    await advanceTo(orch, partial.instanceId, "impact_analysed");
    let view = projectWorkspace(
      orch,
      orch.qualityFlows.getInstance(partial.instanceId),
    );
    expect(view.stage).toBe("impact_analysed");
    expect(view.waiting).toBe(false);
    expect(view.exception).toBe(false);
    expect(view.nextAction).toBe("Continue stage progression");

    // Failed approval posture (outstanding authority while awaiting approval)
    const awaiting = await orch.qualityFlows.createInstance({
      flowId: "qf_ops_smoke",
      triggerId: "trg_appr",
      correlationId: `${CORR}_appr`,
      tenantId: TENANT,
      actor: ACTOR,
    });
    await advanceTo(orch, awaiting.instanceId, "awaiting_approval");
    orch.approvals.registerAuthority({
      authorityId: "product_owner",
      name: "Product Owner",
      scope: "enterprise",
      delegationSupported: false,
      escalationSupported: false,
    });
    await orch.approvals.registerTemplate({
      templateId: "tpl_fail",
      name: "Fail Approval",
      version: "1.0.0",
      requiredAuthorities: ["product_owner"],
      decisionRule: { type: "all_required" },
      documentationRef:
        "docs/products/apzqep/engineering/OWNER-REVIEW-QX-P1-03-QUALITY-FLOW-WORKSPACE.md",
    });
    const pendingBundle = await orch.approvals.createApprovalBundle({
      templateId: "tpl_fail",
      tenantId: TENANT,
      subject: {
        governanceDecisionRef: "gov_fail",
        qualityFlowRef: orch.qualityFlows.getInstance(awaiting.instanceId)
          .qualityFlowId,
      },
    });
    await orch.approvals.submitDecision(pendingBundle.bundleId, {
      authorityId: "product_owner",
      actorId: "po_1",
      state: "rejected",
      comments: "risk unacceptable",
    });
    view = projectWorkspace(orch, orch.qualityFlows.getInstance(awaiting.instanceId));
    expect(view.approvals[0]?.finalStatus).toMatch(/reject/);
    expect(view.blockedRelease).toBe(true);

    // Rejected gate → flow rejected / failed terminal (exception clarity)
    const rejected = await orch.qualityFlows.createInstance({
      flowId: "qf_ops_smoke",
      triggerId: "trg_rej",
      correlationId: `${CORR}_rej`,
      tenantId: TENANT,
      actor: ACTOR,
    });
    await advanceTo(orch, rejected.instanceId, "awaiting_gates");
    await orch.qualityFlows.fail(
      rejected.instanceId,
      ACTOR,
      "gate_rejected",
      `${CORR}_rej`,
    );
    view = projectWorkspace(orch, orch.qualityFlows.getInstance(rejected.instanceId));
    expect(view.exception).toBe(true);
    expect(view.stage).toBe("failed");
    expect(view.nextAction).toBe("Retry from recovery point or cancel");

    // Rejected (terminal from awaiting_approval)
    const gateReject = await orch.qualityFlows.createInstance({
      flowId: "qf_ops_smoke",
      triggerId: "trg_gate_rej",
      correlationId: `${CORR}_gate_rej`,
      tenantId: TENANT,
      actor: ACTOR,
    });
    await advanceTo(orch, gateReject.instanceId, "awaiting_approval");
    await orch.qualityFlows.transition(gateReject.instanceId, {
      toState: "rejected",
      actor: ACTOR,
      reason: "gate_composition_rejected",
      correlationId: `${CORR}_gate_rej`,
    });
    view = projectWorkspace(orch, orch.qualityFlows.getInstance(gateReject.instanceId));
    expect(view.exception).toBe(true);
    expect(view.stage).toBe("rejected");

    // Missing evidence
    const missingEv = await orch.qualityFlows.createInstance({
      flowId: "qf_ops_smoke",
      triggerId: "trg_ev",
      correlationId: `${CORR}_ev`,
      tenantId: TENANT,
      actor: ACTOR,
    });
    await orch.evidenceIntegration.createEvidenceIntegrationPackage({
      qualityFlowRef: orch.qualityFlows.getInstance(missingEv.instanceId).qualityFlowId,
      evidenceRefs: [],
      tenantId: TENANT,
    });
    view = projectWorkspace(orch, orch.qualityFlows.getInstance(missingEv.instanceId));
    expect(view.outstandingEvidence.length).toBeGreaterThan(0);

    // Cancelled
    const cancelled = await orch.qualityFlows.createInstance({
      flowId: "qf_ops_smoke",
      triggerId: "trg_cancel",
      correlationId: `${CORR}_cancel`,
      tenantId: TENANT,
      actor: ACTOR,
    });
    await advanceTo(orch, cancelled.instanceId, "ready");
    await orch.qualityFlows.cancel(
      cancelled.instanceId,
      ACTOR,
      "operator_cancel",
      `${CORR}_cancel`,
    );
    view = projectWorkspace(orch, orch.qualityFlows.getInstance(cancelled.instanceId));
    expect(view.exception).toBe(true);
    expect(view.stage).toBe("cancelled");

    // Resumed
    const paused = await orch.qualityFlows.createInstance({
      flowId: "qf_ops_smoke",
      triggerId: "trg_pause",
      correlationId: `${CORR}_pause`,
      tenantId: TENANT,
      actor: ACTOR,
    });
    await advanceTo(orch, paused.instanceId, "selection_complete");
    await orch.qualityFlows.pause(
      paused.instanceId,
      ACTOR,
      "operator_pause",
      `${CORR}_pause`,
    );
    view = projectWorkspace(orch, orch.qualityFlows.getInstance(paused.instanceId));
    expect(view.paused).toBe(true);
    expect(view.waiting).toBe(true);
    expect(view.nextAction).toBe("Resume the flow to continue progression");
    await orch.qualityFlows.resume(
      paused.instanceId,
      ACTOR,
      "operator_resume",
      `${CORR}_pause`,
    );
    view = projectWorkspace(orch, orch.qualityFlows.getInstance(paused.instanceId));
    expect(view.paused).toBe(false);
    expect(view.nextAction).toBe("Continue stage progression");
  });
});

describe("QX-P1-03 Quality Flow Workspace — Performance", () => {
  it("keeps list, timeline, and transitions responsive under large history", async () => {
    const orch = await createPlatformOrchestration({
      documentStore: new InMemoryOrchestrationDocumentStore(),
    });
    await registerFlow(orch);

    const FLOW_COUNT = 40;
    const ids: string[] = [];
    const createStarted = performance.now();
    for (let i = 0; i < FLOW_COUNT; i += 1) {
      const instance = await orch.qualityFlows.createInstance({
        flowId: "qf_ops_smoke",
        triggerId: `trg_perf_${i}`,
        correlationId: `${CORR}_perf_${i}`,
        tenantId: TENANT,
        actor: ACTOR,
      });
      ids.push(instance.instanceId);
      if (i % 2 === 0) {
        await advanceTo(orch, instance.instanceId, "awaiting_gates");
      } else {
        await advanceTo(orch, instance.instanceId, "impact_analysed");
      }
    }
    const createMs = performance.now() - createStarted;
    expect(createMs).toBeLessThan(15_000);

    const listStarted = performance.now();
    const list = orch.qualityFlows.listInstances();
    const projected = list.map((i) => projectWorkspace(orch, i));
    const listMs = performance.now() - listStarted;
    expect(list).toHaveLength(FLOW_COUNT);
    expect(projected.every((p) => typeof p.nextAction === "string")).toBe(true);
    expect(listMs).toBeLessThan(500);

    // Large timeline on one flow (many transitions already + continue)
    const deepId = ids[0]!;
    const deepStarted = performance.now();
    await advanceTo(orch, deepId, "recommendation_ready");
    const history = orch.qualityFlows.getHistory(deepId);
    const timelineMs = performance.now() - deepStarted;
    expect(history.length).toBeGreaterThan(5);
    expect(timelineMs).toBeLessThan(2_000);

    const transitionStarted = performance.now();
    await orch.qualityFlows.transition(deepId, {
      toState: "completed",
      actor: ACTOR,
      reason: "perf_complete",
      correlationId: CORR,
    });
    const transitionMs = performance.now() - transitionStarted;
    expect(transitionMs).toBeLessThan(250);

    // Evidence thresholds recorded for Owner review (no optimisation unless exceeded)
    expect({
      createMs: Math.round(createMs),
      listMs: Math.round(listMs),
      timelineMs: Math.round(timelineMs),
      transitionMs: Math.round(transitionMs),
      flowCount: FLOW_COUNT,
      historyLength: history.length,
    }).toMatchObject({
      flowCount: FLOW_COUNT,
    });
  });
});
