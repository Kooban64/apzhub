/**
 * Stream-safe content digest via StoragePort — APZQEP-120-S04.
 * Never imports Local Provider or filesystem APIs.
 */

import type { StoragePort } from "../ports/storage-port";
import type { IntegrityAlgorithm } from "./algorithms/integrity-algorithm";
import { EvidenceIntegrityPlatformError } from "./errors";
import { EvidenceStorageError } from "../../shared/errors";

export async function digestContentFromStorage(input: {
  readonly storage: StoragePort;
  readonly tenantId: string;
  readonly storageLocator: string;
  readonly algorithm: IntegrityAlgorithm;
}): Promise<{ readonly digest: string; readonly contentLength: number }> {
  try {
    const handle = await input.storage.openStream(input.tenantId, input.storageLocator);
    if (handle.chunks) {
      const digest = await input.algorithm.digestStream(handle.chunks());
      return { digest, contentLength: handle.byteSize };
    }
    const full = await input.storage.get(input.tenantId, input.storageLocator);
    return {
      digest: input.algorithm.digestBytes(full.bytes),
      contentLength: full.byteSize,
    };
  } catch (error) {
    if (error instanceof EvidenceIntegrityPlatformError) {
      throw error;
    }
    if (error instanceof EvidenceStorageError) {
      if (error.code === "STORAGE_NOT_FOUND") {
        throw new EvidenceIntegrityPlatformError(
          "INTEGRITY_CONTENT_MISSING",
          "Evidence content is missing from storage",
        );
      }
      throw new EvidenceIntegrityPlatformError(
        "STORAGE_UNAVAILABLE",
        "Storage is unavailable for integrity operations",
      );
    }
    const message = error instanceof Error ? error.message : "";
    if (/not found|missing/i.test(message)) {
      throw new EvidenceIntegrityPlatformError(
        "INTEGRITY_CONTENT_MISSING",
        "Evidence content is missing from storage",
      );
    }
    throw new EvidenceIntegrityPlatformError(
      "STORAGE_UNAVAILABLE",
      "Storage is unavailable for integrity operations",
    );
  }
}
