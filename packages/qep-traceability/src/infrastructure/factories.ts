/**
 * QEP Traceability persistence factories (APZQEP-ENG-030A Part 2).
 * Production requires PostgreSQL — no silent in-memory fallback.
 */
import type { DatabaseExecutor } from "@apzhub/config";

import type {
  TraceLinkRepository,
  TraceTaxonomyRepository,
} from "../domain/trace-link/trace-link-repository";
import {
  createEmptyTraceLinkStore,
  createInMemoryTraceLinkRepository,
  createInMemoryTraceTaxonomyRepository,
  type TraceLinkInMemoryStore,
} from "./in-memory/trace-link-repository";
import {
  createPostgresTraceLinkRepository,
  createPostgresTraceTaxonomyRepository,
} from "./postgres/trace-link-repository";

export type QepTraceabilityRepositories = {
  readonly traceLinks: TraceLinkRepository;
  readonly traceTaxonomy: TraceTaxonomyRepository;
};

export type CreateQepTraceabilityPersistenceInput = {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly stores?: TraceLinkInMemoryStore;
};

export function createQepTraceabilityPersistence(
  input: CreateQepTraceabilityPersistenceInput,
): QepTraceabilityRepositories {
  if (input.mode === "memory") {
    const stores = input.stores ?? createEmptyTraceLinkStore();
    return {
      traceLinks: createInMemoryTraceLinkRepository(stores),
      traceTaxonomy: createInMemoryTraceTaxonomyRepository(stores),
    };
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createQepTraceabilityPersistence({ mode: 'postgres' }) requires db — in-memory fallback is forbidden",
      );
    }
    return {
      traceLinks: createPostgresTraceLinkRepository(input.db),
      traceTaxonomy: createPostgresTraceTaxonomyRepository(input.db),
    };
  }
  throw new Error(
    `Unsupported QEP traceability persistence mode: ${String((input as { mode?: string }).mode)}`,
  );
}

export type CreateQepTraceabilityPersistenceForProductionInput = {
  readonly db: DatabaseExecutor;
};

export function createQepTraceabilityPersistenceForProduction(
  input: CreateQepTraceabilityPersistenceForProductionInput,
): QepTraceabilityRepositories {
  if (!input?.db) {
    throw new Error(
      "createQepTraceabilityPersistenceForProduction requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return {
    traceLinks: createPostgresTraceLinkRepository(input.db),
    traceTaxonomy: createPostgresTraceTaxonomyRepository(input.db),
  };
}

export type CreateQepTraceabilityPersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly stores?: TraceLinkInMemoryStore;
};

export function createQepTraceabilityPersistenceForTest(
  input: CreateQepTraceabilityPersistenceForTestInput = {},
): QepTraceabilityRepositories {
  if (input.postgresDb) {
    return {
      traceLinks: createPostgresTraceLinkRepository(input.postgresDb),
      traceTaxonomy: createPostgresTraceTaxonomyRepository(input.postgresDb),
    };
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createQepTraceabilityPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return createQepTraceabilityPersistence({ mode: "memory", stores: input.stores });
}

export {
  createEmptyTraceLinkStore,
  type TraceLinkInMemoryStore,
} from "./in-memory/trace-link-repository";
