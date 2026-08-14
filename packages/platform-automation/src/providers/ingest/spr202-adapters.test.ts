import { describe, expect, it } from "vitest";

import { createPlatformAutomation } from "../../sdk/create-automation";
import { normalizeAllureSummary } from "./normalize-allure";
import { normalizeCiCheckReport } from "./normalize-ci-check";
import { normalizeJunitXml } from "./normalize-junit-xml";

describe("SPR-APZQEP-202 adapters", () => {
  it("normalizes JUnit XML", () => {
    const report = normalizeJunitXml(`
      <testsuite name="Demo">
        <testcase name="ok"/>
        <testcase name="bad"><failure>boom</failure></testcase>
      </testsuite>
    `);
    expect(report.ok).toBe(false);
    expect(report.metrics.failed).toBe(1);
    expect(report.metrics.passed).toBe(1);
  });

  it("normalizes Allure summary", () => {
    const report = normalizeAllureSummary({
      statistic: { passed: 3, failed: 0, skipped: 1, total: 4 },
    });
    expect(report.ok).toBe(true);
    expect(report.metrics.passed).toBe(3);
  });

  it("normalizes CI workflow_run conclusion", () => {
    const report = normalizeCiCheckReport({
      workflow_run: {
        name: "CI",
        conclusion: "success",
        html_url: "https://example.test/run/1",
      },
    });
    expect(report.ok).toBe(true);
    expect(String(report.metrics.conclusion)).toBe("success");
  });

  it("ingests JUnit via automation matrix", async () => {
    const { engine } = createPlatformAutomation({
      playwrightDryRun: true,
      includePlaceholders: false,
    });
    const result = await engine.enqueueAndRun({
      tenantId: "t1",
      providerId: "junit",
      correlationId: "corr-junit",
      requestedBy: "user-1",
      target: {
        kind: "custom",
        name: "junit-ci",
        entry: `<testsuite name="A"><testcase name="t1"/></testsuite>`,
        metadata: { changeEventId: "chg-ci-1", domain: "ci" },
      },
    });
    expect(result.state).toBe("completed");
    expect(result.artifacts.length).toBeGreaterThan(0);
  });
});
