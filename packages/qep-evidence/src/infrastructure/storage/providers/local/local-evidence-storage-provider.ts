/**
 * Local Evidence Storage Provider — APZQEP-120-S03 / ADR-0094.
 *
 * Reference implementation of EvidenceStorageProvider.
 * Filesystem details MUST NOT leak above EvidenceStorageManager.
 */

import { createHash, randomUUID } from "node:crypto";
import { accessSync, createReadStream, mkdirSync } from "node:fs";
import { access, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

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

const LOCAL_CAPABILITIES: EvidenceStorageCapabilities = {
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

const LOCATOR_PREFIX = "evst://local/";
const OBJECT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TENANT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const DEFAULT_MAX_OBJECT_BYTES = 64 * 1024 * 1024;

export type LocalEvidenceStorageProviderOptions = {
  readonly providerId?: string;
  readonly rootDirectory: string;
  readonly maxObjectBytes?: number;
  readonly stagingDirectory?: string;
};

type StoredMeta = StorageContentMetadata & {
  readonly objectId: string;
};

function assertSafeTenantId(tenantId: string): void {
  if (!tenantId || !TENANT_PATTERN.test(tenantId) || tenantId.includes("..")) {
    throw new EvidenceStorageError(
      "STORAGE_INVALID_REQUEST",
      "Invalid tenant identifier for storage",
    );
  }
}

function parseLocator(locator: StorageLocator): string {
  if (!locator.startsWith(LOCATOR_PREFIX)) {
    throw new EvidenceStorageError(
      "STORAGE_INVALID_REQUEST",
      "Invalid storage locator",
    );
  }
  const objectId = locator.slice(LOCATOR_PREFIX.length);
  if (!OBJECT_ID_PATTERN.test(objectId)) {
    throw new EvidenceStorageError(
      "STORAGE_INVALID_REQUEST",
      "Invalid storage locator",
    );
  }
  return objectId;
}

function assertInsideRoot(root: string, candidate: string): string {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(candidate);
  const relative = path.relative(resolvedRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new EvidenceStorageError(
      "STORAGE_FORBIDDEN",
      "Storage path rejected",
      "forbidden",
    );
  }
  return resolved;
}

async function* readableToChunks(stream: Readable): AsyncIterable<Uint8Array> {
  for await (const chunk of stream) {
    if (typeof chunk === "string") {
      yield new Uint8Array(Buffer.from(chunk));
    } else {
      yield new Uint8Array(chunk);
    }
  }
}

export function createLocalEvidenceStorageProvider(
  options: LocalEvidenceStorageProviderOptions,
): EvidenceStorageProvider {
  const providerId = options.providerId ?? "local-evidence-storage";
  const root = path.resolve(options.rootDirectory);
  const staging = path.resolve(options.stagingDirectory ?? path.join(root, ".staging"));
  const maxObjectBytes = options.maxObjectBytes ?? DEFAULT_MAX_OBJECT_BYTES;

  function objectDir(tenantId: string, objectId: string): string {
    assertSafeTenantId(tenantId);
    if (!OBJECT_ID_PATTERN.test(objectId)) {
      throw new EvidenceStorageError(
        "STORAGE_INVALID_REQUEST",
        "Invalid storage object identifier",
      );
    }
    return assertInsideRoot(root, path.join(root, tenantId, objectId));
  }

  function contentPath(tenantId: string, objectId: string): string {
    return assertInsideRoot(
      root,
      path.join(objectDir(tenantId, objectId), "content.bin"),
    );
  }

  function metaPath(tenantId: string, objectId: string): string {
    return assertInsideRoot(
      root,
      path.join(objectDir(tenantId, objectId), "meta.json"),
    );
  }

  async function readMeta(
    tenantId: string,
    objectId: string,
  ): Promise<StoredMeta | null> {
    try {
      const raw = await readFile(metaPath(tenantId, objectId), "utf8");
      const parsed = JSON.parse(raw) as StoredMeta;
      if (parsed.tenantId !== tenantId || parsed.objectId !== objectId) {
        throw new EvidenceStorageError(
          "STORAGE_UNAVAILABLE",
          "Storage metadata integrity failure",
        );
      }
      return parsed;
    } catch (error) {
      if (error instanceof EvidenceStorageError) throw error;
      return null;
    }
  }

  async function writeAtomic(target: string, data: Uint8Array | string): Promise<void> {
    await mkdir(path.dirname(target), { recursive: true, mode: 0o750 });
    const tempPath = path.join(staging, `${randomUUID()}.tmp`);
    assertInsideRoot(staging, tempPath);
    try {
      if (typeof data === "string") {
        await writeFile(tempPath, data, { encoding: "utf8", mode: 0o640 });
      } else {
        await writeFile(tempPath, data, { mode: 0o640 });
      }
      await rename(tempPath, target);
    } catch (error) {
      await rm(tempPath, { force: true }).catch(() => undefined);
      if (error instanceof EvidenceStorageError) throw error;
      throw new EvidenceStorageError("STORAGE_UNAVAILABLE", "Storage write failed");
    }
  }

  function validatePutBytes(bytes: Uint8Array, mediaType: string): void {
    if (!mediaType || mediaType.length > 255 || /[\r\n\0]/.test(mediaType)) {
      throw new EvidenceStorageError("STORAGE_INVALID_REQUEST", "Invalid media type");
    }
    if (bytes.byteLength > maxObjectBytes) {
      throw new EvidenceStorageError(
        "STORAGE_LIMIT_EXCEEDED",
        "Object exceeds configured size limit",
      );
    }
  }

  const provider: EvidenceStorageProvider = {
    providerId,
    kind: "local",
    capabilities: LOCAL_CAPABILITIES,

    async initialise() {
      try {
        await mkdir(root, { recursive: true, mode: 0o750 });
        await mkdir(staging, { recursive: true, mode: 0o750 });
        await access(root);
        await access(staging);
      } catch {
        throw new EvidenceStorageError(
          "STORAGE_UNAVAILABLE",
          "Local storage root is not available",
        );
      }
    },

    /** Sync bootstrap for DI factories that cannot await. */
    initialiseSync() {
      try {
        mkdirSync(root, { recursive: true, mode: 0o750 });
        mkdirSync(staging, { recursive: true, mode: 0o750 });
        accessSync(root);
        accessSync(staging);
      } catch {
        throw new EvidenceStorageError(
          "STORAGE_UNAVAILABLE",
          "Local storage root is not available",
        );
      }
    },

    async health() {
      try {
        await access(root);
        await access(staging);
        return {
          healthy: true,
          providerId,
          kind: "local",
          message: "local storage accessible",
        };
      } catch {
        return {
          healthy: false,
          providerId,
          kind: "local",
          message: "local storage inaccessible",
        };
      }
    },

    async store(input: StoragePutInput): Promise<StoragePutResult> {
      assertSafeTenantId(input.tenantId);
      validatePutBytes(input.bytes, input.mediaType);
      const objectId = randomUUID();
      const storageLocator = `${LOCATOR_PREFIX}${objectId}`;
      const content = contentPath(input.tenantId, objectId);
      const metaFile = metaPath(input.tenantId, objectId);

      try {
        await access(content);
        throw new EvidenceStorageError(
          "STORAGE_CONFLICT",
          "Storage object already exists",
          "conflict",
        );
      } catch (error) {
        if (error instanceof EvidenceStorageError) throw error;
      }

      const contentHash =
        input.contentHash ?? createHash("sha256").update(input.bytes).digest("hex");
      const meta: StoredMeta = {
        objectId,
        storageLocator,
        tenantId: input.tenantId,
        mediaType: input.mediaType,
        byteSize: input.bytes.byteLength,
        contentHash,
        hashAlgorithm: input.hashAlgorithm ?? "sha256",
        createdAt: new Date().toISOString(),
      };

      await writeAtomic(content, input.bytes);
      await writeAtomic(metaFile, `${JSON.stringify(meta, null, 2)}\n`);

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
      const objectId = parseLocator(locator);
      const meta = await readMeta(tenantId, objectId);
      if (!meta || meta.disposedAt) {
        throw new EvidenceStorageError("STORAGE_NOT_FOUND", "Storage object not found");
      }
      try {
        const fileBytes = await readFile(contentPath(tenantId, objectId));
        const bytes = Uint8Array.from(fileBytes);
        return {
          bytes,
          mediaType: meta.mediaType,
          byteSize: bytes.byteLength,
        };
      } catch {
        throw new EvidenceStorageError("STORAGE_NOT_FOUND", "Storage object not found");
      }
    },

    async stream(
      tenantId: string,
      locator: StorageLocator,
    ): Promise<StorageStreamHandle> {
      const objectId = parseLocator(locator);
      const meta = await readMeta(tenantId, objectId);
      if (!meta || meta.disposedAt) {
        throw new EvidenceStorageError("STORAGE_NOT_FOUND", "Storage object not found");
      }
      const filePath = contentPath(tenantId, objectId);
      try {
        await access(filePath);
      } catch {
        throw new EvidenceStorageError("STORAGE_NOT_FOUND", "Storage object not found");
      }

      return {
        kind: "storage-stream",
        storageLocator: locator,
        mediaType: meta.mediaType,
        byteSize: meta.byteSize,
        chunks: () => {
          const stream = createReadStream(filePath);
          return readableToChunks(stream);
        },
      };
    },

    async exists(tenantId: string, locator: StorageLocator): Promise<boolean> {
      try {
        const objectId = parseLocator(locator);
        const meta = await readMeta(tenantId, objectId);
        if (!meta || meta.disposedAt) return false;
        await access(contentPath(tenantId, objectId));
        return true;
      } catch {
        return false;
      }
    },

    async replace(
      tenantId: string,
      locator: StorageLocator,
      input: Omit<StoragePutInput, "tenantId">,
    ): Promise<StoragePutResult> {
      const objectId = parseLocator(locator);
      const existing = await readMeta(tenantId, objectId);
      if (!existing || existing.disposedAt) {
        throw new EvidenceStorageError("STORAGE_NOT_FOUND", "Storage object not found");
      }
      if (existing.archivedAt) {
        throw new EvidenceStorageError(
          "STORAGE_FORBIDDEN",
          "Archived storage object cannot be replaced",
          "forbidden",
        );
      }
      validatePutBytes(input.bytes, input.mediaType);

      const contentHash =
        input.contentHash ?? createHash("sha256").update(input.bytes).digest("hex");
      const meta: StoredMeta = {
        ...existing,
        mediaType: input.mediaType,
        byteSize: input.bytes.byteLength,
        contentHash,
        hashAlgorithm: input.hashAlgorithm ?? existing.hashAlgorithm ?? "sha256",
      };

      await writeAtomic(contentPath(tenantId, objectId), input.bytes);
      await writeAtomic(
        metaPath(tenantId, objectId),
        `${JSON.stringify(meta, null, 2)}\n`,
      );

      return {
        storageLocator: locator,
        byteSize: input.bytes.byteLength,
        mediaType: input.mediaType,
      };
    },

    async archive(tenantId: string, locator: StorageLocator): Promise<void> {
      const objectId = parseLocator(locator);
      const existing = await readMeta(tenantId, objectId);
      if (!existing || existing.disposedAt) {
        throw new EvidenceStorageError("STORAGE_NOT_FOUND", "Storage object not found");
      }
      if (existing.archivedAt) return;
      const meta: StoredMeta = {
        ...existing,
        archivedAt: new Date().toISOString(),
      };
      await writeAtomic(
        metaPath(tenantId, objectId),
        `${JSON.stringify(meta, null, 2)}\n`,
      );
    },

    async remove(tenantId: string, locator: StorageLocator): Promise<void> {
      const objectId = parseLocator(locator);
      const dir = objectDir(tenantId, objectId);
      try {
        await stat(dir);
      } catch {
        return;
      }
      try {
        await rm(dir, { recursive: true, force: true });
      } catch {
        throw new EvidenceStorageError("STORAGE_UNAVAILABLE", "Storage delete failed");
      }
    },

    async metadata(
      tenantId: string,
      locator: StorageLocator,
    ): Promise<StorageContentMetadata | null> {
      try {
        const objectId = parseLocator(locator);
        const meta = await readMeta(tenantId, objectId);
        if (!meta || meta.disposedAt) return null;
        return {
          storageLocator: meta.storageLocator,
          tenantId: meta.tenantId,
          mediaType: meta.mediaType,
          byteSize: meta.byteSize,
          contentHash: meta.contentHash,
          hashAlgorithm: meta.hashAlgorithm,
          createdAt: meta.createdAt,
          archivedAt: meta.archivedAt,
          disposedAt: meta.disposedAt,
        };
      } catch {
        return null;
      }
    },
  };

  return provider;
}

/** Safe diagnostics — never include absolute filesystem paths. */
export function localProviderDiagnostics(providerId: string): Record<string, unknown> {
  return {
    providerId,
    kind: "local",
    rootConfigured: true,
    absolutePathRedacted: true,
  };
}
