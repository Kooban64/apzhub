/**
 * Filesystem DocumentStorageProvider (APZDOCS-002).
 * Local/dev/on-prem — production requires allowFilesystemInProduction.
 */

import {
  access,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type {
  DocumentBinaryResult,
  DocumentRequestContext,
  DocumentStorageReference,
} from "@apzhub/document-contracts";
import type {
  DocumentStorageGetInput,
  DocumentStorageProvider,
  DocumentStoragePutInput,
} from "@apzhub/document-core";
import { sha256Hex } from "@apzhub/document-core";

import { collectProviderBinarySource } from "../binary/collect-source";

export type FilesystemDocumentStorageOptions = {
  readonly id?: string;
  readonly rootDirectory: string;
  readonly maxObjectBytes?: number;
  readonly stagingDirectory?: string;
};

function assertSafeStorageKey(storageKey: string): void {
  if (
    !storageKey ||
    storageKey.includes("..") ||
    storageKey.startsWith("/") ||
    storageKey.includes("\\") ||
    path.isAbsolute(storageKey)
  ) {
    throw new Error("Unsafe storage key rejected");
  }
}

export function createFilesystemDocumentStorageProvider(
  options: FilesystemDocumentStorageOptions,
): DocumentStorageProvider {
  const id = options.id ?? "filesystem";
  const root = path.resolve(options.rootDirectory);
  const staging = path.resolve(
    options.stagingDirectory ?? path.join(root, ".staging"),
  );
  const maxObjectBytes = options.maxObjectBytes ?? 64 * 1024 * 1024;

  function resolveObjectPath(ref: DocumentStorageReference): string {
    assertSafeStorageKey(ref.storageKey);
    const full = path.resolve(root, ref.storageKey);
    if (!full.startsWith(root + path.sep) && full !== root) {
      throw new Error("Path traversal rejected");
    }
    return full;
  }

  const provider: DocumentStorageProvider = {
    id,
    kind: "filesystem",
    capabilities: {
      put: true,
      get: true,
      head: true,
      delete: true,
      copy: false,
      multipart: false,
      implemented: true,
    },
    async initialise() {
      await mkdir(root, { recursive: true, mode: 0o750 });
      await mkdir(staging, { recursive: true, mode: 0o750 });
    },
    async validateConfiguration() {
      await access(root);
      await access(staging);
    },
    async healthCheck() {
      try {
        await access(root);
        return { healthy: true, message: "filesystem root accessible" };
      } catch {
        return { healthy: false, message: "filesystem root inaccessible" };
      }
    },
    async putObject(input: DocumentStoragePutInput) {
      if (input.signal?.aborted) throw new Error("cancelled");
      const target = resolveObjectPath(input.ref);
      try {
        await access(target);
        throw new Error("Object already exists (immutable overwrite denied)");
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("immutable overwrite")
        ) {
          throw error;
        }
      }

      const bytes = await collectProviderBinarySource(input.source, {
        maxObjectBytes,
        signal: input.signal,
      });

      await mkdir(path.dirname(target), { recursive: true, mode: 0o750 });
      const tempPath = path.join(staging, `${randomUUID()}.tmp`);
      await writeFile(tempPath, bytes, { mode: 0o640 });
      await rename(tempPath, target);
      const checksumHex = sha256Hex(bytes);
      return {
        ref: input.ref,
        mimeType: input.mimeType,
        byteLength: bytes.byteLength,
        checksum: { algorithm: "sha256", hex: checksumHex },
      };
    },
    async getObject(
      input: DocumentStorageGetInput,
    ): Promise<DocumentBinaryResult> {
      const target = resolveObjectPath(input.ref);
      const bytes = await readFile(target);
      return { kind: "bytes", bytes: new Uint8Array(bytes) };
    },
    async headObject(
      _ctx: DocumentRequestContext,
      ref: DocumentStorageReference,
    ) {
      try {
        const target = resolveObjectPath(ref);
        const info = await stat(target);
        const bytes = await readFile(target);
        return {
          ref,
          byteLength: info.size,
          checksum: {
            algorithm: "sha256",
            hex: sha256Hex(new Uint8Array(bytes)),
          },
        };
      } catch {
        return null;
      }
    },
    async deleteObject(_ctx, ref) {
      const target = resolveObjectPath(ref);
      await rm(target, { force: true });
    },
    async verifyObject(_ctx, ref, expected) {
      const target = resolveObjectPath(ref);
      const bytes = new Uint8Array(await readFile(target));
      return (
        bytes.byteLength === expected.byteLength &&
        sha256Hex(bytes) === expected.checksumHex
      );
    },
    listCapabilities() {
      return provider.capabilities;
    },
    async dispose() {},
    async exists(ref) {
      try {
        await access(resolveObjectPath(ref));
        return true;
      } catch {
        return false;
      }
    },
    async describe(ref) {
      return provider.headObject({ tenantId: "n/a", userId: "n/a" }, ref);
    },
  };
  return provider;
}

/** Safe diagnostics — never include absolute paths. */
export function filesystemProviderDiagnostics(
  providerId: string,
): Record<string, unknown> {
  return {
    providerId,
    kind: "filesystem",
    rootConfigured: true,
    absolutePathRedacted: true,
  };
}
