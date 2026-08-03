import { describe, expect, it, vi } from "vitest";

import { QI_EVENT_TYPES } from "./contracts/events";
import { PLACEHOLDER_IDS } from "./providers/placeholders";
import { createPlatformQualityIntelligence } from "./sdk/create-qi";

describe("APZQEP-163 platform-quality-intelligence", () => {
  it("registers active providers and placeholders", () => {
    const qi = createPlatformQualityIntelligence();
    const providers = qi.registry.list();

    for (const id of ["rules", "statistical", "historical", "dummy_ai"] as const) {
      expect(providers.find((p) => p.providerId === id)?.status).toBe("active");
    }

    for (const id of PLACEHOLDER_IDS) {
      expect(providers.find((p) => p.providerId === id)?.status).toBe("placeholder");
    }
    expect(providers.filter((p) => p.status === "placeholder").length).toBe(
      PLACEHOLDER_IDS.length,
    );
  });

  it("records observations immutably", async () => {
    const qi = createPlatformQualityIntelligence();
    const observation = await qi.engine.recordObservation({
      tenantId: "tenant-1",
      source: "automation",
      kind: "test_run",
      summary: "Smoke suite completed",
      correlationId: "corr-obs-1",
      severity: "info",
    });

    expect(observation.observationId).toBeTruthy();
    expect(qi.engine.listObservations("tenant-1")).toHaveLength(1);

    expect(() => {
      (observation as { summary: string }).summary = "mutated";
    }).toThrow();

    await expect(
      qi.engine.recordObservation({
        tenantId: "tenant-1",
        source: "automation",
        kind: "duplicate",
        summary: "should fail if same id reused",
        correlationId: "corr-dup",
      }),
    ).resolves.toBeTruthy();
  });

  it("calculates signals from observations", async () => {
    const events: string[] = [];
    const qi = createPlatformQualityIntelligence({
      publishEvent: (e) => {
        events.push(e.type);
      },
    });

    await qi.engine.recordObservation({
      tenantId: "tenant-1",
      source: "evidence",
      kind: "artifact_missing",
      summary: "Missing screenshot",
      correlationId: "corr-1",
      severity: "warning",
    });
    await qi.engine.recordObservation({
      tenantId: "tenant-1",
      source: "automation",
      kind: "test_failure",
      summary: "Login test failed",
      correlationId: "corr-2",
      severity: "critical",
    });

    const signals = await qi.engine.calculateSignals("tenant-1", "corr-signals");
    expect(signals.length).toBeGreaterThan(0);
    expect(signals.some((s) => s.kind === "evidence_completeness")).toBe(true);
    expect(signals.some((s) => s.kind === "automation_health")).toBe(true);
    expect(events).toContain(QI_EVENT_TYPES.signalCalculated);
  });

  it("produces recommendations with mandatory explanations", async () => {
    const qi = createPlatformQualityIntelligence();

    await qi.engine.recordObservation({
      tenantId: "tenant-1",
      source: "evidence",
      kind: "gap",
      summary: "Evidence incomplete",
      correlationId: "corr-1",
      severity: "warning",
    });
    await qi.engine.recordObservation({
      tenantId: "tenant-1",
      source: "automation",
      kind: "failure",
      summary: "Regression failed",
      correlationId: "corr-2",
      severity: "critical",
    });

    await qi.engine.calculateSignals("tenant-1", "corr-signals");
    const { recommendations } = await qi.engine.evaluateProviders(
      "tenant-1",
      "corr-eval",
    );

    expect(recommendations.length).toBeGreaterThan(0);
    for (const rec of recommendations) {
      const explanation = qi.engine.getExplanation(rec.explanationId);
      expect(explanation).toBeDefined();
      expect(explanation?.reason).toBeTruthy();
      expect(explanation?.decisionPath.length).toBeGreaterThan(0);
      expect(explanation?.providerId).toBe(rec.providerId);
    }
  });

  it("applies confidence scoring with evidence and provider weighting", async () => {
    const qi = createPlatformQualityIntelligence();

    await qi.engine.recordObservation({
      tenantId: "tenant-1",
      source: "automation",
      kind: "failure",
      summary: "Failed",
      correlationId: "corr-1",
      severity: "critical",
      evidenceRefs: ["evidence://run/1", "evidence://run/2"],
    });

    await qi.engine.calculateSignals("tenant-1", "corr-signals");
    const { recommendations } = await qi.engine.evaluateProviders(
      "tenant-1",
      "corr-eval",
    );
    const rulesRec = recommendations.find((r) => r.providerId === "rules");
    expect(rulesRec?.confidence.numeric).toBeGreaterThan(0);
    expect(["low", "medium", "high"]).toContain(rulesRec?.confidence.level);
    expect(rulesRec?.confidence.factors).toBeDefined();
  });

  it("derives quality scores (not manually editable)", async () => {
    const events: string[] = [];
    const qi = createPlatformQualityIntelligence({
      publishEvent: (e) => {
        events.push(e.type);
      },
    });

    await qi.engine.recordObservation({
      tenantId: "tenant-1",
      source: "scm",
      kind: "push",
      summary: "Commit pushed",
      correlationId: "corr-1",
    });
    await qi.engine.recordObservation({
      tenantId: "tenant-1",
      source: "evidence",
      kind: "published",
      summary: "Evidence published",
      correlationId: "corr-2",
    });

    await qi.engine.calculateSignals("tenant-1", "corr-signals");
    const { scores } = await qi.engine.evaluateProviders("tenant-1", "corr-eval");

    expect(scores.length).toBeGreaterThan(0);
    expect(scores.some((s) => s.dimension === "overall")).toBe(true);
    for (const score of scores) {
      expect(score.value).toBeGreaterThanOrEqual(0);
      expect(score.value).toBeLessThanOrEqual(100);
      expect(score.derivedFrom.length).toBeGreaterThan(0);
    }
    expect(events).toContain(QI_EVENT_TYPES.qualityScoreUpdated);
  });

  it("supports accept and reject recommendation lifecycle", async () => {
    const events: string[] = [];
    const qi = createPlatformQualityIntelligence({
      publishEvent: (e) => {
        events.push(e.type);
      },
    });

    await qi.engine.recordObservation({
      tenantId: "tenant-1",
      source: "automation",
      kind: "failure",
      summary: "Suite failed",
      correlationId: "corr-1",
      severity: "critical",
    });
    await qi.engine.calculateSignals("tenant-1", "corr-signals");
    const { recommendations } = await qi.engine.evaluateProviders(
      "tenant-1",
      "corr-eval",
    );
    const target = recommendations[0];
    expect(target).toBeDefined();

    const accepted = await qi.engine.acceptRecommendation(
      target!.recommendationId,
      "user-1",
      "corr-accept",
    );
    expect(accepted.status).toBe("accepted");
    expect(accepted.lifecycle.acceptedAt).toBeTruthy();
    expect(events).toContain(QI_EVENT_TYPES.recommendationAccepted);

    const proposed = recommendations.find(
      (r) => r.status === "proposed" && r !== target,
    );
    if (proposed) {
      const rejected = await qi.engine.rejectRecommendation(
        proposed.recommendationId,
        "user-2",
        "corr-reject",
      );
      expect(rejected.status).toBe("rejected");
      expect(events).toContain(QI_EVENT_TYPES.recommendationRejected);
    }

    const audits = qi.engine.listAudits("tenant-1");
    expect(audits.some((a) => a.action === "created")).toBe(true);
    expect(audits.some((a) => a.action === "accepted")).toBe(true);
    expect(qi.engine.listHistory("tenant-1").length).toBeGreaterThan(0);
    expect(qi.engine.listConfidence("tenant-1").length).toBeGreaterThan(0);
  });

  it("dummy_ai never calls network and exposes no openai types on public records", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("network should not be called"));

    const qi = createPlatformQualityIntelligence();
    await qi.engine.recordObservation({
      tenantId: "tenant-1",
      source: "operational",
      kind: "health_check",
      summary: "Platform healthy",
      correlationId: "corr-1",
    });

    await qi.engine.calculateSignals("tenant-1", "corr-signals");
    const { recommendations } = await qi.engine.evaluateProviders(
      "tenant-1",
      "corr-eval",
    );
    const dummyRec = recommendations.find((r) => r.providerId === "dummy_ai");

    expect(dummyRec).toBeDefined();
    expect(fetchSpy).not.toHaveBeenCalled();

    const serialized = JSON.stringify({
      recommendation: dummyRec,
      explanation: qi.engine.getExplanation(dummyRec!.explanationId),
    });
    expect(serialized.toLowerCase()).not.toMatch(
      /openai|anthropic|google|gemini|azure/,
    );
    expect(dummyRec?.confidence.factors?.mode).toBe("offline-demo-only");

    fetchSpy.mockRestore();
  });

  it("placeholder providers refuse evaluation", async () => {
    const qi = createPlatformQualityIntelligence();

    for (const providerId of PLACEHOLDER_IDS) {
      await expect(
        qi.engine.dispatchProvider(providerId, "tenant-1", "corr-placeholder"),
      ).rejects.toThrow(/placeholder/i);
    }
  });

  it("publishes platform quality intelligence events", async () => {
    const events: string[] = [];
    const qi = createPlatformQualityIntelligence({
      publishEvent: (e) => {
        events.push(e.type);
      },
    });

    await qi.engine.recordObservation({
      tenantId: "tenant-1",
      source: "requirements",
      kind: "change",
      summary: "Requirement updated",
      correlationId: "corr-1",
    });
    await qi.engine.calculateSignals("tenant-1", "corr-signals");
    await qi.engine.evaluateProviders("tenant-1", "corr-eval");

    expect(events).toContain(QI_EVENT_TYPES.providerRegistered);
    expect(events).toContain(QI_EVENT_TYPES.observationCreated);
    expect(events).toContain(QI_EVENT_TYPES.signalCalculated);
    expect(events).toContain(QI_EVENT_TYPES.recommendationCreated);
    expect(events).toContain(QI_EVENT_TYPES.qualityScoreUpdated);
    expect(events).toContain(QI_EVENT_TYPES.providerHealthChanged);
  });
});
