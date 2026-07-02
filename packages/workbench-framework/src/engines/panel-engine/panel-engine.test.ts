import { describe, expect, it } from "vitest";

import { createPanelEngine, DEFAULT_PANEL_STATE } from "./panel-engine";

describe("PanelEngine", () => {
  it("starts with sidebar expanded and context collapsed", () => {
    const engine = createPanelEngine();
    expect(engine.getState()).toEqual(DEFAULT_PANEL_STATE);
  });

  it("opens sidebar panel", () => {
    const engine = createPanelEngine({
      initialState: {
        ...DEFAULT_PANEL_STATE,
        sidebar: { ...DEFAULT_PANEL_STATE.sidebar, collapsed: true },
      },
    });

    const result = engine.handleRequest({ type: "openPanel", panelId: "sidebar" });

    expect(result.ok).toBe(true);
    expect(engine.getState().sidebar.collapsed).toBe(false);
  });

  it("opens context panel with optional tab key", () => {
    const engine = createPanelEngine();
    const result = engine.handleRequest({
      type: "openPanel",
      panelId: "context",
      tabKey: "properties",
    });

    expect(result.ok).toBe(true);
    expect(engine.getState().context).toMatchObject({
      collapsed: false,
      activeTabKey: "properties",
    });
  });

  it("closes panels", () => {
    const engine = createPanelEngine();
    expect(engine.handleRequest({ type: "closePanel", panelId: "sidebar" }).ok).toBe(
      true,
    );
    expect(engine.getState().sidebar.collapsed).toBe(true);

    engine.handleRequest({ type: "openPanel", panelId: "context" });
    expect(engine.handleRequest({ type: "closePanel", panelId: "context" }).ok).toBe(
      true,
    );
    expect(engine.getState().context.collapsed).toBe(true);
  });

  it("rejects unsupported request types", () => {
    const engine = createPanelEngine();
    const result = engine.handleRequest({ type: "openView", viewId: "test" });

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("INVALID_REQUEST");
  });
});
