import { describe, expect, it } from "vitest";

import { computePlanAvailableActions } from "./available-actions";

describe("computePlanAvailableActions", () => {
  it("allows content edits and submitForReview from draft when unrestricted", () => {
    const actions = computePlanAvailableActions({ status: "draft" });
    expect(actions).toContain("updateContent");
    expect(actions).toContain("addItem");
    expect(actions).toContain("submitForReview");
    expect(actions).not.toContain("approve");
  });

  it("allows approve and reject from review", () => {
    const actions = computePlanAvailableActions({ status: "review" });
    expect(actions).toContain("approve");
    expect(actions).toContain("reject");
    expect(actions).not.toContain("updateContent");
  });

  it("allows returnToDraft only from rejected", () => {
    const actions = computePlanAvailableActions({ status: "rejected" });
    expect(actions).toContain("returnToDraft");
    expect(actions).toContain("updateContent");
  });

  it("allows markReady from approved and startExecution from ready", () => {
    expect(computePlanAvailableActions({ status: "approved" })).toContain("markReady");
    expect(computePlanAvailableActions({ status: "ready" })).toContain(
      "startExecution",
    );
  });

  it("allows complete from in_execution and archive from completed", () => {
    expect(computePlanAvailableActions({ status: "in_execution" })).toContain(
      "complete",
    );
    expect(computePlanAvailableActions({ status: "completed" })).toContain("archive");
  });

  it("allows supersede from approved, ready, and completed", () => {
    expect(computePlanAvailableActions({ status: "approved" })).toContain("supersede");
    expect(computePlanAvailableActions({ status: "ready" })).toContain("supersede");
    expect(computePlanAvailableActions({ status: "completed" })).toContain("supersede");
    expect(computePlanAvailableActions({ status: "draft" })).not.toContain("supersede");
  });

  it("returns no mutating actions for terminal states beyond clone", () => {
    for (const status of ["archived", "cancelled", "superseded"] as const) {
      const actions = computePlanAvailableActions({ status });
      expect(actions).not.toContain("updateContent");
      expect(actions).not.toContain("cancel");
      expect(actions).toContain("clone");
    }
  });

  it("filters actions by explicit permission grants", () => {
    const readOnly = computePlanAvailableActions({ status: "draft" }, [
      "qep.plan.read",
    ]);
    expect(readOnly).toEqual([]);

    const submitOnly = computePlanAvailableActions({ status: "draft" }, [
      "qep.plan.submit",
    ]);
    expect(submitOnly).toEqual(["submitForReview"]);

    const wildcard = computePlanAvailableActions({ status: "approved" }, [
      "qep.plan.*",
    ]);
    expect(wildcard).toContain("markReady");
    expect(wildcard).toContain("supersede");
  });
});
