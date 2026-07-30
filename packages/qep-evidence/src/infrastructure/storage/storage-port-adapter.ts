/**
 * StoragePort adapter skeleton — APZQEP-ENG-110C.
 * Technology remains undecided (ADR-0088). No provider I/O.
 */

import type {
  StorageContentMetadata,
  StorageGetResult,
  StorageLocator,
  StoragePort,
  StoragePutInput,
  StoragePutResult,
  StorageStreamHandle,
} from "../../application/ports/storage-port";
import { PersistenceNotImplementedError } from "../../shared/errors";

function notImplemented(operation: string): Promise<never> {
  return Promise.reject(
    new PersistenceNotImplementedError("StoragePortAdapterSkeleton", operation),
  );
}

/**
 * Non-functional StoragePort. Satisfies the contract for DI/compile-time use.
 * Extension point for a future provider-specific adapter (technology TBD).
 */
export const StoragePortAdapterSkeleton: StoragePort = {
  portId: "StoragePort",

  put(_input: StoragePutInput): Promise<StoragePutResult> {
    return notImplemented("put");
  },

  get(_tenantId: string, _storageLocator: StorageLocator): Promise<StorageGetResult> {
    return notImplemented("get");
  },

  openStream(
    _tenantId: string,
    _storageLocator: StorageLocator,
  ): Promise<StorageStreamHandle> {
    return notImplemented("openStream");
  },

  update(
    _tenantId: string,
    _storageLocator: StorageLocator,
    _input: Omit<StoragePutInput, "tenantId">,
  ): Promise<StoragePutResult> {
    return notImplemented("update");
  },

  archive(_tenantId: string, _storageLocator: StorageLocator): Promise<void> {
    return notImplemented("archive");
  },

  dispose(_tenantId: string, _storageLocator: StorageLocator): Promise<void> {
    return notImplemented("dispose");
  },

  delete(_tenantId: string, _storageLocator: StorageLocator): Promise<void> {
    return notImplemented("delete");
  },

  exists(_tenantId: string, _storageLocator: StorageLocator): Promise<boolean> {
    return notImplemented("exists");
  },

  getMetadata(
    _tenantId: string,
    _storageLocator: StorageLocator,
  ): Promise<StorageContentMetadata | null> {
    return notImplemented("getMetadata");
  },
};

export type StorageAdapterScaffoldId = "StoragePortAdapter";

export interface StorageAdapterScaffold {
  readonly adapterId: StorageAdapterScaffoldId;
  readonly technology: "undecided";
  readonly skeleton: StoragePort;
}

export const STORAGE_ADAPTER_SCAFFOLD: StorageAdapterScaffold = {
  adapterId: "StoragePortAdapter",
  technology: "undecided",
  skeleton: StoragePortAdapterSkeleton,
};
