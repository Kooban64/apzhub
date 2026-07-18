/**
 * In-memory Platform Document client for tests / Workbench (APZDOCS-004/005).
 */

import type { DocumentClient } from "./document-client";
import type {
  DocumentDiagnosticsViewModel,
  DocumentSummaryViewModel,
  DocumentVersionViewModel,
  DocumentViewModel,
} from "./document-types";

export const MOCK_DOCUMENT: DocumentViewModel = {
  id: "doc_mock_1",
  title: "Policy Handbook",
  status: "published",
  classification: "internal",
  documentType: "file",
  description: "Read-only mock document for Workbench tests",
  createdAt: "2026-07-13T10:00:00.000Z",
  updatedAt: "2026-07-13T12:00:00.000Z",
  folderId: "folder_policies",
  collectionId: "collection_compliance",
  retentionId: "ret_standard",
  ownerUserId: "user_1",
  tagNames: ["policy", "compliance"],
};

export const MOCK_DOCUMENT_VERSION: DocumentVersionViewModel = {
  id: "ver_mock_1",
  documentId: MOCK_DOCUMENT.id,
  versionNumber: 1,
  mimeType: "application/pdf",
  byteLength: 1024,
  checksumHex: "abc123checksum",
  storageStatus: "verified",
  createdAt: "2026-07-13T10:00:00.000Z",
};

export function createMockDocumentClient(
  overrides: Partial<DocumentClient> = {},
): DocumentClient {
  const docs = new Map<string, DocumentViewModel>([[MOCK_DOCUMENT.id, MOCK_DOCUMENT]]);
  let seq = 1;

  const base: DocumentClient = {
    async listDocuments(query) {
      const q = query?.query?.trim().toLowerCase() ?? "";
      const items = [...docs.values()]
        .filter((d) => {
          if (query?.status && d.status !== query.status) return false;
          if (query?.classification && d.classification !== query.classification) {
            return false;
          }
          if (query?.tagName && !(d.tagNames ?? []).includes(query.tagName)) {
            return false;
          }
          if (query?.folderId && d.folderId !== query.folderId) return false;
          if (query?.collectionId && d.collectionId !== query.collectionId) {
            return false;
          }
          if (!q) return true;
          return (
            d.title.toLowerCase().includes(q) ||
            d.id.toLowerCase().includes(q) ||
            d.status.toLowerCase().includes(q) ||
            d.classification.toLowerCase().includes(q)
          );
        })
        .map((d): DocumentSummaryViewModel => ({
          documentId: d.id,
          title: d.title,
          status: d.status,
          classification: d.classification,
          documentType: d.documentType,
          updatedAt: d.updatedAt,
          tagNames: d.tagNames ?? [],
          folderId: d.folderId,
          collectionId: d.collectionId,
          ownerUserId: d.ownerUserId,
        }));
      return { items, page: { limit: items.length, hasMore: false } };
    },
    async getDocument(documentId) {
      const doc = docs.get(documentId);
      if (!doc) throw new Error(`document not found: ${documentId}`);
      return doc;
    },
    async createDocumentMetadata(input) {
      const id = `doc_mock_${++seq}`;
      const now = "2026-07-13T16:00:00.000Z";
      const doc: DocumentViewModel = {
        id,
        title: input.title,
        status: "draft",
        classification: input.classification ?? "internal",
        documentType: input.documentType ?? "file",
        description: input.description,
        createdAt: now,
        updatedAt: now,
        tagNames: input.tagNames ?? [],
        ownerUserId: "user_1",
      };
      docs.set(id, doc);
      return doc;
    },
    async updateDocumentMetadata(documentId, input) {
      const doc = await this.getDocument(documentId);
      const updated = {
        ...doc,
        title: input.title ?? doc.title,
        description: input.description ?? doc.description,
        updatedAt: "2026-07-13T16:01:00.000Z",
      };
      docs.set(documentId, updated);
      return {
        id: `meta_${documentId}`,
        documentId,
        title: updated.title,
        description: updated.description,
        updatedAt: updated.updatedAt,
      };
    },
    async archiveDocument(documentId) {
      const doc = await this.getDocument(documentId);
      const updated = { ...doc, status: "archived" };
      docs.set(documentId, updated);
      return updated;
    },
    async restoreDocument(documentId) {
      const doc = await this.getDocument(documentId);
      const updated = { ...doc, status: "restored" };
      docs.set(documentId, updated);
      return updated;
    },
    async listVersions(documentId) {
      if (!docs.has(documentId)) return { items: [] };
      return {
        items: [{ ...MOCK_DOCUMENT_VERSION, documentId }],
      };
    },
    async getVersion(documentId, versionId) {
      if (versionId !== MOCK_DOCUMENT_VERSION.id && versionId !== "ver_1") {
        throw new Error("version not found");
      }
      return { ...MOCK_DOCUMENT_VERSION, documentId, id: versionId };
    },
    async getStorageMetadata(documentId, versionId) {
      return {
        version: {
          ...MOCK_DOCUMENT_VERSION,
          id: versionId,
          documentId,
          storageKeyPresent: true,
        },
        storageObject: {
          id: "sto_1",
          status: "verified",
          checksumHex: MOCK_DOCUMENT_VERSION.checksumHex,
          byteLength: MOCK_DOCUMENT_VERSION.byteLength,
          storageKeyPresent: true,
        },
      };
    },
    async assignFolder(documentId, folderId) {
      const doc = await this.getDocument(documentId);
      const updated = { ...doc, folderId: folderId ?? undefined };
      docs.set(documentId, updated);
      return updated;
    },
    async assignCollection(documentId, collectionId) {
      const doc = await this.getDocument(documentId);
      const updated = { ...doc, collectionId: collectionId ?? undefined };
      docs.set(documentId, updated);
      return updated;
    },
    async classify(_documentId, input) {
      return { code: input.classification };
    },
    async tag() {
      return [
        { id: "tag_policy", name: "policy" },
        { id: "tag_compliance", name: "compliance" },
      ];
    },
    async relate() {
      return { id: "rel_1", kind: "related_to" };
    },
    async applyRetention(documentId, retentionId) {
      const doc = await this.getDocument(documentId);
      const updated = { ...doc, retentionId: retentionId ?? undefined };
      docs.set(documentId, updated);
      return updated;
    },
    async listAudit(documentId) {
      return {
        items: [
          { id: `aud_${documentId}_1`, action: "document.created" },
          { id: `aud_${documentId}_2`, action: "document.metadata.updated" },
        ],
      };
    },
    listMetadata(query, options) {
      return this.listDocuments(query, options);
    },
    async getDiagnostics(): Promise<DocumentDiagnosticsViewModel> {
      return {
        providerReady: true,
        providerId: "memory",
        providerKind: "memory",
        repositoryReady: true,
        storageReady: true,
        checksumReady: true,
        reconciliationIssueCount: 0,
      };
    },
  };

  return { ...base, ...overrides };
}
