/**
 * Workflow persistence factories (APZWORKFLOW-001).
 * Production requires PostgreSQL — no silent in-memory fallback.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { WorkflowFoundationRepos } from "@apzhub/workflow-core";

import {
  createEmptyWorkflowInMemoryStores,
  createInMemoryWorkflowRepositories,
  type WorkflowInMemoryStores,
} from "./in-memory/repositories";
import { createPostgresWorkflowRepositories } from "./postgres/repositories";

export type WorkflowPersistenceBundle = WorkflowFoundationRepos;

export type CreateWorkflowPersistenceInput = {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly stores?: WorkflowInMemoryStores;
};

/**
 * Create workflow persistence for the requested mode.
 * `postgres` requires an explicit db handle.
 */
export function createWorkflowPersistence(
  input: CreateWorkflowPersistenceInput,
): WorkflowPersistenceBundle {
  if (input.mode === "memory") {
    const stores = input.stores ?? createEmptyWorkflowInMemoryStores();
    return createInMemoryWorkflowRepositories(stores);
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createWorkflowPersistence({ mode: 'postgres' }) requires db — in-memory fallback is forbidden",
      );
    }
    return createPostgresWorkflowRepositories(input.db);
  }
  throw new Error(`Unsupported workflow persistence mode: ${String((input as { mode?: string }).mode)}`);
}

export type CreateProductionWorkflowPersistenceInput = {
  readonly db: DatabaseExecutor;
};

/**
 * Production helper — PostgreSQL mandatory.
 * Throws if db is missing.
 */
export function createProductionWorkflowPersistence(
  input: CreateProductionWorkflowPersistenceInput,
): WorkflowPersistenceBundle {
  if (!input?.db) {
    throw new Error(
      "createProductionWorkflowPersistence requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return createPostgresWorkflowRepositories(input.db);
}

export type CreateWorkflowPersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly stores?: WorkflowInMemoryStores;
};

/**
 * Test helper — in-memory only when explicitly allowed.
 * Production bootstrap must never call this.
 */
export function createWorkflowPersistenceForTest(
  input: CreateWorkflowPersistenceForTestInput = {},
): WorkflowPersistenceBundle {
  if (input.postgresDb) {
    return createPostgresWorkflowRepositories(input.postgresDb);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createWorkflowPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return createWorkflowPersistence({
    mode: "memory",
    stores: input.stores,
  });
}
