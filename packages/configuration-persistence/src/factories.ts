/**
 * Configuration persistence factories (APZCONFIG-001 / APZCONFIG-002).
 * Production requires PostgreSQL — no silent in-memory fallback.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { ConfigurationFoundationRepos } from "@apzhub/configuration-core";

import {
  createEmptyConfigurationInMemoryStores,
  createInMemoryConfigurationRepositories,
  type ConfigurationInMemoryStores,
} from "./in-memory/repositories";
import { createPostgresConfigurationRepositories } from "./postgres/repositories";

export type ConfigurationPersistenceBundle = ConfigurationFoundationRepos;

export type CreateConfigurationPersistenceInput = {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly stores?: ConfigurationInMemoryStores;
};

export function createConfigurationPersistence(
  input: CreateConfigurationPersistenceInput,
): ConfigurationPersistenceBundle {
  if (input.mode === "memory") {
    const stores = input.stores ?? createEmptyConfigurationInMemoryStores();
    return createInMemoryConfigurationRepositories(stores);
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createConfigurationPersistence({ mode: 'postgres' }) requires db — in-memory fallback is forbidden",
      );
    }
    return createPostgresConfigurationRepositories(input.db);
  }
  throw new Error(
    `Unsupported configuration persistence mode: ${String((input as { mode?: string }).mode)}`,
  );
}

export type CreateProductionConfigurationPersistenceInput = {
  readonly db: DatabaseExecutor;
};

export function createProductionConfigurationPersistence(
  input: CreateProductionConfigurationPersistenceInput,
): ConfigurationPersistenceBundle {
  if (!input?.db) {
    throw new Error(
      "createProductionConfigurationPersistence requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return createPostgresConfigurationRepositories(input.db);
}

export type CreateConfigurationPersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly stores?: ConfigurationInMemoryStores;
};

export function createConfigurationPersistenceForTest(
  input: CreateConfigurationPersistenceForTestInput = {},
): ConfigurationPersistenceBundle {
  if (input.postgresDb) {
    return createPostgresConfigurationRepositories(input.postgresDb);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createConfigurationPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return createConfigurationPersistence({
    mode: "memory",
    stores: input.stores,
  });
}
