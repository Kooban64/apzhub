import { describe, expect, it } from "vitest";

import {
  DECISION_EVENT_TYPES,
  ORCHESTRATION_KERNEL_EVENT_TYPES,
  createPlatformOrchestration,
  isCommandStyleEventType,
  looksPastTense,
} from "./index";

describe("APZQEP-165 QO-010 Enterprise Quality Event Backbone", () => {
  it("registers built-in types and records kernel events via the backbone", async () => {
    const legacy: string[] = [];
    const platform = await createPlatformOrchestration({
      config: { orchestrationId: "orch_evt", name: "evt" },
      publishEvent: (e) => {
        legacy.push(e.type);
      },
    });

    expect(platform.contracts.get("orchestration.event.backbone.v1")?.kind).toBe(
      "event",
    );
    expect(platform.container.has("orchestration.event.backbone")).toBe(true);
    expect(platform.events.registry.count()).toBeGreaterThan(10);
    expect(platform.events.diagnostics().ready).toBe(true);

    const history = platform.events.getHistory({
      eventType: ORCHESTRATION_KERNEL_EVENT_TYPES.kernelReady,
    });
    expect(history.length).toBeGreaterThan(0);
    expect(legacy).toContain(ORCHESTRATION_KERNEL_EVENT_TYPES.kernelCreated);
    expect(legacy).toContain(ORCHESTRATION_KERNEL_EVENT_TYPES.kernelReady);
  });

  it("publishes immutable envelopes and preserves correlation ordering", async () => {
    const platform = await createPlatformOrchestration();
    const received: string[] = [];
    platform.events.subscribe({
      subscriberId: "audit_sink",
      eventTypes: [DECISION_EVENT_TYPES.packageCreated],
      handler: (e) => {
        received.push(e.eventId);
      },
    });

    const a = await platform.events.publish({
      eventType: DECISION_EVENT_TYPES.packageCreated,
      correlationId: "corr_1",
      causationId: "cause_0",
      tenantId: "t1",
      projectId: "p1",
      producer: "orchestration.decision",
      subjectRef: "dp_1",
      payload: { conclusion: "GO" },
    });
    const b = await platform.events.publish({
      eventType: DECISION_EVENT_TYPES.packageCreated,
      correlationId: "corr_1",
      causationId: a.eventId,
      tenantId: "t1",
      projectId: "p1",
      producer: "orchestration.decision",
      subjectRef: "dp_2",
      payload: { conclusion: "NO_GO" },
    });

    expect(a.sequence).toBe(1);
    expect(b.sequence).toBe(2);
    expect(a.eventId).not.toBe(b.eventId);
    expect(platform.events.getEvent(a.eventId).payload.conclusion).toBe("GO");
    expect(received).toEqual([a.eventId, b.eventId]);

    const ordered = platform.events.queryEvents({ correlationId: "corr_1" });
    expect(ordered.map((e) => e.sequence)).toEqual([1, 2]);
  });

  it("rejects command-style and unregistered events", async () => {
    const platform = await createPlatformOrchestration();
    expect(isCommandStyleEventType("run-tests")).toBe(true);
    expect(isCommandStyleEventType("approve-release")).toBe(true);
    expect(looksPastTense("decision.package.created")).toBe(true);

    await expect(
      platform.events.publish({
        eventType: "run-tests",
        correlationId: "c",
        tenantId: "t",
        producer: "bad",
        subjectRef: "x",
      }),
    ).rejects.toThrow(/Command-style|past-tense|forbidden/i);

    await expect(
      platform.events.publish({
        eventType: "approve-release",
        correlationId: "c",
        tenantId: "t",
        producer: "bad",
        subjectRef: "x",
      }),
    ).rejects.toThrow();

    await expect(
      platform.events.publish({
        eventType: "something.completed",
        correlationId: "c",
        tenantId: "t",
        producer: "bad",
        subjectRef: "x",
      }),
    ).rejects.toThrow(/not registered/i);

    expect(platform.events.diagnostics().validationStatistics.rejected).toBeGreaterThan(
      0,
    );
  });

  it("supports directed and tenant-scoped routing", async () => {
    const platform = await createPlatformOrchestration();
    const hits: string[] = [];

    platform.events.subscribe({
      subscriberId: "alpha",
      handler: () => {
        hits.push("alpha");
      },
    });
    platform.events.subscribe({
      subscriberId: "beta",
      handler: () => {
        hits.push("beta");
      },
    });
    platform.events.subscribe({
      subscriberId: "tenant_a_only",
      tenantId: "tenant_a",
      routing: "tenant_scoped",
      handler: () => {
        hits.push("tenant");
      },
    });

    await platform.events.publish({
      eventType: DECISION_EVENT_TYPES.packageCreated,
      correlationId: "corr_dir",
      tenantId: "tenant_a",
      producer: "orchestration.decision",
      subjectRef: "dp_dir",
      routing: "directed",
      targetSubscriberIds: ["beta"],
    });
    expect(hits).toEqual(["beta"]);

    hits.length = 0;
    await platform.events.publish({
      eventType: DECISION_EVENT_TYPES.packageCreated,
      correlationId: "corr_ten",
      tenantId: "tenant_b",
      producer: "orchestration.decision",
      subjectRef: "dp_ten",
      routing: "tenant_scoped",
    });
    // tenant_a_only filtered out by subscription tenant; alpha/beta have no tenant filter
    expect(hits).toContain("alpha");
    expect(hits).toContain("beta");
    expect(hits).not.toContain("tenant");
  });

  it("supports event versioning without mutation", async () => {
    const platform = await createPlatformOrchestration();
    platform.events.registerEventType({
      eventType: "quality.signal.emitted",
      version: "1.0.0",
      description: "Quality signal emitted v1",
      producer: "future.qi",
      schemaRef: "schema://quality.signal.emitted/1.0.0",
      documentationRef: "docs://events/quality.signal.emitted",
    });
    platform.events.registerEventType({
      eventType: "quality.signal.emitted",
      version: "2.0.0",
      description: "Quality signal emitted v2",
      producer: "future.qi",
      schemaRef: "schema://quality.signal.emitted/2.0.0",
      documentationRef: "docs://events/quality.signal.emitted",
    });

    const v1 = await platform.events.publish({
      eventType: "quality.signal.emitted",
      eventVersion: "1.0.0",
      correlationId: "corr_v",
      tenantId: "t",
      producer: "future.qi",
      subjectRef: "sig_1",
    });
    const v2 = await platform.events.publish({
      eventType: "quality.signal.emitted",
      eventVersion: "2.0.0",
      correlationId: "corr_v",
      tenantId: "t",
      producer: "future.qi",
      subjectRef: "sig_2",
    });

    expect(v1.eventVersion).toBe("1.0.0");
    expect(v2.eventVersion).toBe("2.0.0");
    expect(platform.events.listEventVersions("quality.signal.emitted")).toHaveLength(2);
    expect(
      platform.events.getEventMetadata("quality.signal.emitted", "1.0.0").description,
    ).toContain("v1");
  });

  it("records replay metadata without executing replay", async () => {
    const platform = await createPlatformOrchestration();
    const evt = await platform.events.publish({
      eventType: DECISION_EVENT_TYPES.packageCreated,
      correlationId: "corr_replay",
      tenantId: "t",
      producer: "orchestration.decision",
      subjectRef: "dp_r",
      replay: {
        replayEligible: true,
        replayWindowHours: 24,
        replayRef: "replay_ref_1",
        replayStatus: "eligible",
      },
    });

    expect(evt.replay.replayEligible).toBe(true);
    expect(evt.replay.replayWindowHours).toBe(24);
    expect(evt.replay.replayRef).toBe("replay_ref_1");
    expect(evt.replay.replayStatus).toBe("eligible");
    expect(
      typeof (platform.events as unknown as { executeReplay?: unknown }).executeReplay,
    ).toBe("undefined");
    expect(
      typeof (platform.events as unknown as { evaluatePolicy?: unknown })
        .evaluatePolicy,
    ).toBe("undefined");
    expect(typeof (platform.events as unknown as { deploy?: unknown }).deploy).toBe(
      "undefined",
    );
  });

  it("exposes list/query/history APIs and diagnostics", async () => {
    const platform = await createPlatformOrchestration();
    await platform.events.publish({
      eventType: DECISION_EVENT_TYPES.packageCreated,
      correlationId: "corr_api",
      tenantId: "tenant_x",
      projectId: "proj_x",
      producer: "orchestration.decision",
      subjectRef: "dp_api",
    });

    expect(platform.events.listEventTypes()).toContain(
      DECISION_EVENT_TYPES.packageCreated,
    );
    expect(
      platform.events.queryEvents({ tenantId: "tenant_x" }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.events.getHistory({ producer: "orchestration.decision" }).length,
    ).toBeGreaterThan(0);
    const diag = platform.events.diagnostics();
    expect(diag.publishedCount).toBeGreaterThan(0);
    expect(diag.historyCount).toBeGreaterThan(0);
    expect(diag.health).toBe("healthy");
  });
});
