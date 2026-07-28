/**
 * QEP Test Specification persistence factories (APZQEP-ENG-050B).
 * Production requires PostgreSQL — no silent in-memory fallback.
 */
import type { DatabaseExecutor } from "@apzhub/config";

import type { TestSpecificationRepository } from "../domain/test-specification/specification-repository";
import {
  createEmptyTestSpecificationStore,
  createInMemoryTestSpecificationRepository,
  type TestSpecificationInMemoryStore,
} from "./in-memory/specification-repository";
import { createPostgresTestSpecificationRepository } from "./postgres/specification-repository";

export type QepTestSpecificationRepositories = {
  readonly specifications: TestSpecificationRepository;
};

export type CreateQepTestSpecificationPersistenceInput = {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly stores?: TestSpecificationInMemoryStore;
};

export function createQepTestSpecificationPersistence(
  input: CreateQepTestSpecificationPersistenceInput,
): QepTestSpecificationRepositories {
  if (input.mode === "memory") {
    const stores = input.stores ?? createEmptyTestSpecificationStore();
    return {
      specifications: createInMemoryTestSpecificationRepository(stores),
    };
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createQepTestSpecificationPersistence({ mode: 'postgres' }) requires db — in-memory fallback is forbidden",
      );
    }
    return {
      specifications: createPostgresTestSpecificationRepository(input.db),
    };
  }
  throw new Error(
    `Unsupported QEP test specification persistence mode: ${String((input as { mode?: string }).mode)}`,
  );
}

export type CreateQepTestSpecificationPersistenceForProductionInput = {
  readonly db: DatabaseExecutor;
};

export function createQepTestSpecificationPersistenceForProduction(
  input: CreateQepTestSpecificationPersistenceForProductionInput,
): QepTestSpecificationRepositories {
  if (!input?.db) {
    throw new Error(
      "createQepTestSpecificationPersistenceForProduction requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return {
    specifications: createPostgresTestSpecificationRepository(input.db),
  };
}

export type CreateQepTestSpecificationPersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly stores?: TestSpecificationInMemoryStore;
};

export function createQepTestSpecificationPersistenceForTest(
  input: CreateQepTestSpecificationPersistenceForTestInput = {},
): QepTestSpecificationRepositories {
  if (input.postgresDb) {
    return {
      specifications: createPostgresTestSpecificationRepository(input.postgresDb),
    };
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createQepTestSpecificationPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return createQepTestSpecificationPersistence({
    mode: "memory",
    stores: input.stores,
  });
}

export {
  createEmptyTestSpecificationStore,
  type TestSpecificationInMemoryStore,
} from "./in-memory/specification-repository";
