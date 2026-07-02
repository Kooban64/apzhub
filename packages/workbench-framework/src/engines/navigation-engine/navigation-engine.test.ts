import { describe, expect, it } from "vitest";

import type { NavigationContribution } from "../../interfaces/types";
import { createAllowAllWorkbenchPermissionAdapter } from "../../permission/allow-all-adapter";
import { createNavigationEngine } from "./navigation-engine";

const homeContribution: NavigationContribution = {
  id: "platform-home",
  capabilityId: "platform-home",
  capabilityKind: "module",
  level: "activity-bar",
  workspace: "home",
  label: "Home",
  icon: "home",
  route: "/workspace/home",
  order: 10,
  permission: "platform.nav.home.view",
  hidden: false,
};

const adminContribution: NavigationContribution = {
  id: "platform-administration",
  capabilityId: "platform-administration",
  capabilityKind: "module",
  level: "activity-bar",
  workspace: "administration",
  label: "Administration",
  order: 20,
  permission: "platform.nav.administration.view",
  hidden: false,
};

const sidebarContribution: NavigationContribution = {
  id: "platform-home-overview",
  capabilityId: "platform-home-overview",
  capabilityKind: "module",
  level: "sidebar",
  workspace: "home",
  parent: "platform-home",
  label: "Overview",
  order: 10,
  permission: "platform.nav.home.view",
  hidden: false,
};

describe("NavigationEngine", () => {
  it("builds manifest-driven navigation without hardcoded entries", () => {
    const engine = createNavigationEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      contributions: [homeContribution, adminContribution, sidebarContribution],
    });

    const state = engine.getState();
    expect(state.items).toHaveLength(3);
    expect(state.activeWorkspaceId).toBe("home");
    expect(engine.getActivityBarItems()).toHaveLength(2);
    expect(engine.getSidebarItems("home")).toHaveLength(1);
  });

  it("orders activity bar items by manifest order", () => {
    const engine = createNavigationEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      contributions: [adminContribution, homeContribution],
    });

    const items = engine.getActivityBarItems();
    expect(items.map((item) => item.id)).toEqual([
      "platform-home",
      "platform-administration",
    ]);
  });

  it("groups navigation by level and workspace", () => {
    const engine = createNavigationEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      contributions: [homeContribution, sidebarContribution],
    });

    const groups = engine.getGroupsForLevel("sidebar");
    expect(groups).toHaveLength(1);
    expect(groups[0]?.workspace).toBe("home");
    expect(groups[0]?.items).toHaveLength(1);
  });

  it("builds parent/child tree from manifest parent references", () => {
    const engine = createNavigationEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      contributions: [homeContribution, sidebarContribution],
    });

    expect(engine.getState().tree[0]?.children[0]?.id).toBe("platform-home-overview");
  });

  it("filters items by permission adapter", () => {
    const engine = createNavigationEngine({
      permissionAdapter: {
        getContext: () => null,
        can: (permission) => permission !== "platform.nav.administration.view",
        filter: (items) =>
          items.filter(
            (item) => item.permission !== "platform.nav.administration.view",
          ),
      },
      contributions: [homeContribution, adminContribution],
    });

    expect(engine.getState().items).toHaveLength(1);
    expect(engine.getDiagnostics().permissionFilteredCount).toBe(1);
  });

  it("reveals hidden navigation items via revealNavigationItem request", () => {
    const hiddenItem: NavigationContribution = {
      ...adminContribution,
      hidden: true,
    };

    const engine = createNavigationEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      contributions: [homeContribution, hiddenItem],
    });

    expect(engine.getState().items).toHaveLength(1);
    const result = engine.handleRequest({
      type: "revealNavigationItem",
      navId: "platform-administration",
    });
    expect(result.ok).toBe(true);
    expect(engine.getState().items).toHaveLength(2);
  });

  it("reports navigation diagnostics", () => {
    const duplicate: NavigationContribution = {
      ...homeContribution,
      capabilityId: "dup",
    };
    const engine = createNavigationEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      contributions: [homeContribution, duplicate],
    });

    const diagnostics = engine.getDiagnostics();
    expect(diagnostics.duplicateIds).toContain("platform-home");
    expect(diagnostics.visibleCount).toBe(1);
  });

  it("exposes platform navigation model with stable ids", () => {
    const engine = createNavigationEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      contributions: [homeContribution, adminContribution],
    });

    const model = engine.getNavigationModel();
    expect(model.schemaVersion).toBe("1.0");
    expect(model.activityBar.map((item) => item.id)).toEqual([
      "platform-home",
      "platform-administration",
    ]);
    expect(model.diagnostics.contributionCount).toBe(2);
  });
});
