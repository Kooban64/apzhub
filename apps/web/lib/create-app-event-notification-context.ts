import {
  bootstrapEventRegistry,
  bootstrapNotificationRegistry,
  createDefaultNotificationRegistry,
  createEventNotificationContext,
  type EventCapabilityRecord,
  type EventNotificationContext,
} from "@apzhub/event-notification-framework";

import { registerPlatformDomainEventBus } from "./platform-domain-event-bus";
import { registerAppNotificationRoutes } from "./register-app-notification-routes";
import { registerSupportEvents } from "./register-support-events";
import { registerSupportNotificationRoutes } from "./register-support-notification-routes";
import { wireAppEventNotifications } from "./wire-app-event-notifications";
import { wireSupportDomainNotifications } from "./wire-support-domain-events";

export interface CreateAppEventNotificationContextOptions {
  readonly capabilityRecords?: readonly EventCapabilityRecord[];
  /** When true (default), register this context EventBus as the platform domain bus. */
  readonly registerAsPlatformDomainBus?: boolean;
}

/**
 * Shared apps/web composition root for Event & Notification Framework.
 * Used by server hydration and client shell providers — one context per session surface.
 * Includes cross-product Support domain event/notification foundation (APZHUB-1.1-003).
 */
export function createAppEventNotificationContext(
  options: CreateAppEventNotificationContextOptions = {},
): EventNotificationContext {
  const notificationRegistry = createDefaultNotificationRegistry();

  bootstrapNotificationRegistry({
    registry: notificationRegistry,
    capabilityRecords: options.capabilityRecords,
  });
  registerAppNotificationRoutes(notificationRegistry);
  registerSupportNotificationRoutes(notificationRegistry);

  const context = createEventNotificationContext({ notificationRegistry });

  bootstrapEventRegistry({
    registry: context.eventRegistry,
    capabilityRecords: options.capabilityRecords,
  });
  registerSupportEvents(context.eventRegistry);

  wireAppEventNotifications(context);
  wireSupportDomainNotifications(context);

  if (options.registerAsPlatformDomainBus !== false) {
    registerPlatformDomainEventBus(context.eventBus);
  }

  return context;
}
