import { describe, expect, it } from "vitest";

import { createContextEngine } from "./context-engine";

describe("ContextEngine", () => {
  it("sets context key and payload via setContext request", () => {
    const engine = createContextEngine();
    const result = engine.handleRequest({
      type: "setContext",
      contextKey: "entity.details",
      payload: { entityId: "123" },
    });

    expect(result.ok).toBe(true);
    expect(engine.getState().activeKey).toBe("entity.details");
    expect(engine.getState().payload).toEqual({ entityId: "123" });
    expect(engine.getDiagnostics().hasPayload).toBe(true);
  });

  it("syncs active workspace, view, route and selection from workbench state", () => {
    const engine = createContextEngine();

    engine.syncFromWorkbench({
      navigation: {
        activeWorkspaceId: "home",
        items: [
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
            visible: true,
            revealed: false,
            children: [],
          },
        ],
        groups: [],
        tree: [],
      },
      views: {
        descriptors: [],
        openViews: [
          {
            viewId: "platform-home-overview",
            workspace: "home",
            title: "Overview",
            route: "/workspace/home/overview",
            lifecycle: "active",
          },
        ],
        focusedViewId: "platform-home-overview",
      },
      selection: {
        activeViewId: "platform-home-overview",
        mode: "single",
        items: [{ id: "row-1", kind: "table-row" }],
        byView: {
          "platform-home-overview": [{ id: "row-1", kind: "table-row" }],
        },
      },
    });

    const state = engine.getState();
    expect(state.activeWorkspaceId).toBe("home");
    expect(state.activeViewId).toBe("platform-home-overview");
    expect(state.activeRoute).toBe("/workspace/home/overview");
    expect(state.selectedNavItemId).toBe("platform-home-overview");
    expect(state.selectedItemId).toBe("row-1");
  });
});
