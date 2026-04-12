import { describe, expect, it } from "vitest";

import {
  defaultWorkspaceConfig,
  isModuleEnabled,
  isServiceAllowed,
  minimalEmptyWorkspaceConfig,
  workspaceConfigSchema,
} from "@/lib/workspace/workspace-config";

describe("workspaceConfigSchema", () => {
  it("parses defaults and helpers respect allowlists", () => {
    const cfg = workspaceConfigSchema.parse(defaultWorkspaceConfig);
    expect(isModuleEnabled(cfg, "launcher")).toBe(true);
    expect(isServiceAllowed(cfg, "mail")).toBe(true);
    expect(isServiceAllowed(cfg, "plane")).toBe(true);
    expect(isServiceAllowed(cfg, "drive")).toBe(true);
    expect(isServiceAllowed(cfg, "chat")).toBe(true);
  });

  it("rejects featured services outside the visible set when visible is explicit", () => {
    expect(() =>
      workspaceConfigSchema.parse({
        enabledModules: ["launcher"],
        allowedServices: ["calendar", "mail"],
        launcherVisibleServiceIds: ["calendar"],
        launcherFeaturedServiceIds: ["mail"],
        rightPanelTabs: ["calendar"],
        launcherMaxVisible: 4,
      }),
    ).toThrow();
  });

  it("minimal empty config stays valid and sparse", () => {
    expect(minimalEmptyWorkspaceConfig.enabledModules).toEqual(["today_summary", "launcher"]);
    expect(minimalEmptyWorkspaceConfig.allowedServices).toEqual(["calendar"]);
  });
});
