/**
 * Process-level Notification Delivery Service (ADR-0071 / Platform-1.3-ENG-004).
 * Hybrid central delivery — in-app + SMTP when `.secrets/smtp` is loaded.
 * ENG-001B: durable runtime binds PostgreSQL store + worker when flag ON.
 */

import type {
  NotificationDeliveryAdminService,
  NotificationDeliveryService,
} from "@apzhub/notification-contracts";
import type { DatabaseExecutor } from "@apzhub/config";
import { ensureLocalSecretsLoaded, getDb, lookupUserEmailById } from "@apzhub/config";
import {
  createDurableDeliveryStoreForTest,
  createDurableDeliveryStoreFromDb,
  createDurableNotificationRuntimeBootstrap,
  createNotificationDeliveryAdminService,
  createNotificationDeliveryService,
  createObserveNotificationDeliveryHook,
  isNotificationDeliveryEnabled,
  isNotificationDurableRuntimeEnabled,
  isNotificationWorkerEnabled,
  type DurableNotificationWorker,
} from "@apzhub/platform-services";

import {
  getOrCreateServerDomainEventPublisher,
  getServerDomainEventBus,
} from "./domain-event-bus";

type DeliveryServiceRuntime = ReturnType<typeof createNotificationDeliveryService>;

let deliveryService: DeliveryServiceRuntime | undefined;
let deliveryAdminService: NotificationDeliveryAdminService | undefined;
let durableWorker: DurableNotificationWorker | null = null;

function attachEventBusIfAvailable(service: DeliveryServiceRuntime): void {
  const bus = getServerDomainEventBus();
  if (!bus || !isNotificationDeliveryEnabled(process.env)) return;

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

export function getOrCreateNotificationDeliveryService(): NotificationDeliveryService {
  if (deliveryService) return deliveryService;

  ensureLocalSecretsLoaded();
  const publisher = getOrCreateServerDomainEventPublisher();
  const durableOn = isNotificationDurableRuntimeEnabled(process.env);

  if (durableOn) {
    const store = createDurableDeliveryStoreFromDb(getDb());
    const service = createNotificationDeliveryService({
      env: process.env,
      publisher,
      durableStore: store,
      resolveUser: async ({ userId, organisationId }) => {
        const email = await lookupUserEmailById(userId);
        if (!email) {
          return { ok: true, active: true, organisationId };
        }
        return { ok: true, active: true, organisationId, email };
      },
    });

    attachEventBusIfAvailable(service);

    const boot = createDurableNotificationRuntimeBootstrap({
      store,
      env: process.env,
      autoStartWorker: true,
      publisher,
      resolveEmail: async ({ userId }) => lookupUserEmailById(userId),
    });
    durableWorker = boot.durableWorker;

    deliveryAdminService = createNotificationDeliveryAdminService({
      store,
      env: process.env,
      publisher,
    });

    deliveryService = service;
    return service;
  }

  const service = createNotificationDeliveryService({
    env: process.env,
    publisher,
    resolveUser: async ({ userId, organisationId }) => {
      const email = await lookupUserEmailById(userId);
      if (!email) {
        return { ok: true, active: true, organisationId };
      }
      return { ok: true, active: true, organisationId, email };
    },
  });

  attachEventBusIfAvailable(service);

  if (isNotificationWorkerEnabled(process.env)) {
    service.startWorker();
  }

  deliveryService = service;
  return service;
}

/**
 * Durable delivery admin — available even when durable runtime flag is OFF.
 * When durable ON, shares the same PostgreSQL store as intake/worker.
 */
export function getOrCreateNotificationDeliveryAdminService(): NotificationDeliveryAdminService {
  if (deliveryAdminService) return deliveryAdminService;

  ensureLocalSecretsLoaded();
  const publisher = getOrCreateServerDomainEventPublisher();

  if (isNotificationDurableRuntimeEnabled(process.env)) {
    // Ensure delivery service (and shared store) are initialised first.
    getOrCreateNotificationDeliveryService();
    if (deliveryAdminService) return deliveryAdminService;
  }

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
  if (durableWorker) {
    void durableWorker.stop().catch(() => {
      /* ignore */
    });
  }
  deliveryService = undefined;
  deliveryAdminService = undefined;
  durableWorker = null;
}
