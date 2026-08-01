/**
 * Memory Evidence Storage Provider — APZQEP-120-S03.
 * Process-local reference provider for tests and default LA wiring.
 */

import type {
  StorageContentMetadata,
  StorageGetResult,
  StorageLocator,
  StoragePutInput,
  StoragePutResult,
  StorageStreamHandle,
} from "../../../../application/ports/storage-port";
import { EvidenceStorageError } from "../../../../shared/errors";
import type { EvidenceStorageProvider } from "../../platform/evidence-storage-provider";
import type { EvidenceStorageCapabilities } from "../../platform/types";

const MEMORY_CAPABILITIES: EvidenceStorageCapabilities = {
  store: true,
  retrieve: true,
  stream: true,
  exists: true,
  delete: true,
  update: true,
  archive: true,
  health: true,
  metadata: true,
};

const LOCATOR_PREFIX = "evst://memory/";
const DEFAULT_MAX_OBJECT_BYTES = 64 * 1024 * 1024;

export type MemoryEvidenceStorageProviderOptions = {
  readonly providerId?: string;
  readonly maxObjectBytes?: number;
};

export function createMemoryEvidenceStorageProvider(
  options: MemoryEvidenceStorageProviderOptions = {},
): EvidenceStorageProvider & {
  readonly blobs: Map<string, { bytes: Uint8Array; meta: StorageContentMetadata }>;
} {
  const providerId = options.providerId ?? "memory-evidence-storage";
  const maxObjectBytes = options.maxObjectBytes ?? DEFAULT_MAX_OBJECT_BYTES;
  const blobs = new Map<string, { bytes: Uint8Array; meta: StorageContentMetadata }>();
  const key = (tenantId: string, locator: string) => `${tenantId}:${locator}`;
  let seq = 0;

  function requireEntry(tenantId: string, locator: StorageLocator) {
    const found = blobs.get(key(tenantId, locator));
    if (!found || found.meta.disposedAt) {
      throw new EvidenceStorageError("STORAGE_NOT_FOUND", "Storage object not found");
    }
    return found;
  }

  const provider: EvidenceStorageProvider & {
    readonly blobs: Map<string, { bytes: Uint8Array; meta: StorageContentMetadata }>;
  } = {
    providerId,
    kind: "memory",
    capabilities: MEMORY_CAPABILITIES,
    blobs,

    async initialise() {},

    async health() {
      return {
        healthy: true,
        providerId,
        kind: "memory",
        message: "memory storage available",
      };
    },

    async store(input: StoragePutInput): Promise<StoragePutResult> {
      if (!input.tenantId) {
        throw new EvidenceStorageError(
          "STORAGE_INVALID_REQUEST",
          "Invalid tenant identifier for storage",
        );
      }
      if (input.bytes.byteLength > maxObjectBytes) {
        throw new EvidenceStorageError(
          "STORAGE_LIMIT_EXCEEDED",
          "Object exceeds configured size limit",
        );
      }
      seq += 1;
      const storageLocator = `${LOCATOR_PREFIX}${seq}`;
      const meta: StorageContentMetadata = {
        storageLocator,
        tenantId: input.tenantId,
        mediaType: input.mediaType,
        byteSize: input.bytes.byteLength,
        contentHash: input.contentHash,
        hashAlgorithm: input.hashAlgorithm,
        createdAt: new Date().toISOString(),
      };
      blobs.set(key(input.tenantId, storageLocator), {
        bytes: input.bytes,
        meta,
      });
      return {
        storageLocator,
        byteSize: input.bytes.byteLength,
        mediaType: input.mediaType,
      };
    },

    async retrieve(
      tenantId: string,
      locator: StorageLocator,
    ): Promise<StorageGetResult> {
      const found = requireEntry(tenantId, locator);
      return {
        bytes: found.bytes,
        mediaType: found.meta.mediaType,
        byteSize: found.meta.byteSize,
      };
    },

    async stream(
      tenantId: string,
      locator: StorageLocator,
    ): Promise<StorageStreamHandle> {
      const found = requireEntry(tenantId, locator);
      return {
        kind: "storage-stream",
        storageLocator: locator,
        mediaType: found.meta.mediaType,
        byteSize: found.meta.byteSize,
        chunks: async function* () {
          yield found.bytes;
        },
      };
    },

    async exists(tenantId, locator) {
      const found = blobs.get(key(tenantId, locator));
      return Boolean(found && !found.meta.disposedAt);
    },

    async replace(tenantId, locator, input) {
      const existing = requireEntry(tenantId, locator);
      if (existing.meta.archivedAt) {
        throw new EvidenceStorageError(
          "STORAGE_FORBIDDEN",
          "Archived storage object cannot be replaced",
          "forbidden",
        );
      }
      if (input.bytes.byteLength > maxObjectBytes) {
        throw new EvidenceStorageError(
          "STORAGE_LIMIT_EXCEEDED",
          "Object exceeds configured size limit",
        );
      }
      const meta: StorageContentMetadata = {
        ...existing.meta,
        mediaType: input.mediaType,
        byteSize: input.bytes.byteLength,
        contentHash: input.contentHash,
        hashAlgorithm: input.hashAlgorithm,
      };
      blobs.set(key(tenantId, locator), { bytes: input.bytes, meta });
      return {
        storageLocator: locator,
        byteSize: input.bytes.byteLength,
        mediaType: input.mediaType,
      };
    },

    async archive(tenantId, locator) {
      const existing = requireEntry(tenantId, locator);
      if (existing.meta.archivedAt) return;
      blobs.set(key(tenantId, locator), {
        ...existing,
        meta: { ...existing.meta, archivedAt: new Date().toISOString() },
      });
    },

    async remove(tenantId, locator) {
      blobs.delete(key(tenantId, locator));
    },

    async metadata(tenantId, locator) {
      return blobs.get(key(tenantId, locator))?.meta ?? null;
    },
  };

  return provider;
}
