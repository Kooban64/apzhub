import type { EventNotificationContext } from "../di/event-notification-context";

/**
 * Reusable platform helper — subscribe event patterns to NotificationMapper → NotificationService.
 * Products register routes; this wires Attention-path delivery without product-owned notify subsystems.
 * (APZHUB-1.1-003)
 */
export function wireDomainEventNotifications(
  context: EventNotificationContext,
  eventPatterns: readonly string[],
): string[] {
  return eventPatterns.map((eventPattern) =>
    context.eventBus.subscribe({
      eventPattern,
      handler: (envelope) => {
        const mapped = context.notificationMapper.map(envelope);
        if (mapped.ok && mapped.items.length > 0) {
          context.notificationService.addNotifications(mapped.items);
        }
      },
    }),
  );
}
