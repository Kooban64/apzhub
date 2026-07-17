/**
 * Harness — APZADMIN-002 platform services audit.
 */

import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

describe("APZADMIN-002 administration platform services harness", () => {
  it("passes architecture audit", () => {
    const script = join(
      process.cwd(),
      "scripts/apzadmin-002-platform-services-audit.mjs",
    );
    const output = execFileSync(process.execPath, [script], {
      encoding: "utf8",
      cwd: process.cwd(),
    });
    expect(output).toContain("RESULT: PASS");
  });
});
