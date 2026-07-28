/**
 * QEP Requirements persistence factories (APZQEP-ENG-020B / ENG-020F Part 2).
 * Production requires PostgreSQL — no silent in-memory fallback.
 */

import type { DatabaseExecutor } from "@apzhub/config";

import type { RequirementContentVersionRepository } from "../domain/repositories/requirement-content-version-repository";
import {
  createEmptyQepRequirementsInMemoryStores,
  createInMemoryQepRequirementsRepositories,
  type QepRequirementsInMemoryStores,
  type QepRequirementsRepositories,
} from "./in-memory/repositories";
import { createPostgresQepRequirementsRepositories } from "./postgres/repositories";

export type QepRequirementsPersistenceBundle = QepRequirementsRepositories & {
  readonly contentVersions: RequirementContentVersionRepository;
};

export type CreateQepRequirementsPersistenceInput = {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly stores?: QepRequirementsInMemoryStores;
};

export function createQepRequirementsPersistence(
  input: CreateQepRequirementsPersistenceInput,
): QepRequirementsPersistenceBundle {
  if (input.mode === "memory") {
    const stores = input.stores ?? createEmptyQepRequirementsInMemoryStores();
    return createInMemoryQepRequirementsRepositories(stores);
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createQepRequirementsPersistence({ mode: 'postgres' }) requires db — in-memory fallback is forbidden",
      );
    }
    return createPostgresQepRequirementsRepositories(input.db);
  }
  throw new Error(
    `Unsupported QEP requirements persistence mode: ${String((input as { mode?: string }).mode)}`,
  );
}

export type CreateQepRequirementsPersistenceForProductionInput = {
  readonly db: DatabaseExecutor;
};

export function createQepRequirementsPersistenceForProduction(
  input: CreateQepRequirementsPersistenceForProductionInput,
): QepRequirementsPersistenceBundle {
  if (!input?.db) {
    throw new Error(
      "createQepRequirementsPersistenceForProduction requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return createPostgresQepRequirementsRepositories(input.db);
}

export type CreateQepRequirementsPersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly stores?: QepRequirementsInMemoryStores;
};

export function createQepRequirementsPersistenceForTest(
  input: CreateQepRequirementsPersistenceForTestInput = {},
): QepRequirementsPersistenceBundle {
  if (input.postgresDb) {
    return createPostgresQepRequirementsRepositories(input.postgresDb);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createQepRequirementsPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return createQepRequirementsPersistence({
    mode: "memory",
    stores: input.stores,
  });
}

export {
  createEmptyQepRequirementsInMemoryStores,
  type QepRequirementsInMemoryStores,
} from "./in-memory/repositories";
