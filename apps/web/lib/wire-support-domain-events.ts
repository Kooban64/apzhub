import {
  wireDomainEventNotifications,
  type EventNotificationContext,
} from "@apzhub/event-notification-framework";

/** Wires Support domain events onto the platform Notification Attention path. */
export function wireSupportDomainNotifications(
  context: EventNotificationContext,
): string[] {
  return wireDomainEventNotifications(context, [
    "support.request.*",
    "support.article.*",
  ]);
}
