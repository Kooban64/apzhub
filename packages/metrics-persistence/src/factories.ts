/**
 * Metrics persistence factories (APZMETRICS-001).
 * Production requires PostgreSQL — no silent in-memory fallback.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { MetricsFoundationRepos } from "@apzhub/metrics-core";

import {
  createEmptyMetricsInMemoryStores,
  createInMemoryMetricsRepositories,
  type MetricsInMemoryStores,
} from "./in-memory/repositories";
import { createPostgresMetricsRepositories } from "./postgres/repositories";

export type MetricsPersistenceBundle = MetricsFoundationRepos;

export type CreateMetricsPersistenceInput = {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly stores?: MetricsInMemoryStores;
};

export function createMetricsPersistence(
  input: CreateMetricsPersistenceInput,
): MetricsPersistenceBundle {
  if (input.mode === "memory") {
    const stores = input.stores ?? createEmptyMetricsInMemoryStores();
    return createInMemoryMetricsRepositories(stores);
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createMetricsPersistence({ mode: 'postgres' }) requires db — in-memory fallback is forbidden",
      );
    }
    return createPostgresMetricsRepositories(input.db);
  }
  throw new Error(
    `Unsupported metrics persistence mode: ${String((input as { mode?: string }).mode)}`,
  );
}

export type CreateProductionMetricsPersistenceInput = {
  readonly db: DatabaseExecutor;
};

export function createProductionMetricsPersistence(
  input: CreateProductionMetricsPersistenceInput,
): MetricsPersistenceBundle {
  if (!input?.db) {
    throw new Error(
      "createProductionMetricsPersistence requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return createPostgresMetricsRepositories(input.db);
}

export type CreateMetricsPersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly stores?: MetricsInMemoryStores;
};

export function createMetricsPersistenceForTest(
  input: CreateMetricsPersistenceForTestInput = {},
): MetricsPersistenceBundle {
  if (input.postgresDb) {
    return createPostgresMetricsRepositories(input.postgresDb);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createMetricsPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return createMetricsPersistence({
    mode: "memory",
    stores: input.stores,
  });
}
