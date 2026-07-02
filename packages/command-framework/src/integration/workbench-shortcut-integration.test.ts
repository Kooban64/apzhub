import { describe, expect, it, vi } from "vitest";

import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { actionToRequest, workbenchRequestOk } from "@apzhub/workbench-framework";

import { createDefaultWorkbenchCommandBridge } from "../bridge";
import { createDefaultActionRegistry } from "../registry";
import { createDefaultShortcutRegistry } from "../shortcuts";
import { createWorkbenchActionExecutorAdapter } from "./workbench-action-executor-adapter";
import {
  executeShortcutViaWorkbenchApi,
  resolveShortcutActionId,
} from "./workbench-shortcut-integration";

describe("workbench shortcut integration", () => {
  it("resolves shortcut action ids without executing", () => {
    const shortcuts = createDefaultShortcutRegistry();
    shortcuts.register({
      commandId: "workbench.view.open",
      chord: "Ctrl+Shift+V",
      source: "builtin",
    });

    const actionId = resolveShortcutActionId(shortcuts, {
      key: "v",
      ctrlKey: true,
      shiftKey: true,
      metaKey: false,
      altKey: false,
    });

    expect(actionId).toBe("workbench.view.open");
  });

  it("executes resolved shortcuts through Workbench API adapter", () => {
    const publish = vi.fn((_request: unknown) => workbenchRequestOk());
    const registry = createDefaultActionRegistry();
    registry.register({
      id: "workbench.view.open",
      label: "Open View",
      handler: "workbench-bridge:workbench.view.open",
      handlerKind: "workbench-bridge",
      source: "builtin",
    });

    const shortcuts = createDefaultShortcutRegistry();
    shortcuts.register({
      commandId: "workbench.view.open",
      chord: "Ctrl+Shift+V",
      source: "builtin",
    });

    const executor = createWorkbenchActionExecutorAdapter({
      registry,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      bridge: createDefaultWorkbenchCommandBridge(),
      workbenchExecute: (action) => publish(actionToRequest(action)),
    });

    const result = executeShortcutViaWorkbenchApi(
      shortcuts,
      executor,
      {
        key: "v",
        ctrlKey: true,
        shiftKey: true,
        metaKey: false,
        altKey: false,
      },
      { args: { viewId: "platform-home", workspace: "home" } },
    );

    expect(result?.ok).toBe(true);
    expect(publish).toHaveBeenCalledWith({
      type: "openView",
      viewId: "platform-home",
      workspace: "home",
    });
  });

  it("returns null when shortcut does not resolve", () => {
    const shortcuts = createDefaultShortcutRegistry();
    const executor = createWorkbenchActionExecutorAdapter({
      registry: createDefaultActionRegistry(),
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      bridge: createDefaultWorkbenchCommandBridge(),
      workbenchExecute: () => workbenchRequestOk(),
    });

    expect(
      executeShortcutViaWorkbenchApi(shortcuts, executor, {
        key: "x",
        ctrlKey: false,
        shiftKey: false,
        metaKey: false,
        altKey: false,
      }),
    ).toBeNull();
  });
});
