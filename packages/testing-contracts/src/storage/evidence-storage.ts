/** Abstract evidence object storage — no cloud SDK; implementations may throw not_implemented. */

export interface EvidenceStoragePutInput {
  readonly keyHint?: string;
  readonly contentType?: string;
  /** Optional — abstract; in-memory providers may store bytes. */
  readonly bytes?: Uint8Array;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface EvidenceStorageObject {
  readonly storageRef: string;
  readonly contentType?: string;
  readonly sizeBytes?: number;
  readonly checksum?: string;
  readonly contentHash?: string;
}

export interface EvidenceStorageProvider {
  put(input: EvidenceStoragePutInput): Promise<EvidenceStorageObject>;
  get(storageRef: string): Promise<EvidenceStorageObject | undefined>;
  delete(storageRef: string): Promise<void>;
  exists(storageRef: string): Promise<boolean>;
}

/** Contract only — no cloud SDK. Implementations may throw not_implemented for network ops. */
export interface ObjectStorageProvider extends EvidenceStorageProvider {
  readonly providerKind: "object_storage";
  readonly bucket?: string;
}
