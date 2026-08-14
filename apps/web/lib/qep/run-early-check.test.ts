import { describe, expect, it } from "vitest";

describe("F13 run-early-check policy", () => {
  it("source must not mutate certification", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const source = await fs.readFile(
      path.join(process.cwd(), "apps/web/lib/qep/run-early-check.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/recordHumanCertificationDecision/);
    expect(source).not.toMatch(/evaluateChangeCertification/);
    expect(source).toMatch(/F13_ASSIST_ORIGIN/);
    expect(source).toMatch(/autoCertified: false/);
    expect(source).toMatch(/runVerificationPacksForChange/);
  });
});

describe("F13 early-check routes", () => {
  it("builds deep links", async () => {
    const { QEP_EARLY_CHECK_ROUTES, isQepEarlyCheckRoute } =
      await import("./early-check-routes");
    expect(QEP_EARLY_CHECK_ROUTES.byChange("chg-1")).toContain("changeEventId=chg-1");
    expect(isQepEarlyCheckRoute("/workspace/qep/early-check")).toBe(true);
    expect(isQepEarlyCheckRoute("/workspace/qep/quality-journey")).toBe(false);
  });
});
