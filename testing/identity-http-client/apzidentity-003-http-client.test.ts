import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("APZIDENTITY-003 Identity HTTP & Typed Client", () => {
  it("passes architecture audit with zero violations", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzidentity-003-identity-http-audit.mjs")],
      { encoding: "utf8", cwd: ROOT },
    );
    expect(output).toContain("APZIDENTITY-003 architecture audit PASSED");
  });

  it("ships required identity HTTP route entrypoints", () => {
    const required = [
      "apps/web/lib/api/v1/handlers/identity.ts",
      "apps/web/lib/api/v1/schemas/identity.ts",
      "apps/web/lib/identity/identity-client.ts",
      "apps/web/lib/identity/index.ts",
      "apps/web/app/api/v1/identity/users/route.ts",
      "apps/web/app/api/v1/identity/management-capabilities/route.ts",
      "apps/web/app/api/v1/identity/health/route.ts",
      "scripts/apzidentity-003-identity-http-audit.mjs",
    ];
    for (const path of required) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
    }
  });
});
