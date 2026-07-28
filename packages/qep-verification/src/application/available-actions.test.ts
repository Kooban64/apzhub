import { describe, expect, it } from "vitest";

import { computeVerificationAvailableActions } from "./available-actions";

describe("computeVerificationAvailableActions", () => {
  it("allows request from draft when unrestricted", () => {
    const actions = computeVerificationAvailableActions({ status: "draft" });
    expect(actions).toContain("request");
    expect(actions).toContain("updateMetadata");
    expect(actions).not.toContain("assign");
  });

  it("allows assign and start from requested", () => {
    const actions = computeVerificationAvailableActions({ status: "requested" });
    expect(actions).toContain("assign");
    expect(actions).toContain("start");
    expect(actions).toContain("cancel");
    expect(actions).not.toContain("request");
  });

  it("allows start from assigned", () => {
    const actions = computeVerificationAvailableActions({ status: "assigned" });
    expect(actions).toContain("start");
    expect(actions).not.toContain("assign");
  });

  it("allows complete and reject from in_progress", () => {
    const actions = computeVerificationAvailableActions({ status: "in_progress" });
    expect(actions).toContain("complete");
    expect(actions).toContain("reject");
    expect(actions).toContain("updatePriority");
  });

  it("allows expire, supersede, retire, withdraw from verified", () => {
    const actions = computeVerificationAvailableActions({ status: "verified" });
    expect(actions).toContain("expire");
    expect(actions).toContain("supersede");
    expect(actions).toContain("retire");
    expect(actions).toContain("withdraw");
    expect(actions).not.toContain("updateMetadata");
  });

  it("allows supersede, retire, and re-request from rejected", () => {
    const actions = computeVerificationAvailableActions({ status: "rejected" });
    expect(actions).toContain("supersede");
    expect(actions).toContain("retire");
    expect(actions).toContain("request");
  });

  it("returns no actions for terminal states", () => {
    expect(computeVerificationAvailableActions({ status: "withdrawn" })).toEqual([]);
    expect(computeVerificationAvailableActions({ status: "cancelled" })).toEqual([]);
    expect(computeVerificationAvailableActions({ status: "retired" })).toEqual([]);
    expect(computeVerificationAvailableActions({ status: "superseded" })).toEqual([]);
  });

  it("filters actions by explicit permission grants", () => {
    const viewOnly = computeVerificationAvailableActions(
      { status: "draft" },
      ["qep.verification.view"],
    );
    expect(viewOnly).toEqual([]);

    const requestOnly = computeVerificationAvailableActions(
      { status: "draft" },
      ["qep.verification.request"],
    );
    expect(requestOnly).toEqual(["request"]);

    const wildcard = computeVerificationAvailableActions(
      { status: "verified" },
      ["qep.verification.*"],
    );
    expect(wildcard).toContain("retire");
    expect(wildcard).toContain("supersede");
  });
});
