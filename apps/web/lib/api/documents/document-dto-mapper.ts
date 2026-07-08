import type { Document } from "@apzhub/legal-business-core";

import {
  createEntityMetadataCache,
  type EntityApiMetadata,
} from "../framework/entity-metadata-cache";

/** Document API DTO shapes aligned with LAW-OpenAPI-v1 (LAW-014-06). */

export interface DocumentSummaryV1 {
  readonly documentId: string;
  readonly documentReference: string;
  readonly title: string;
  readonly documentType: Document["documentType"];
  readonly documentStatus: Document["documentStatus"];
  readonly matterId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface DocumentDetailV1 extends DocumentSummaryV1 {
  readonly version: number;
  readonly documentCategoryId: string;
  readonly clientId?: string | null;
  readonly folderId?: string | null;
  readonly createdByUserId: string;
  readonly tags: readonly string[];
  readonly customFields: Readonly<Record<string, string>>;
}

export interface CreateDocumentV1Request {
  readonly title: string;
  readonly documentType: Document["documentType"];
  readonly matterId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly documentCategoryId?: string;
  readonly tags?: readonly string[];
  readonly customFields?: Readonly<Record<string, string>>;
}

export interface UpdateDocumentV1Request {
  readonly title?: string;
  readonly documentStatus?: Document["documentStatus"];
  readonly documentCategoryId?: string;
  readonly folderId?: string | null;
  readonly tags?: readonly string[];
  readonly customFields?: Readonly<Record<string, string>>;
}

export interface DocumentArchiveResponseV1 {
  readonly documentId: string;
  readonly status: "archived";
}

export type DocumentApiMetadata = EntityApiMetadata;

const documentMetadataCache = createEntityMetadataCache();

export function resetDocumentApiMetadataCache(): void {
  documentMetadataCache.reset();
}

export function seedDocumentApiMetadata(
  documentId: string,
  metadata: DocumentApiMetadata,
): void {
  documentMetadataCache.seed(documentId, metadata);
}

export function touchDocumentApiMetadata(
  documentId: string,
  created = false,
): DocumentApiMetadata {
  return documentMetadataCache.touch(documentId, created);
}

export function getDocumentApiMetadata(documentId: string): DocumentApiMetadata {
  return documentMetadataCache.get(documentId);
}

export function mapDocumentToSummaryV1(
  document: Document,
  metadata: DocumentApiMetadata,
): DocumentSummaryV1 {
  return {
    documentId: document.documentId,
    documentReference: document.documentReference,
    title: document.title,
    documentType: document.documentType,
    documentStatus: document.documentStatus,
    matterId: document.matterId,
    fileName: document.fileName,
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes,
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
  };
}

export function mapDocumentToDetailV1(
  document: Document,
  metadata: DocumentApiMetadata,
): DocumentDetailV1 {
  return {
    ...mapDocumentToSummaryV1(document, metadata),
    version: metadata.version,
    documentCategoryId: document.documentCategoryId,
    clientId: document.clientId ?? null,
    folderId: document.folderId ?? null,
    createdByUserId: document.createdByUserId,
    tags: [...document.tags],
    customFields: { ...document.customFields },
  };
}
