import { describe, expect, it } from "vitest";

import {
  assertConfigurationApiPath,
  CONFIGURATION_API_BASE,
  CONFIGURATION_WORKSPACE_BASE,
  configurationSectionPath,
  isConfigurationApiPath,
  isConfigurationRoute,
  resolveConfigurationSection,
} from "./routes";

describe("configuration routes", () => {
  it("identifies configuration API paths", () => {
    expect(isConfigurationApiPath(CONFIGURATION_API_BASE)).toBe(true);
    expect(isConfigurationApiPath(`${CONFIGURATION_API_BASE}/configurations`)).toBe(
      true,
    );
    expect(isConfigurationApiPath("/api/v1/notifications")).toBe(false);
  });

  it("rejects paths outside configuration base", () => {
    expect(() => assertConfigurationApiPath("/api/v1/projects")).toThrow(
      /only call/,
    );
  });

  it("resolves workspace sections", () => {
    expect(isConfigurationRoute(CONFIGURATION_WORKSPACE_BASE)).toBe(true);
    expect(resolveConfigurationSection("/workspace/configuration")).toBe(
      "overview",
    );
    expect(
      resolveConfigurationSection("/workspace/configuration/versions"),
    ).toBe("versions");
    expect(
      resolveConfigurationSection("/workspace/configuration/unknown"),
    ).toBe("overview");
    expect(configurationSectionPath("diagnostics")).toBe(
      "/workspace/configuration/diagnostics",
    );
  });
});
