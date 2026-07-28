import { describe, expect, it } from "vitest";

import { computeTraceLinkAvailableActions } from "./available-actions";

describe("computeTraceLinkAvailableActions", () => {
  it("allows validate from draft when unrestricted", () => {
    const actions = computeTraceLinkAvailableActions({ lifecycleState: "draft" });
    expect(actions).toContain("validate");
    expect(actions).toContain("updateEndpoint");
    expect(actions).not.toContain("approve");
    expect(actions).not.toContain("retire");
  });

  it("allows approve from validated and blocks validate", () => {
    const actions = computeTraceLinkAvailableActions({ lifecycleState: "validated" });
    expect(actions).toContain("approve");
    expect(actions).toContain("updateEndpoint");
    expect(actions).not.toContain("validate");
  });

  it("allows retire and supersede from approved but not updateEndpoint", () => {
    const actions = computeTraceLinkAvailableActions({ lifecycleState: "approved" });
    expect(actions).toContain("retire");
    expect(actions).toContain("supersede");
    expect(actions).not.toContain("updateEndpoint");
    expect(actions).not.toContain("approve");
  });

  it("returns no actions for retired or superseded links", () => {
    expect(computeTraceLinkAvailableActions({ lifecycleState: "retired" })).toEqual([]);
    expect(computeTraceLinkAvailableActions({ lifecycleState: "superseded" })).toEqual(
      [],
    );
  });

  it("filters actions by explicit permission grants", () => {
    const viewOnly = computeTraceLinkAvailableActions({ lifecycleState: "draft" }, [
      "qep.traceability.trace_links.view",
    ]);
    expect(viewOnly).toEqual([]);

    const validateOnly = computeTraceLinkAvailableActions({ lifecycleState: "draft" }, [
      "qep.traceability.trace_links.validate",
    ]);
    expect(validateOnly).toEqual(["validate"]);

    const wildcard = computeTraceLinkAvailableActions({ lifecycleState: "approved" }, [
      "qep.traceability.*",
    ]);
    expect(wildcard).toContain("retire");
    expect(wildcard).toContain("supersede");
  });
});
