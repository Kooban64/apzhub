/**
 * APZADMIN-001 foundation harness — executes architecture audit.
 */
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZADMIN-001 Administration Foundation", () => {
  it("passes foundation architecture audit", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzadmin-001-administration-foundation-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });
});
