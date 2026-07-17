/**
 * Administration persistence factories (APZADMIN-001).
 * Production requires PostgreSQL — no silent in-memory fallback.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { AdministrationFoundationRepos } from "@apzhub/admin-core";

import {
  createEmptyAdministrationInMemoryStores,
  createInMemoryAdministrationRepositories,
  type AdministrationInMemoryStores,
} from "./in-memory/repositories";
import { createPostgresAdministrationRepositories } from "./postgres/repositories";

export type AdministrationPersistenceBundle = AdministrationFoundationRepos;

export type CreateAdministrationPersistenceInput = {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly stores?: AdministrationInMemoryStores;
};

export function createAdministrationPersistence(
  input: CreateAdministrationPersistenceInput,
): AdministrationPersistenceBundle {
  if (input.mode === "memory") {
    const stores = input.stores ?? createEmptyAdministrationInMemoryStores();
    return createInMemoryAdministrationRepositories(stores);
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createAdministrationPersistence({ mode: 'postgres' }) requires db — in-memory fallback is forbidden",
      );
    }
    return createPostgresAdministrationRepositories(input.db);
  }
  throw new Error(
    `Unsupported administration persistence mode: ${String((input as { mode?: string }).mode)}`,
  );
}

export type CreateProductionAdministrationPersistenceInput = {
  readonly db: DatabaseExecutor;
};

export function createProductionAdministrationPersistence(
  input: CreateProductionAdministrationPersistenceInput,
): AdministrationPersistenceBundle {
  if (!input?.db) {
    throw new Error(
      "createProductionAdministrationPersistence requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return createPostgresAdministrationRepositories(input.db);
}

export type CreateAdministrationPersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly stores?: AdministrationInMemoryStores;
};

export function createAdministrationPersistenceForTest(
  input: CreateAdministrationPersistenceForTestInput = {},
): AdministrationPersistenceBundle {
  if (input.postgresDb) {
    return createPostgresAdministrationRepositories(input.postgresDb);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createAdministrationPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return createAdministrationPersistence({
    mode: "memory",
    stores: input.stores,
  });
}
