import type { EventNotificationContext } from "@apzhub/event-notification-framework";

/**
 * Production Event Bus subscriber — maps platform events into the session Notification Service.
 * Application-owned lifecycle; not used in ENF package tests (see wireNotificationMapperToService).
 */
export function wireAppEventNotifications(context: EventNotificationContext): string {
  return context.eventBus.subscribe({
    eventPattern: "capability.action.*",
    handler: (envelope) => {
      const mapped = context.notificationMapper.map(envelope);
      if (mapped.ok && mapped.items.length > 0) {
        context.notificationService.addNotifications(mapped.items);
      }
    },
  });
}
