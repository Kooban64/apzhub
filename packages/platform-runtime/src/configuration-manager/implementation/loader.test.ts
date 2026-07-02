import { afterEach, describe, expect, it } from "vitest";

import { collectUnknownOverrideKeys, mergeConfiguration } from "./loader";

describe("mergeConfiguration", () => {
  afterEach(() => {
    delete process.env.APZHUB_PLATFORM_VERSION;
  });

  it("merges defaults and overrides", () => {
    const merged = mergeConfiguration("/tmp/base", {
      workspaceRoot: "/tmp/override",
      platformVersion: "1.0.0",
    });

    expect(merged.configuration.platformVersion).toBe("1.0.0");
    expect(merged.sources).toEqual(["defaults", "overrides"]);
  });

  it("includes environment source without overrides", () => {
    process.env.APZHUB_PLATFORM_VERSION = "2.0.0";

    const merged = mergeConfiguration("/tmp/base", {});

    expect(merged.sources).toEqual(["defaults", "environment"]);
    expect(merged.configuration.platformVersion).toBe("2.0.0");
  });

  it("collects unknown override keys", () => {
    expect(collectUnknownOverrideKeys({ workspaceRoot: "/tmp", extra: true })).toEqual([
      "extra",
    ]);
  });
});
