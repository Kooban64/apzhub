/**
 * APZMETRICS-006 — Metrics wave closeout certification harness.
 * Docs/governance only — no product behaviour changes.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZMETRICS-006 Metrics Wave Closeout", () => {
  it("passes wave closeout audit (0 violations)", () => {
    const script = join(ROOT, "scripts/apzmetrics-006-metrics-wave-closeout-audit.mjs");
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("retains frozen package versions", () => {
    const versions: Record<string, string> = {
      "packages/metrics-contracts/package.json": "0.2.0",
      "packages/metrics-core/package.json": "0.2.0",
      "packages/metrics-persistence/package.json": "0.1.0",
      "packages/platform-services/package.json": "0.26.1",
    };
    for (const [path, expected] of Object.entries(versions)) {
      const actual = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(actual, path).toBe(expected);
    }
  });

  it("ships freeze notice, reference standard, and recommends APZSEARCH-016 only", () => {
    const freeze = readFileSync(
      join(ROOT, "docs/architecture/APZHUB-Metrics-Architecture-Freeze-Notice.md"),
      "utf8",
    );
    expect(freeze).toMatch(/frozen/i);
    const standard = readFileSync(
      join(ROOT, "docs/architecture/APZHUB-Metrics-Reference-Standard.md"),
      "utf8",
    );
    expect(standard).toMatch(/Reference Standard/i);
    expect(standard).toMatch(/System of Record|canonical/i);
    const completion = readFileSync(
      join(ROOT, "docs/sprint/APZMETRICS-006-completion-report.md"),
      "utf8",
    );
    expect(completion).toContain("PRODUCTION_READY_WITH_LIMITATIONS");
    expect(completion).toContain("APZSEARCH-016");
    expect(completion).toMatch(/do not implement/i);
    expect(completion).toMatch(
      /APZSEARCH-001.*already complete|already complete.*APZSEARCH-001/i,
    );
  });

  it("keeps execution and provider routes absent at freeze", () => {
    for (const omitted of [
      "apps/web/app/api/v1/metrics/prometheus",
      "apps/web/app/api/v1/metrics/grafana",
      "apps/web/app/api/v1/metrics/execute",
      "apps/web/app/api/v1/metrics/calculate",
      "apps/web/app/api/v1/metrics/scrape",
      "apps/web/app/api/v1/metrics/ingest",
      "apps/web/app/api/v1/metrics/analytics",
      "apps/web/app/workspace/metrics",
    ]) {
      expect(existsSync(join(ROOT, omitted)), omitted).toBe(false);
    }
  });

  it("ships operational readiness and future guide; Observability remains separate", () => {
    expect(
      existsSync(
        join(ROOT, "docs/guides/APZHUB-Metrics-Operational-Readiness-Guide.md"),
      ),
    ).toBe(true);
    expect(
      existsSync(join(ROOT, "docs/developer/APZHUB-Future-Metrics-Platform-Guide.md")),
    ).toBe(true);
    const metricsRoutes = readFileSync(
      join(ROOT, "apps/web/lib/metrics/routes.ts"),
      "utf8",
    );
    expect(metricsRoutes).toContain("/workspace/metrics");
    const observeManifest = readFileSync(
      join(
        ROOT,
        "packages/workbench-framework/manifests/platform-observability/module.yaml",
      ),
      "utf8",
    );
    expect(observeManifest).toContain("/workspace/observability");
  });
});
