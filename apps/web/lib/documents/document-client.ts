/**
 * Typed Platform Document HTTP client — calls ONLY `/api/v1/documents/*`.
 * No binary upload/download methods.
 */

import { DocumentClientError } from "./document-errors";
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

const API_BASE = "/api/v1/documents";

type JsonRecord = Record<string, unknown>;
type ApiErrorEnvelope = {
  readonly error?: { readonly message?: string; readonly code?: string };
  readonly meta?: { readonly correlationId?: string; readonly requestId?: string };
};
type ApiSuccessEnvelope<T> = { readonly data: T };
type ApiCollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

export interface DocumentClient {
  listDocuments(
    query?: ListDocumentsClientQuery,
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentCollectionResult<DocumentSummaryViewModel>>;
  getDocument(
    documentId: string,
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentViewModel>;
  createDocumentMetadata(
    input: CreateDocumentClientInput,
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentViewModel>;
  updateDocumentMetadata(
    documentId: string,
    input: UpdateDocumentMetadataClientInput,
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentMetadataViewModel>;
  archiveDocument(
    documentId: string,
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentViewModel>;
  restoreDocument(
    documentId: string,
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentViewModel>;
  listVersions(
    documentId: string,
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentCollectionResult<DocumentVersionViewModel>>;
  getVersion(
    documentId: string,
    versionId: string,
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentVersionViewModel>;
  getStorageMetadata(
    documentId: string,
    versionId: string,
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentStorageMetadataViewModel>;
  assignFolder(
    documentId: string,
    folderId: string | null,
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentViewModel>;
  assignCollection(
    documentId: string,
    collectionId: string | null,
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentViewModel>;
  classify(
    documentId: string,
    input: ClassifyDocumentClientInput,
    options?: DocumentClientRequestOptions,
  ): Promise<{ readonly code: string }>;
  tag(
    documentId: string,
    input: TagDocumentClientInput,
    options?: DocumentClientRequestOptions,
  ): Promise<readonly { readonly id: string; readonly name: string }[]>;
  relate(
    documentId: string,
    input: RelateDocumentClientInput,
    options?: DocumentClientRequestOptions,
  ): Promise<{ readonly id: string; readonly kind: string }>;
  applyRetention(
    documentId: string,
    retentionId: string | null,
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentViewModel>;
  listAudit(
    documentId: string,
    options?: DocumentClientRequestOptions,
  ): Promise<
    DocumentCollectionResult<{ readonly id: string; readonly action: string }>
  >;
  listMetadata(
    query?: ListDocumentsClientQuery,
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentCollectionResult<DocumentSummaryViewModel>>;
  getDiagnostics(
    options?: DocumentClientRequestOptions,
  ): Promise<DocumentDiagnosticsViewModel>;
}

function asRecord(value: unknown): JsonRecord {
  return value !== null && typeof value === "object" ? (value as JsonRecord) : {};
}

function mapSummary(raw: unknown): DocumentSummaryViewModel {
  const r = asRecord(raw);
  return {
    documentId: String(r.documentId ?? r.id ?? ""),
    title: String(r.title ?? ""),
    status: String(r.status ?? ""),
    classification: String(
      typeof r.classification === "object"
        ? (asRecord(r.classification).code ?? r.classification)
        : (r.classification ?? ""),
    ),
    documentType: String(r.documentType ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    tagNames: Array.isArray(r.tagNames) ? r.tagNames.map(String) : [],
    folderId:
      r.folderId !== undefined && r.folderId !== null ? String(r.folderId) : undefined,
    collectionId:
      r.collectionId !== undefined && r.collectionId !== null
        ? String(r.collectionId)
        : r.categoryId !== undefined && r.categoryId !== null
          ? String(r.categoryId)
          : undefined,
    ownerUserId:
      r.ownerUserId !== undefined && r.ownerUserId !== null
        ? String(r.ownerUserId)
        : r.creatorUserId !== undefined && r.creatorUserId !== null
          ? String(r.creatorUserId)
          : undefined,
  };
}

function mapDocument(raw: unknown): DocumentViewModel {
  const r = asRecord(raw);
  const classification =
    typeof r.classification === "object"
      ? String(asRecord(r.classification).code ?? "")
      : String(r.classification ?? "");
  return {
    id: String(r.id ?? ""),
    title: String(r.title ?? ""),
    status: String(r.status ?? ""),
    classification,
    documentType: String(r.documentType ?? ""),
    description: r.description !== undefined ? String(r.description) : undefined,
    updatedAt: String(r.updatedAt ?? ""),
    createdAt: String(r.createdAt ?? ""),
    folderId:
      r.folderId !== undefined && r.folderId !== null ? String(r.folderId) : undefined,
    collectionId:
      r.collectionId !== undefined && r.collectionId !== null
        ? String(r.collectionId)
        : r.categoryId !== undefined && r.categoryId !== null
          ? String(r.categoryId)
          : undefined,
    retentionId:
      r.retentionId !== undefined && r.retentionId !== null
        ? String(r.retentionId)
        : undefined,
    ownerUserId:
      r.ownerUserId !== undefined && r.ownerUserId !== null
        ? String(r.ownerUserId)
        : r.creatorUserId !== undefined && r.creatorUserId !== null
          ? String(r.creatorUserId)
          : undefined,
    tagNames: Array.isArray(r.tagNames) ? r.tagNames.map(String) : undefined,
  };
}

function mapVersion(raw: unknown): DocumentVersionViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    documentId: String(r.documentId ?? ""),
    versionNumber: Number(r.versionNumber ?? 0),
    mimeType: String(r.mimeType ?? ""),
    byteLength: Number(r.byteLength ?? 0),
    checksumHex: String(r.checksumHex ?? ""),
    storageStatus: String(r.storageStatus ?? ""),
    createdAt: String(r.createdAt ?? ""),
  };
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options?: DocumentClientRequestOptions,
): Promise<T> {
  if (!path.startsWith(API_BASE) && !path.startsWith("/api/v1/documents")) {
    throw new DocumentClientError({
      message: "Document client may only call /api/v1/documents",
      code: "INVALID_CLIENT_PATH",
    });
  }
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    signal: options?.signal,
    headers: {
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...options?.headers,
      ...init.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as
    ApiSuccessEnvelope<T> | ApiCollectionEnvelope<unknown> | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new DocumentClientError({
      message: err.error?.message ?? `Document request failed (${response.status})`,
      code: err.error?.code ?? "DOCUMENT_HTTP_ERROR",
      correlationId: err.meta?.correlationId,
      status: response.status,
    });
  }
  return payload as T;
}

export function createHttpDocumentClient(): DocumentClient {
  return {
    async listDocuments(query, options) {
      const params = new URLSearchParams();
      if (query?.query) params.set("query", query.query);
      if (query?.status) params.set("status", query.status);
      if (query?.classification) params.set("classification", query.classification);
      if (query?.tagName) params.set("tagName", query.tagName);
      if (query?.limit) params.set("limit", String(query.limit));
      const qs = params.toString();
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}${qs ? `?${qs}` : ""}`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapSummary),
        page: envelope.page,
      };
    },
    async getDocument(documentId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}`,
        { method: "GET" },
        options,
      );
      return mapDocument(envelope.data);
    },
    async createDocumentMetadata(input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        API_BASE,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapDocument(envelope.data);
    },
    async updateDocumentMetadata(documentId, input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      );
      const r = asRecord(envelope.data);
      return {
        id: String(r.id ?? ""),
        documentId: String(r.documentId ?? documentId),
        title: String(r.title ?? ""),
        description: r.description !== undefined ? String(r.description) : undefined,
        updatedAt: String(r.updatedAt ?? ""),
      };
    },
    async archiveDocument(documentId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}/archive`,
        { method: "POST" },
        options,
      );
      return mapDocument(envelope.data);
    },
    async restoreDocument(documentId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}/restore`,
        { method: "POST" },
        options,
      );
      return mapDocument(envelope.data);
    },
    async listVersions(documentId, options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}/versions`,
        { method: "GET" },
        options,
      );
      return { items: (envelope.data ?? []).map(mapVersion), page: envelope.page };
    },
    async getVersion(documentId, versionId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}/versions/${encodeURIComponent(versionId)}`,
        { method: "GET" },
        options,
      );
      return mapVersion(envelope.data);
    },
    async getStorageMetadata(documentId, versionId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}/versions/${encodeURIComponent(versionId)}/storage`,
        { method: "GET" },
        options,
      );
      const r = asRecord(envelope.data);
      const version = mapVersion(r.version);
      const obj = r.storageObject ? asRecord(r.storageObject) : null;
      return {
        version: {
          ...version,
          storageKeyPresent: Boolean(asRecord(r.version).storageKeyPresent),
        },
        storageObject: obj
          ? {
              id: String(obj.id ?? ""),
              status: String(obj.status ?? ""),
              checksumHex: String(obj.checksumHex ?? ""),
              byteLength: Number(obj.byteLength ?? 0),
              storageKeyPresent: Boolean(obj.storageKeyPresent),
            }
          : null,
      };
    },
    async assignFolder(documentId, folderId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}/folder`,
        { method: "POST", body: JSON.stringify({ folderId }) },
        options,
      );
      return mapDocument(envelope.data);
    },
    async assignCollection(documentId, collectionId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}/collection`,
        { method: "POST", body: JSON.stringify({ collectionId }) },
        options,
      );
      return mapDocument(envelope.data);
    },
    async classify(documentId, input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}/classify`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      const r = asRecord(envelope.data);
      return { code: String(r.code ?? "") };
    },
    async tag(documentId, input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}/tags`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      const data = Array.isArray(envelope.data) ? envelope.data : [];
      return data.map((row) => {
        const r = asRecord(row);
        return { id: String(r.id ?? ""), name: String(r.name ?? "") };
      });
    },
    async relate(documentId, input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}/relationships`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      const r = asRecord(envelope.data);
      return { id: String(r.id ?? ""), kind: String(r.kind ?? "") };
    },
    async applyRetention(documentId, retentionId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}/retention`,
        { method: "POST", body: JSON.stringify({ retentionId }) },
        options,
      );
      return mapDocument(envelope.data);
    },
    async listAudit(documentId, options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/${encodeURIComponent(documentId)}/audit`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map((row) => {
          const r = asRecord(row);
          return { id: String(r.id ?? ""), action: String(r.action ?? "") };
        }),
        page: envelope.page,
      };
    },
    listMetadata(query, options) {
      return this.listDocuments(query, options);
    },
    async getDiagnostics(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/diagnostics`,
        { method: "GET" },
        options,
      );
      const r = asRecord(envelope.data);
      return {
        providerReady: Boolean(r.providerReady),
        providerId: String(r.providerId ?? ""),
        providerKind: String(r.providerKind ?? ""),
        repositoryReady: Boolean(r.repositoryReady),
        storageReady: Boolean(r.storageReady),
        checksumReady: Boolean(r.checksumReady),
        reconciliationIssueCount: Number(r.reconciliationIssueCount ?? 0),
      };
    },
  };
}
