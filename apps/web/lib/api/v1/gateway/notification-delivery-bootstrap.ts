/**
 * Process-level Notification Delivery Service (ADR-0071 / Platform-1.3-ENG-004).
 * Hybrid central delivery — in-app Phase A; SMTP deferred.
 * ENG-001B-P4: durable admin service (store-backed) — flag default OFF.
 */

import type {
  NotificationDeliveryAdminService,
  NotificationDeliveryService,
} from "@apzhub/notification-contracts";
import type { DatabaseExecutor } from "@apzhub/config";
import {
  createDurableDeliveryStoreForTest,
  createDurableDeliveryStoreFromDb,
  createNotificationDeliveryAdminService,
  createNotificationDeliveryService,
  createObserveNotificationDeliveryHook,
  isNotificationDeliveryEnabled,
  isNotificationWorkerEnabled,
} from "@apzhub/platform-services";

import {
  getOrCreateServerDomainEventPublisher,
  getServerDomainEventBus,
} from "./domain-event-bus";

type DeliveryServiceRuntime = ReturnType<typeof createNotificationDeliveryService>;

let deliveryService: DeliveryServiceRuntime | undefined;
let deliveryAdminService: NotificationDeliveryAdminService | undefined;

export function getOrCreateNotificationDeliveryService(): NotificationDeliveryService {
  if (deliveryService) return deliveryService;

  const publisher = getOrCreateServerDomainEventPublisher();
  const bus = getServerDomainEventBus();

  const service = createNotificationDeliveryService({
    env: process.env,
    publisher,
  });

  if (bus && isNotificationDeliveryEnabled(process.env)) {
    service.attachEventBus({
      subscribe: (options) =>
        bus.subscribe({
          eventPattern: options.eventPattern,
          handler: (envelope) => {
            options.handler({
              envelopeId: envelope.envelopeId,
              eventId: envelope.eventId,
              eventVersion: envelope.eventVersion,
              category: envelope.category as never,
              correlationId: envelope.correlationId,
              causationId: envelope.causationId,
              timestamp: envelope.timestamp,
              publisher: envelope.publisher,
              actorId: envelope.actorId,
              sourceService: envelope.sourceService,
              tenantId: envelope.tenantId,
              payload: envelope.payload,
            });
          },
        }),
      unsubscribe: (id) => bus.unsubscribe(id),
    });
  }

  if (isNotificationWorkerEnabled(process.env)) {
    service.startWorker();
  }

  deliveryService = service;
  return service;
}

/**
 * Durable delivery admin — available even when durable runtime flag is OFF.
 */
export function getOrCreateNotificationDeliveryAdminService(): NotificationDeliveryAdminService {
  if (deliveryAdminService) return deliveryAdminService;
  const publisher = getOrCreateServerDomainEventPublisher();
  deliveryAdminService = createNotificationDeliveryAdminService({
    store: createDurableDeliveryStoreForTest(),
    env: process.env,
    publisher,
  });
  return deliveryAdminService;
}

/** Bind admin to explicit postgres db when available (ops wiring). */
export function bindNotificationDeliveryAdminStoreFromDb(
  db: DatabaseExecutor,
): NotificationDeliveryAdminService {
  deliveryAdminService = createNotificationDeliveryAdminService({
    store: createDurableDeliveryStoreFromDb(db),
    env: process.env,
    publisher: getOrCreateServerDomainEventPublisher(),
  });
  return deliveryAdminService;
}

export function createObserveDeliveryHookFromBootstrap() {
  const service = getOrCreateNotificationDeliveryService();
  return createObserveNotificationDeliveryHook(service);
}

export function isNotificationDeliveryHttpEnabled(): boolean {
  return isNotificationDeliveryEnabled(process.env);
}

/** Test helper */
export function resetNotificationDeliveryServiceForTests(): void {
  if (deliveryService) {
    try {
      deliveryService.stopWorker();
    } catch {
      /* ignore */
    }
  }
  deliveryService = undefined;
  deliveryAdminService = undefined;
}
