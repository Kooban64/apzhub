import { describe, expect, it } from "vitest";

import { registryError } from "./errors";

describe("registryError", () => {
  it("creates structured registry errors", () => {
    expect(
      registryError("REGISTRY_NOT_FOUND", "missing", { capabilityId: "x" }),
    ).toEqual({
      code: "REGISTRY_NOT_FOUND",
      message: "missing",
      capabilityId: "x",
    });
  });
});
