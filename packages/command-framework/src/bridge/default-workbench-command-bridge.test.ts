import { describe, expect, it } from "vitest";

import { REQUEST_COMMAND_MAP } from "@apzhub/workbench-framework";
import { actionToRequest } from "@apzhub/workbench-framework";

import {
  createDefaultWorkbenchCommandBridge,
  defaultWorkbenchCommandBridgeFactory,
  WORKBENCH_BRIDGE_ACTION_IDS,
} from "./index";

describe("DefaultWorkbenchCommandBridge", () => {
  it("supports all REQUEST_COMMAND_MAP action ids", () => {
    const bridge = createDefaultWorkbenchCommandBridge();

    expect(WORKBENCH_BRIDGE_ACTION_IDS).toEqual(Object.values(REQUEST_COMMAND_MAP));
    for (const actionId of WORKBENCH_BRIDGE_ACTION_IDS) {
      expect(bridge.supports(actionId)).toBe(true);
    }
  });

  it("maps workbench.view.open", () => {
    const bridge = createDefaultWorkbenchCommandBridge();
    const action = bridge.toAction("workbench.view.open", {
      viewId: "platform-home",
      workspace: "home",
    });

    expect(action).toEqual({
      id: "workbench.view.open",
      viewId: "platform-home",
      workspace: "home",
      params: undefined,
    });

    expect(
      bridge.toRequest("workbench.view.open", { viewId: "platform-home" }),
    ).toEqual({
      type: "openView",
      viewId: "platform-home",
      workspace: undefined,
      params: undefined,
    });
  });

  it("maps workbench.view.close", () => {
    const bridge = createDefaultWorkbenchCommandBridge();
    expect(
      bridge.toRequest("workbench.view.close", { viewId: "platform-home" }),
    ).toEqual({
      type: "closeView",
      viewId: "platform-home",
    });
  });

  it("maps workbench.view.focus", () => {
    const bridge = createDefaultWorkbenchCommandBridge();
    expect(
      bridge.toRequest("workbench.view.focus", { viewId: "platform-home" }),
    ).toEqual({
      type: "focusView",
      viewId: "platform-home",
    });
  });

  it("maps workbench.panel.open", () => {
    const bridge = createDefaultWorkbenchCommandBridge();
    expect(
      bridge.toRequest("workbench.panel.open", { panelId: "sidebar", tabKey: "nav" }),
    ).toEqual({
      type: "openPanel",
      panelId: "sidebar",
      tabKey: "nav",
    });
  });

  it("maps workbench.panel.close", () => {
    const bridge = createDefaultWorkbenchCommandBridge();
    expect(bridge.toRequest("workbench.panel.close", { panelId: "context" })).toEqual({
      type: "closePanel",
      panelId: "context",
    });
  });

  it("maps workbench.navigation.reveal", () => {
    const bridge = createDefaultWorkbenchCommandBridge();
    expect(
      bridge.toRequest("workbench.navigation.reveal", { navId: "platform-home" }),
    ).toEqual({
      type: "revealNavigationItem",
      navId: "platform-home",
    });
  });

  it("maps workbench.context.set", () => {
    const bridge = createDefaultWorkbenchCommandBridge();
    expect(
      bridge.toRequest("workbench.context.set", {
        contextKey: "workspace",
        payload: { workspace: "home" },
      }),
    ).toEqual({
      type: "setContext",
      contextKey: "workspace",
      payload: { workspace: "home" },
    });
  });

  it("maps workbench.selection.set", () => {
    const bridge = createDefaultWorkbenchCommandBridge();
    expect(
      bridge.toRequest("workbench.selection.set", {
        selection: {
          items: [{ id: "item-1", kind: "record" }],
          mode: "single",
          viewId: "platform-home",
        },
      }),
    ).toEqual({
      type: "setSelection",
      selection: {
        items: [{ id: "item-1", kind: "record" }],
        mode: "single",
        viewId: "platform-home",
      },
    });
  });

  it("returns null for unsupported action ids", () => {
    const bridge = createDefaultWorkbenchCommandBridge();

    expect(bridge.toAction("platform.unknown.action", {})).toBeNull();
    expect(bridge.toRequest("platform.unknown.action", {})).toBeNull();
    expect(bridge.getDiagnostics().unsupportedActionCount).toBe(2);
  });

  it("returns null for invalid payloads on supported actions", () => {
    const bridge = createDefaultWorkbenchCommandBridge();

    expect(bridge.toAction("workbench.view.open", {})).toBeNull();
    expect(bridge.toRequest("workbench.panel.open", { panelId: "invalid" })).toBeNull();
    expect(bridge.getDiagnostics().invalidPayloadCount).toBe(2);
  });

  it("translates actions to requests consistently with actionToRequest", () => {
    const bridge = createDefaultWorkbenchCommandBridge();
    const action = bridge.toAction("workbench.view.open", { viewId: "platform-home" });

    expect(action).not.toBeNull();
    if (!action) {
      return;
    }

    expect(
      bridge.toRequest("workbench.view.open", { viewId: "platform-home" }),
    ).toEqual(actionToRequest(action));
  });

  it("reports bridge diagnostics", () => {
    const bridge = createDefaultWorkbenchCommandBridge();

    bridge.toRequest("workbench.view.open", { viewId: "platform-home" });
    bridge.toAction("unknown.action");
    bridge.toAction("workbench.view.focus", {});

    const diagnostics = bridge.getDiagnostics();
    expect(diagnostics.status).toBe("ready");
    expect(diagnostics.translationCount).toBe(1);
    expect(diagnostics.unsupportedActionCount).toBe(1);
    expect(diagnostics.invalidPayloadCount).toBe(1);
    expect(diagnostics.lastTranslationAt).toBeTruthy();
    expect(diagnostics.supportedActionIds).toEqual(WORKBENCH_BRIDGE_ACTION_IDS);
  });

  it("creates instances via DI factory", () => {
    const bridge = defaultWorkbenchCommandBridgeFactory.create();
    expect(bridge.supports("workbench.view.open")).toBe(true);
  });
});
