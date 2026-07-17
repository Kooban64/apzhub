/**
 * APZCONFIG-003 — Configuration HTTP client boundary harness.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZCONFIG-003 Configuration HTTP & Typed Client", () => {
  it("passes architecture audit with zero violations", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzconfig-003-configuration-http-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("APZCONFIG-003 architecture audit PASSED");
  });

  it("ships required configuration HTTP route entrypoints", () => {
    const routes = [
      "apps/web/app/api/v1/configuration/configurations/route.ts",
      "apps/web/app/api/v1/configuration/configurations/[configurationId]/route.ts",
      "apps/web/app/api/v1/configuration/validation/route.ts",
      "apps/web/app/api/v1/configuration/validation/rules/route.ts",
      "apps/web/app/api/v1/configuration/capabilities/route.ts",
      "apps/web/lib/configuration/configuration-client.ts",
      "apps/web/lib/api/v1/handlers/configuration.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(ROOT, route))).toBe(true);
    }
  });
});
