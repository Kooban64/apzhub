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

export interface DocumentsDmsProvider {
  readonly providerId: string;
  getHealth(ctx: ServiceRequestContext): Promise<DocumentsDmsHealth>;
  listDocuments(
    ctx: ServiceRequestContext,
    query?: { readonly page?: number; readonly pageSize?: number },
  ): Promise<readonly DocumentsDmsDocumentSummary[]>;
}

export interface DocumentsDmsGateway {
  readonly dms: {
    getHealth(ctx: ServiceRequestContext): Promise<DocumentsDmsHealth>;
    listDocuments(
      ctx: ServiceRequestContext,
      query?: { readonly page?: number; readonly pageSize?: number },
    ): Promise<readonly DocumentsDmsDocumentSummary[]>;
  };
}
