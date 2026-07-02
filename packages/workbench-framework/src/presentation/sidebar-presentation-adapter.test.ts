import { describe, expect, it } from "vitest";

import type { NavigationModel } from "../navigation/platform-navigation-model";
import { NAVIGATION_MODEL_SCHEMA_VERSION } from "../navigation/platform-navigation-model";
import { SidebarPresentationAdapter } from "./sidebar-presentation-adapter";

const model: NavigationModel = {
  schemaVersion: NAVIGATION_MODEL_SCHEMA_VERSION,
  activeWorkspaceId: "home",
  items: [],
  groups: [],
  tree: [],
  activityBar: [],
  sidebar: [
    {
      id: "platform-home-overview",
      capabilityId: "platform-home-overview",
      capabilityKind: "module",
      level: "sidebar",
      workspace: "home",
      label: "Overview",
      route: "/workspace/home/overview",
      order: 10,
      parent: "platform-home",
    },
  ],
  diagnostics: {
    contributionCount: 1,
    visibleCount: 1,
    hiddenCount: 0,
    permissionFilteredCount: 0,
    duplicateIds: [],
    orphanParents: [],
    activeWorkspaceId: "home",
    groupCount: 0,
  },
};

describe("SidebarPresentationAdapter", () => {
  it("maps sidebar navigation model entries for the active workspace", () => {
    const adapter = new SidebarPresentationAdapter();
    const items = adapter.adapt(model);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "platform-home-overview",
      label: "Overview",
      route: "/workspace/home/overview",
      workspace: "home",
      parent: "platform-home",
    });
  });
});
