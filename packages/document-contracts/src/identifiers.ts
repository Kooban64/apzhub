/** Branded platform global identifiers for Document Platform entities (APZDOCS-001). */

declare const brand: unique symbol;

type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type DocumentId = Brand<string, "DocumentId">;
export type DocumentVersionId = Brand<string, "DocumentVersionId">;
export type DocumentRevisionId = Brand<string, "DocumentRevisionId">;
export type DocumentMetadataId = Brand<string, "DocumentMetadataId">;
export type DocumentCategoryId = Brand<string, "DocumentCategoryId">;
export type DocumentFolderId = Brand<string, "DocumentFolderId">;
export type DocumentCollectionId = Brand<string, "DocumentCollectionId">;
export type DocumentRelationshipId = Brand<string, "DocumentRelationshipId">;
export type DocumentRetentionId = Brand<string, "DocumentRetentionId">;
export type DocumentAuditId = Brand<string, "DocumentAuditId">;
export type DocumentTagId = Brand<string, "DocumentTagId">;
export type DocumentLinkId = Brand<string, "DocumentLinkId">;
export type DocumentAttachmentId = Brand<string, "DocumentAttachmentId">;
export type DocumentOwnerId = Brand<string, "DocumentOwnerId">;

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

export function isPlatformIdShape(value: string): boolean {
  return ID_PATTERN.test(value);
}

function brandId<T extends string>(value: string): T {
  if (!isPlatformIdShape(value)) {
    throw new Error(`Invalid platform identifier shape: ${value}`);
  }
  return value as T;
}

export function asDocumentId(value: string): DocumentId {
  return brandId(value);
}
export function asDocumentVersionId(value: string): DocumentVersionId {
  return brandId(value);
}
export function asDocumentRevisionId(value: string): DocumentRevisionId {
  return brandId(value);
}
export function asDocumentMetadataId(value: string): DocumentMetadataId {
  return brandId(value);
}
export function asDocumentCategoryId(value: string): DocumentCategoryId {
  return brandId(value);
}
export function asDocumentFolderId(value: string): DocumentFolderId {
  return brandId(value);
}
export function asDocumentCollectionId(value: string): DocumentCollectionId {
  return brandId(value);
}
export function asDocumentRelationshipId(value: string): DocumentRelationshipId {
  return brandId(value);
}
export function asDocumentRetentionId(value: string): DocumentRetentionId {
  return brandId(value);
}
export function asDocumentAuditId(value: string): DocumentAuditId {
  return brandId(value);
}
export function asDocumentTagId(value: string): DocumentTagId {
  return brandId(value);
}
export function asDocumentLinkId(value: string): DocumentLinkId {
  return brandId(value);
}
export function asDocumentAttachmentId(value: string): DocumentAttachmentId {
  return brandId(value);
}
export function asDocumentOwnerId(value: string): DocumentOwnerId {
  return brandId(value);
}
