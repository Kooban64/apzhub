import { describe, expect, it } from "vitest";

import { dependencyGraphError } from "./errors";

describe("dependencyGraphError", () => {
  it("creates a structured error with optional fields", () => {
    const error = dependencyGraphError("MISSING_DEPENDENCY", "missing dep", {
      capabilityId: "a",
      dependencyId: "b",
    });

    expect(error).toEqual({
      code: "MISSING_DEPENDENCY",
      message: "missing dep",
      capabilityId: "a",
      dependencyId: "b",
    });
  });
});
