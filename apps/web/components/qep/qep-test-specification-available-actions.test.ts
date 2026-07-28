import { computeQepTestSpecificationAvailableActions } from "@apzhub/qep-contracts";
import { describe, expect, it } from "vitest";

/**
 * APZQEP-ENG-050C — Workbench must never invent availableActions.
 * ADR-0074: rejected must not expose returnToDraft.
 */
describe("APZQEP-ENG-050C Test Specification availableActions contract", () => {
  const all = [
    "qep.specification.create",
    "qep.specification.read",
    "qep.specification.update",
    "qep.specification.review",
    "qep.specification.approve",
    "qep.specification.reject",
    "qep.specification.withdraw",
    "qep.specification.retire",
    "qep.specification.cancel",
    "qep.specification.search",
    "qep.specification.history.view",
  ];

  it("draft exposes updateDraft and submitForReview when permitted", () => {
    const actions = computeQepTestSpecificationAvailableActions("draft", all);
    expect(actions).toContain("updateDraft");
    expect(actions).toContain("submitForReview");
  });

  it("under_review exposes approve and reject", () => {
    const actions = computeQepTestSpecificationAvailableActions("under_review", all);
    expect(actions).toContain("approve");
    expect(actions).toContain("reject");
  });

  it("rejected exposes only withdraw and cancel — not returnToDraft (ADR-0074)", () => {
    const actions = computeQepTestSpecificationAvailableActions("rejected", all);
    expect(actions).toEqual(["withdraw", "cancel"]);
    expect((actions as readonly string[]).includes("returnToDraft")).toBe(false);
  });

  it("approved exposes supersede and retire", () => {
    const actions = computeQepTestSpecificationAvailableActions("approved", all);
    expect(actions).toContain("supersede");
    expect(actions).toContain("retire");
  });

  it("terminal superseded exposes no actions", () => {
    expect(computeQepTestSpecificationAvailableActions("superseded", all)).toEqual([]);
  });

  it("respects permission grants", () => {
    expect(
      computeQepTestSpecificationAvailableActions("draft", ["qep.specification.read"]),
    ).toEqual([]);
  });
});
