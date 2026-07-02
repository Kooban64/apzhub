import { describe, expect, it, vi } from "vitest";

import type { WorkbenchPermissionAdapter } from "../interfaces/permission-adapter";
import type { ViewDescriptor } from "../interfaces/types";
import { createMemorySessionStore } from "../session/memory-session-store";
import { createEmptySessionPayload } from "../session/workbench-session-payload";
import { createWorkbenchManager } from "./workbench-manager";

describe("DefaultWorkbenchManager", () => {
  it("aggregates engine state slices", () => {
    const manager = createWorkbenchManager();
    const state = manager.getState();

    expect(state.layout.regions.workspace.visible).toBe(true);
    expect(state.panels.sidebar.collapsed).toBe(false);
    expect(state.navigation.activeWorkspaceId).toBe("");
    expect(state.navigation.items).toEqual([]);
    expect(state.session.schemaVersion).toBe("1.0");
    expect(state.session.hydrated).toBe(false);
    expect(state.session.restoreStatus).toBe("none");
    expect(state.selection.mode).toBe("none");
    expect(state.selection.items).toEqual([]);
  });

  it("loads manifest-driven navigation contributions", () => {
    const manager = createWorkbenchManager({
      dependencies: {
        navigationContributions: [
          {
            id: "platform-home",
            capabilityId: "platform-home",
            capabilityKind: "module",
            level: "activity-bar",
            workspace: "home",
            label: "Home",
            order: 10,
            hidden: false,
          },
        ],
      },
    });

    expect(manager.getState().navigation.items).toHaveLength(1);
    expect(manager.getState().navigation.activeWorkspaceId).toBe("home");
  });

  it("routes panel requests to Panel Engine", () => {
    const manager = createWorkbenchManager();
    const result = manager.handleRequest({ type: "closePanel", panelId: "sidebar" });

    expect(result.ok).toBe(true);
    expect(manager.getState().panels.sidebar.collapsed).toBe(true);
  });

  it("coordinates layout visibility when panels open and close", () => {
    const manager = createWorkbenchManager();

    manager.handleRequest({ type: "closePanel", panelId: "sidebar" });
    expect(manager.getState().layout.regions.sidebar.visible).toBe(false);

    manager.handleRequest({ type: "openPanel", panelId: "sidebar" });
    expect(manager.getState().layout.regions.sidebar.visible).toBe(true);
  });

  it("routes openView to View Engine", () => {
    const manager = createWorkbenchManager({
      dependencies: {
        viewDescriptors: [
          {
            viewId: "platform-home",
            capabilityId: "platform-home",
            capabilityKind: "module",
            title: "Home",
            workspace: "home",
            route: "/workspace/home",
            default: true,
          },
        ],
      },
    });

    const result = manager.handleRequest({ type: "openView", viewId: "platform-home" });

    expect(result.ok).toBe(true);
    expect(manager.getViewState().focusedViewId).toBe("platform-home");
  });

  it("activates views from sidebar navigation selection", () => {
    const viewDescriptors: ViewDescriptor[] = [
      {
        viewId: "platform-home",
        capabilityId: "platform-home",
        capabilityKind: "module",
        title: "Home",
        workspace: "home",
        route: "/workspace/home",
        default: true,
      },
      {
        viewId: "platform-home-overview",
        capabilityId: "platform-home-overview",
        capabilityKind: "module",
        title: "Overview",
        workspace: "home",
        route: "/workspace/home/overview",
      },
    ];

    const manager = createWorkbenchManager({
      dependencies: {
        navigationContributions: [
          {
            id: "platform-home",
            capabilityId: "platform-home",
            capabilityKind: "module",
            level: "activity-bar",
            workspace: "home",
            label: "Home",
            order: 10,
            hidden: false,
          },
          {
            id: "platform-home-overview",
            capabilityId: "platform-home-overview",
            capabilityKind: "module",
            level: "sidebar",
            workspace: "home",
            label: "Overview",
            order: 10,
            hidden: false,
          },
        ],
        viewDescriptors,
      },
    });

    const result = manager.selectSidebarNavigationItem("platform-home-overview");
    expect(result.ok).toBe(true);
    expect(manager.getViewState().focusedViewId).toBe("platform-home-overview");
  });

  it("maps routes to view activation", () => {
    const manager = createWorkbenchManager({
      dependencies: {
        navigationContributions: [
          {
            id: "platform-home",
            capabilityId: "platform-home",
            capabilityKind: "module",
            level: "activity-bar",
            workspace: "home",
            label: "Home",
            order: 10,
            hidden: false,
          },
        ],
        viewDescriptors: [
          {
            viewId: "platform-home-overview",
            capabilityId: "platform-home-overview",
            capabilityKind: "module",
            title: "Overview",
            workspace: "home",
            route: "/workspace/home/overview",
          },
        ],
      },
    });

    const result = manager.activateViewForRoute("/workspace/home/overview");
    expect(result.ok).toBe(true);
    expect(manager.getViewState().focusedViewId).toBe("platform-home-overview");
  });

  it("routes setContext to Context Engine", () => {
    const manager = createWorkbenchManager();
    const result = manager.handleRequest({
      type: "setContext",
      contextKey: "demo",
      payload: { id: "1" },
    });

    expect(result.ok).toBe(true);
    expect(manager.getState().context.activeKey).toBe("demo");
    expect(manager.getContextDiagnostics().hasPayload).toBe(true);
  });

  it("routes setSelection to Selection Engine after opening a view", () => {
    const manager = createWorkbenchManager({
      dependencies: {
        viewDescriptors: [
          {
            viewId: "platform-home-overview",
            capabilityId: "platform-home-overview",
            capabilityKind: "module",
            title: "Overview",
            workspace: "home",
            route: "/workspace/home/overview",
          },
        ],
      },
    });

    manager.handleRequest({ type: "openView", viewId: "platform-home-overview" });
    const result = manager.handleRequest({
      type: "setSelection",
      selection: {
        mode: "single",
        items: [{ id: "row-1", kind: "table-row" }],
      },
    });

    expect(result.ok).toBe(true);
    expect(manager.getState().selection.items).toEqual([
      { id: "row-1", kind: "table-row" },
    ]);
    expect(manager.getState().context.selectedItemId).toBe("row-1");
  });

  it("routes revealNavigationItem to Navigation Engine", () => {
    const manager = createWorkbenchManager({
      dependencies: {
        navigationContributions: [
          {
            id: "platform-administration",
            capabilityId: "platform-administration",
            capabilityKind: "module",
            level: "activity-bar",
            workspace: "administration",
            label: "Administration",
            order: 20,
            permission: "platform.nav.administration.view",
            hidden: true,
          },
        ],
      },
    });

    expect(manager.getState().navigation.items).toHaveLength(0);
    const result = manager.handleRequest({
      type: "revealNavigationItem",
      navId: "platform-administration",
    });
    expect(result.ok).toBe(true);
    expect(manager.getState().navigation.items).toHaveLength(1);
  });

  it("rejects requests when permission adapter denies", () => {
    const denyAdapter: WorkbenchPermissionAdapter = {
      getContext: () => ({ userId: "u1", roles: [], permissions: new Set() }),
      can: () => false,
      filter: () => [],
    };

    const manager = createWorkbenchManager({
      dependencies: { permissionAdapter: denyAdapter },
    });
    const result = manager.handleRequest({ type: "openPanel", panelId: "context" });

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("FORBIDDEN");
  });

  it("notifies subscribers on state change", () => {
    const manager = createWorkbenchManager();
    const listener = vi.fn();
    manager.subscribe(listener);

    manager.handleRequest({ type: "openPanel", panelId: "context" });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]?.[0].panels.context.collapsed).toBe(false);
  });

  it("exposes capability handle with publish-only surface", () => {
    const manager = createWorkbenchManager();
    const handle = manager.createCapabilityHandle();

    expect(handle.publish({ type: "closePanel", panelId: "sidebar" }).ok).toBe(true);
    expect(handle.getState().panels.sidebar.collapsed).toBe(true);
  });

  it("exposes navigation model and activity bar selection", () => {
    const manager = createWorkbenchManager({
      dependencies: {
        navigationContributions: [
          {
            id: "platform-home",
            capabilityId: "platform-home",
            capabilityKind: "module",
            level: "activity-bar",
            workspace: "home",
            label: "Home",
            order: 10,
            hidden: false,
          },
          {
            id: "platform-administration",
            capabilityId: "platform-administration",
            capabilityKind: "module",
            level: "activity-bar",
            workspace: "administration",
            label: "Administration",
            order: 20,
            hidden: false,
          },
        ],
      },
    });

    expect(manager.getNavigationModel().activityBar.map((item) => item.id)).toEqual([
      "platform-home",
      "platform-administration",
    ]);

    const result = manager.selectActivityBarNavigationItem("platform-administration");
    expect(result.ok).toBe(true);
    expect(manager.getNavigationModel().activeWorkspaceId).toBe("administration");
  });

  it("restores persisted session state for a user", async () => {
    const store = createMemorySessionStore();
    await store.save("user-1", {
      ...createEmptySessionPayload("home"),
      focusedViewId: "platform-home-overview",
      openViews: [{ viewId: "platform-home-overview", workspace: "home" }],
      panels: {
        sidebar: { collapsed: true, width: 240 },
      },
    });

    const manager = createWorkbenchManager({
      dependencies: {
        sessionStore: store,
        sessionStorageBackend: "memory",
        navigationContributions: [
          {
            id: "platform-home",
            capabilityId: "platform-home",
            capabilityKind: "module",
            level: "activity-bar",
            workspace: "home",
            label: "Home",
            order: 10,
            hidden: false,
          },
          {
            id: "platform-home-overview",
            capabilityId: "platform-home-overview",
            capabilityKind: "module",
            level: "sidebar",
            workspace: "home",
            label: "Overview",
            route: "/workspace/home/overview",
            order: 10,
            hidden: false,
          },
        ],
        viewDescriptors: [
          {
            viewId: "platform-home",
            capabilityId: "platform-home",
            capabilityKind: "module",
            title: "Home",
            workspace: "home",
            route: "/workspace/home",
            default: true,
          },
          {
            viewId: "platform-home-overview",
            capabilityId: "platform-home-overview",
            capabilityKind: "module",
            title: "Overview",
            workspace: "home",
            route: "/workspace/home/overview",
          },
        ],
      },
    });

    const result = await manager.restoreSession("user-1");
    expect(result.restored).toBe(true);
    expect(manager.getViewState().focusedViewId).toBe("platform-home-overview");
    expect(manager.getState().panels.sidebar.collapsed).toBe(true);
    expect(manager.getSessionDiagnostics().restoreStatus).toBe("success");
  });
});
