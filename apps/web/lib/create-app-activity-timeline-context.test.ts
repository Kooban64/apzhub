import { describe, expect, it } from "vitest";

import { CAPABILITY_ACTION_EXECUTED_EVENT_ID } from "@apzhub/command-framework";
import { Runtime } from "@apzhub/platform-runtime/server";
import { mapPlatformCapabilitiesToActivityRecords } from "@apzhub/activity-timeline-framework/server";
import { createAppEventNotificationContext } from "@/lib/create-app-event-notification-context";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createAppActivityTimelineContext } from "./create-app-activity-timeline-context";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("createAppActivityTimelineContext", () => {
  it("bootstraps registries and wires mapper subscriber on shared Event Bus", async () => {
    await Runtime.bootstrap({ workspaceRoot, failFast: false });
    const capabilityRecords = mapPlatformCapabilitiesToActivityRecords(
      Runtime.registry().findAll(),
    );
    const eventNotificationContext = createAppEventNotificationContext({
      capabilityRecords,
    });

    const context = createAppActivityTimelineContext({
      eventBus: eventNotificationContext.eventBus,
      capabilityRecords,
    });

    expect(
      context.registry.getDiagnostics().registeredActivityTypeCount,
    ).toBeGreaterThan(0);
    expect(
      context.timelineRegistry.getDiagnostics().registeredTimelineCount,
    ).toBeGreaterThan(0);
    expect(context.mapper.getDiagnostics().status).toBe("ready");
    expect(context.service.getDiagnostics().status).toBe("empty");
    expect(context.subscriberId).toBeDefined();
    expect(
      eventNotificationContext.eventBus.getDiagnostics().subscriberCount,
    ).toBeGreaterThan(1);
  });

  it("maps action audit events into the activity service", () => {
    const eventNotificationContext = createAppEventNotificationContext();
    const context = createAppActivityTimelineContext({
      eventBus: eventNotificationContext.eventBus,
    });

    eventNotificationContext.eventBus.publish({
      envelopeId: "77777777-7777-4777-8777-777777777777",
      eventId: CAPABILITY_ACTION_EXECUTED_EVENT_ID,
      eventVersion: "1.0.0",
      category: "capability",
      correlationId: "88888888-8888-4888-8888-888888888888",
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

    expect(context.service.listActivities().length).toBeGreaterThan(0);
  });
});
