/**
 * Notification persistence factories (APZNOTIFY-001).
 * Production requires PostgreSQL — no silent in-memory fallback.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { NotificationFoundationRepos } from "@apzhub/notification-core";

import {
  createEmptyNotificationInMemoryStores,
  createInMemoryNotificationRepositories,
  type NotificationInMemoryStores,
} from "./in-memory/repositories";
import { createPostgresNotificationRepositories } from "./postgres/repositories";

export type NotificationPersistenceBundle = NotificationFoundationRepos;

export type CreateNotificationPersistenceInput = {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly stores?: NotificationInMemoryStores;
};

/**
 * Create notification persistence for the requested mode.
 * `postgres` requires an explicit db handle.
 */
export function createNotificationPersistence(
  input: CreateNotificationPersistenceInput,
): NotificationPersistenceBundle {
  if (input.mode === "memory") {
    const stores = input.stores ?? createEmptyNotificationInMemoryStores();
    return createInMemoryNotificationRepositories(stores);
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createNotificationPersistence({ mode: 'postgres' }) requires db — in-memory fallback is forbidden",
      );
    }
    return createPostgresNotificationRepositories(input.db);
  }
  throw new Error(
    `Unsupported notification persistence mode: ${String((input as { mode?: string }).mode)}`,
  );
}

export type CreateProductionNotificationPersistenceInput = {
  readonly db: DatabaseExecutor;
};

/**
 * Production helper — PostgreSQL mandatory.
 * Throws if db is missing.
 */
export function createProductionNotificationPersistence(
  input: CreateProductionNotificationPersistenceInput,
): NotificationPersistenceBundle {
  if (!input?.db) {
    throw new Error(
      "createProductionNotificationPersistence requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return createPostgresNotificationRepositories(input.db);
}

export type CreateNotificationPersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly stores?: NotificationInMemoryStores;
};

/**
 * Test helper — in-memory only when explicitly allowed.
 * Production bootstrap must never call this.
 */
export function createNotificationPersistenceForTest(
  input: CreateNotificationPersistenceForTestInput = {},
): NotificationPersistenceBundle {
  if (input.postgresDb) {
    return createPostgresNotificationRepositories(input.postgresDb);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createNotificationPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return createNotificationPersistence({
    mode: "memory",
    stores: input.stores,
  });
}
