import { describe, expect, it } from "vitest";

import { createQepQualityIntelligence } from "./compose";
import { QEP_QI_BASE_PATH, QEP_QI_ROUTES, isQepQiRoute } from "./presentation/routes";

describe("APZQEP-163 qep-quality-intelligence", () => {
  it("exposes workspace routes under /workspace/qep/quality-intelligence", () => {
    expect(QEP_QI_ROUTES.home).toBe(QEP_QI_BASE_PATH);
    expect(isQepQiRoute("/workspace/qep/quality-intelligence/recommendations")).toBe(
      true,
    );
    expect(isQepQiRoute("/workspace/qep/scm")).toBe(false);
  });

  it("runs analysis through rules/statistical/historical/dummy_ai providers", async () => {
    const qep = createQepQualityIntelligence();
    await qep.recordObservation({
      tenantId: "tenant-1",
      source: "evidence",
      kind: "evidence.gap",
      summary: "Missing evidence pack for release candidate",
      correlationId: "corr-1",
      severity: "warning",
    });
    await qep.recordObservation({
      tenantId: "tenant-1",
      source: "automation",
      kind: "automation.failure",
      summary: "Playwright dry-run reported failures",
      correlationId: "corr-1",
      severity: "critical",
    });

    const result = await qep.runAnalysis("tenant-1", "corr-1");
    expect(result.signals.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations.every((r) => r.explanationId)).toBe(true);
    expect((await qep.listHistory("tenant-1")).length).toBe(
      result.recommendations.length,
    );
    expect((await qep.listAudits("tenant-1")).some((a) => a.action === "created")).toBe(
      true,
    );
    expect((await qep.listConfidence("tenant-1")).length).toBeGreaterThan(0);
    expect(qep.listProviders().some((p) => p.providerId === "dummy_ai")).toBe(true);
    expect(
      qep
        .listProviders()
        .some((p) => p.providerId === "openai" && p.status === "placeholder"),
    ).toBe(true);
    expect(QEP_QI_ROUTES.history).toContain("/history");
    expect(QEP_QI_ROUTES.confidence).toContain("/confidence");
  });
});
