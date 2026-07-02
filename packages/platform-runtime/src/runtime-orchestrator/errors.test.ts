import { describe, expect, it } from "vitest";

import { orchestratorError } from "./errors";

describe("orchestratorError", () => {
  it("creates structured orchestrator errors", () => {
    expect(
      orchestratorError("ORCHESTRATOR_STARTUP_FAILED", "startup failed", {
        step: "discovery",
        subsystem: "discovery-engine",
      }),
    ).toEqual({
      code: "ORCHESTRATOR_STARTUP_FAILED",
      message: "startup failed",
      step: "discovery",
      subsystem: "discovery-engine",
    });
  });
});
