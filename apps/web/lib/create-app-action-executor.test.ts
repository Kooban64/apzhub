import { describe, expect, it, vi } from "vitest";

import {
  bootstrapActionRegistry,
  mapPlatformCapabilitiesToActionRecords,
} from "@apzhub/command-framework/server";
import { Runtime } from "@apzhub/platform-runtime/server";
import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createAppActionExecutorBundle } from "./create-app-action-executor";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("createAppActionExecutorBundle", () => {
  it("creates a shared executor wired to the workbench publish pipeline", async () => {
    await Runtime.bootstrap({ workspaceRoot, failFast: false });
    const records = mapPlatformCapabilitiesToActionRecords(
      Runtime.registry().findAll(),
    );
    const population = bootstrapActionRegistry({ capabilityRecords: records });
    expect(population.ok).toBe(true);

    const publish = vi.fn(() => ({ ok: true as const }));
    const permissionAdapter = createAllowAllWorkbenchPermissionAdapter();
    const bundle = createAppActionExecutorBundle({
      dto: population.dto,
      permissionAdapter,
      publish,
    });

    expect(bundle.actionExecutor).toBeDefined();
    expect(bundle.workbenchActionExecutor).toBeDefined();

    const workbenchResult = bundle.workbenchActionExecutor.execute({
      actionId: "workbench.view.open",
      actor: "user",
      args: { viewId: "platform-home" },
    });

    expect(workbenchResult.ok).toBe(true);
    expect(publish).toHaveBeenCalled();
  });
});
