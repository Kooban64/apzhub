/**
 * Evidence persistence factory — APZQEP-ENG-110F / APZQEP-120-S03.
 *
 * Metadata repositories remain in-memory until S04.
 * Content bytes flow through EvidenceStorageManager (StoragePort).
 * Default provider is memory; Local is selected only via configuration.
 */

import {
  createEvidenceApplicationServices,
  createInMemoryAuditPort,
  createInMemoryClockPort,
  createInMemoryIdPort,
  createInMemoryUnitOfWork,
  type EvidenceApplicationServices,
  type StoragePort,
} from "../../application";
import {
  createEvidenceStorageSync,
  resolveEvidenceStorageConfigFromEnv,
} from "../storage/platform/create-evidence-storage";
import type { EvidenceStoragePlatformConfig } from "../storage/platform/types";

export type EvidencePersistenceMode = "memory" | "local";

export type EvidenceRuntimeBundle = {
  readonly application: EvidenceApplicationServices;
  readonly persistenceMode: EvidencePersistenceMode;
  readonly storage: StoragePort;
};

function buildRuntime(input: {
  readonly storageConfig: EvidenceStoragePlatformConfig;
  readonly now?: string;
}): EvidenceRuntimeBundle {
  const { manager } = createEvidenceStorageSync(input.storageConfig);
  const uow = createInMemoryUnitOfWork();
  const application = createEvidenceApplicationServices({
    uow,
    storage: manager,
    clock: createInMemoryClockPort(input.now),
    ids: createInMemoryIdPort(),
    audit: createInMemoryAuditPort(),
    secure: true,
  });
  return {
    application,
    persistenceMode: input.storageConfig.provider,
    storage: manager,
  };
}

/**
 * Build secured Application services with memory content provider.
 */
export function createEvidenceRuntimeForMemory(input?: {
  readonly now?: string;
}): EvidenceRuntimeBundle {
  return buildRuntime({
    storageConfig: { provider: "memory" },
    now: input?.now,
  });
}

/**
 * Build secured Application services with Local content provider (LA).
 */
export function createEvidenceRuntimeForLocal(input: {
  readonly rootDirectory: string;
  readonly maxObjectBytes?: number;
  readonly now?: string;
}): EvidenceRuntimeBundle {
  return buildRuntime({
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

export function createEvidenceRuntimeForTest(): EvidenceRuntimeBundle {
  return createEvidenceRuntimeForMemory();
}

/**
 * Production Evidence runtime — resolves provider from environment.
 * Defaults to memory until Local/root (or later providers) are configured.
 */
export function createEvidenceRuntimeForProduction(): EvidenceRuntimeBundle {
  return buildRuntime({
    storageConfig: resolveEvidenceStorageConfigFromEnv(),
  });
}
