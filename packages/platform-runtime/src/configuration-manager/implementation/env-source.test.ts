import { afterEach, describe, expect, it } from "vitest";

import { listKnownEnvironmentKeys, readEnvironmentConfiguration } from "./env-source";

describe("readEnvironmentConfiguration", () => {
  afterEach(() => {
    for (const key of listKnownEnvironmentKeys()) {
      delete process.env[key];
    }
  });

  it("reads supported APZHUB environment variables", () => {
    process.env.APZHUB_DISCOVERY_ROOTS = "services, integrations";

    expect(readEnvironmentConfiguration()).toEqual({
      discovery: { roots: ["services", "integrations"] },
    });
  });

  it("reads additional environment variables", () => {
    process.env.APZHUB_PLATFORM_VERSION = "1.2.3";
    process.env.APZHUB_RUNTIME_FAIL_FAST = "true";
    process.env.APZHUB_RUNTIME_MODE = "test";

    expect(readEnvironmentConfiguration()).toEqual({
      platformVersion: "1.2.3",
      failFast: true,
      runtimeMode: "test",
    });
  });

  it("lists known environment keys", () => {
    expect(listKnownEnvironmentKeys()).toContain("APZHUB_WORKSPACE_ROOT");
  });
});
