import { describe, expect, it } from "vitest";

import type { NavigationModel } from "../navigation/platform-navigation-model";
import { NAVIGATION_MODEL_SCHEMA_VERSION } from "../navigation/platform-navigation-model";
import { ActivityBarPresentationAdapter } from "./activity-bar-presentation-adapter";

const model: NavigationModel = {
  schemaVersion: NAVIGATION_MODEL_SCHEMA_VERSION,
  activeWorkspaceId: "home",
  items: [
    {
      id: "platform-home",
      capabilityId: "platform-home",
      capabilityKind: "module",
      level: "activity-bar",
      workspace: "home",
      label: "Home",
      order: 10,
    },
    {
      id: "platform-administration",
      capabilityId: "platform-administration",
      capabilityKind: "module",
      level: "activity-bar",
      workspace: "administration",
      label: "Administration",
      order: 20,
    },
  ],
  groups: [],
  tree: [],
  activityBar: [
    {
      id: "platform-home",
      capabilityId: "platform-home",
      capabilityKind: "module",
      level: "activity-bar",
      workspace: "home",
      label: "Home",
      order: 10,
    },
    {
      id: "platform-administration",
      capabilityId: "platform-administration",
      capabilityKind: "module",
      level: "activity-bar",
      workspace: "administration",
      label: "Administration",
      order: 20,
    },
  ],
  sidebar: [],
  diagnostics: {
    contributionCount: 2,
    visibleCount: 2,
    hiddenCount: 0,
    permissionFilteredCount: 0,
    duplicateIds: [],
    orphanParents: [],
    activeWorkspaceId: "home",
    groupCount: 0,
  },
};

describe("ActivityBarPresentationAdapter", () => {
  it("maps navigation model activity bar entries to presentation items", () => {
    const adapter = new ActivityBarPresentationAdapter();
    const items = adapter.adapt(model);

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      id: "platform-home",
      label: "Home",
      active: true,
      ariaLabel: "Home workspace",
    });
    expect(items[1]?.active).toBe(false);
  });
});
