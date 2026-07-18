import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("APZMETRICS-002 platform services audit harness", () => {
  it("passes architecture / dependency / boundary audit", () => {
    const output = execFileSync(
      "node",
      ["scripts/apzmetrics-002-metrics-platform-services-audit.mjs"],
      { encoding: "utf8", cwd: process.cwd() },
    );
    expect(output).toContain("Violations: 0");
    expect(output).toContain("RESULT: PASS");
  });
});
