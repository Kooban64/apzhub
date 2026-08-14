import { describe, expect, it } from "vitest";

import { createPlatformAutomation } from "../../sdk/create-automation";
import { normalizeAxeSummary } from "../accessibility/normalize-axe";
import { normalizeK6Summary } from "./normalize-k6";
import { normalizeSarifOrFindings } from "./normalize-sarif";
import { normalizeTestSuiteReport } from "./normalize-test-report";
import { normalizeVitestReport } from "../vitest/normalize-vitest";

describe("F3 provider evidence ingest", () => {
  it("normalizes Vitest JSON reports", () => {
    const report = normalizeVitestReport({
      success: true,
      numPassedTests: 2,
      numFailedTests: 0,
      tests: [
        { title: "a", status: "passed", duration: 12 },
        { title: "b", status: "passed", duration: 8 },
      ],
    });
    expect(report.ok).toBe(true);
    expect(report.passed).toBe(2);
    expect(report.summary).toMatch(/Vitest CI/);
  });

  it("normalizes axe summaries", () => {
    const report = normalizeAxeSummary({
      url: "https://example.test",
      violations: [{ id: "color-contrast", impact: "serious", nodes: [{}] }],
      passes: [{ id: "html-has-lang" }],
    });
    expect(report.ok).toBe(false);
    expect(report.violationCount).toBe(1);
    expect(report.passCount).toBe(1);
  });

  it("ingests Vitest report into completed execution with artifacts", async () => {
    const { engine } = createPlatformAutomation({
      playwrightDryRun: true,
      includePlaceholders: false,
    });
    const report = {
      success: true,
      tests: [{ title: "unit", status: "passed", duration: 3 }],
    };
    const result = await engine.enqueueAndRun({
      tenantId: "t1",
      providerId: "vitest",
      correlationId: "corr-vitest",
      requestedBy: "user-1",
      target: {
        kind: "custom",
        name: "ci-unit",
        entry: JSON.stringify(report),
        metadata: { changeEventId: "chg-demo-1", domain: "ci" },
      },
    });
    expect(result.state).toBe("completed");
    expect(result.artifacts.length).toBeGreaterThanOrEqual(2);
    expect(result.evidenceRefs.length).toBeGreaterThan(0);
  });

  it("ingests axe summary into completed execution with artifacts", async () => {
    const { engine } = createPlatformAutomation({
      playwrightDryRun: true,
      includePlaceholders: false,
    });
    const report = {
      url: "about:blank",
      violations: [],
      passes: [{ id: "document-title" }],
    };
    const result = await engine.enqueueAndRun({
      tenantId: "t1",
      providerId: "accessibility",
      correlationId: "corr-a11y",
      requestedBy: "user-1",
      target: {
        kind: "custom",
        name: "a11y-scan",
        entry: JSON.stringify(report),
        metadata: { changeEventId: "chg-demo-1", domain: "a11y" },
      },
    });
    expect(result.state).toBe("completed");
    expect(result.resultSummary).toMatch(/0 violations/);
    expect(result.evidenceRefs.length).toBeGreaterThan(0);
  });

  it("normalizes security / k6 / cypress reports", () => {
    expect(normalizeSarifOrFindings({ ok: true, findings: [] }, "Security").ok).toBe(
      true,
    );
    expect(normalizeK6Summary({ ok: true, p95: 80 }).ok).toBe(true);
    expect(
      normalizeTestSuiteReport(
        { success: true, tests: [{ title: "a", status: "passed" }] },
        "Cypress",
      ).ok,
    ).toBe(true);
  });

  it("registers full active matrix with no placeholders", () => {
    const { registry } = createPlatformAutomation({ playwrightDryRun: true });
    const providers = registry.list();
    expect(providers.every((p) => p.status === "active")).toBe(true);
    expect(providers.map((p) => p.providerId).sort()).toEqual(
      [
        "accessibility",
        "appium",
        "codequality",
        "cypress",
        "k6",
        "playwright",
        "rest",
        "security",
        "selenium",
        "visual",
        "vitest",
      ].sort(),
    );
  });

  it("ingests security + k6 + codequality reports", async () => {
    const { engine } = createPlatformAutomation({ playwrightDryRun: true });
    for (const [providerId, report] of [
      ["security", { ok: true, findings: [] }],
      ["k6", { ok: true, p95: 90 }],
      ["codequality", { ok: true, findings: [] }],
    ] as const) {
      const result = await engine.enqueueAndRun({
        tenantId: "t1",
        providerId,
        correlationId: `corr-${providerId}`,
        requestedBy: "user-1",
        target: {
          kind: "custom",
          name: `${providerId}-ingest`,
          entry: JSON.stringify(report),
          metadata: { changeEventId: "chg-demo-1" },
        },
      });
      expect(result.state).toBe("completed");
      expect(result.artifacts.length).toBeGreaterThanOrEqual(2);
    }
  });
});
