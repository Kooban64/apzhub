/**
 * APZCONFIG-002 platform services harness — executes architecture audit.
 */
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZCONFIG-002 Configuration Platform Services", () => {
  it("passes platform services architecture audit", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzconfig-002-platform-services-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });
});
