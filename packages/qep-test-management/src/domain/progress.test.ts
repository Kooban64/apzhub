import { describe, expect, it } from "vitest";

import {
  deriveExecutionType,
  deriveWorkspaceSessionResult,
  mapEngineStatusToProductStatus,
  mapOutcomeToProductResult,
} from "./progress";

describe("Phase 4 status/result composition", () => {
  it("does not map operational completed status into not_run result", () => {
    expect(mapOutcomeToProductResult("completed")).toBe("not_run");
    expect(mapEngineStatusToProductStatus("completed")).toBe("completed");
    expect(
      deriveWorkspaceSessionResult({ status: "completed", passed: 4, failed: 1 }),
    ).toBe("fail");
    expect(
      deriveWorkspaceSessionResult({ status: "completed", passed: 5, failed: 0 }),
    ).toBe("pass");
    expect(deriveWorkspaceSessionResult({ status: "in_progress", passed: 2 })).toBe(
      "not_run",
    );
  });

  it("maps engine quality outcomes without collapsing them into status", () => {
    expect(mapOutcomeToProductResult("passed")).toBe("pass");
    expect(mapOutcomeToProductResult("failed")).toBe("fail");
    expect(mapOutcomeToProductResult("blocked")).toBe("blocked");
    expect(mapOutcomeToProductResult("in_progress")).toBe("not_run");
  });

  it("derives customer type from mode and capability", () => {
    expect(deriveExecutionType({ mode: "manual" })).toBe("manual");
    expect(deriveExecutionType({ mode: "automated" })).toBe("automated");
    expect(deriveExecutionType({ mode: "imported" })).toBe("automated");
  });
});
