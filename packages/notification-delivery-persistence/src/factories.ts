/**
 * Factories for Notification Delivery durable persistence (ENG-001B-P1/P2).
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { NotificationDeliveryDurableRuntimeStore } from "@apzhub/notification-contracts";

import {
  createEmptyNotificationDeliveryInMemoryStores,
  createInMemoryNotificationDeliveryDurableStore,
  type NotificationDeliveryInMemoryStores,
} from "./in-memory/store";
import { createPostgresNotificationDeliveryDurableStore } from "./postgres/store";

export type CreateNotificationDeliveryDurableStoreInput =
  | {
      readonly mode: "memory";
      readonly stores?: NotificationDeliveryInMemoryStores;
    }
  | {
      readonly mode: "postgres";
      readonly db: DatabaseExecutor;
    };

export function createNotificationDeliveryDurableStore(
  input: CreateNotificationDeliveryDurableStoreInput,
): NotificationDeliveryDurableRuntimeStore {
  if (input.mode === "memory") {
    return createInMemoryNotificationDeliveryDurableStore(
      input.stores ?? createEmptyNotificationDeliveryInMemoryStores(),
    );
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createNotificationDeliveryDurableStore({ mode: 'postgres' }) requires db",
      );
    }
    return createPostgresNotificationDeliveryDurableStore(input.db);
  }
  throw new Error(
    `Unsupported notification delivery durable store mode: ${String(
      (input as { mode?: string }).mode,
    )}`,
  );
}

export function createProductionNotificationDeliveryDurableStore(input: {
  readonly db: DatabaseExecutor;
}): NotificationDeliveryDurableRuntimeStore {
  if (!input?.db) {
    throw new Error(
      "createProductionNotificationDeliveryDurableStore requires explicit postgres db",
    );
  }
  return createPostgresNotificationDeliveryDurableStore(input.db);
}

export function createNotificationDeliveryDurableStoreForTest(
  input: {
    readonly postgresDb?: DatabaseExecutor;
    readonly allowInMemory?: boolean;
    readonly stores?: NotificationDeliveryInMemoryStores;
  } = {},
): NotificationDeliveryDurableRuntimeStore {
  if (input.postgresDb) {
    return createPostgresNotificationDeliveryDurableStore(input.postgresDb);
  }
  if (input.allowInMemory) {
    return createInMemoryNotificationDeliveryDurableStore(
      input.stores ?? createEmptyNotificationDeliveryInMemoryStores(),
    );
  }
  throw new Error(
    "createNotificationDeliveryDurableStoreForTest requires postgresDb or allowInMemory: true",
  );
}
