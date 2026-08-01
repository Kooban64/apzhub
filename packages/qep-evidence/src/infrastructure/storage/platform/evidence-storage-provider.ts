/**
 * EvidenceStorageProvider — provider-agnostic content contract (APZQEP-120-S03).
 */

import type {
  StorageContentMetadata,
  StorageGetResult,
  StorageLocator,
  StoragePutInput,
  StoragePutResult,
  StorageStreamHandle,
} from "../../../application/ports/storage-port";
import type {
  EvidenceStorageCapabilities,
  EvidenceStorageHealth,
  EvidenceStorageProviderKind,
} from "./types";

export type EvidenceStorageProvider = {
  readonly providerId: string;
  readonly kind: EvidenceStorageProviderKind;
  readonly capabilities: EvidenceStorageCapabilities;

  initialise(): Promise<void>;
  /** Optional sync bootstrap for DI factories that cannot await. */
  initialiseSync?(): void;
  health(): Promise<EvidenceStorageHealth>;

  store(input: StoragePutInput): Promise<StoragePutResult>;
  retrieve(tenantId: string, locator: StorageLocator): Promise<StorageGetResult>;
  stream(tenantId: string, locator: StorageLocator): Promise<StorageStreamHandle>;
  exists(tenantId: string, locator: StorageLocator): Promise<boolean>;
  replace(
    tenantId: string,
    locator: StorageLocator,
    input: Omit<StoragePutInput, "tenantId">,
  ): Promise<StoragePutResult>;
  archive(tenantId: string, locator: StorageLocator): Promise<void>;
  /** Hard delete of content bytes (authorised disposition). */
  remove(tenantId: string, locator: StorageLocator): Promise<void>;
  metadata(
    tenantId: string,
    locator: StorageLocator,
  ): Promise<StorageContentMetadata | null>;
};
