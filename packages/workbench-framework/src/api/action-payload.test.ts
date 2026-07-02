import { describe, expect, it } from "vitest";

import { actionPayload } from "./action-payload";
import type { WorkbenchAction } from "./workbench-actions";

describe("actionPayload", () => {
  it("serialises workbench.view.open with optional workspace and params", () => {
    const action: WorkbenchAction = {
      id: "workbench.view.open",
      viewId: "platform-home",
      workspace: "home",
      params: { tab: "overview" },
    };

    expect(actionPayload(action)).toEqual({
      viewId: "platform-home",
      workspace: "home",
      params: { tab: "overview" },
    });
  });

  it("omits optional fields on workbench.view.open when absent", () => {
    expect(
      actionPayload({
        id: "workbench.view.open",
        viewId: "platform-home",
      }),
    ).toEqual({ viewId: "platform-home" });
  });

  it("serialises workbench.view.close and workbench.view.focus", () => {
    expect(actionPayload({ id: "workbench.view.close", viewId: "v1" })).toEqual({
      viewId: "v1",
    });
    expect(actionPayload({ id: "workbench.view.focus", viewId: "v2" })).toEqual({
      viewId: "v2",
    });
  });

  it("serialises panel actions with optional tab key", () => {
    expect(
      actionPayload({
        id: "workbench.panel.open",
        panelId: "sidebar",
        tabKey: "files",
      }),
    ).toEqual({ panelId: "sidebar", tabKey: "files" });

    expect(actionPayload({ id: "workbench.panel.close", panelId: "context" })).toEqual({
      panelId: "context",
    });
  });

  it("serialises navigation reveal", () => {
    expect(
      actionPayload({
        id: "workbench.navigation.reveal",
        navId: "platform-home-overview",
      }),
    ).toEqual({ navId: "platform-home-overview" });
  });

  it("serialises context set with optional payload", () => {
    expect(
      actionPayload({
        id: "workbench.context.set",
        contextKey: "workspace",
        payload: { route: "/workspace/home" },
      }),
    ).toEqual({
      contextKey: "workspace",
      payload: { route: "/workspace/home" },
    });

    expect(actionPayload({ id: "workbench.context.set", contextKey: "demo" })).toEqual({
      contextKey: "demo",
    });
  });

  it("serialises selection with optional mode and view id", () => {
    const action: WorkbenchAction = {
      id: "workbench.selection.set",
      items: [{ id: "item-1", kind: "record" }],
      mode: "single",
      viewId: "platform-home",
    };

    expect(actionPayload(action)).toEqual({
      selection: {
        items: [{ id: "item-1", kind: "record" }],
        mode: "single",
        viewId: "platform-home",
      },
    });
  });
});
