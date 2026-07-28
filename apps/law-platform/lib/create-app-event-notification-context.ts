import {
  bootstrapEventRegistry,
  bootstrapNotificationRegistry,
  createDefaultNotificationRegistry,
  createDefaultNotificationService,
  createEventNotificationContext,
  createLawNotificationPersistenceStorageKey,
  createPersistedNotificationSessionStore,
  type EventCapabilityRecord,
  type EventNotificationContext,
  type NotificationService,
  type NotificationSessionStore,
} from "@apzhub/event-notification-framework";

import { createLawSessionDualWriteStorage } from "./persistence/law-session-dual-write-storage";
import { registerAppNotificationRoutes } from "./register-app-notification-routes";
import { registerLawEvents } from "./register-law-events";
import { registerLawNotificationRoutes } from "./register-law-notification-routes";
import { wireAppEventNotifications } from "./wire-app-event-notifications";
import { wireLegalDomainNotifications } from "./wire-legal-domain-events";

export interface CreateAppEventNotificationContextOptions {
  readonly capabilityRecords?: readonly EventCapabilityRecord[];
  /** When set, uses durable platform notification store (OBS-LAW-02). */
  readonly persistenceScope?: {
    readonly userId?: string;
    readonly tenantId?: string;
  };
  readonly notificationStore?: NotificationSessionStore;
  readonly notificationService?: NotificationService;
}

/**
 * Shared apps/web composition root for Event & Notification Framework.
 * Used by server hydration and client shell providers — one context per session surface.
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
  registerLawNotificationRoutes(notificationRegistry);

  const store =
    options.notificationStore ??
    (options.persistenceScope
      ? (() => {
          const storageKey = createLawNotificationPersistenceStorageKey(
            options.persistenceScope!,
          );
          return createPersistedNotificationSessionStore({
            storageKey,
            storage: createLawSessionDualWriteStorage({
              kind: "notification",
              storageKey,
              scope: options.persistenceScope!,
            }),
          });
        })()
      : undefined);
  const notificationService =
    options.notificationService ??
    (store ? createDefaultNotificationService({ store }) : undefined);

  const context = createEventNotificationContext({
    notificationRegistry,
    notificationService,
  });

  bootstrapEventRegistry({
    registry: context.eventRegistry,
    capabilityRecords: options.capabilityRecords,
  });
  registerLawEvents(context.eventRegistry);

  wireAppEventNotifications(context);
  wireLegalDomainNotifications(context);

  return context;
}
