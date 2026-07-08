import { describe, expect, it, vi } from "vitest";

import {
  createDefaultActionExecutor,
  createDefaultActionRegistry,
  createDefaultWorkbenchCommandBridge,
} from "@apzhub/command-framework";
import {
  createAllowAllWorkbenchPermissionAdapter,
  workbenchRequestOk,
} from "@apzhub/workbench-framework";

import { bootstrapEventRegistry } from "../catalogue/bootstrap-event-registry";
import { bootstrapNotificationRegistry } from "../catalogue/bootstrap-notification-registry";
import { createEventNotificationContext } from "../di/event-notification-context";
import { createDefaultNotificationRegistry } from "../notification/default-notification-registry";
import type { NotificationRegistry } from "../notification/notification-descriptor";
import { createActionAuditEventBusHook } from "./action-audit-event-publisher";
import { wireNotificationMapperToService } from "./wire-notification-mapper-to-service";

function registerActionExecutedNotificationRoutes(
  registry: NotificationRegistry,
): void {
  registry.register({
    routeId: "capability.action.executed.inbox",
    eventPattern: "capability.action.executed",
    notificationKind: "inbox",
    channel: "in-app",
    templateRef: "action-executed-inbox",
    version: "1.0.0",
    status: "active",
    label: "Action executed inbox",
    titleTemplate: "Action {{payload.actionId}} completed",
    bodyTemplate: "Executed by {{payload.actor}}",
  });
  registry.register({
    routeId: "capability.action.executed.toast",
    eventPattern: "capability.action.executed",
    notificationKind: "toast",
    channel: "in-app",
    templateRef: "action-executed-toast",
    version: "1.0.0",
    status: "active",
    label: "Action executed toast",
    titleTemplate: "{{payload.actionId}} finished",
  });
}

function createPipelineTestContext() {
  const notificationRegistry = createDefaultNotificationRegistry();
  bootstrapNotificationRegistry({ registry: notificationRegistry });
  registerActionExecutedNotificationRoutes(notificationRegistry);

  const context = createEventNotificationContext({ notificationRegistry });
  bootstrapEventRegistry({ registry: context.eventRegistry });
  return context;
}

describe("action audit notification pipeline integration", () => {
  it("executes action, publishes event, maps notification, and stores in service", async () => {
    const context = createPipelineTestContext();
    wireNotificationMapperToService(context);

    const auditHook = createActionAuditEventBusHook({ eventBus: context.eventBus });
    const registry = createDefaultActionRegistry();
    registry.register({
      id: "workbench.view.open",
      label: "Open View",
      handler: "workbench-bridge:workbench.view.open",
      handlerKind: "workbench-bridge",
      source: "builtin",
    });

    const executor = createDefaultActionExecutor({
      registry,
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      bridge: createDefaultWorkbenchCommandBridge(),
      workbenchExecute: vi.fn(() => workbenchRequestOk()),
      auditHook,
    });

    const result = await executor.execute("workbench.view.open", {
      actor: "user",
      userId: "user-1",
      args: { viewId: "platform-home" },
    });

    expect(result.ok).toBe(true);
    expect(context.eventBus.getDiagnostics().publishCount).toBe(1);
    expect(context.eventBus.getDiagnostics().lastPublishStatus).toBe("success");

    const notifications = context.notificationService.listNotifications();
    expect(notifications.length).toBeGreaterThanOrEqual(1);
    expect(
      notifications.some((item) => item.routeId === "capability.action.executed.inbox"),
    ).toBe(true);
    expect(notifications[0]?.metadata.read).toBe(false);
    expect(context.notificationService.getUnreadCount()).toBeGreaterThan(0);
  });

  it("does not store notifications when action execution fails", async () => {
    const context = createPipelineTestContext();
    wireNotificationMapperToService(context);

    const auditHook = createActionAuditEventBusHook({ eventBus: context.eventBus });
    const executor = createDefaultActionExecutor({
      registry: createDefaultActionRegistry(),
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      auditHook,
    });

    const result = await executor.execute("missing.action", { actor: "user" });

    expect(result.ok).toBe(false);
    expect(context.eventBus.getDiagnostics().publishCount).toBe(0);
    expect(context.notificationService.listNotifications()).toEqual([]);
  });
});
