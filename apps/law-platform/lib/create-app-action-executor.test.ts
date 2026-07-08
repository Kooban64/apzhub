import { describe, expect, it, vi } from "vitest";

import {
  bootstrapActionRegistry,
  mapPlatformCapabilitiesToActionRecords,
} from "@apzhub/command-framework/server";
import { createActionAuditEventBusHook } from "@apzhub/event-notification-framework";
import { Runtime } from "@apzhub/platform-runtime/server";
import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { workbenchRequestOk } from "@apzhub/workbench-framework";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createAppActionExecutorBundle } from "./create-app-action-executor";
import { createAppEventNotificationContext } from "./create-app-event-notification-context";

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

  it("publishes audit events and stores notifications when audit hook is wired", async () => {
    await Runtime.bootstrap({ workspaceRoot, failFast: false });
    const records = mapPlatformCapabilitiesToActionRecords(
      Runtime.registry().findAll(),
    );
    const population = bootstrapActionRegistry({ capabilityRecords: records });
    const eventNotificationContext = createAppEventNotificationContext();
    const auditHook = createActionAuditEventBusHook({
      eventBus: eventNotificationContext.eventBus,
    });

    const bundle = createAppActionExecutorBundle({
      dto: population.dto,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      publish: vi.fn(() => workbenchRequestOk()),
      auditHook,
    });

    const result = await bundle.actionExecutor.execute("workbench.view.open", {
      actor: "user",
      userId: "user-1",
      args: { viewId: "platform-home" },
    });

    expect(result.ok).toBe(true);
    expect(eventNotificationContext.eventBus.getDiagnostics().publishCount).toBe(1);
    expect(
      eventNotificationContext.notificationService.getUnreadCount(),
    ).toBeGreaterThan(0);
  });
});
