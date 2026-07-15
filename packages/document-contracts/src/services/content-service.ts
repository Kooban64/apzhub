/**
 * Document content / storage service contracts (APZDOCS-002).
 * Domain-facing — products never call storage providers directly.
 */

import type { DocumentRequestContext } from "../common/context";
import type { DocumentId, DocumentVersionId } from "../identifiers";
import type {
  DocumentBinaryResult,
  DocumentBinarySource,
  DocumentContentVersionRecord,
} from "../storage/types";
import type { DocumentIntegrityResult } from "../integrity/types";
import type {
  DocumentReconciliationInspectionResult,
  DocumentReconciliationRepairResult,
} from "../reconciliation/types";

export type StoreDocumentContentInput = {
  readonly documentId: DocumentId;
  readonly source: DocumentBinarySource;
  readonly mimeType: string;
  readonly displayFilename?: string;
  readonly declaredMimeType?: string;
  readonly maxBytes?: number;
  readonly idempotencyKey?: string;
  readonly signal?: AbortSignal;
};

export type StoreDocumentContentResult = {
  readonly version: DocumentContentVersionRecord;
  readonly integrity: DocumentIntegrityResult;
  readonly duplicateChecksumDetected: boolean;
};

export type ReadDocumentContentInput = {
  readonly documentId: DocumentId;
  readonly versionId: DocumentVersionId;
  readonly as?: "bytes" | "stream";
  readonly signal?: AbortSignal;
};

export type DeleteDocumentContentInput = {
  readonly documentId: DocumentId;
  readonly versionId: DocumentVersionId;
  readonly force?: boolean;
  readonly signal?: AbortSignal;
};

export type DocumentContentService = {
  storeContent(
    ctx: DocumentRequestContext,
    input: StoreDocumentContentInput,
  ): Promise<StoreDocumentContentResult>;
  readContent(
    ctx: DocumentRequestContext,
    input: ReadDocumentContentInput,
  ): Promise<DocumentBinaryResult>;
  verifyContent(
    ctx: DocumentRequestContext,
    input: { readonly documentId: DocumentId; readonly versionId: DocumentVersionId },
  ): Promise<DocumentIntegrityResult>;
  deleteContent(
    ctx: DocumentRequestContext,
    input: DeleteDocumentContentInput,
  ): Promise<DocumentContentVersionRecord>;
  listVersions(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
  ): Promise<readonly DocumentContentVersionRecord[]>;
  getVersion(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
    versionId: DocumentVersionId,
  ): Promise<DocumentContentVersionRecord>;
  inspectReconciliation(
    ctx: DocumentRequestContext,
  ): Promise<DocumentReconciliationInspectionResult>;
  repairReconciliationIssue(
    ctx: DocumentRequestContext,
    issueId: string,
  ): Promise<DocumentReconciliationRepairResult>;
};
