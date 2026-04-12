import { describe, expect, it } from "vitest";

import { readbackSnippetFromResult, verificationJsonFromResult } from "@/lib/provisioning/verification/normalize";

describe("verificationJsonFromResult", () => {
  it("merges job fields when payload omits them", () => {
    const j = verificationJsonFromResult(
      {
        outcome: "success",
        verificationPayload: { connectorId: "x", observedRole: "r1" },
      },
      { serviceId: "mail", userId: "u-1", jobType: "grant" },
    );
    expect(j?.serviceId).toBe("mail");
    expect(j?.userId).toBe("u-1");
    expect(j?.jobType).toBe("grant");
    expect(j?.outcome).toBe("success");
  });

  it("returns null when no payload and nothing to merge", () => {
    expect(verificationJsonFromResult({ outcome: "terminal_failure" })).toBeNull();
  });
});

describe("readbackSnippetFromResult", () => {
  it("truncates large payloads", () => {
    const big = "x".repeat(500);
    const s = readbackSnippetFromResult({
      outcome: "success",
      verificationPayload: { data: big },
    });
    expect(s).toBeDefined();
    expect(s!.length).toBeLessThanOrEqual(401);
    expect(s!.endsWith("…")).toBe(true);
  });
});
