/**
 * Platform-1.3-ENG-002 — Observe Live Alerts Phase A (ADR-0070).
 */

import { beforeEach, describe, expect, it } from "vitest";

import { OBSERVE_ALERT_RULE_METADATA_KEY } from "@apzhub/observe-contracts";
import {
  computeAlertFingerprint,
  evaluateAlertPredicate,
  readAlertLifecycleMetadata,
  validateAlertRuleConfig,
} from "@apzhub/observe-core";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  createObservePlatformServicesForTest,
  isObserveAlertEvaluationEnabled,
  OBSERVE_ALERT_DOMAIN_EVENT_IDS,
  resetDomainEventEnvelopeCounter,
  resolveOperationAuthorization,
  type DomainEventEnvelope,
  type DomainEventPublisher,
} from "../../index";
import { createRecordingObserveAlertDeliveryHook } from "./alert-delivery-hook";

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_obs",
    userId: "user_obs",
    organisationId: "org_obs",
    correlationId: "corr_eng002",
    permissions: ["observe.*"],
    ...overrides,
  };
}

describe("isObserveAlertEvaluationEnabled (deny-by-default)", () => {
  it("is disabled when unset", () => {
    expect(isObserveAlertEvaluationEnabled({})).toBe(false);
  });
  it("is disabled for invalid values", () => {
    expect(
      isObserveAlertEvaluationEnabled({
        APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED: "yes",
      }),
    ).toBe(false);
    expect(
      isObserveAlertEvaluationEnabled({
        APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED: "false",
      }),
    ).toBe(false);
  });
  it("enables only for true|1|on", () => {
    expect(
      isObserveAlertEvaluationEnabled({
        APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED: "true",
      }),
    ).toBe(true);
    expect(
      isObserveAlertEvaluationEnabled({ APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED: "1" }),
    ).toBe(true);
    expect(
      isObserveAlertEvaluationEnabled({
        APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED: "on",
      }),
    ).toBe(true);
  });
});

describe("alert rule validation", () => {
  it("accepts metadata-driven Phase A rules", () => {
    const rule = validateAlertRuleConfig({
      enabled: true,
      signalSource: "serviceHealth",
      signalKey: "api",
      predicate: {
        kind: "status_in",
        field: "overallStatus",
        values: ["unhealthy", "degraded"],
      },
      category: "platform_health",
      labels: { env: "prod" },
    });
    expect(rule.enabled).toBe(true);
    expect(rule.signalSource).toBe("serviceHealth");
  });

  it("rejects PromQL fields", () => {
    expect(() =>
      validateAlertRuleConfig({
        enabled: true,
        signalSource: "serviceHealth",
        predicate: { kind: "status_in", field: "status", values: ["unhealthy"] },
        promql: "up == 0",
      }),
    ).toThrow(/forbids/);
  });
});

describe("predicate + fingerprint", () => {
  it("treats unavailable and unknown as unknown (not clear)", () => {
    expect(
      evaluateAlertPredicate(
        { kind: "status_in", field: "status", values: ["unhealthy"] },
        { available: false },
      ),
    ).toBe("unknown");
    expect(
      evaluateAlertPredicate(
        { kind: "status_in", field: "status", values: ["unhealthy"] },
        { available: true, status: "unknown" },
      ),
    ).toBe("unknown");
  });

  it("matches and clears deterministically", () => {
    expect(
      evaluateAlertPredicate(
        { kind: "status_in", field: "status", values: ["unhealthy"] },
        { available: true, status: "unhealthy" },
      ),
    ).toBe("match");
    expect(
      evaluateAlertPredicate(
        { kind: "status_in", field: "status", values: ["unhealthy"] },
        { available: true, status: "healthy" },
      ),
    ).toBe("clear");
  });

  it("computes stable fingerprints", () => {
    const a = computeAlertFingerprint({
      tenantId: "t1",
      definitionId: "ad_1",
      labels: { b: "2", a: "1" },
    });
    const b = computeAlertFingerprint({
      tenantId: "t1",
      definitionId: "ad_1",
      labels: { a: "1", b: "2" },
    });
    expect(a).toBe(b);
  });
});

describe("Observe Live Alerts Phase A evaluation", () => {
  const published: DomainEventEnvelope[] = [];
  let publisher: DomainEventPublisher;
  const deliverySink = { calls: [] as { eventId: string }[] };

  beforeEach(() => {
    published.length = 0;
    deliverySink.calls = [];
    resetDomainEventEnvelopeCounter();
    publisher = {
      publish(envelope) {
        published.push(envelope);
        return { ok: true, envelopeId: envelope.envelopeId };
      },
    };
  });

  function bundle(env: Record<string, string | undefined> = {}) {
    let tick = 0;
    return createObservePlatformServicesForTest({
      allowInMemoryPersistence: true,
      eventPublisher: publisher,
      deliveryHook: createRecordingObserveAlertDeliveryHook(deliverySink as never),
      env,
      now: () => new Date(Date.UTC(2026, 6, 22, 12, 0, tick++)).toISOString(),
    });
  }

  async function seedUnhealthyApi(g: ReturnType<typeof bundle>["gatewaySurface"]) {
    await g.serviceHealth.create(ctx(), {
      serviceKey: "api",
      displayName: "API",
      overallStatus: "unhealthy",
      readinessStatus: "ready",
      livenessStatus: "alive",
    });
    return g.alertDefinitions.create(ctx(), {
      key: "api-unhealthy",
      name: "API unhealthy",
      severity: "critical",
      providerKind: "internal",
      status: "active",
      metadata: {
        [OBSERVE_ALERT_RULE_METADATA_KEY]: {
          enabled: true,
          signalSource: "serviceHealth",
          signalKey: "api",
          predicate: {
            kind: "status_in",
            field: "overallStatus",
            values: ["unhealthy", "degraded"],
          },
          category: "platform_health",
          labels: { service: "api" },
        },
      },
    });
  }

  it("does not evaluate when disabled by default", async () => {
    const b = bundle({});
    const g = b.gatewaySurface;
    await seedUnhealthyApi(g);
    const result = await g.alertEvaluation.evaluateBatch(ctx());
    expect(result.evaluationEnabled).toBe(false);
    expect(result.rulesEvaluated).toBe(0);
    expect(await g.alertStates.list(ctx())).toHaveLength(0);
  });

  it("fires a new alert when enabled and condition matches", async () => {
    const b = bundle({ APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED: "true" });
    const g = b.gatewaySurface;
    await seedUnhealthyApi(g);

    const result = await g.alertEvaluation.evaluateBatch(ctx());
    expect(result.evaluationEnabled).toBe(true);
    expect(
      result.results.some((r) => r.outcome === "match" && r.state === "firing"),
    ).toBe(true);
    const states = await g.alertStates.list(ctx());
    expect(states).toHaveLength(1);
    expect(states[0]?.state).toBe("firing");
    const life = readAlertLifecycleMetadata(states[0]?.metadata);
    expect(life?.occurrenceCount).toBe(1);
    expect(life?.firstFiredAt).toBeTruthy();
    expect(life?.lastFiredAt).toBeTruthy();
    expect(
      published.some((e) => e.eventId === OBSERVE_ALERT_DOMAIN_EVENT_IDS.fired),
    ).toBe(true);
    expect(
      deliverySink.calls.some(
        (c) => c.eventId === OBSERVE_ALERT_DOMAIN_EVENT_IDS.fired,
      ),
    ).toBe(true);
  });

  it("deduplicates repeated active conditions and updates occurrence count", async () => {
    const b = bundle({ APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED: "true" });
    const g = b.gatewaySurface;
    await seedUnhealthyApi(g);

    await g.alertEvaluation.evaluateBatch(ctx());
    const first = (await g.alertStates.list(ctx()))[0]!;
    const firstLife = readAlertLifecycleMetadata(first.metadata)!;
    const firstFired = firstLife.firstFiredAt;

    await g.alertEvaluation.evaluateBatch(ctx());
    const states = await g.alertStates.list(ctx());
    expect(states).toHaveLength(1);
    const life = readAlertLifecycleMetadata(states[0]?.metadata)!;
    expect(life.occurrenceCount).toBe(2);
    expect(life.firstFiredAt).toBe(firstFired);
    expect(life.lastFiredAt).not.toBe(firstFired);
    expect(life.acknowledgedAt).toBeUndefined();
  });

  it("does not auto-resolve on unknown input", async () => {
    const b = bundle({ APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED: "true" });
    const g = b.gatewaySurface;
    const health = await g.serviceHealth.create(ctx(), {
      serviceKey: "api",
      displayName: "API",
      overallStatus: "unhealthy",
      readinessStatus: "ready",
      livenessStatus: "alive",
    });
    await g.alertDefinitions.create(ctx(), {
      key: "api-unhealthy",
      name: "API unhealthy",
      severity: "critical",
      providerKind: "internal",
      status: "active",
      metadata: {
        [OBSERVE_ALERT_RULE_METADATA_KEY]: {
          enabled: true,
          signalSource: "serviceHealth",
          signalKey: "api",
          predicate: {
            kind: "status_in",
            field: "overallStatus",
            values: ["unhealthy"],
          },
          labels: { service: "api" },
        },
      },
    });
    await g.alertEvaluation.evaluateBatch(ctx());
    expect((await g.alertStates.list(ctx()))[0]?.state).toBe("firing");

    await g.serviceHealth.update(ctx(), {
      id: health.id,
      overallStatus: "unknown",
    });
    const result = await g.alertEvaluation.evaluateBatch(ctx());
    expect(result.results.some((r) => r.outcome === "unknown")).toBe(true);
    expect((await g.alertStates.list(ctx()))[0]?.state).toBe("firing");
  });

  it("acknowledges without resolving and rejects invalid ack", async () => {
    const b = bundle({ APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED: "true" });
    const g = b.gatewaySurface;
    await seedUnhealthyApi(g);
    await g.alertEvaluation.evaluateBatch(ctx());
    const firing = (await g.alertStates.list(ctx()))[0]!;
    const ack = await g.alertStates.acknowledge(ctx(), {
      id: firing.id,
      note: "looking",
    });
    expect(ack.state).toBe("firing");
    const life = readAlertLifecycleMetadata(ack.metadata)!;
    expect(life.acknowledgedBy).toBe("user_obs");
    expect(life.acknowledgedAt).toBeTruthy();
    expect(
      published.some((e) => e.eventId === OBSERVE_ALERT_DOMAIN_EVENT_IDS.acknowledged),
    ).toBe(true);

    const resolved = await g.alertStates.resolve(ctx(), { id: firing.id });
    expect(resolved.state).toBe("resolved");
    await expect(
      g.alertStates.acknowledge(ctx(), { id: resolved.id }),
    ).rejects.toThrow();
  });

  it("resolves on healthy evaluation and publishes resolved", async () => {
    const b = bundle({ APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED: "true" });
    const g = b.gatewaySurface;
    const health = await g.serviceHealth.create(ctx(), {
      serviceKey: "api",
      displayName: "API",
      overallStatus: "unhealthy",
      readinessStatus: "ready",
      livenessStatus: "alive",
    });
    await g.alertDefinitions.create(ctx(), {
      key: "api-unhealthy",
      name: "API unhealthy",
      severity: "critical",
      providerKind: "internal",
      status: "active",
      metadata: {
        [OBSERVE_ALERT_RULE_METADATA_KEY]: {
          enabled: true,
          signalSource: "serviceHealth",
          signalKey: "api",
          predicate: {
            kind: "status_in",
            field: "overallStatus",
            values: ["unhealthy"],
          },
          labels: { service: "api" },
        },
      },
    });
    await g.alertEvaluation.evaluateBatch(ctx());
    await g.serviceHealth.update(ctx(), { id: health.id, overallStatus: "healthy" });
    await g.alertEvaluation.evaluateBatch(ctx());
    expect((await g.alertStates.list(ctx()))[0]?.state).toBe("resolved");
    expect(
      published.some((e) => e.eventId === OBSERVE_ALERT_DOMAIN_EVENT_IDS.resolved),
    ).toBe(true);
  });

  it("suppresses without representing healthy", async () => {
    const b = bundle({ APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED: "true" });
    const g = b.gatewaySurface;
    await seedUnhealthyApi(g);
    await g.alertEvaluation.evaluateBatch(ctx());
    const firing = (await g.alertStates.list(ctx()))[0]!;
    const silenced = await g.alertStates.suppress(ctx(), {
      id: firing.id,
      reason: "maint",
    });
    expect(silenced.state).toBe("silenced");
    expect(silenced.state).not.toBe("resolved");
    expect(
      published.some((e) => e.eventId === OBSERVE_ALERT_DOMAIN_EVENT_IDS.suppressed),
    ).toBe(true);
  });

  it("exposes diagnostics, health, and metrics counters", async () => {
    const b = bundle({ APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED: "true" });
    const g = b.gatewaySurface;
    await seedUnhealthyApi(g);
    await g.alertEvaluation.evaluateBatch(ctx());
    const diagnostics = await g.alertEvaluation.getDiagnostics(ctx());
    expect(diagnostics.evaluationEnabled).toBe(true);
    expect(diagnostics.alertsFired).toBeGreaterThanOrEqual(1);
    expect(diagnostics.activeAlertCount).toBeGreaterThanOrEqual(1);
    const health = await g.alertEvaluation.getHealth(ctx());
    expect(health.evaluationEnabled).toBe(true);
    expect(["healthy", "degraded", "unhealthy", "disabled"]).toContain(health.status);
  });

  it("records event publication failures without corrupting alert state", async () => {
    const failingPublisher: DomainEventPublisher = {
      publish() {
        throw new Error("bus_down");
      },
    };
    const b = createObservePlatformServicesForTest({
      allowInMemoryPersistence: true,
      eventPublisher: failingPublisher,
      env: { APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED: "true" },
    });
    const g = b.gatewaySurface;
    await seedUnhealthyApi(g);
    await g.alertEvaluation.evaluateBatch(ctx());
    expect((await g.alertStates.list(ctx()))[0]?.state).toBe("firing");
    const diagnostics = await g.alertEvaluation.getDiagnostics(ctx());
    expect(diagnostics.eventPublicationFailureCount).toBeGreaterThanOrEqual(1);
  });

  it("maps authorization for evaluation and lifecycle ops", () => {
    expect(
      resolveOperationAuthorization("observeAlertEvaluation", "evaluateBatch")
        ?.requiredPermission,
    ).toBe("observe.manage");
    expect(
      resolveOperationAuthorization("observeAlertStates", "acknowledge")
        ?.requiredPermission,
    ).toBe("observe.alerts");
    expect(
      resolveOperationAuthorization("observeAlertEvaluation", "getDiagnostics")
        ?.requiredPermission,
    ).toBe("observe.diagnostics");
  });
});
