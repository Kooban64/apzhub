/**
 * Platform Document service contracts (APZDOCS-001).
 * Contracts only — no HTTP, no Workbench.
 */

import type { DocumentRequestContext } from "../common/context";
import type {
  Document,
  DocumentAudit,
  DocumentClassification,
  DocumentMetadata,
  DocumentRelationship,
  DocumentSummary,
  DocumentTag,
} from "../domain/document";
import type { DocumentId, DocumentTagId } from "../identifiers";
import type {
  DocumentClassificationCode,
  DocumentRelationshipKind,
  DocumentType,
} from "../enums/catalogue";
import type { DocumentReference } from "../domain/document";

export type CreateDocumentInput = {
  readonly title: string;
  readonly description?: string;
  readonly documentType?: DocumentType;
  readonly classification?: DocumentClassificationCode;
  readonly customClassification?: string;
  readonly mimeType?: string;
  readonly byteLength?: number;
  readonly organisationId?: string;
  readonly tagNames?: readonly string[];
  readonly categoryId?: string;
  readonly folderId?: string;
  readonly checksumHex?: string;
  readonly checksumAlgorithm?: "sha256" | "sha512" | "md5";
  /** Opaque storage locator only — never binary content. */
  readonly storageProviderId?: string;
  readonly storageKey?: string;
};

export type UpdateDocumentMetadataInput = {
  readonly documentId: DocumentId;
  readonly title?: string;
  readonly description?: string;
  readonly mimeType?: string;
  readonly byteLength?: number;
  readonly custom?: Readonly<Record<string, string>>;
};

export type ClassifyDocumentInput = {
  readonly documentId: DocumentId;
  readonly classification: DocumentClassificationCode;
  readonly customCode?: string;
  readonly label?: string;
};

export type TagDocumentInput = {
  readonly documentId: DocumentId;
  readonly tagNames: readonly string[];
};

export type RelateDocumentInput = {
  readonly sourceDocumentId: DocumentId;
  readonly kind: DocumentRelationshipKind;
  readonly targetDocumentId?: DocumentId;
  readonly reference?: DocumentReference;
};

export type AssignDocumentFolderInput = {
  readonly documentId: DocumentId;
  readonly folderId: string | null;
};

export type AssignDocumentCollectionInput = {
  readonly documentId: DocumentId;
  readonly collectionId: string | null;
};

export type ApplyDocumentRetentionInput = {
  readonly documentId: DocumentId;
  readonly retentionId: string | null;
};

export type FindDocumentsInput = {
  readonly query?: string;
  readonly status?: string;
  readonly classification?: DocumentClassificationCode;
  readonly documentType?: DocumentType;
  readonly tagName?: string;
  readonly limit?: number;
};

export type PlatformDocumentService = {
  createDocument(
    ctx: DocumentRequestContext,
    input: CreateDocumentInput,
  ): Promise<Document>;
  updateMetadata(
    ctx: DocumentRequestContext,
    input: UpdateDocumentMetadataInput,
  ): Promise<DocumentMetadata>;
  archiveDocument(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
  ): Promise<Document>;
  restoreDocument(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
  ): Promise<Document>;
  classifyDocument(
    ctx: DocumentRequestContext,
    input: ClassifyDocumentInput,
  ): Promise<DocumentClassification>;
  tagDocument(
    ctx: DocumentRequestContext,
    input: TagDocumentInput,
  ): Promise<readonly DocumentTag[]>;
  relateDocument(
    ctx: DocumentRequestContext,
    input: RelateDocumentInput,
  ): Promise<DocumentRelationship>;
  findDocuments(
    ctx: DocumentRequestContext,
    input?: FindDocumentsInput,
  ): Promise<readonly DocumentSummary[]>;
  summarizeDocument(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
  ): Promise<DocumentSummary>;
  getDocument(ctx: DocumentRequestContext, documentId: DocumentId): Promise<Document>;
  listAudit(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
  ): Promise<readonly DocumentAudit[]>;
  listTags(ctx: DocumentRequestContext): Promise<readonly DocumentTag[]>;
  getTag(
    ctx: DocumentRequestContext,
    tagId: DocumentTagId,
  ): Promise<DocumentTag | null>;
  assignFolder(
    ctx: DocumentRequestContext,
    input: AssignDocumentFolderInput,
  ): Promise<Document>;
  assignCollection(
    ctx: DocumentRequestContext,
    input: AssignDocumentCollectionInput,
  ): Promise<Document>;
  applyRetention(
    ctx: DocumentRequestContext,
    input: ApplyDocumentRetentionInput,
  ): Promise<Document>;
};
