/**
 * EvidenceStorageManager — APZQEP-120-S03.
 *
 * Implements Application StoragePort. Selects provider by configuration.
 * Application Services never see LocalProvider or filesystem details.
 */

import type {
  StoragePort,
  StoragePutInput,
} from "../../../application/ports/storage-port";
import { EvidenceStorageError } from "../../../shared/errors";
import type { EvidenceStorageProvider } from "./evidence-storage-provider";
import type { EvidenceStorageProviderRegistry } from "./registry";
import type {
  EvidenceStorageHealth,
  EvidenceStoragePlatformConfig,
  EvidenceStorageProviderKind,
} from "./types";

export type EvidenceStorageAuditHook = (event: {
  readonly operation: string;
  readonly providerKind: string;
  readonly outcome: "success" | "failure";
  readonly code?: string;
}) => void | Promise<void>;

export type EvidenceStorageManager = StoragePort & {
  readonly managerId: "EvidenceStorageManager";
  readonly activeProviderKind: EvidenceStorageProviderKind;
  health(): Promise<EvidenceStorageHealth>;
  listProviders(): readonly {
    readonly providerId: string;
    readonly kind: EvidenceStorageProviderKind;
  }[];
};

function translate(error: unknown): never {
  if (error instanceof EvidenceStorageError) {
    throw error;
  }
  throw new EvidenceStorageError(
    "STORAGE_UNAVAILABLE",
    "Storage operation failed",
    "unavailable",
  );
}

export function createEvidenceStorageManager(input: {
  readonly registry: EvidenceStorageProviderRegistry;
  readonly config: EvidenceStoragePlatformConfig;
  readonly onAudit?: EvidenceStorageAuditHook;
}): EvidenceStorageManager {
  const activeKind = input.config.provider;
  let active: EvidenceStorageProvider | undefined;

  function provider(): EvidenceStorageProvider {
    if (!active) {
      active = input.registry.getByKind(activeKind);
    }
    return active;
  }

  async function audit(
    operation: string,
    outcome: "success" | "failure",
    code?: string,
  ): Promise<void> {
    if (!input.onAudit) return;
    await input.onAudit({
      operation,
      providerKind: activeKind,
      outcome,
      code,
    });
  }

  async function withProvider<T>(
    operation: string,
    fn: (p: EvidenceStorageProvider) => Promise<T>,
  ): Promise<T> {
    try {
      const result = await fn(provider());
      await audit(operation, "success");
      return result;
    } catch (error) {
      const code =
        error instanceof EvidenceStorageError ? error.code : "STORAGE_UNAVAILABLE";
      await audit(operation, "failure", code);
      translate(error);
    }
  }

  return {
    portId: "StoragePort",
    managerId: "EvidenceStorageManager",
    activeProviderKind: activeKind,

    listProviders() {
      return input.registry.list().map((p) => ({
        providerId: p.providerId,
        kind: p.kind,
      }));
    },

    health() {
      return withProvider("health", (p) => p.health());
    },

    put(putInput: StoragePutInput) {
      return withProvider("store", (p) => p.store(putInput));
    },
    get(tenantId, storageLocator) {
      return withProvider("retrieve", (p) => p.retrieve(tenantId, storageLocator));
    },
    openStream(tenantId, storageLocator) {
      return withProvider("stream", (p) => p.stream(tenantId, storageLocator));
    },
    update(tenantId, storageLocator, updateInput) {
      return withProvider("replace", (p) =>
        p.replace(tenantId, storageLocator, updateInput),
      );
    },
    archive(tenantId, storageLocator) {
      return withProvider("archive", (p) => p.archive(tenantId, storageLocator));
    },
    dispose(tenantId, storageLocator) {
      return withProvider("delete", (p) => p.remove(tenantId, storageLocator));
    },
    delete(tenantId, storageLocator) {
      return withProvider("delete", (p) => p.remove(tenantId, storageLocator));
    },
    exists(tenantId, storageLocator) {
      return withProvider("exists", (p) => p.exists(tenantId, storageLocator));
    },
    getMetadata(tenantId, storageLocator) {
      return withProvider("metadata", (p) => p.metadata(tenantId, storageLocator));
    },
  };
}
