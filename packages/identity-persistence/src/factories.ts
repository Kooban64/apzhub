/**
 * Identity Administration persistence factories (APZIDENTITY-001).
 * Production requires PostgreSQL — no silent in-memory fallback.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { IdentityFoundationRepos } from "@apzhub/identity-core";

import {
  createEmptyIdentityInMemoryStores,
  createInMemoryIdentityRepositories,
  type IdentityInMemoryStores,
} from "./in-memory/repositories";
import { createPostgresIdentityRepositories } from "./postgres/repositories";

export type IdentityPersistenceBundle = IdentityFoundationRepos;

export type CreateIdentityPersistenceInput = {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly stores?: IdentityInMemoryStores;
};

export function createIdentityPersistence(
  input: CreateIdentityPersistenceInput,
): IdentityPersistenceBundle {
  if (input.mode === "memory") {
    const stores = input.stores ?? createEmptyIdentityInMemoryStores();
    return createInMemoryIdentityRepositories(stores);
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createIdentityPersistence({ mode: 'postgres' }) requires db — in-memory fallback is forbidden",
      );
    }
    return createPostgresIdentityRepositories(input.db);
  }
  throw new Error(
    `Unsupported identity persistence mode: ${String((input as { mode?: string }).mode)}`,
  );
}

export type CreateProductionIdentityPersistenceInput = {
  readonly db: DatabaseExecutor;
};

export function createProductionIdentityPersistence(
  input: CreateProductionIdentityPersistenceInput,
): IdentityPersistenceBundle {
  if (!input?.db) {
    throw new Error(
      "createProductionIdentityPersistence requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return createPostgresIdentityRepositories(input.db);
}

export type CreateIdentityPersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly stores?: IdentityInMemoryStores;
};

export function createIdentityPersistenceForTest(
  input: CreateIdentityPersistenceForTestInput = {},
): IdentityPersistenceBundle {
  if (input.postgresDb) {
    return createPostgresIdentityRepositories(input.postgresDb);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createIdentityPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return createIdentityPersistence({
    mode: "memory",
    stores: input.stores,
  });
}
