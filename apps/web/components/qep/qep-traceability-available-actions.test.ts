import { describe, expect, it } from "vitest";

import { computeQepTraceLinkAvailableActions } from "@apzhub/qep-contracts";

/**
 * Contract: Workbench must map only server-style availableActions.
 * This mirrors computeQepTraceLinkAvailableActions used by the API adapter.
 */
describe("QepTraceLink availableActions contract (APZQEP-ENG-030C)", () => {
  it("draft + validate permission yields validate and endpoint updates", () => {
    const actions = computeQepTraceLinkAvailableActions("draft", [
      "qep.traceability.trace_links.validate",
      "qep.traceability.trace_links.modify",
    ]);
    expect(actions).toContain("validate");
    expect(actions).toContain("updateEndpoint");
    expect(actions).not.toContain("approve");
    expect(actions).not.toContain("retire");
  });

  it("validated + approve permission yields approve and blocks validate", () => {
    const actions = computeQepTraceLinkAvailableActions("validated", [
      "qep.traceability.trace_links.approve",
      "qep.traceability.trace_links.modify",
    ]);
    expect(actions).toContain("approve");
    expect(actions).toContain("updateEndpoint");
    expect(actions).not.toContain("validate");
  });

  it("approved yields retire and supersede but not updateEndpoint or approve", () => {
    const actions = computeQepTraceLinkAvailableActions("approved", [
      "qep.traceability.trace_links.retire",
      "qep.traceability.trace_links.supersede",
      "qep.traceability.trace_links.modify",
    ]);
    expect(actions).toContain("retire");
    expect(actions).toContain("supersede");
    expect(actions).not.toContain("updateEndpoint");
    expect(actions).not.toContain("approve");
  });

  it("returns no actions for retired or superseded trace links", () => {
    expect(computeQepTraceLinkAvailableActions("retired")).toEqual([]);
    expect(computeQepTraceLinkAvailableActions("superseded")).toEqual([]);
  });

  it("view-only permissions yield no actions", () => {
    const actions = computeQepTraceLinkAvailableActions("draft", [
      "qep.traceability.trace_links.view",
    ]);
    expect(actions).toEqual([]);
  });
});
