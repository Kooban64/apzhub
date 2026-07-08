import { describe, expect, it } from "vitest";

import { CAPABILITY_ACTION_EXECUTED_EVENT_ID } from "@apzhub/command-framework";
import { Runtime } from "@apzhub/platform-runtime/server";
import { mapPlatformCapabilitiesToEventRecords } from "@apzhub/event-notification-framework/server";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createAppEventNotificationContext } from "./create-app-event-notification-context";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("createAppEventNotificationContext", () => {
  it("bootstraps registries, wires mapper subscriber, and registers action audit routes", async () => {
    await Runtime.bootstrap({ workspaceRoot, failFast: false });
    const capabilityRecords = mapPlatformCapabilitiesToEventRecords(
      Runtime.registry().findAll(),
    );

    const context = createAppEventNotificationContext({ capabilityRecords });

    expect(context.eventRegistry.has(CAPABILITY_ACTION_EXECUTED_EVENT_ID)).toBe(true);
    expect(context.notificationRegistry.has("capability.action.executed.inbox")).toBe(
      true,
    );
    expect(context.eventBus.getDiagnostics().subscriberCount).toBeGreaterThan(0);
    expect(context.getDiagnostics().notificationMapper.status).toBe("ready");
    expect(context.getDiagnostics().notificationService.status).toBe("empty");
  });

  it("maps action audit events into the notification service", () => {
    const context = createAppEventNotificationContext();

    context.eventBus.publish({
      envelopeId: "55555555-5555-4555-8555-555555555555",
      eventId: CAPABILITY_ACTION_EXECUTED_EVENT_ID,
      eventVersion: "1.0.0",
      category: "capability",
      correlationId: "66666666-6666-4666-8666-666666666666",
      timestamp: "2026-07-04T12:00:00.000Z",
      publisher: "command-framework",
      payload: {
        actionId: "workbench.view.open",
        actor: "user",
        resultCode: "SUCCESS",
        ok: true,
        durationMs: 5,
        auditReference: "action-audit:test",
      },
    });

    expect(context.notificationService.listNotifications().length).toBeGreaterThan(0);
    expect(context.notificationService.getUnreadCount()).toBeGreaterThan(0);
  });
});
