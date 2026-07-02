import { describe, expect, it } from "vitest";

import { createDefaultLayoutState, createLayoutEngine } from "./layout-engine";

describe("LayoutEngine", () => {
  it("exposes all permanent shell regions per Document 016", () => {
    const engine = createLayoutEngine();
    const state = engine.getState();

    expect(Object.keys(state.regions).sort()).toEqual([
      "activityBar",
      "context",
      "header",
      "sidebar",
      "statusBar",
      "workspace",
    ]);
    for (const region of Object.values(state.regions)) {
      expect(region.visible).toBe(true);
    }
  });

  it("returns NOT_IMPLEMENTED for requests in Phase 1", () => {
    const engine = createLayoutEngine();
    const result = engine.handleRequest({ type: "openPanel", panelId: "sidebar" });

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("NOT_IMPLEMENTED");
    expect(result.error?.engineId).toBe("layout");
  });

  it("updates region visibility via manager coordination API", () => {
    const engine = createLayoutEngine();
    engine.setRegionVisibility("sidebar", false);

    expect(engine.getState().regions.sidebar.visible).toBe(false);
  });

  it("creates deterministic default layout state", () => {
    const a = createDefaultLayoutState();
    const b = createDefaultLayoutState();
    expect(a).toEqual(b);
  });
});
