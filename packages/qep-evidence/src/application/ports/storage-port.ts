/**
 * StoragePort — content byte store abstraction (APZQEP-ENG-110C / OES-ENG-091A §5.1).
 *
 * Domain never imports this for business rules. Application/Infrastructure use it
 * for content bytes only. Aggregate metadata persists via repositories.
 *
 * Technology MUST NOT be assumed (ADR-0088).
 */

export type StorageLocator = string;

export type StorageContentMetadata = {
  readonly storageLocator: StorageLocator;
  readonly tenantId: string;
  readonly mediaType: string;
  readonly byteSize: number;
  readonly contentHash?: string;
  readonly hashAlgorithm?: string;
  readonly createdAt?: string;
  readonly archivedAt?: string;
  readonly disposedAt?: string;
};

export type StoragePutInput = {
  readonly tenantId: string;
  readonly bytes: Uint8Array;
  readonly mediaType: string;
  readonly contentHash?: string;
  readonly hashAlgorithm?: string;
};

export type StoragePutResult = {
  readonly storageLocator: StorageLocator;
  readonly byteSize: number;
  readonly mediaType: string;
};

export type StorageGetResult = {
  readonly bytes: Uint8Array;
  readonly mediaType: string;
  readonly byteSize: number;
};

/**
 * Optional stream handle — adapters may return bytes via get() instead.
 * No concrete stream library types (technology independence).
 */
export type StorageStreamHandle = {
  readonly kind: "storage-stream";
  readonly storageLocator: StorageLocator;
  readonly mediaType: string;
  readonly byteSize: number;
};

export type StoragePort = {
  readonly portId: "StoragePort";

  /** Create / store content bytes → opaque locator. */
  put(input: StoragePutInput): Promise<StoragePutResult>;

  /** Retrieve full content bytes. */
  get(tenantId: string, storageLocator: StorageLocator): Promise<StorageGetResult>;

  /**
   * Retrieve a stream abstraction handle (no provider-specific stream type).
   * Skeleton may reject as not implemented.
   */
  openStream(
    tenantId: string,
    storageLocator: StorageLocator,
  ): Promise<StorageStreamHandle>;

  /**
   * Replace content at locator when policy allows (pre-seal Application concern).
   * Skeleton may reject as not implemented.
   */
  update(
    tenantId: string,
    storageLocator: StorageLocator,
    input: Omit<StoragePutInput, "tenantId">,
  ): Promise<StoragePutResult>;

  /** Mark content archived at storage layer (metadata flag / lifecycle). */
  archive(tenantId: string, storageLocator: StorageLocator): Promise<void>;

  /** Dispose / delete content bytes after authorised disposition. */
  dispose(tenantId: string, storageLocator: StorageLocator): Promise<void>;

  /** Alias for dispose when hard-delete semantics are selected later. */
  delete(tenantId: string, storageLocator: StorageLocator): Promise<void>;

  exists(tenantId: string, storageLocator: StorageLocator): Promise<boolean>;

  /** Content-side metadata only — not aggregate SoR. */
  getMetadata(
    tenantId: string,
    storageLocator: StorageLocator,
  ): Promise<StorageContentMetadata | null>;
};
