/**
 * Platform Document service facets (APZDOCS-003).
 * Gateway-facing contracts — metadata only; no binary transfer.
 * Context is structurally compatible with ServiceRequestContext (no package cycle).
 */

import type {
  Document,
  DocumentAudit,
  DocumentClassification,
  DocumentCollection,
  DocumentFolder,
  DocumentMetadata,
  DocumentRelationship,
  DocumentRetention,
  DocumentSummary,
  DocumentTag,
} from "../domain/document";
import type { DocumentId, DocumentTagId, DocumentVersionId } from "../identifiers";
import type { DocumentIntegrityResult } from "../integrity/types";
import type { DocumentReconciliationInspectionResult } from "../reconciliation/types";
import type {
  DocumentContentVersionRecord,
  DocumentStorageObjectRecord,
} from "../storage/types";
import type {
  AssignDocumentCollectionInput,
  AssignDocumentFolderInput,
  ApplyDocumentRetentionInput,
  ClassifyDocumentInput,
  CreateDocumentInput,
  FindDocumentsInput,
  RelateDocumentInput,
  TagDocumentInput,
  UpdateDocumentMetadataInput,
} from "./document-service";

/**
 * Gateway request context for document platform services.
 * Structurally compatible with ServiceRequestContext — mapped in platform-services.
 */
export type DocumentPlatformServiceContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId: string;
  readonly permissions: readonly string[];
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly requestId?: string;
};

export type DocumentService = {
  create(
    ctx: DocumentPlatformServiceContext,
    input: CreateDocumentInput,
  ): Promise<Document>;
  get(ctx: DocumentPlatformServiceContext, documentId: DocumentId): Promise<Document>;
  summarize(
    ctx: DocumentPlatformServiceContext,
    documentId: DocumentId,
  ): Promise<DocumentSummary>;
  archive(
    ctx: DocumentPlatformServiceContext,
    documentId: DocumentId,
  ): Promise<Document>;
  restore(
    ctx: DocumentPlatformServiceContext,
    documentId: DocumentId,
  ): Promise<Document>;
};

export type DocumentMetadataService = {
  update(
    ctx: DocumentPlatformServiceContext,
    input: UpdateDocumentMetadataInput,
  ): Promise<DocumentMetadata>;
};

export type DocumentClassificationService = {
  classify(
    ctx: DocumentPlatformServiceContext,
    input: ClassifyDocumentInput,
  ): Promise<DocumentClassification>;
};

export type DocumentTagService = {
  tag(
    ctx: DocumentPlatformServiceContext,
    input: TagDocumentInput,
  ): Promise<readonly DocumentTag[]>;
  list(ctx: DocumentPlatformServiceContext): Promise<readonly DocumentTag[]>;
  get(
    ctx: DocumentPlatformServiceContext,
    tagId: DocumentTagId,
  ): Promise<DocumentTag | null>;
};

export type DocumentRelationshipService = {
  relate(
    ctx: DocumentPlatformServiceContext,
    input: RelateDocumentInput,
  ): Promise<DocumentRelationship>;
};

export type DocumentFolderService = {
  assign(
    ctx: DocumentPlatformServiceContext,
    input: AssignDocumentFolderInput,
  ): Promise<Document>;
};

export type DocumentCollectionService = {
  assign(
    ctx: DocumentPlatformServiceContext,
    input: AssignDocumentCollectionInput,
  ): Promise<Document>;
};

export type DocumentRetentionService = {
  apply(
    ctx: DocumentPlatformServiceContext,
    input: ApplyDocumentRetentionInput,
  ): Promise<Document>;
};

export type DocumentAuditService = {
  list(
    ctx: DocumentPlatformServiceContext,
    documentId: DocumentId,
  ): Promise<readonly DocumentAudit[]>;
};

export type DocumentVersionService = {
  list(
    ctx: DocumentPlatformServiceContext,
    documentId: DocumentId,
  ): Promise<readonly DocumentContentVersionRecord[]>;
  get(
    ctx: DocumentPlatformServiceContext,
    documentId: DocumentId,
    versionId: DocumentVersionId,
  ): Promise<DocumentContentVersionRecord>;
};

export type DocumentStorageService = {
  /** Metadata-only storage descriptor — never returns binary content. */
  getStorageMetadata(
    ctx: DocumentPlatformServiceContext,
    documentId: DocumentId,
    versionId: DocumentVersionId,
  ): Promise<{
    readonly version: DocumentContentVersionRecord;
    readonly storageObject: DocumentStorageObjectRecord | null;
  }>;
  verifyIntegrity(
    ctx: DocumentPlatformServiceContext,
    documentId: DocumentId,
    versionId: DocumentVersionId,
  ): Promise<DocumentIntegrityResult>;
  inspectReconciliation(
    ctx: DocumentPlatformServiceContext,
  ): Promise<DocumentReconciliationInspectionResult>;
};

export type DocumentSearchMetadataService = {
  /** Metadata filter/lookup only — not full-text search. */
  find(
    ctx: DocumentPlatformServiceContext,
    input?: FindDocumentsInput,
  ): Promise<readonly DocumentSummary[]>;
};

export type DocumentPlatformDiagnostics = {
  readonly providerReady: boolean;
  readonly providerId: string;
  readonly providerKind: string;
  readonly repositoryReady: boolean;
  readonly storageReady: boolean;
  readonly checksumReady: boolean;
  readonly reconciliationIssueCount: number;
  readonly maxObjectBytes?: number;
  readonly capabilities?: Readonly<Record<string, boolean>>;
};

export type DocumentDiagnosticsService = {
  getDiagnostics(
    ctx: DocumentPlatformServiceContext,
  ): Promise<DocumentPlatformDiagnostics>;
};

/**
 * Nested document gateway surface (APZDOCS-003).
 * Products consume via PlatformServiceGateway — never storage providers.
 */
export type DocumentPlatformGateway = {
  readonly documents: DocumentService;
  readonly documentVersions: DocumentVersionService;
  readonly documentStorage: DocumentStorageService;
  readonly documentCollections: DocumentCollectionService;
  readonly documentFolders: DocumentFolderService;
  readonly documentTags: DocumentTagService;
  readonly documentRelationships: DocumentRelationshipService;
  readonly documentRetention: DocumentRetentionService;
  readonly documentAudit: DocumentAuditService;
  readonly documentMetadata: DocumentMetadataService;
  readonly documentClassification: DocumentClassificationService;
  readonly documentSearchMetadata: DocumentSearchMetadataService;
  readonly documentDiagnostics: DocumentDiagnosticsService;
};

/** Placeholder catalogue types for future folder/collection SoR expansion. */
export type DocumentFolderRecord = DocumentFolder;
export type DocumentCollectionRecord = DocumentCollection;
export type DocumentRetentionRecord = DocumentRetention;
