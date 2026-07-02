import { describe, expect, it, vi } from "vitest";

import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { actionToRequest, workbenchRequestOk } from "@apzhub/workbench-framework";

import { createDefaultWorkbenchCommandBridge } from "../bridge";
import { createDefaultActionRegistry } from "../registry";
import { createWorkbenchActionExecutorAdapter } from "./workbench-action-executor-adapter";

describe("createWorkbenchActionExecutorAdapter", () => {
  it("executes through bridge and workbench publish callback", () => {
    const publish = vi.fn((_request: unknown) => workbenchRequestOk());
    const registry = createDefaultActionRegistry();
    registry.register({
      id: "workbench.view.open",
      label: "Open View",
      handler: "workbench-bridge:workbench.view.open",
      handlerKind: "workbench-bridge",
      source: "builtin",
    });

    const adapter = createWorkbenchActionExecutorAdapter({
      registry,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      bridge: createDefaultWorkbenchCommandBridge(),
      workbenchExecute: (action) => publish(actionToRequest(action)),
    });

    const result = adapter.execute({
      actionId: "workbench.view.open",
      args: { viewId: "platform-home", workspace: "home" },
    });

    expect(result.ok).toBe(true);
    expect(result.code).toBe("SUCCESS");
    expect(publish).toHaveBeenCalledWith({
      type: "openView",
      viewId: "platform-home",
      workspace: "home",
    });
  });
});
