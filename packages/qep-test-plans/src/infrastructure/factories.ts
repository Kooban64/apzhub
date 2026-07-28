/**
 * QEP Test Plan persistence factories (APZQEP-ENG-060B).
 * Production requires PostgreSQL — no silent in-memory fallback.
 */
import type { DatabaseExecutor } from "@apzhub/config";

import type { TestPlanRepository } from "../domain/test-plan/plan-repository";
import {
  createEmptyTestPlanStore,
  createInMemoryTestPlanRepository,
  type TestPlanInMemoryStore,
} from "./in-memory/plan-repository";
import { createPostgresTestPlanRepository } from "./postgres/plan-repository";

export type QepTestPlanRepositories = {
  readonly plans: TestPlanRepository;
};

export type CreateQepTestPlanPersistenceInput = {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly stores?: TestPlanInMemoryStore;
};

export function createQepTestPlanPersistence(
  input: CreateQepTestPlanPersistenceInput,
): QepTestPlanRepositories {
  if (input.mode === "memory") {
    const stores = input.stores ?? createEmptyTestPlanStore();
    return {
      plans: createInMemoryTestPlanRepository(stores),
    };
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createQepTestPlanPersistence({ mode: 'postgres' }) requires db — in-memory fallback is forbidden",
      );
    }
    return {
      plans: createPostgresTestPlanRepository(input.db),
    };
  }
  throw new Error(
    `Unsupported QEP test plan persistence mode: ${String((input as { mode?: string }).mode)}`,
  );
}

export type CreateQepTestPlanPersistenceForProductionInput = {
  readonly db: DatabaseExecutor;
};

export function createQepTestPlanPersistenceForProduction(
  input: CreateQepTestPlanPersistenceForProductionInput,
): QepTestPlanRepositories {
  if (!input?.db) {
    throw new Error(
      "createQepTestPlanPersistenceForProduction requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return {
    plans: createPostgresTestPlanRepository(input.db),
  };
}

export type CreateQepTestPlanPersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly stores?: TestPlanInMemoryStore;
};

export function createQepTestPlanPersistenceForTest(
  input: CreateQepTestPlanPersistenceForTestInput = {},
): QepTestPlanRepositories {
  if (input.postgresDb) {
    return {
      plans: createPostgresTestPlanRepository(input.postgresDb),
    };
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createQepTestPlanPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return createQepTestPlanPersistence({ mode: "memory", stores: input.stores });
}

export {
  createEmptyTestPlanStore,
  type TestPlanInMemoryStore,
} from "./in-memory/plan-repository";
