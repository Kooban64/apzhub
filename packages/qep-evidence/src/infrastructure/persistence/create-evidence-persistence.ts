/**
 * Evidence persistence factory — APZQEP-120-S05.
 *
 * Catalogue mode (memory | postgres) is orthogonal to storage provider
 * (memory | local). PostgreSQL is the first durable catalogue adapter.
 */

import type { DatabaseExecutor } from "@apzhub/config";

import {
  createEvidenceApplicationServices,
  createInMemoryAuditPort,
  createInMemoryClockPort,
  createInMemoryIdPort,
  createInMemoryUnitOfWork,
  createUuidIdPort,
  type EvidenceApplicationServices,
  type StoragePort,
} from "../../application";
import { createPostgresEvidenceLifecycleHistoryRepository } from "../postgres/lifecycle-history-repository";
import { createPostgresEvidenceUnitOfWork } from "../postgres/unit-of-work";
import {
  createEvidenceStorageSync,
  resolveEvidenceStorageConfigFromEnv,
} from "../storage/platform/create-evidence-storage";
import type { EvidenceStoragePlatformConfig } from "../storage/platform/types";
import { createInMemoryLifecycleHistoryRepository } from "../../application/lifecycle/in-memory-lifecycle-history";

export type EvidenceCatalogueMode = "memory" | "postgres";

/** @deprecated Prefer catalogueMode + storageProviderKind. */
export type EvidencePersistenceMode = "memory" | "local";

export type EvidenceRuntimeBundle = {
  readonly application: EvidenceApplicationServices;
  /** Logical catalogue persistence (S05). */
  readonly catalogueMode: EvidenceCatalogueMode;
  /**
   * Storage provider kind (S03). Retained as `persistenceMode` for readiness
   * API compatibility with prior slices.
   */
  readonly persistenceMode: EvidencePersistenceMode;
  readonly storageProviderKind: "memory" | "local";
  readonly storage: StoragePort;
};

export type CreateEvidenceRuntimeInput = {
  readonly catalogueMode?: EvidenceCatalogueMode;
  readonly db?: DatabaseExecutor;
  readonly storageConfig?: EvidenceStoragePlatformConfig;
  readonly now?: string;
};

function resolveCatalogueMode(
  explicit: EvidenceCatalogueMode | undefined,
  env: NodeJS.ProcessEnv = process.env,
): EvidenceCatalogueMode {
  if (explicit) return explicit;
  const raw = (env.APZQEP_EVIDENCE_CATALOGUE_MODE ?? "memory").trim().toLowerCase();
  if (raw === "postgres") return "postgres";
  return "memory";
}

function buildRuntime(input: CreateEvidenceRuntimeInput): EvidenceRuntimeBundle {
  const catalogueMode = resolveCatalogueMode(input.catalogueMode);
  const storageConfig = input.storageConfig ?? resolveEvidenceStorageConfigFromEnv();
  const { manager } = createEvidenceStorageSync(storageConfig);

  if (catalogueMode === "postgres") {
    if (!input.db) {
      throw new Error(
        "Evidence catalogue mode 'postgres' requires db — in-memory catalogue fallback is forbidden",
      );
    }
  }

  const uow =
    catalogueMode === "postgres"
      ? createPostgresEvidenceUnitOfWork(input.db!)
      : createInMemoryUnitOfWork();

  const lifecycleHistory =
    catalogueMode === "postgres"
      ? createPostgresEvidenceLifecycleHistoryRepository(input.db!)
      : createInMemoryLifecycleHistoryRepository();

  const application = createEvidenceApplicationServices({
    uow,
    storage: manager,
    clock: createInMemoryClockPort(input.now),
    // Postgres catalogue must not reuse sequential IDs that reset on process restart.
    ids: catalogueMode === "postgres" ? createUuidIdPort() : createInMemoryIdPort(),
    audit: createInMemoryAuditPort(),
    lifecycleHistory,
    secure: true,
  });

  return {
    application,
    catalogueMode,
    persistenceMode: storageConfig.provider,
    storageProviderKind: storageConfig.provider,
    storage: manager,
  };
}

/**
 * Build secured Application services with memory catalogue + memory content.
 */
export function createEvidenceRuntimeForMemory(input?: {
  readonly now?: string;
}): EvidenceRuntimeBundle {
  return buildRuntime({
    catalogueMode: "memory",
    storageConfig: { provider: "memory" },
    now: input?.now,
  });
}

/**
 * Build secured Application services with Local content provider (LA).
 * Catalogue remains memory unless postgres is selected separately.
 */
export function createEvidenceRuntimeForLocal(input: {
  readonly rootDirectory: string;
  readonly maxObjectBytes?: number;
  readonly now?: string;
  readonly catalogueMode?: EvidenceCatalogueMode;
  readonly db?: DatabaseExecutor;
}): EvidenceRuntimeBundle {
  return buildRuntime({
    catalogueMode: input.catalogueMode ?? "memory",
    db: input.db,
    storageConfig: {
      provider: "local",
      local: {
        rootDirectory: input.rootDirectory,
        maxObjectBytes: input.maxObjectBytes,
      },
    },
    now: input.now,
  });
}

/**
 * Build secured Application services with PostgreSQL catalogue.
 */
export function createEvidenceRuntimeForPostgres(input: {
  readonly db: DatabaseExecutor;
  readonly storageConfig?: EvidenceStoragePlatformConfig;
  readonly now?: string;
}): EvidenceRuntimeBundle {
  if (!input.db) {
    throw new Error(
      "createEvidenceRuntimeForPostgres requires db — in-memory catalogue fallback is forbidden",
    );
  }
  return buildRuntime({
    catalogueMode: "postgres",
    db: input.db,
    storageConfig: input.storageConfig ?? { provider: "memory" },
    now: input.now,
  });
}

export function createEvidenceRuntimeForTest(input?: {
  readonly now?: string;
  readonly catalogueMode?: EvidenceCatalogueMode;
  readonly db?: DatabaseExecutor;
}): EvidenceRuntimeBundle {
  if (input?.catalogueMode === "postgres") {
    return createEvidenceRuntimeForPostgres({
      db: input.db!,
      now: input.now,
    });
  }
  return createEvidenceRuntimeForMemory({ now: input?.now });
}

/**
 * Production Evidence runtime — catalogue and storage resolved from environment.
 * Defaults: catalogue=memory, storage=memory (LA-safe).
 */
export function createEvidenceRuntimeForProduction(input?: {
  readonly db?: DatabaseExecutor;
}): EvidenceRuntimeBundle {
  return buildRuntime({
    db: input?.db,
    storageConfig: resolveEvidenceStorageConfigFromEnv(),
  });
}
