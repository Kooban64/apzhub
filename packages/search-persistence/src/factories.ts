/**
 * Search persistence factories (APZSEARCH-002).
 * Production must not silently fall back to in-memory.
 */

import type { DatabaseExecutor } from "@apzhub/config";

import {
  createEmptySearchInMemoryStores,
  createInMemorySearchPersistence,
} from "./in-memory/repositories";
import type { SearchPersistenceBundle } from "./ports";
import { createPostgresSearchPersistence } from "./postgres/repositories";
import {
  createSearchProviderRegistry,
  type SearchProviderRegistryBundle,
} from "./registry/provider-registry";
import { createSearchPlatformServices } from "./services/platform-services";
import type { SearchPlatformGateway } from "@apzhub/search-contracts";

export type CreateSearchPersistenceForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
};

export type CreateSearchPersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  /** Explicit opt-in required when no postgresDb is provided. */
  readonly allowInMemoryPersistence?: boolean;
};

export function createSearchPersistenceForProduction(
  input: CreateSearchPersistenceForProductionInput,
): SearchPersistenceBundle {
  if (!input.postgresDb) {
    throw new Error(
      "createSearchPersistenceForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  return createPostgresSearchPersistence(input.postgresDb);
}

export function createSearchPersistenceForTest(
  input: CreateSearchPersistenceForTestInput = {},
): SearchPersistenceBundle {
  if (input.postgresDb) {
    return createPostgresSearchPersistence(input.postgresDb);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createSearchPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return createInMemorySearchPersistence(createEmptySearchInMemoryStores());
}

export type SearchPlatformFoundation = {
  readonly persistence: SearchPersistenceBundle;
  readonly registry: SearchProviderRegistryBundle;
  readonly gateway: SearchPlatformGateway;
  readonly readiness: {
    readonly searchEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly executionEnabled: false;
    readonly managementPlaneReady: true;
  };
};

export type CreateSearchPlatformFoundationInput = {
  readonly persistence: SearchPersistenceBundle;
  readonly now?: () => string;
  readonly id?: () => string;
};

export function createSearchPlatformFoundation(
  input: CreateSearchPlatformFoundationInput,
): SearchPlatformFoundation {
  const registry = createSearchProviderRegistry(input.persistence, {
    now: input.now,
    id: input.id,
  });
  const gateway = createSearchPlatformServices({
    persistence: input.persistence,
    registry,
    now: input.now,
    id: input.id,
  });
  return {
    persistence: input.persistence,
    registry,
    gateway,
    readiness: {
      searchEnabled: true,
      persistenceMode: input.persistence.mode,
      executionEnabled: false,
      managementPlaneReady: true,
    },
  };
}

export type CreateSearchPlatformFoundationForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
  readonly now?: () => string;
  readonly id?: () => string;
};

export function createSearchPlatformFoundationForProduction(
  input: CreateSearchPlatformFoundationForProductionInput,
): SearchPlatformFoundation {
  const persistence = createSearchPersistenceForProduction({
    postgresDb: input.postgresDb,
  });
  if (persistence.mode !== "postgres") {
    throw new Error("production foundation must use postgres persistence");
  }
  return createSearchPlatformFoundation({
    persistence,
    now: input.now,
    id: input.id,
  });
}

export type CreateSearchPlatformFoundationForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
};

export function createSearchPlatformFoundationForTest(
  input: CreateSearchPlatformFoundationForTestInput = {},
): SearchPlatformFoundation {
  const persistence = createSearchPersistenceForTest(input);
  return createSearchPlatformFoundation({
    persistence,
    now: input.now,
    id: input.id,
  });
}
