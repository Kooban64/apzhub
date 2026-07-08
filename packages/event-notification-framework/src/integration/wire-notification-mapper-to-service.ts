import type { EventNotificationContext } from "../di/event-notification-context";

/**
 * Test-only wiring: Event Bus subscriber maps envelopes into Notification Service.
 * Production applications use `wireAppEventNotifications()` in apps/web (EN-015).
 */
export function wireNotificationMapperToService(
  context: EventNotificationContext,
): string {
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
