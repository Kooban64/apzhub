/**
 * Module-level Platform Document client accessor + facades (APZDOCS-004/005).
 */

import {
  createHttpDocumentClient,
  type DocumentClient,
} from "./document-client";
import { createMockDocumentClient } from "./mock-document-client";
import type {
  ClassifyDocumentClientInput,
  CreateDocumentClientInput,
  DocumentClientRequestOptions,
  DocumentCollectionResult,
  DocumentDiagnosticsViewModel,
  DocumentMetadataViewModel,
  DocumentStorageMetadataViewModel,
  DocumentSummaryViewModel,
  DocumentVersionViewModel,
  DocumentViewModel,
  ListDocumentsClientQuery,
  RelateDocumentClientInput,
  TagDocumentClientInput,
  UpdateDocumentMetadataClientInput,
} from "./document-types";

let documentClient: DocumentClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockDocumentClient()
    : createHttpDocumentClient();

export function setDocumentClient(client: DocumentClient): void {
  documentClient = client;
}

export function getDocumentClient(): DocumentClient {
  return documentClient;
}

export function resetDocumentClient(): void {
  documentClient = createMockDocumentClient();
}

export function listDocuments(
  query?: ListDocumentsClientQuery,
  options?: DocumentClientRequestOptions,
): Promise<DocumentCollectionResult<DocumentSummaryViewModel>> {
  return getDocumentClient().listDocuments(query, options);
}

export function getDocument(
  documentId: string,
  options?: DocumentClientRequestOptions,
): Promise<DocumentViewModel> {
  return getDocumentClient().getDocument(documentId, options);
}

export function createDocumentMetadata(
  input: CreateDocumentClientInput,
  options?: DocumentClientRequestOptions,
): Promise<DocumentViewModel> {
  return getDocumentClient().createDocumentMetadata(input, options);
}

export function updateDocumentMetadata(
  documentId: string,
  input: UpdateDocumentMetadataClientInput,
  options?: DocumentClientRequestOptions,
): Promise<DocumentMetadataViewModel> {
  return getDocumentClient().updateDocumentMetadata(documentId, input, options);
}

export function archiveDocument(
  documentId: string,
  options?: DocumentClientRequestOptions,
): Promise<DocumentViewModel> {
  return getDocumentClient().archiveDocument(documentId, options);
}

export function restoreDocument(
  documentId: string,
  options?: DocumentClientRequestOptions,
): Promise<DocumentViewModel> {
  return getDocumentClient().restoreDocument(documentId, options);
}

export function listVersions(
  documentId: string,
  options?: DocumentClientRequestOptions,
): Promise<DocumentCollectionResult<DocumentVersionViewModel>> {
  return getDocumentClient().listVersions(documentId, options);
}

export function getVersion(
  documentId: string,
  versionId: string,
  options?: DocumentClientRequestOptions,
): Promise<DocumentVersionViewModel> {
  return getDocumentClient().getVersion(documentId, versionId, options);
}

export function getStorageMetadata(
  documentId: string,
  versionId: string,
  options?: DocumentClientRequestOptions,
): Promise<DocumentStorageMetadataViewModel> {
  return getDocumentClient().getStorageMetadata(documentId, versionId, options);
}

export function assignFolder(
  documentId: string,
  folderId: string | null,
  options?: DocumentClientRequestOptions,
): Promise<DocumentViewModel> {
  return getDocumentClient().assignFolder(documentId, folderId, options);
}

export function assignCollection(
  documentId: string,
  collectionId: string | null,
  options?: DocumentClientRequestOptions,
): Promise<DocumentViewModel> {
  return getDocumentClient().assignCollection(documentId, collectionId, options);
}

export function classifyDocument(
  documentId: string,
  input: ClassifyDocumentClientInput,
  options?: DocumentClientRequestOptions,
): Promise<{ readonly code: string }> {
  return getDocumentClient().classify(documentId, input, options);
}

export function tagDocument(
  documentId: string,
  input: TagDocumentClientInput,
  options?: DocumentClientRequestOptions,
): Promise<readonly { readonly id: string; readonly name: string }[]> {
  return getDocumentClient().tag(documentId, input, options);
}

export function relateDocument(
  documentId: string,
  input: RelateDocumentClientInput,
  options?: DocumentClientRequestOptions,
): Promise<{ readonly id: string; readonly kind: string }> {
  return getDocumentClient().relate(documentId, input, options);
}

export function applyRetention(
  documentId: string,
  retentionId: string | null,
  options?: DocumentClientRequestOptions,
): Promise<DocumentViewModel> {
  return getDocumentClient().applyRetention(documentId, retentionId, options);
}

export function listAudit(
  documentId: string,
  options?: DocumentClientRequestOptions,
): Promise<DocumentCollectionResult<{ readonly id: string; readonly action: string }>> {
  return getDocumentClient().listAudit(documentId, options);
}

export function listMetadata(
  query?: ListDocumentsClientQuery,
  options?: DocumentClientRequestOptions,
): Promise<DocumentCollectionResult<DocumentSummaryViewModel>> {
  return getDocumentClient().listMetadata(query, options);
}

export function getDiagnostics(
  options?: DocumentClientRequestOptions,
): Promise<DocumentDiagnosticsViewModel> {
  return getDocumentClient().getDiagnostics(options);
}

export {
  createHttpDocumentClient,
  createMockDocumentClient,
  type DocumentClient,
};
export * from "./document-types";
export * from "./document-errors";
