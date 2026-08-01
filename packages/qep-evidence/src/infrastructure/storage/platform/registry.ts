/**
 * Provider registry — APZQEP-120-S03.
 */

import { EvidenceStorageError } from "../../../shared/errors";
import type { EvidenceStorageProvider } from "./evidence-storage-provider";
import type { EvidenceStorageProviderKind } from "./types";

export type EvidenceStorageProviderRegistry = {
  register(provider: EvidenceStorageProvider): void;
  get(providerId: string): EvidenceStorageProvider;
  getByKind(kind: EvidenceStorageProviderKind): EvidenceStorageProvider;
  list(): readonly EvidenceStorageProvider[];
};

export function createEvidenceStorageProviderRegistry(): EvidenceStorageProviderRegistry {
  const byId = new Map<string, EvidenceStorageProvider>();
  const byKind = new Map<EvidenceStorageProviderKind, EvidenceStorageProvider>();

  return {
    register(provider) {
      byId.set(provider.providerId, provider);
      byKind.set(provider.kind, provider);
    },
    get(providerId) {
      const found = byId.get(providerId);
      if (!found) {
        throw new EvidenceStorageError(
          "STORAGE_PROVIDER_UNKNOWN",
          "Storage provider is not registered",
        );
      }
      return found;
    },
    getByKind(kind) {
      const found = byKind.get(kind);
      if (!found) {
        throw new EvidenceStorageError(
          "STORAGE_PROVIDER_UNKNOWN",
          "Storage provider kind is not available",
        );
      }
      return found;
    },
    list() {
      return [...byId.values()];
    },
  };
}
