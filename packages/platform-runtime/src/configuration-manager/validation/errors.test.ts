import { describe, expect, it } from "vitest";

import { configurationError } from "./errors";

describe("configurationError", () => {
  it("creates structured configuration errors", () => {
    expect(
      configurationError("CONFIG_MISSING_REQUIRED", "missing workspaceRoot", {
        key: "workspaceRoot",
      }),
    ).toEqual({
      code: "CONFIG_MISSING_REQUIRED",
      message: "missing workspaceRoot",
      key: "workspaceRoot",
    });
  });
});
