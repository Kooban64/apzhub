import type {
  Document,
  DocumentAudit,
  DocumentCategory,
  DocumentFolder,
  DocumentId,
  DocumentMetadata,
  DocumentRelationship,
  DocumentRequestContext,
  DocumentRetention,
  DocumentTag,
  DocumentTagId,
} from "@apzhub/document-contracts";

export class DocumentDomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "DocumentDomainError";
  }
}

export function requireFound<T>(
  value: T | null | undefined,
  kind: string,
  id: string,
): T {
  if (value == null) {
    throw new DocumentDomainError("not_found", `${kind} not found: ${id}`, {
      kind,
      id,
    });
  }
  return value;
}

export interface DocumentRepositoryPort {
  create(ctx: DocumentRequestContext, document: Document): Promise<Document>;
  get(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
  ): Promise<Document | null>;
  update(ctx: DocumentRequestContext, document: Document): Promise<Document>;
  list(ctx: DocumentRequestContext): Promise<readonly Document[]>;
}

export interface DocumentMetadataRepositoryPort {
  upsert(
    ctx: DocumentRequestContext,
    metadata: DocumentMetadata,
  ): Promise<DocumentMetadata>;
  getByDocumentId(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
  ): Promise<DocumentMetadata | null>;
}

export interface DocumentTagRepositoryPort {
  list(ctx: DocumentRequestContext): Promise<readonly DocumentTag[]>;
  get(
    ctx: DocumentRequestContext,
    tagId: DocumentTagId,
  ): Promise<DocumentTag | null>;
  ensure(
    ctx: DocumentRequestContext,
    name: string,
  ): Promise<DocumentTag>;
}

export interface DocumentRelationshipRepositoryPort {
  create(
    ctx: DocumentRequestContext,
    relationship: DocumentRelationship,
  ): Promise<DocumentRelationship>;
  listByDocument(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
  ): Promise<readonly DocumentRelationship[]>;
}

export interface DocumentAuditRepositoryPort {
  append(
    ctx: DocumentRequestContext,
    audit: DocumentAudit,
  ): Promise<DocumentAudit>;
  listByDocument(
    ctx: DocumentRequestContext,
    documentId: DocumentId,
  ): Promise<readonly DocumentAudit[]>;
}

export interface DocumentCategoryRepositoryPort {
  get(
    ctx: DocumentRequestContext,
    categoryId: string,
  ): Promise<DocumentCategory | null>;
}

export interface DocumentFolderRepositoryPort {
  get(
    ctx: DocumentRequestContext,
    folderId: string,
  ): Promise<DocumentFolder | null>;
}

export interface DocumentRetentionRepositoryPort {
  get(
    ctx: DocumentRequestContext,
    retentionId: string,
  ): Promise<DocumentRetention | null>;
  upsert(
    ctx: DocumentRequestContext,
    retention: DocumentRetention,
  ): Promise<DocumentRetention>;
}
