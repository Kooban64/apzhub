import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("APZMETRICS-001 foundation audit harness", () => {
  it("passes architecture / dependency / boundary audit", () => {
    const output = execFileSync(
      "node",
      ["scripts/apzmetrics-001-metrics-foundation-audit.mjs"],
      { encoding: "utf8", cwd: process.cwd() },
    );
    expect(output).toContain("Violations: 0");
    expect(output).toContain("RESULT: PASS");
  });
});
