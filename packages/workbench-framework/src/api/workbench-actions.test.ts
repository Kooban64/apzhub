import { describe, expect, it } from "vitest";

import {
  actionToRequest,
  requestToAction,
  requestToActionId,
} from "./workbench-actions";

describe("workbench actions", () => {
  it("maps actions to requests", () => {
    expect(
      actionToRequest({
        id: "workbench.view.open",
        viewId: "platform-home",
        workspace: "home",
      }),
    ).toEqual({
      type: "openView",
      viewId: "platform-home",
      workspace: "home",
    });
  });

  it("maps requests to action ids", () => {
    expect(requestToActionId("openView")).toBe("workbench.view.open");
  });

  it("reverse maps requests to actions", () => {
    expect(
      requestToAction({
        type: "setSelection",
        selection: { items: [{ id: "row-1", kind: "row" }], mode: "single" },
      }),
    ).toEqual({
      id: "workbench.selection.set",
      items: [{ id: "row-1", kind: "row" }],
      mode: "single",
    });
  });

  it("maps all supported action ids to requests", () => {
    expect(actionToRequest({ id: "workbench.view.close", viewId: "v1" }).type).toBe(
      "closeView",
    );
    expect(actionToRequest({ id: "workbench.view.focus", viewId: "v1" }).type).toBe(
      "focusView",
    );
    expect(
      actionToRequest({ id: "workbench.panel.open", panelId: "sidebar" }).type,
    ).toBe("openPanel");
    expect(
      actionToRequest({ id: "workbench.panel.close", panelId: "context" }).type,
    ).toBe("closePanel");
    expect(
      actionToRequest({ id: "workbench.navigation.reveal", navId: "nav-1" }).type,
    ).toBe("revealNavigationItem");
    expect(
      actionToRequest({ id: "workbench.context.set", contextKey: "demo" }).type,
    ).toBe("setContext");
  });

  it("returns null for unsupported request reverse mapping", () => {
    expect(requestToAction({ type: "openView", viewId: "x" })).not.toBeNull();
  });
});
