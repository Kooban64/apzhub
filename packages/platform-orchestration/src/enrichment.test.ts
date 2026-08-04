import { describe, expect, it } from "vitest";

import { ENRICHMENT_EVENT_TYPES, createPlatformOrchestration } from "./index";

describe("APZQEP-165 QO-013 Enterprise Quality Intelligence Enrichment", () => {
  it("creates an additive Enrichment Package with advisory insights", async () => {
    const platform = await createPlatformOrchestration();
    expect(platform.contracts.get("orchestration.enrichment.v1")?.kind).toBe(
      "enrichment",
    );
    expect(platform.container.has("orchestration.enrichment.engine")).toBe(true);

    const pkg = platform.enrichment.createEnrichmentPackage({
      qualityFlowRef: "qf_1",
      decisionPackageRef: "dp_1",
      impactGraphRef: "imp_1",
      confidenceSummaryRef: "conf_1",
      automationCoordinationPackageRef: "acp_1",
      sourceChangePackageRef: "scp_1",
      historicalTrendRefs: ["trend:defect-rate-30d"],
      statisticalIndicators: ["stat:flaky-rate"],
      qualitySignalRefs: ["qi:signal:42"],
      recommendationRefs: ["qi:rec:7"],
      observedConfidence: 0.82,
      observedResidualRisk: "medium",
      observedPlatformConclusion: "GO",
      tenantId: "tenant_a",
      projectId: "proj_a",
      actorId: "actor_enrich",
      insights: [
        {
          category: "historical_pattern",
          summary: "Similar changes historically required regression verification",
          signalRefs: ["qi:signal:42"],
          confidenceAttribution: [
            {
              sourceRef: "qi:hist:12",
              sourceKind: "historical",
              attributedConfidence: 0.7,
              note: "Wave-3 QI historical provider artefact (opaque ref)",
            },
          ],
        },
        {
          category: "future_ai_insight",
          summary: "Future AI provider may comment on scope concentration",
          detail: "Placeholder advisory only — AI is not authoritative",
          confidenceAttribution: [
            {
              sourceRef: "qi:ai:future",
              sourceKind: "future_ai",
              note: "External AI contributes advisory insight only",
            },
          ],
        },
      ],
    });

    expect(pkg.advisory).toBe(true);
    expect(pkg.authoritative).toBe(false);
    expect(pkg.correctsUpstream).toBe(false);
    expect(pkg.enrichmentStatus).toBe("enriched");
    expect(pkg.decisionPackageRef).toBe("dp_1");
    expect(pkg.automationCoordinationPackageRef).toBe("acp_1");
    expect(pkg.sourceChangePackageRef).toBe("scp_1");
    expect(pkg.advisoryInsights.length).toBeGreaterThanOrEqual(2);
    expect(pkg.explainability.nonAuthoritativeStatement).toMatch(/advisory only/i);
    expect(pkg.explainability.whyAdditive).toMatch(/without modifying/i);

    const insights = platform.enrichment.queryAdvisoryInsights(pkg.enrichmentPackageId);
    expect(insights.every((i) => i.advisory === true)).toBe(true);

    const signals = platform.enrichment.getHistoricalSignals(pkg.enrichmentPackageId);
    expect(signals.historicalTrendRefs).toContain("trend:defect-rate-30d");
    expect(signals.qualitySignalRefs).toContain("qi:signal:42");

    expect(
      platform.events.queryEvents({
        eventType: ENRICHMENT_EVENT_TYPES.packageCreated,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.events.queryEvents({
        eventType: ENRICHMENT_EVENT_TYPES.insightAttached,
      }).length,
    ).toBeGreaterThan(0);
    expect(
      platform.events.queryEvents({
        eventType: ENRICHMENT_EVENT_TYPES.enrichmentCompleted,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("marks empty enrichment when no insights or signals are provided", async () => {
    const platform = await createPlatformOrchestration();
    const pkg = platform.enrichment.createEnrichmentPackage({
      qualityFlowRef: "qf_empty",
      tenantId: "t1",
    });
    expect(pkg.enrichmentStatus).toBe("empty");
    expect(pkg.advisoryInsights).toHaveLength(0);
  });

  it("never exposes APIs that mutate or re-evaluate upstream artefacts", async () => {
    const platform = await createPlatformOrchestration();
    const eng = platform.enrichment as unknown as Record<string, unknown>;
    expect(typeof eng.modifyDecisionPackage).toBe("undefined");
    expect(typeof eng.evaluatePolicy).toBe("undefined");
    expect(typeof eng.evaluateGovernance).toBe("undefined");
    expect(typeof eng.invokeOpenAI).toBe("undefined");
    expect(typeof eng.correctUpstream).toBe("undefined");

    const pkg = platform.enrichment.createEnrichmentPackage({
      qualityFlowRef: "qf_arch",
      decisionPackageRef: "dp_arch",
      tenantId: "t1",
      insights: [
        {
          category: "statistical_observation",
          summary: "Flaky rate elevated in related suites (advisory)",
        },
      ],
    });
    expect(pkg.correctsUpstream).toBe(false);
    expect(JSON.stringify(pkg).toLowerCase()).not.toMatch(/openai|anthropic|chatgpt/);
    expect(platform.enrichment.diagnostics().ready).toBe(true);
  });

  it("supports superseding enrichment packages without correcting history", async () => {
    const platform = await createPlatformOrchestration();
    const first = platform.enrichment.createEnrichmentPackage({
      qualityFlowRef: "qf_s",
      decisionPackageRef: "dp_s",
      tenantId: "t1",
      insights: [{ category: "trend", summary: "Initial trend commentary" }],
    });
    const second = platform.enrichment.createEnrichmentPackage({
      qualityFlowRef: "qf_s",
      decisionPackageRef: "dp_s",
      tenantId: "t1",
      supersedesPackageId: first.enrichmentPackageId,
      insights: [
        { category: "trend", summary: "Updated trend commentary (new package)" },
      ],
    });
    expect(second.supersedesPackageId).toBe(first.enrichmentPackageId);
    expect(first.advisoryInsights[0]?.summary).toContain("Initial");
    expect(
      platform.enrichment.getEnrichmentHistory(second.enrichmentPackageId).length,
    ).toBeGreaterThan(0);
  });

  it("attributes confidence without recalculating or overriding decisions", async () => {
    const platform = await createPlatformOrchestration();
    const pkg = platform.enrichment.createEnrichmentPackage({
      qualityFlowRef: "qf_c",
      decisionPackageRef: "dp_c",
      confidenceSummaryRef: "conf_c",
      observedConfidence: 0.55,
      observedPlatformConclusion: "CONDITIONAL_GO",
      tenantId: "t1",
    });

    const commentary = pkg.advisoryInsights.find(
      (i) => i.category === "confidence_commentary",
    );
    expect(commentary?.confidenceAttribution[0]?.attributedConfidence).toBe(0.55);
    const rec = pkg.advisoryInsights.find((i) => i.category === "recommendation");
    expect(rec?.summary).toMatch(/remains authoritative/i);
    expect(
      pkg.explainability.reasons.some((r) => /not mutated|No authoritative/i.test(r)),
    ).toBe(true);
  });
});
