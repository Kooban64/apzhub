import { describe, expect, it } from "vitest";

import { canStartWorkflowRuns, canStartWorkflowRunsWhenReady } from "./permissions";

describe("workflow permissions — execute honesty (WF-P1-02)", () => {
  it("grants start permission independently of readiness", () => {
    expect(canStartWorkflowRuns(["workflow.runs.start"])).toBe(true);
    expect(canStartWorkflowRuns(["workflow.view"])).toBe(false);
  });

  it("hides start when provider execute is unsupported", () => {
    expect(
      canStartWorkflowRunsWhenReady(["workflow.runs.start"], {
        providerExecuteSupported: false,
      }),
    ).toBe(false);
  });

  it("hides start when readiness is unknown", () => {
    expect(canStartWorkflowRunsWhenReady(["workflow.runs.start"], undefined)).toBe(
      false,
    );
  });

  it("allows start only when permission and provider execute are both true", () => {
    expect(
      canStartWorkflowRunsWhenReady(["workflow.runs.start"], {
        providerExecuteSupported: true,
      }),
    ).toBe(true);
    expect(
      canStartWorkflowRunsWhenReady(["workflow.view"], {
        providerExecuteSupported: true,
      }),
    ).toBe(false);
  });
});
