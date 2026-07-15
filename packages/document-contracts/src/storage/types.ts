/**
 * Document storage operation states and binary contracts (APZDOCS-002).
 */

export const DOCUMENT_STORAGE_OPERATION_STATES = [
  "pending",
  "writing",
  "stored",
  "verified",
  "failed",
  "reconciliation_required",
  "deletion_pending",
  "deleted",
] as const;

export type DocumentStorageOperationState =
  (typeof DOCUMENT_STORAGE_OPERATION_STATES)[number];

export const DOCUMENT_CHECKSUM_ALGORITHMS = ["sha256"] as const;
export type DocumentChecksumAlgorithm =
  (typeof DOCUMENT_CHECKSUM_ALGORITHMS)[number];

/** Opaque binary source — never a filesystem path from domain callers. */
export type DocumentBinarySource =
  | { readonly kind: "bytes"; readonly bytes: Uint8Array }
  | { readonly kind: "stream"; readonly stream: AsyncIterable<Uint8Array> };

export type DocumentBinaryResult =
  | { readonly kind: "bytes"; readonly bytes: Uint8Array }
  | {
      readonly kind: "stream";
      readonly stream: AsyncIterable<Uint8Array>;
      readonly byteLength?: number;
    };

export type DocumentContentVersionRecord = {
  readonly id: string;
  readonly documentId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly versionNumber: number;
  readonly mimeType: string;
  readonly byteLength: number;
  readonly checksumAlgorithm: DocumentChecksumAlgorithm;
  readonly checksumHex: string;
  readonly storageProviderId: string;
  readonly storageKey: string;
  readonly storageStatus: DocumentStorageOperationState;
  readonly etag?: string;
  readonly encryptionKeyRef?: string;
  readonly immutable: true;
  readonly displayFilename?: string;
  readonly declaredMimeType?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly verifiedAt?: string;
  readonly revision: number;
};

export type DocumentStorageObjectRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly documentId: string;
  readonly versionId: string;
  readonly providerId: string;
  readonly storageKey: string;
  readonly byteLength: number;
  readonly mimeType: string;
  readonly checksumHex: string;
  readonly checksumAlgorithm: DocumentChecksumAlgorithm;
  readonly status: DocumentStorageOperationState;
  readonly etag?: string;
  readonly encryptionKeyRef?: string;
  readonly verifiedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly revision: number;
};
