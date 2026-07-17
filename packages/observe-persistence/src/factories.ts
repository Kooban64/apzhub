/**
 * Observability persistence factories (APZOBSERVE-001).
 * Production requires PostgreSQL — no silent in-memory fallback.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { ObserveFoundationRepos } from "@apzhub/observe-core";

import {
  createEmptyObserveInMemoryStores,
  createInMemoryObserveRepositories,
  type ObserveInMemoryStores,
} from "./in-memory/repositories";
import { createPostgresObserveRepositories } from "./postgres/repositories";

export type ObservePersistenceBundle = ObserveFoundationRepos;

export type CreateObservePersistenceInput = {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly stores?: ObserveInMemoryStores;
};

export function createObservePersistence(
  input: CreateObservePersistenceInput,
): ObservePersistenceBundle {
  if (input.mode === "memory") {
    const stores = input.stores ?? createEmptyObserveInMemoryStores();
    return createInMemoryObserveRepositories(stores);
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createObservePersistence({ mode: 'postgres' }) requires db — in-memory fallback is forbidden",
      );
    }
    return createPostgresObserveRepositories(input.db);
  }
  throw new Error(
    `Unsupported observe persistence mode: ${String((input as { mode?: string }).mode)}`,
  );
}

export type CreateProductionObservePersistenceInput = {
  readonly db: DatabaseExecutor;
};

export function createProductionObservePersistence(
  input: CreateProductionObservePersistenceInput,
): ObservePersistenceBundle {
  if (!input?.db) {
    throw new Error(
      "createProductionObservePersistence requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return createPostgresObserveRepositories(input.db);
}

export type CreateObservePersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly stores?: ObserveInMemoryStores;
};

export function createObservePersistenceForTest(
  input: CreateObservePersistenceForTestInput = {},
): ObservePersistenceBundle {
  if (input.postgresDb) {
    return createPostgresObserveRepositories(input.postgresDb);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createObservePersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return createObservePersistence({
    mode: "memory",
    stores: input.stores,
  });
}
