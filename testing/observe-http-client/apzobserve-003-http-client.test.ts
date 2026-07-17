/**
 * APZOBSERVE-003 — Observability HTTP client boundary harness.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZOBSERVE-003 Observability HTTP & Typed Client", () => {
  it("passes architecture audit with zero violations", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzobserve-003-observe-http-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("APZOBSERVE-003 architecture audit PASSED");
  });

  it("ships required observe HTTP route entrypoints", () => {
    const routes = [
      "apps/web/app/api/v1/observe/health-checks/route.ts",
      "apps/web/app/api/v1/observe/health-checks/[healthCheckId]/route.ts",
      "apps/web/app/api/v1/observe/diagnostics/route.ts",
      "apps/web/app/api/v1/observe/capabilities/route.ts",
      "apps/web/lib/observe/observe-client.ts",
      "apps/web/lib/api/v1/handlers/observe.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(ROOT, route))).toBe(true);
    }
  });
});
