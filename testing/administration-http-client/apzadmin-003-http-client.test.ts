import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("APZADMIN-003 Administration HTTP & Typed Client", () => {
  it("passes architecture audit with zero violations", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzadmin-003-administration-http-audit.mjs")],
      { encoding: "utf8", cwd: ROOT },
    );
    expect(output).toContain("APZADMIN-003 architecture audit PASSED");
  });

  it("ships required administration HTTP route entrypoints", () => {
    const required = [
      "apps/web/lib/api/v1/handlers/administration.ts",
      "apps/web/lib/api/v1/schemas/administration.ts",
      "apps/web/lib/administration/administration-client.ts",
      "apps/web/lib/administration/index.ts",
      "apps/web/app/api/v1/administration/modules/route.ts",
      "apps/web/app/api/v1/administration/management-capabilities/route.ts",
      "apps/web/app/api/v1/administration/health/route.ts",
      "scripts/apzadmin-003-administration-http-audit.mjs",
    ];
    for (const path of required) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
    }
  });
});
