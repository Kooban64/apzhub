/**
 * In-memory DocumentStorageProvider for tests (APZDOCS-002).
 */

import type {
  DocumentBinaryResult,
  DocumentRequestContext,
  DocumentStorageReference,
} from "@apzhub/document-contracts";
import type {
  DocumentStorageGetInput,
  DocumentStorageObjectDescriptor,
  DocumentStorageProvider,
  DocumentStoragePutInput,
} from "@apzhub/document-core";
import { sha256Hex } from "@apzhub/document-core";

import { collectProviderBinarySource } from "../binary/collect-source";

type Stored = {
  readonly bytes: Uint8Array;
  readonly mimeType: string;
  readonly checksumHex: string;
};

export function createMemoryDocumentStorageProvider(
  options: { readonly id?: string; readonly maxObjectBytes?: number } = {},
): DocumentStorageProvider {
  const store = new Map<string, Stored>();
  const id = options.id ?? "memory";
  const maxObjectBytes = options.maxObjectBytes ?? 32 * 1024 * 1024;

  function keyOf(ref: DocumentStorageReference): string {
    return `${ref.providerId}:${ref.storageKey}`;
  }

  const provider: DocumentStorageProvider = {
    id,
    kind: "memory",
    capabilities: {
      put: true,
      get: true,
      head: true,
      delete: true,
      copy: true,
      multipart: false,
      implemented: true,
    },
    async initialise() {},
    async validateConfiguration() {},
    async healthCheck() {
      return { healthy: true, message: "memory provider ready" };
    },
    async putObject(input: DocumentStoragePutInput) {
      if (
        input.ref.storageKey.includes("..") ||
        input.ref.storageKey.startsWith("/")
      ) {
        throw new Error("Invalid storage key");
      }
      const bytes = await collectProviderBinarySource(input.source, {
        maxObjectBytes,
        signal: input.signal,
      });
      if (store.has(keyOf(input.ref))) {
        throw new Error("Object already exists (immutable overwrite denied)");
      }
      const checksumHex = sha256Hex(bytes);
      store.set(keyOf(input.ref), {
        bytes,
        mimeType: input.mimeType,
        checksumHex,
      });
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
      const row = store.get(keyOf(input.ref));
      if (!row) throw new Error("Object not found");
      return { kind: "bytes", bytes: row.bytes };
    },
    async headObject(
      _ctx: DocumentRequestContext,
      ref: DocumentStorageReference,
    ) {
      const row = store.get(keyOf(ref));
      if (!row) return null;
      return {
        ref,
        mimeType: row.mimeType,
        byteLength: row.bytes.byteLength,
        checksum: { algorithm: "sha256", hex: row.checksumHex },
      } satisfies DocumentStorageObjectDescriptor;
    },
    async deleteObject(_ctx, ref) {
      store.delete(keyOf(ref));
    },
    async verifyObject(_ctx, ref, expected) {
      const row = store.get(keyOf(ref));
      if (!row) return false;
      return (
        row.checksumHex === expected.checksumHex &&
        row.bytes.byteLength === expected.byteLength
      );
    },
    listCapabilities() {
      return provider.capabilities;
    },
    async dispose() {
      store.clear();
    },
    async exists(ref) {
      return store.has(keyOf(ref));
    },
    async describe(ref) {
      return provider.headObject({ tenantId: "n/a", userId: "n/a" }, ref);
    },
  };
  return provider;
}
