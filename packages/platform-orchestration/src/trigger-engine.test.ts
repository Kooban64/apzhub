import { describe, expect, it } from "vitest";

import {
  TRIGGER_EVENT_TYPES,
  createPlatformOrchestration,
  createTriggerId,
  isOrchestrationError,
  type NormalizedTrigger,
} from "./index";

function normalized(overrides: Partial<NormalizedTrigger> = {}): NormalizedTrigger {
  return {
    triggerId: overrides.triggerId ?? createTriggerId(),
    triggerType: overrides.triggerType ?? "scm.push",
    triggerSource: overrides.triggerSource ?? "scm",
    tenantId: overrides.tenantId ?? "tenant-a",
    projectId: overrides.projectId ?? "proj-1",
    correlationId: overrides.correlationId ?? "corr-1",
    causationId: overrides.causationId ?? "cause-1",
    payloadRef: overrides.payloadRef ?? "payload://ref/abc",
    context: overrides.context ?? { ref: "opaque" },
    occurredAt: overrides.occurredAt ?? new Date().toISOString(),
  };
}

describe("APZQEP-165 QO-003 Trigger Engine", () => {
  it("routes normalized triggers to a Quality Flow selection without executing", async () => {
    const events: string[] = [];
    const platform = await createPlatformOrchestration({
      publishEvent: (e) => {
        events.push(e.type);
      },
    });

    platform.triggerBindings.register({
      bindingId: "bind.push.default",
      triggerType: "scm.push",
      triggerSource: "scm",
      qualityFlowId: "qf.smoke.v1",
      nextStage: "impact_correlation",
      priority: 10,
      enabled: true,
    });

    const result = platform.triggers.ingest(normalized());
    expect(result.disposition).toBe("routed");
    expect(result.qualityFlowId).toBe("qf.smoke.v1");
    expect(result.nextStage).toBe("impact_correlation");
    expect(result.identities.triggerId).toBeTruthy();
    expect(result.identities.correlationId).toBe("corr-1");
    expect(result.identities.causationId).toBe("cause-1");
    expect(result.identities.qualityFlowId).toBe("qf.smoke.v1");
    expect(result.identities.executionId).toBeUndefined();
    expect(events).toContain(TRIGGER_EVENT_TYPES.received);
    expect(events).toContain(TRIGGER_EVENT_TYPES.routed);
    expect(platform.triggers.engineMode).toBe("route-only");
  });

  it("ignores triggers with no binding", async () => {
    const platform = await createPlatformOrchestration();
    const result = platform.triggers.ingest(
      normalized({ triggerType: "scm.tag.created" }),
    );
    expect(result.disposition).toBe("ignored");
    expect(result.reason).toBe("no_matching_binding");
    expect(result.qualityFlowId).toBeUndefined();
  });

  it("deduplicates by Trigger ID", async () => {
    const platform = await createPlatformOrchestration();
    platform.triggerBindings.register({
      bindingId: "b1",
      triggerType: "api.flow.start",
      triggerSource: "api",
      qualityFlowId: "qf.manual",
      priority: 1,
      enabled: true,
    });
    const trigger = normalized({
      triggerId: "trig_fixed",
      triggerType: "api.flow.start",
      triggerSource: "api",
    });
    expect(platform.triggers.ingest(trigger).disposition).toBe("routed");
    expect(platform.triggers.ingest(trigger).disposition).toBe("ignored");
    expect(platform.triggers.ingest(trigger).reason).toBe("duplicate_trigger_id");
  });

  it("rejects provider-specific source classes", async () => {
    const platform = await createPlatformOrchestration();
    try {
      platform.triggers.ingest(
        normalized({
          // intentional invalid leakage for guardrail test
          triggerSource: "github" as never,
        }),
      );
      expect.fail("expected provider-specific source rejection");
    } catch (error) {
      expect(isOrchestrationError(error)).toBe(true);
    }
  });

  it("requires payloadRef instead of raw provider payloads", async () => {
    const platform = await createPlatformOrchestration();
    try {
      platform.triggers.ingest(normalized({ payloadRef: "   " }));
      expect.fail("expected missing payloadRef failure");
    } catch (error) {
      expect(isOrchestrationError(error)).toBe(true);
    }
  });

  it("keeps Trigger ID distinct from Correlation ID and Causation ID", async () => {
    const platform = await createPlatformOrchestration();
    platform.triggerBindings.register({
      bindingId: "b2",
      triggerType: "schedule.cron",
      triggerSource: "schedule",
      qualityFlowId: "qf.nightly",
      priority: 5,
      enabled: true,
    });
    const result = platform.triggers.ingest(
      normalized({
        triggerId: "trig_abc",
        correlationId: "corr_xyz",
        causationId: "cause_1",
        triggerType: "schedule.cron",
        triggerSource: "schedule",
      }),
    );
    expect(result.triggerId).toBe("trig_abc");
    expect(result.correlationId).toBe("corr_xyz");
    expect(result.causationId).toBe("cause_1");
    expect(result.triggerId).not.toBe(result.correlationId);
  });

  it("exposes no execute/start Quality Flow APIs on TriggerEngine", async () => {
    const platform = await createPlatformOrchestration();
    const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(platform.triggers));
    for (const forbidden of [
      "execute",
      "startFlow",
      "runFlow",
      "invoke",
      "executeQualityFlow",
    ]) {
      expect(proto).not.toContain(forbidden);
    }
  });

  it("registers orchestration.trigger.v1 contract", async () => {
    const platform = await createPlatformOrchestration();
    expect(platform.contracts.get("orchestration.trigger.v1")).toBeDefined();
  });
});
