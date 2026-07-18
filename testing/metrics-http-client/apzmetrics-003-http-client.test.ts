/**
 * APZMETRICS-003 — Metrics HTTP client boundary harness.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZMETRICS-003 Metrics HTTP & Typed Client", () => {
  it("passes architecture audit with zero violations", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzmetrics-003-metrics-http-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("APZMETRICS-003 architecture audit PASSED");
  });

  it("ships required metrics HTTP route entrypoints", () => {
    const routes = [
      "apps/web/app/api/v1/metrics/metrics/route.ts",
      "apps/web/app/api/v1/metrics/metrics/[metricId]/route.ts",
      "apps/web/app/api/v1/metrics/kpis/route.ts",
      "apps/web/app/api/v1/metrics/diagnostics/health/route.ts",
      "apps/web/app/api/v1/metrics/capabilities/route.ts",
      "apps/web/lib/metrics/metrics-client.ts",
      "apps/web/lib/api/v1/handlers/metrics.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(ROOT, route))).toBe(true);
    }
  });
});
