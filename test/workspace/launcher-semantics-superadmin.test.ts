import { describe, expect, it } from "vitest";

import {
  effectiveLauncherVisible,
  effectiveLauncherVisibleForSubject,
} from "@/lib/workspace/launcher-semantics";
import { workspaceConfigSchema } from "@/lib/workspace/workspace-config";

describe("effectiveLauncherVisibleForSubject", () => {
  const cfg = workspaceConfigSchema.parse({
    enabledModules: ["launcher"],
    allowedServices: ["mail", "calendar", "plane", "paperless"],
    launcherVisibleServiceIds: ["mail", "calendar"],
    launcherFeaturedServiceIds: ["mail"],
    rightPanelTabs: ["mail"],
    launcherMaxVisible: 8,
  });

  it("returns curated launcher list for normal users", () => {
    expect(effectiveLauncherVisible(cfg)).toEqual(["mail", "calendar"]);
    expect(effectiveLauncherVisibleForSubject(cfg, "user")).toEqual(["mail", "calendar"]);
  });

  it("returns all tenant-allowed services for superadmin", () => {
    expect(effectiveLauncherVisibleForSubject(cfg, "superadmin")).toEqual([
      "mail",
      "calendar",
      "plane",
      "paperless",
    ]);
  });
});
