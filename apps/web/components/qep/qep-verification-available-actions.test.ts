import { computeQepVerificationAvailableActions } from "@apzhub/qep-contracts";
import { describe, expect, it } from "vitest";

/**
 * APZQEP-ENG-040C — Workbench must never invent availableActions.
 * This contract test locks the server-side matrix the UI consumes.
 */
describe("APZQEP-ENG-040C Verification availableActions contract", () => {
  const all = [
    "qep.verification.view",
    "qep.verification.create",
    "qep.verification.request",
    "qep.verification.assign",
    "qep.verification.start",
    "qep.verification.complete",
    "qep.verification.reject",
    "qep.verification.expire",
    "qep.verification.withdraw",
    "qep.verification.supersede",
    "qep.verification.cancel",
    "qep.verification.retire",
    "qep.verification.modify",
    "qep.verification.history.view",
    "qep.verification.search",
  ];

  it("draft exposes request when permitted", () => {
    expect(computeQepVerificationAvailableActions("draft", all)).toContain("request");
  });

  it("requested exposes assign and start", () => {
    const actions = computeQepVerificationAvailableActions("requested", all);
    expect(actions).toContain("assign");
    expect(actions).toContain("start");
  });

  it("in_progress exposes complete and reject", () => {
    const actions = computeQepVerificationAvailableActions("in_progress", all);
    expect(actions).toContain("complete");
    expect(actions).toContain("reject");
  });

  it("terminal withdrawn exposes no actions", () => {
    expect(computeQepVerificationAvailableActions("withdrawn", all)).toEqual([]);
  });

  it("respects permission grants", () => {
    expect(computeQepVerificationAvailableActions("draft", ["qep.verification.view"])).toEqual(
      [],
    );
  });
});
