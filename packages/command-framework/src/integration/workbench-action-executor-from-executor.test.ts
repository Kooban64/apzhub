import { describe, expect, it, vi } from "vitest";

import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import { createDefaultActionExecutor } from "../executor";
import { createDefaultActionRegistry } from "../registry";
import { createDefaultWorkbenchCommandBridge } from "../bridge";
import { createWorkbenchActionExecutorFromActionExecutor } from "./workbench-action-executor-from-executor";

describe("createWorkbenchActionExecutorFromActionExecutor", () => {
  it("delegates to the underlying ActionExecutor", () => {
    const registry = createDefaultActionRegistry();
    registry.register({
      id: "workbench.view.open",
      label: "Open View",
      source: "builtin",
      handlerKind: "workbench-bridge",
      handler: "workbench-bridge:workbench.view.open",
    });

    const publish = vi.fn(() => ({ ok: true as const }));
    const executor = createDefaultActionExecutor({
      registry,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      bridge: createDefaultWorkbenchCommandBridge(),
      workbenchExecute: publish,
    });

    const workbenchExecutor = createWorkbenchActionExecutorFromActionExecutor(executor);
    const result = workbenchExecutor.execute({
      actionId: "workbench.view.open",
      actor: "user",
      args: { viewId: "platform-home" },
    });

    expect(result.ok).toBe(true);
    expect(publish).toHaveBeenCalled();
  });
});
