import { describe, expect, it } from "vitest";

import type { NavigationContribution } from "../interfaces/types";
import {
  assertStableNavigationIds,
  buildNavigationModel,
  NAVIGATION_MODEL_SCHEMA_VERSION,
} from "./platform-navigation-model";

const homeContribution: NavigationContribution = {
  id: "platform-home",
  capabilityId: "platform-home",
  capabilityKind: "module",
  level: "activity-bar",
  workspace: "home",
  label: "Home",
  order: 10,
  permission: "platform.nav.home.view",
  hidden: false,
};

describe("platform navigation model", () => {
  it("builds a schema-versioned navigation model from engine state", () => {
    const model = buildNavigationModel(
      {
        activeWorkspaceId: "home",
        items: [{ ...homeContribution, visible: true, revealed: false, children: [] }],
        groups: [],
        tree: [],
      },
      {
        contributionCount: 1,
        visibleCount: 1,
        hiddenCount: 0,
        permissionFilteredCount: 0,
        duplicateIds: [],
        orphanParents: [],
        activeWorkspaceId: "home",
        groupCount: 0,
      },
    );

    expect(model.schemaVersion).toBe(NAVIGATION_MODEL_SCHEMA_VERSION);
    expect(model.activityBar).toHaveLength(1);
    expect(model.activityBar[0]?.id).toBe("platform-home");
    expect(model.diagnostics.visibleCount).toBe(1);
  });

  it("preserves stable navigation ids", () => {
    const model = buildNavigationModel(
      {
        activeWorkspaceId: "home",
        items: [{ ...homeContribution, visible: true, revealed: false, children: [] }],
        groups: [],
        tree: [],
      },
      {
        contributionCount: 1,
        visibleCount: 1,
        hiddenCount: 0,
        permissionFilteredCount: 0,
        duplicateIds: [],
        orphanParents: [],
        activeWorkspaceId: "home",
        groupCount: 0,
      },
    );

    expect(assertStableNavigationIds(model)).toEqual(["platform-home"]);
  });

  it("includes sidebar slice scoped to active workspace", () => {
    const model = buildNavigationModel(
      {
        activeWorkspaceId: "home",
        items: [
          { ...homeContribution, visible: true, revealed: false, children: [] },
          {
            id: "platform-home-overview",
            capabilityId: "platform-home-overview",
            capabilityKind: "module",
            level: "sidebar",
            workspace: "home",
            label: "Overview",
            order: 10,
            permission: "platform.nav.home.view",
            hidden: false,
            visible: true,
            revealed: false,
            children: [],
          },
        ],
        groups: [],
        tree: [],
      },
      {
        contributionCount: 2,
        visibleCount: 2,
        hiddenCount: 0,
        permissionFilteredCount: 0,
        duplicateIds: [],
        orphanParents: [],
        activeWorkspaceId: "home",
        groupCount: 0,
      },
    );

    expect(model.sidebar.map((item) => item.id)).toEqual(["platform-home-overview"]);
  });
});
