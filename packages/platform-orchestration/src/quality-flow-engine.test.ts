import { describe, expect, it } from "vitest";
import {
  QUALITY_FLOW_STATES,
  QUALITY_FLOW_TRANSITION_RULES,
  assertQualityFlowTransition,
  canTransitionQualityFlow,
  createPlatformOrchestration,
  isOrchestrationError,
  listProgressionEdges,
  type NormalizedTrigger,
  type QualityFlowState,
} from "./index";

const ACTOR = "actor_test";
const CORR = "corr_qo004";

async function registerDefaultFlow(
  engine: Awaited<ReturnType<typeof createPlatformOrchestration>>["qualityFlows"],
) {
  return await engine.registerDefinition({
    flowId: "qf_continuous_cert",
    name: "Continuous Certification",
    version: "1.0.0",
    description: "Governed continuous quality flow",
    owner: "apzqep",
    supportedTriggerTypes: ["change.committed", "pipeline.completed"],
    supportedCapabilityStages: [
      "impact_correlation",
      "test_selection",
      "capability_coordination",
      "quality_gates",
      "human_approval",
      "release_recommendation",
    ],
    supportedPolicies: ["policy.change_impact"],
    supportedGates: ["gate.coverage"],
    lifecycleVersion: "1",
    documentationRef: "docs/products/apzqep/v1.1/apzqep-165-qo-004/",
    metadata: { domain: "quality" },
  });
}

async function advanceTo(
  engine: Awaited<ReturnType<typeof createPlatformOrchestration>>["qualityFlows"],
  instanceId: string,
  target: QualityFlowState,
): Promise<void> {
  const path = [
    "ready",
    "triggered",
    "impact_analysed",
    "selection_complete",
    "capability_coordination",
    "awaiting_gates",
    "awaiting_approval",
    "recommendation_ready",
    "completed",
  ] as const;

  let current = await engine.getInstance(instanceId).currentState;
  if (current === "registered" && target !== "registered") {
    await engine.transition(instanceId, {
      toState: "ready",
      actor: ACTOR,
      reason: "advance",
      correlationId: CORR,
    });
    current = "ready";
  }
  if (target === "registered" || target === current) return;

  for (const state of path) {
    if (current === target) return;
    if (engine.getInstance(instanceId).currentState === target) return;
    const next = state;
    if (canTransitionQualityFlow(engine.getInstance(instanceId).currentState, next)) {
      await engine.transition(instanceId, {
        toState: next,
        actor: ACTOR,
        reason: `advance_to_${target}`,
        correlationId: CORR,
      });
    }
    if (next === target) return;
  }
}

describe("APZQEP-165 QO-004 Quality Flow Engine", () => {
  it("exposes immutable definitions and versioning without mutation", async () => {
    const platform = await createPlatformOrchestration();
    const qf = platform.qualityFlows;
    const v1 = await registerDefaultFlow(qf);
    expect(v1.version).toBe("1.0.0");
    expect(Object.isFrozen(v1)).toBe(true);

    const v2 = await qf.versionDefinition("qf_continuous_cert", {
      name: "Continuous Certification",
      version: "1.1.0",
      owner: "apzqep",
      documentationRef: "docs/products/apzqep/v1.1/apzqep-165-qo-004/",
      supportedTriggerTypes: ["change.committed"],
    });
    expect(v2.version).toBe("1.1.0");
    expect(qf.getDefinition("qf_continuous_cert", "1.0.0").version).toBe("1.0.0");
    expect(qf.listDefinitions()).toHaveLength(2);
  });

  it("creates instances pinned to a definition version", async () => {
    const platform = await createPlatformOrchestration();
    const qf = platform.qualityFlows;
    await registerDefaultFlow(qf);
    const instance = await qf.createInstance({
      flowId: "qf_continuous_cert",
      triggerId: "trig_1",
      correlationId: "corr_1",
      tenantId: "tenant_a",
      projectId: "proj_a",
      actor: ACTOR,
    });
    expect(instance.currentState).toBe("registered");
    expect(instance.definitionVersion).toBe("1.0.0");
    expect(instance.triggerId).toBe("trig_1");
    expect(instance.qualityFlowId).toMatch(/^qf_/);
    expect(instance.history).toHaveLength(1);
    expect(instance.history[0]!.reason).toBe("instance_created");
  });

  it("covers every progression edge in the happy path", async () => {
    const platform = await createPlatformOrchestration();
    const qf = platform.qualityFlows;
    await registerDefaultFlow(qf);
    const instance = await qf.createInstance({
      flowId: "qf_continuous_cert",
      triggerId: "trig_prog",
      correlationId: CORR,
      tenantId: "tenant_a",
      actor: ACTOR,
    });

    for (const [from, to] of listProgressionEdges()) {
      expect(qf.getInstance(instance.instanceId).currentState).toBe(from);
      expect(canTransitionQualityFlow(from, to)).toBe(true);
      await qf.transition(instance.instanceId, {
        toState: to,
        actor: ACTOR,
        reason: `progress_${from}_${to}`,
        correlationId: CORR,
      });
      expect(qf.getInstance(instance.instanceId).currentState).toBe(to);
      expect(qf.getInstance(instance.instanceId).previousState).toBe(from);
    }
    expect(qf.getInstance(instance.instanceId).currentState).toBe("completed");
    expect(qf.getInstance(instance.instanceId).completedAt).toBeTruthy();
  });

  it("covers every declared transition rule in the table", async () => {
    for (const rule of QUALITY_FLOW_TRANSITION_RULES) {
      expect(canTransitionQualityFlow(rule.from, rule.to)).toBe(true);
      expect(assertQualityFlowTransition(rule.from, rule.to)).toBe(rule.kind);
    }
    // Invalid sample
    expect(canTransitionQualityFlow("registered", "completed")).toBe(false);
    expect(canTransitionQualityFlow("completed", "ready")).toBe(false);
  });

  it("rejects invalid transitions and preserves append-only history", async () => {
    const platform = await createPlatformOrchestration();
    const qf = platform.qualityFlows;
    await registerDefaultFlow(qf);
    const instance = await qf.createInstance({
      flowId: "qf_continuous_cert",
      triggerId: "trig_inv",
      correlationId: CORR,
      tenantId: "tenant_a",
      actor: ACTOR,
    });
    const before = await qf.getHistory(instance.instanceId).length;
    try {
      await qf.transition(instance.instanceId, {
        toState: "completed",
        actor: ACTOR,
        reason: "skip",
        correlationId: CORR,
      });
      expect.fail("expected invalid transition");
    } catch (error) {
      expect(isOrchestrationError(error)).toBe(true);
    }
    expect(qf.getHistory(instance.instanceId)).toHaveLength(before);
    expect(qf.getInstance(instance.instanceId).currentState).toBe("registered");
  });

  it("supports pause/resume recovery without changing state", async () => {
    const platform = await createPlatformOrchestration();
    const qf = platform.qualityFlows;
    await registerDefaultFlow(qf);
    const instance = await qf.createInstance({
      flowId: "qf_continuous_cert",
      triggerId: "trig_pause",
      correlationId: CORR,
      tenantId: "tenant_a",
      actor: ACTOR,
    });
    await advanceTo(qf, instance.instanceId, "triggered");
    await qf.pause(instance.instanceId, ACTOR, "hold", CORR);
    expect(qf.getStatus(instance.instanceId).paused).toBe(true);
    expect(qf.getStatus(instance.instanceId).currentState).toBe("triggered");
    try {
      await qf.transition(instance.instanceId, {
        toState: "impact_analysed",
        actor: ACTOR,
        reason: "blocked",
        correlationId: CORR,
      });
      expect.fail("paused should block");
    } catch (error) {
      expect(isOrchestrationError(error)).toBe(true);
    }
    await qf.resume(instance.instanceId, ACTOR, "continue", CORR);
    await qf.transition(instance.instanceId, {
      toState: "impact_analysed",
      actor: ACTOR,
      reason: "resume_progress",
      correlationId: CORR,
    });
    expect(qf.getInstance(instance.instanceId).currentState).toBe("impact_analysed");
  });

  it("supports cancel, fail/retry, timeout, reject, supersede, restart", async () => {
    const platform = await createPlatformOrchestration();
    const qf = platform.qualityFlows;
    await registerDefaultFlow(qf);

    const cancelled = await qf.createInstance({
      flowId: "qf_continuous_cert",
      triggerId: "trig_c",
      correlationId: CORR,
      tenantId: "tenant_a",
      actor: ACTOR,
    });
    await qf.cancel(cancelled.instanceId, ACTOR, "abort", CORR);
    expect(qf.getInstance(cancelled.instanceId).currentState).toBe("cancelled");

    const failed = await qf.createInstance({
      flowId: "qf_continuous_cert",
      triggerId: "trig_f",
      correlationId: CORR,
      tenantId: "tenant_a",
      actor: ACTOR,
    });
    await advanceTo(qf, failed.instanceId, "selection_complete");
    await qf.fail(failed.instanceId, ACTOR, "capability deferred", CORR);
    expect(qf.getInstance(failed.instanceId).currentState).toBe("failed");
    expect(qf.getInstance(failed.instanceId).recoveryPoint).toBe("selection_complete");
    await qf.retry(failed.instanceId, ACTOR, "retry_from_recovery_point", CORR);
    expect(qf.getInstance(failed.instanceId).currentState).toBe("selection_complete");

    const timed = await qf.createInstance({
      flowId: "qf_continuous_cert",
      triggerId: "trig_t",
      correlationId: CORR,
      tenantId: "tenant_a",
      actor: ACTOR,
    });
    await advanceTo(qf, timed.instanceId, "awaiting_gates");
    await qf.timeout(timed.instanceId, ACTOR, "sla", CORR);
    expect(qf.getInstance(timed.instanceId).currentState).toBe("timed_out");
    await qf.restart(timed.instanceId, ACTOR, "restart", CORR);
    expect(qf.getInstance(timed.instanceId).currentState).toBe("ready");

    const rejected = await qf.createInstance({
      flowId: "qf_continuous_cert",
      triggerId: "trig_r",
      correlationId: CORR,
      tenantId: "tenant_a",
      actor: ACTOR,
    });
    await advanceTo(qf, rejected.instanceId, "awaiting_approval");
    await qf.reject(rejected.instanceId, ACTOR, "human_reject", CORR);
    expect(qf.getInstance(rejected.instanceId).currentState).toBe("rejected");

    const superseded = await qf.createInstance({
      flowId: "qf_continuous_cert",
      triggerId: "trig_s",
      correlationId: CORR,
      tenantId: "tenant_a",
      actor: ACTOR,
    });
    await advanceTo(qf, superseded.instanceId, "ready");
    await qf.supersede(superseded.instanceId, ACTOR, "newer_instance", CORR);
    expect(qf.getInstance(superseded.instanceId).currentState).toBe("superseded");
  });

  it("integrates with Trigger Engine routing without provider payloads", async () => {
    const platform = await createPlatformOrchestration();
    await registerDefaultFlow(platform.qualityFlows);
    platform.triggerBindings.register({
      bindingId: "bind_1",
      triggerType: "change.committed",
      triggerSource: "scm",
      qualityFlowId: "qf_continuous_cert",
      priority: 10,
      enabled: true,
    });

    const trigger: NormalizedTrigger = {
      triggerId: "trig_route_1",
      triggerType: "change.committed",
      triggerSource: "scm",
      tenantId: "tenant_a",
      projectId: "proj_a",
      correlationId: "corr_route_1",
      causationId: "cause_1",
      payloadRef: "payload://opaque/1",
      occurredAt: new Date().toISOString(),
    };
    const routing = platform.triggers.ingest(trigger);
    expect(routing.disposition).toBe("routed");

    const instance = await platform.qualityFlows.createInstanceFromRouting(routing, {
      tenantId: trigger.tenantId,
      projectId: trigger.projectId,
      actor: ACTOR,
    });
    expect(instance.triggerId).toBe(trigger.triggerId);
    expect(instance.correlationId).toBe(trigger.correlationId);
    expect(instance.flowDefinitionId).toBe("qf_continuous_cert");
    expect(JSON.stringify(instance.metadata).toLowerCase()).not.toContain("github");
  });

  it("rejects provider-specific metadata and discovers capabilities without invoke", async () => {
    const platform = await createPlatformOrchestration();
    await registerDefaultFlow(platform.qualityFlows);
    platform.capabilities.register({
      capabilityId: "cap_impact",
      name: "Impact",
      version: "1.0.0",
      provider: "platform-quality-intelligence",
      supportedContractVersions: ["1"],
      supportedQualityFlowStages: ["impact_correlation"],
      documentationRef: "docs://impact",
      contractIds: ["c1"],
    });

    try {
      await platform.qualityFlows.createInstance({
        flowId: "qf_continuous_cert",
        triggerId: "trig_prov",
        correlationId: CORR,
        tenantId: "tenant_a",
        metadata: { github_repo: "acme/app" },
      });
      expect.fail("provider metadata should reject");
    } catch (error) {
      expect(isOrchestrationError(error)).toBe(true);
    }

    const discovered =
      await platform.qualityFlows.discoverCapabilities("qf_continuous_cert");
    expect(discovered.some((c) => c.capabilityId === "cap_impact")).toBe(true);
    expect(
      typeof (platform.qualityFlows as unknown as { invoke?: unknown }).invoke,
    ).toBe("undefined");
  });

  it("exposes diagnostics and wires DI tokens", async () => {
    const platform = await createPlatformOrchestration();
    await registerDefaultFlow(platform.qualityFlows);
    await platform.qualityFlows.createInstance({
      flowId: "qf_continuous_cert",
      triggerId: "trig_diag",
      correlationId: CORR,
      tenantId: "tenant_a",
      actor: ACTOR,
    });
    const diag = await platform.qualityFlows.diagnostics();
    expect(diag.definitionCount).toBe(1);
    expect(diag.instanceCount).toBe(1);
    expect(diag.lifecycleValidation).toBe("pass");
    expect(diag.health).toBe("healthy");
    expect(platform.qualityFlows.health().ready).toBe(true);
    expect(platform.container.has("orchestration.quality_flow.engine")).toBe(true);
    expect(QUALITY_FLOW_STATES).toContain("capability_coordination");
  });

  it("allows cancel while paused", async () => {
    const platform = await createPlatformOrchestration();
    await registerDefaultFlow(platform.qualityFlows);
    const instance = await platform.qualityFlows.createInstance({
      flowId: "qf_continuous_cert",
      triggerId: "trig_pc",
      correlationId: CORR,
      tenantId: "tenant_a",
      actor: ACTOR,
    });
    await platform.qualityFlows.pause(instance.instanceId, ACTOR, "hold", CORR);
    await platform.qualityFlows.cancel(
      instance.instanceId,
      ACTOR,
      "abort_paused",
      CORR,
    );
    expect(platform.qualityFlows.getInstance(instance.instanceId).currentState).toBe(
      "cancelled",
    );
    expect(platform.qualityFlows.getInstance(instance.instanceId).paused).toBe(false);
  });
});
