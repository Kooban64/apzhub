/**
 * Document persistence factories (APZDOCS-002).
 * Production requires PostgreSQL — no silent in-memory fallback.
 */

import type { DatabaseExecutor } from "@apzhub/config";

import {
  createDocumentPlatformReposFromMemory,
  createEmptyDocumentInMemoryStores,
  type DocumentInMemoryStores,
  type InMemoryDocumentRepositories,
} from "./in-memory/repositories";
import { createPostgresDocumentRepositories } from "./postgres/postgres-repositories";
import {
  createEmptyDocumentVersionInMemoryStores,
  createInMemoryDocumentVersionRepositories,
  type DocumentVersionInMemoryStores,
} from "./version/in-memory-versions";

export type DocumentPersistenceBundle = ReturnType<
  typeof createPostgresDocumentRepositories
>;

export type CreateDocumentPersistenceForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
};

export type CreateDocumentPersistenceForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  /**
   * Explicit opt-in for in-memory metadata + version stores.
   * Required when postgresDb is omitted — no silent fallback.
   */
  readonly allowInMemoryPersistence?: boolean;
  readonly stores?: DocumentInMemoryStores;
  readonly versionStores?: DocumentVersionInMemoryStores;
};

function mergeInMemory(
  meta: InMemoryDocumentRepositories,
  versions: ReturnType<typeof createInMemoryDocumentVersionRepositories>,
): DocumentPersistenceBundle {
  return {
    documents: meta.documents,
    metadata: meta.metadata,
    tags: meta.tags,
    relationships: meta.relationships,
    audits: meta.audits,
    versions: versions.versions,
    storageObjects: versions.storageObjects,
  };
}

/**
 * Production persistence — PostgreSQL mandatory.
 * Throws if postgresDb is missing.
 */
export function createDocumentPersistenceForProduction(
  input: CreateDocumentPersistenceForProductionInput,
): DocumentPersistenceBundle {
  if (!input.postgresDb) {
    throw new Error(
      "createDocumentPersistenceForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  return createPostgresDocumentRepositories(input.postgresDb);
}

/**
 * Test persistence — PostgreSQL when provided; otherwise explicit in-memory opt-in.
 */
export function createDocumentPersistenceForTest(
  input: CreateDocumentPersistenceForTestInput = {},
): DocumentPersistenceBundle {
  if (input.postgresDb) {
    return createPostgresDocumentRepositories(input.postgresDb);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createDocumentPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const stores = input.stores ?? createEmptyDocumentInMemoryStores();
  const versionStores =
    input.versionStores ?? createEmptyDocumentVersionInMemoryStores();
  return mergeInMemory(
    createDocumentPlatformReposFromMemory(stores),
    createInMemoryDocumentVersionRepositories(versionStores),
  );
}
