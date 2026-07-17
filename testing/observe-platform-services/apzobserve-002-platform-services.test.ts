import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("APZOBSERVE-002 platform services harness", () => {
  it("audit script passes with zero violations", () => {
    const output = execFileSync(
      "node",
      ["scripts/apzobserve-002-platform-services-audit.mjs"],
      { encoding: "utf8", cwd: process.cwd() },
    );
    expect(output).toContain("Violations: 0");
    expect(output).toContain("RESULT: PASS");
  });
});
