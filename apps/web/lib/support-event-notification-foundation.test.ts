import { describe, expect, it } from "vitest";

import { createAppEventNotificationContext } from "./create-app-event-notification-context";
import { clearPlatformDomainEventBus } from "./platform-domain-event-bus";

describe("Support Event Bus & Notification Foundation (APZHUB-1.1-003)", () => {
  it("registers Support events and maps publishes to notifications", () => {
    clearPlatformDomainEventBus();
    const context = createAppEventNotificationContext();

    expect(context.eventRegistry.has("support.request.created")).toBe(true);
    expect(context.eventRegistry.has("support.request.assigned")).toBe(true);
    expect(context.eventRegistry.has("support.article.created")).toBe(true);
    expect(context.notificationRegistry.has("support.request.created.inbox")).toBe(
      true,
    );

    const publish = context.eventBus.publish({
      envelopeId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      eventId: "support.request.created",
      eventVersion: "1.0.0",
      category: "business",
      correlationId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      timestamp: "2026-07-20T00:00:00.000Z",
      publisher: "support-service",
      payload: {
        supportRequestId: "sr-1",
        title: "Printer offline",
        status: "new",
        priority: "normal",
      },
    });

    expect(publish.ok).toBe(true);
    expect(context.notificationService.listNotifications().length).toBeGreaterThan(0);
    expect(context.notificationService.getUnreadCount()).toBeGreaterThan(0);
  });

  it("maps support.request.assigned to inbox notifications", () => {
    const context = createAppEventNotificationContext({
      registerAsPlatformDomainBus: false,
    });

    context.eventBus.publish({
      envelopeId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      eventId: "support.request.assigned",
      eventVersion: "1.0.0",
      category: "business",
      correlationId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
      timestamp: "2026-07-20T00:00:00.000Z",
      publisher: "support-service",
      payload: {
        supportRequestId: "sr-2",
        title: "VPN access",
        assigneeId: "agent-9",
      },
    });

    const items = context.notificationService.listNotifications();
    expect(
      items.some((item) => item.routeId === "support.request.assigned.inbox"),
    ).toBe(true);
  });
});
