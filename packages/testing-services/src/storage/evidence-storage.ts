import { createHash, randomUUID } from "node:crypto";

import type {
  EvidenceStorageObject,
  EvidenceStorageProvider,
  EvidenceStoragePutInput,
  ObjectStorageProvider,
} from "@apzhub/testing-contracts";

import { DomainRuleError } from "../lifecycle/state-machines";

export function createInMemoryEvidenceStorageProvider(): EvidenceStorageProvider {
  const objects = new Map<string, EvidenceStorageObject & { bytes?: Uint8Array }>();

  return {
    async put(input: EvidenceStoragePutInput): Promise<EvidenceStorageObject> {
      const storageRef = `mem://${input.keyHint ?? randomUUID()}`;
      const sizeBytes = input.bytes?.byteLength;
      const contentHash = input.bytes
        ? createHash("sha256").update(input.bytes).digest("hex")
        : undefined;
      const obj: EvidenceStorageObject & { bytes?: Uint8Array } = {
        storageRef,
        contentType: input.contentType,
        sizeBytes,
        checksum: contentHash,
        contentHash,
        bytes: input.bytes,
      };
      objects.set(storageRef, obj);
      return {
        storageRef: obj.storageRef,
        contentType: obj.contentType,
        sizeBytes: obj.sizeBytes,
        checksum: obj.checksum,
        contentHash: obj.contentHash,
      };
    },
    async get(storageRef: string) {
      const obj = objects.get(storageRef);
      if (!obj) return undefined;
      return {
        storageRef: obj.storageRef,
        contentType: obj.contentType,
        sizeBytes: obj.sizeBytes,
        checksum: obj.checksum,
        contentHash: obj.contentHash,
      };
    },
    async delete(storageRef: string) {
      objects.delete(storageRef);
    },
    async exists(storageRef: string) {
      return objects.has(storageRef);
    },
  };
}

/** Contract presence only — network object storage not implemented in APZTCMS-006. */
export function createUnimplementedObjectStorageProvider(
  bucket?: string,
): ObjectStorageProvider {
  const notImplemented = async (): Promise<never> => {
    throw new DomainRuleError(
      "not_implemented",
      "Object storage provider network operations are not implemented",
    );
  };
  return {
    providerKind: "object_storage",
    bucket,
    put: notImplemented,
    get: notImplemented,
    delete: notImplemented,
    exists: notImplemented,
  };
}
