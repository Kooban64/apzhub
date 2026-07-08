import {
  createNotificationItem,
  type NotificationService,
} from "@apzhub/event-notification-framework";
import type { EventEnvelope } from "@apzhub/event-notification-framework";
import type { NotificationDescriptor } from "@apzhub/event-notification-framework";
import { createDefaultNotificationService } from "@apzhub/event-notification-framework";
import type { NotificationItem } from "@apzhub/event-notification-framework";

const ROUTE: NotificationDescriptor = {
  routeId: "platform.inbox.system",
  eventPattern: "system.platform.bootstrap.completed",
  notificationKind: "inbox",
  channel: "in-app",
  templateRef: "bootstrap-completed",
  version: "1.0.0",
  status: "active",
  priority: "high",
};

const ENVELOPE: EventEnvelope = {
  envelopeId: "env-shell-1",
  eventId: "system.platform.bootstrap.completed",
  eventVersion: "1.0.0",
  category: "system",
  correlationId: "corr-shell",
  timestamp: "2026-07-04T10:00:00.000Z",
  publisher: "platform-runtime",
  payload: {},
};

export function seedNotificationService(
  service: NotificationService = createDefaultNotificationService(),
) {
  service.addNotifications([
    createNotificationItem({
      envelope: ENVELOPE,
      route: ROUTE,
      title: "Bootstrap complete",
      body: "Platform is ready",
      renderedAt: "2026-07-04T10:00:01.000Z",
    }),
  ]);

  return service;
}

export function seedNotificationServiceWithAction(
  service: NotificationService = createDefaultNotificationService(),
) {
  const item = createNotificationItem({
    envelope: ENVELOPE,
    route: ROUTE,
    title: "Action notification",
    renderedAt: "2026-07-04T10:00:01.000Z",
  });

  const withAction = Object.freeze({
    ...item,
    metadata: Object.freeze({
      ...item.metadata,
      actionRef: Object.freeze({
        actionId: "platform.theme.toggle",
        handlerContext: Object.freeze({ source: "notification" }),
      }),
    }),
  }) as NotificationItem;

  service.addNotifications([withAction]);

  return service;
}

export { ROUTE, ENVELOPE };
