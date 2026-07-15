/**
 * Version / storage-object repository ports (APZDOCS-002).
 */

import type {
  DocumentContentVersionRecord,
  DocumentId,
  DocumentRequestContext,
  DocumentStorageObjectRecord,
  DocumentVersionId,
} from "@apzhub/document-contracts";

export type DocumentListQuery = {
  readonly limit?: number;
  readonly offset?: number;
  readonly status?: string;
  readonly includeArchived?: boolean;
  readonly includeDeleted?: boolean;
  readonly sortBy?: "createdAt" | "updatedAt" | "title";
  readonly sortOrder?: "asc" | "desc";
  readonly query?: string;
};

export type DocumentPageResult<T> = {
  readonly items: readonly T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
};

export interface DocumentVersionRepositoryPort {
  create(
    ctx: DocumentRequestContext,
    version: DocumentContentVersionRecord,
  ): Promise<DocumentContentVersionRecord>;
  get(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
    versionId: DocumentVersionId,
  ): Promise<DocumentContentVersionRecord | null>;
  listByDocument(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
  ): Promise<readonly DocumentContentVersionRecord[]>;
  nextVersionNumber(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
  ): Promise<number>;
  findByChecksum(
    ctx: DocumentRequestContext,
    checksumHex: string,
  ): Promise<readonly DocumentContentVersionRecord[]>;
  /** Immutability: content fields cannot be updated after create. */
  updateStatus(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
    versionId: DocumentVersionId,
    status: DocumentContentVersionRecord["storageStatus"],
    options?: { readonly verifiedAt?: string; readonly expectedRevision?: number },
  ): Promise<DocumentContentVersionRecord>;
}

export interface DocumentStorageObjectRepositoryPort {
  create(
    ctx: DocumentRequestContext,
    record: DocumentStorageObjectRecord,
  ): Promise<DocumentStorageObjectRecord>;
  getByVersion(
    ctx: DocumentRequestContext,
    versionId: DocumentVersionId,
  ): Promise<DocumentStorageObjectRecord | null>;
  updateStatus(
    ctx: DocumentRequestContext,
    id: string,
    status: DocumentStorageObjectRecord["status"],
    options?: { readonly expectedRevision?: number; readonly verifiedAt?: string },
  ): Promise<DocumentStorageObjectRecord>;
  listReconciliationCandidates(
    ctx: DocumentRequestContext,
  ): Promise<readonly DocumentStorageObjectRecord[]>;
}
