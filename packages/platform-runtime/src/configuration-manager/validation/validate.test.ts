import { describe, expect, it } from "vitest";

import { createDefaultConfiguration } from "../defaults/defaults";
import { findMissingRequiredValues, validateRuntimeConfiguration } from "./validate";

describe("validateRuntimeConfiguration", () => {
  it("accepts valid configuration", () => {
    const result = validateRuntimeConfiguration(
      createDefaultConfiguration("/tmp/apzhub"),
    );
    expect(result.success).toBe(true);
  });

  it("rejects missing configuration", () => {
    const result = validateRuntimeConfiguration(undefined);
    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe("CONFIG_NOT_LOADED");
  });

  it("rejects empty workspace root", () => {
    const result = validateRuntimeConfiguration({
      ...createDefaultConfiguration("/tmp/apzhub"),
      workspaceRoot: "   ",
    });
    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe("CONFIG_MISSING_REQUIRED");
  });

  it("rejects invalid failFast type", () => {
    const result = validateRuntimeConfiguration({
      ...createDefaultConfiguration("/tmp/apzhub"),
      failFast: "yes" as never,
    });
    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe("CONFIG_INVALID_TYPE");
  });

  it("detects missing required values on partial configuration", () => {
    expect(
      findMissingRequiredValues({
        ...createDefaultConfiguration("/tmp/apzhub"),
        platformVersion: "",
      }),
    ).toContain("platformVersion");
  });
});
