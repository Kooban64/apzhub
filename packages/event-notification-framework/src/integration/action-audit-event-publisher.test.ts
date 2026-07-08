import { describe, expect, it, vi } from "vitest";

import type { ActionAuditEntry } from "@apzhub/command-framework";
import { CAPABILITY_ACTION_EXECUTED_EVENT_ID } from "@apzhub/command-framework";

import { bootstrapEventRegistry } from "../catalogue/bootstrap-event-registry";
import { createEventNotificationContext } from "../di/event-notification-context";
import {
  createActionAuditEventBusHook,
  publishActionExecutedEventToBus,
} from "./action-audit-event-publisher";

const SUCCESS_ENTRY: ActionAuditEntry = {
  auditReference: "action-audit:workbench.view.open:123:abc",
  actionId: "workbench.view.open",
  actor: "user",
  timestamp: "2026-07-04T12:00:00.000Z",
  ok: true,
  code: "SUCCESS",
  durationMs: 8,
  userId: "user-1",
};

describe("publishActionExecutedEventToBus", () => {
  it("publishes capability.action.executed to a bootstrapped event bus", () => {
    const context = createEventNotificationContext();
    bootstrapEventRegistry({ registry: context.eventRegistry });

    const handler = vi.fn();
    context.eventBus.subscribe({
      eventPattern: CAPABILITY_ACTION_EXECUTED_EVENT_ID,
      handler,
    });

    const result = publishActionExecutedEventToBus(context.eventBus, SUCCESS_ENTRY, {
      envelopeId: "33333333-3333-4333-8333-333333333333",
      correlationId: "44444444-4444-4444-8444-444444444444",
    });

    expect(result.ok).toBe(true);
    expect(result.envelope?.eventId).toBe(CAPABILITY_ACTION_EXECUTED_EVENT_ID);
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]?.[0].payload.actionId).toBe("workbench.view.open");
    expect(context.eventBus.getDiagnostics().publishCount).toBe(1);
  });

  it("skips publish for failed audit entries", () => {
    const context = createEventNotificationContext();
    bootstrapEventRegistry({ registry: context.eventRegistry });

    const result = publishActionExecutedEventToBus(context.eventBus, {
      ...SUCCESS_ENTRY,
      ok: false,
      code: "FORBIDDEN",
    });

    expect(result.skipped).toBe(true);
    expect(context.eventBus.getDiagnostics().publishCount).toBe(0);
  });
});

describe("createActionAuditEventBusHook", () => {
  it("records successful executions on the event bus", () => {
    const context = createEventNotificationContext();
    bootstrapEventRegistry({ registry: context.eventRegistry });
    const onPublished = vi.fn();
    const auditHook = createActionAuditEventBusHook({
      eventBus: context.eventBus,
      onPublished,
    });

    auditHook.record(SUCCESS_ENTRY);

    expect(onPublished).toHaveBeenCalledOnce();
    expect(context.eventBus.getDiagnostics().publishCount).toBe(1);
  });
});
