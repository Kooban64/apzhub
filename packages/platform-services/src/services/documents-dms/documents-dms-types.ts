import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

export interface DocumentsDmsHealth {
  readonly status: "healthy" | "degraded" | "unavailable" | "unknown";
  readonly checkedAt: string;
  readonly providerStatuses: readonly {
    readonly providerId: "documents-dms";
    readonly status: DocumentsDmsHealth["status"];
    readonly message: string;
  }[];
  readonly reasons: readonly string[];
}

export interface DocumentsDmsDocumentSummary {
  readonly id: string;
  readonly title: string;
  readonly addedAt?: string;
  readonly createdAt?: string;
  readonly modifiedAt?: string;
  readonly originalFileName?: string;
  readonly archiveSerialNumber?: number;
  readonly tagCount: number;
}

export interface DocumentsDmsUploadInput {
  readonly fileName: string;
  readonly contentType: string;
  readonly bytes: Uint8Array;
  readonly title?: string;
}

export interface DocumentsDmsUploadResult {
  readonly status: "accepted";
  /** Opaque ingest id — never a native Documents SoR id. */
  readonly ingestId: string;
  readonly fileName: string;
  readonly title?: string;
}

export interface DocumentsDmsDownloadResult {
  readonly bytes: Uint8Array;
  readonly contentType: string;
  readonly fileName: string;
  readonly documentId: string;
}

export interface DocumentsDmsProvider {
  readonly providerId: string;
  getHealth(ctx: ServiceRequestContext): Promise<DocumentsDmsHealth>;
  listDocuments(
    ctx: ServiceRequestContext,
    query?: { readonly page?: number; readonly pageSize?: number },
  ): Promise<readonly DocumentsDmsDocumentSummary[]>;
  getDocument(
    ctx: ServiceRequestContext,
    documentId: string,
  ): Promise<DocumentsDmsDocumentSummary>;
  downloadDocument(
    ctx: ServiceRequestContext,
    documentId: string,
  ): Promise<DocumentsDmsDownloadResult>;
  uploadDocument(
    ctx: ServiceRequestContext,
    input: DocumentsDmsUploadInput,
  ): Promise<DocumentsDmsUploadResult>;
}

export interface DocumentsDmsGateway {
  readonly dms: {
    getHealth(ctx: ServiceRequestContext): Promise<DocumentsDmsHealth>;
    listDocuments(
      ctx: ServiceRequestContext,
      query?: { readonly page?: number; readonly pageSize?: number },
    ): Promise<readonly DocumentsDmsDocumentSummary[]>;
    getDocument(
      ctx: ServiceRequestContext,
      documentId: string,
    ): Promise<DocumentsDmsDocumentSummary>;
    downloadDocument(
      ctx: ServiceRequestContext,
      documentId: string,
    ): Promise<DocumentsDmsDownloadResult>;
    uploadDocument(
      ctx: ServiceRequestContext,
      input: DocumentsDmsUploadInput,
    ): Promise<DocumentsDmsUploadResult>;
  };
}
