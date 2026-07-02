import { describe, expect, it, vi } from "vitest";

import { createAllowAllWorkbenchPermissionAdapter } from "../../permission/allow-all-adapter";
import { createEmptySelectionState } from "../selection-engine/selection-state";
import { createMemorySessionStore } from "../../session/memory-session-store";
import { createEmptySessionPayload } from "../../session/workbench-session-payload";
import { createSessionEngine } from "./session-engine";

describe("SessionEngine", () => {
  it("restores workspace, view, and panel preferences", async () => {
    const store = createMemorySessionStore();
    const engine = createSessionEngine({
      sessionStore: store,
      storageBackend: "memory",
    });

    await store.save("user-1", {
      ...createEmptySessionPayload("home"),
      focusedViewId: "platform-home-overview",
      activeSidebarItemId: "platform-home-overview",
      openViews: [{ viewId: "platform-home-overview", workspace: "home" }],
      panels: {
        sidebar: { collapsed: true, width: 240 },
      },
    });

    const setActiveWorkspace = vi.fn(() => ({ ok: true }));
    const restoreFocusedView = vi.fn(() => ({ ok: true }));
    const applyPanelState = vi.fn();
    const applyLayoutPreferences = vi.fn();
    const applySelection = vi.fn();
    const applyDock = vi.fn();

    const result = await engine.restore("user-1", {
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      navigationItems: [
        {
          id: "platform-home",
          capabilityId: "platform-home",
          capabilityKind: "module",
          level: "activity-bar",
          workspace: "home",
          label: "Home",
          order: 10,
          hidden: false,
          visible: true,
          revealed: false,
          children: [],
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
      setActiveWorkspace,
      restoreFocusedView,
      applyPanelState,
      applyLayoutPreferences,
      applySelection,
      applyDock,
    });

    expect(result.restored).toBe(true);
    expect(setActiveWorkspace).toHaveBeenCalledWith("home");
    expect(restoreFocusedView).toHaveBeenCalledWith("platform-home-overview", "home");
    expect(applyPanelState).toHaveBeenCalledWith({
      sidebar: { collapsed: true, width: 240 },
    });
    expect(engine.getDiagnostics().hydrated).toBe(true);
  });

  it("persists captured session state", async () => {
    const store = createMemorySessionStore();
    const engine = createSessionEngine({
      sessionStore: store,
      storageBackend: "memory",
    });

    await engine.persist(
      "user-1",
      {
        layout: {
          regions: {
            header: { visible: true, order: 0 },
            activityBar: { visible: true, order: 1 },
            sidebar: { visible: true, order: 2 },
            workspace: { visible: true, order: 3 },
            context: { visible: false, order: 4 },
            statusBar: { visible: true, order: 5 },
          },
        },
        panels: {
          sidebar: { collapsed: false, width: 280 },
          context: { collapsed: true, width: 320 },
        },
        navigation: {
          activeWorkspaceId: "home",
          items: [],
          groups: [],
          tree: [],
        },
        views: {
          descriptors: [],
          openViews: [
            {
              viewId: "platform-home",
              workspace: "home",
              title: "Home",
              route: "/workspace/home",
              lifecycle: "placeholder",
            },
          ],
          focusedViewId: "platform-home",
        },
        session: engine.getDiagnostics(),
        dock: { splitRatios: {} },
        context: {},
        selection: createEmptySelectionState(),
      },
      {
        activeWorkspaceId: "home",
        items: [],
        groups: [],
        tree: [],
      },
    );

    const loaded = await store.load("user-1");
    expect(loaded?.focusedViewId).toBe("platform-home");
    expect(loaded?.activeWorkspace).toBe("home");
  });
});
