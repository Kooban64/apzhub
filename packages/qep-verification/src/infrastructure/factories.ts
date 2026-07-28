/**
 * QEP Verification persistence factories (APZQEP-ENG-040B Part 2).
 * Production requires PostgreSQL — no silent in-memory fallback.
 */
import type { DatabaseExecutor } from "@apzhub/config";

import type { VerificationRepository } from "../domain/verification/verification-repository";
import {
  createEmptyVerificationStore,
  createInMemoryVerificationRepository,
  type VerificationInMemoryStore,
} from "./in-memory/verification-repository";
import { createPostgresVerificationRepository } from "./postgres/verification-repository";

export type QepVerificationRepositories = {
  readonly verifications: VerificationRepository;
};

export type CreateQepVerificationPersistenceInput = {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly stores?: VerificationInMemoryStore;
};

export function createQepVerificationPersistence(
  input: CreateQepVerificationPersistenceInput,
): QepVerificationRepositories {
  if (input.mode === "memory") {
    const stores = input.stores ?? createEmptyVerificationStore();
    return {
      verifications: createInMemoryVerificationRepository(stores),
    };
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createQepVerificationPersistence({ mode: 'postgres' }) requires db — in-memory fallback is forbidden",
      );
    }
    return {
      verifications: createPostgresVerificationRepository(input.db),
    };
  }
  throw new Error(
    `Unsupported QEP verification persistence mode: ${String((input as { mode?: string }).mode)}`,
  );
}

export type CreateQepVerificationPersistenceForProductionInput = {
  readonly db: DatabaseExecutor;
};

export function createQepVerificationPersistenceForProduction(
  input: CreateQepVerificationPersistenceForProductionInput,
): QepVerificationRepositories {
  if (!input?.db) {
    throw new Error(
      "createQepVerificationPersistenceForProduction requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return {
    verifications: createPostgresVerificationRepository(input.db),
  };
}

export type CreateQepVerificationPersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly stores?: VerificationInMemoryStore;
};

export function createQepVerificationPersistenceForTest(
  input: CreateQepVerificationPersistenceForTestInput = {},
): QepVerificationRepositories {
  if (input.postgresDb) {
    return {
      verifications: createPostgresVerificationRepository(input.postgresDb),
    };
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createQepVerificationPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return createQepVerificationPersistence({ mode: "memory", stores: input.stores });
}

export {
  createEmptyVerificationStore,
  type VerificationInMemoryStore,
} from "./in-memory/verification-repository";
