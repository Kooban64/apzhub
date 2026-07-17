/**
 * APZIDENTITY-001 — Identity Administration foundation certification harness.
 */
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZIDENTITY-001 Identity Foundation", () => {
  it("passes foundation architecture audit", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzidentity-001-identity-foundation-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });
});
