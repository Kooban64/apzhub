/**
 * Evidence Storage Platform types — APZQEP-120-S03 / ADR-0094.
 * Opaque to Application: no filesystem paths, buckets, or vendor concepts.
 */

export type EvidenceStorageProviderKind = "memory" | "local";

export type EvidenceStorageCapabilities = {
  readonly store: boolean;
  readonly retrieve: boolean;
  readonly stream: boolean;
  readonly exists: boolean;
  readonly delete: boolean;
  readonly update: boolean;
  readonly archive: boolean;
  readonly health: boolean;
  readonly metadata: boolean;
};

export type EvidenceStorageHealth = {
  readonly healthy: boolean;
  readonly providerId: string;
  readonly kind: EvidenceStorageProviderKind;
  readonly message?: string;
};

export type EvidenceStoragePlatformConfig = {
  /**
   * Active provider kind. Never hard-coded to local in Manager —
   * selected via configuration / factory.
   */
  readonly provider: EvidenceStorageProviderKind;
  readonly local?: {
    readonly rootDirectory: string;
    readonly maxObjectBytes?: number;
  };
  readonly memory?: {
    readonly maxObjectBytes?: number;
  };
};
