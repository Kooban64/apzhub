import { createHash } from "node:crypto";

import type { PaperlessAdapter } from "@apzhub/integration-paperless";
import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import { PlatformServiceError } from "@apzhub/platform-service-contracts";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import { fromPublicDocumentId, toPublicDocumentId } from "./document-ids";
import type {
  DocumentsDmsDocumentSummary,
  DocumentsDmsHealth,
  DocumentsDmsProvider,
} from "./documents-dms-types";

function toIntegrationContext(ctx: ServiceRequestContext): IntegrationRequestContext {
  return {
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId ?? "documents-dms",
  };
}

function toPublicIngestId(taskId: string): string {
  const digest = createHash("sha256")
    .update(`documents-dms-ingest:${taskId}`)
    .digest("hex")
    .slice(0, 24);
  return `dmsingest_${digest}`;
}

function requireEngineId(publicId: string): number {
  const engineId = fromPublicDocumentId(publicId);
  if (engineId == null) {
    throw new PlatformServiceError({
      category: "validation",
      code: "VALIDATION_ERROR",
      message: "Invalid Documents DMS document id.",
      correlationId: "documents-dms",
      retryable: false,
    });
  }
  return engineId;
}

function mapDocument(document: {
  readonly id: number;
  readonly title?: string;
  readonly added?: string;
  readonly created?: string;
  readonly modified?: string;
  readonly original_file_name?: string;
  readonly archive_serial_number?: number | null;
  readonly tags?: readonly number[];
}): DocumentsDmsDocumentSummary {
  return {
    id: toPublicDocumentId(document.id),
    title: document.title?.trim() || "Untitled document",
    addedAt: document.added,
    createdAt: document.created,
    modifiedAt: document.modified,
    originalFileName: document.original_file_name,
    archiveSerialNumber: document.archive_serial_number ?? undefined,
    tagCount: document.tags?.length ?? 0,
  };
}

export function createPaperlessOpsProvider(
  adapter: PaperlessAdapter,
): DocumentsDmsProvider {
  return {
    providerId: "paperless",

    async getHealth(ctx) {
      const ictx = toIntegrationContext(ctx);
      await adapter.testConnection(ictx).catch(() => undefined);
      const extension = adapter.diagnosticsExtension;
      const status: DocumentsDmsHealth["status"] =
        extension.authenticationStatus === "valid" &&
        extension.apiStatus === "reachable"
          ? "healthy"
          : extension.apiStatus === "unavailable" ||
              extension.authenticationStatus === "invalid" ||
              extension.authenticationStatus === "missing"
            ? "unavailable"
            : "degraded";
      return {
        status,
        checkedAt: new Date().toISOString(),
        providerStatuses: [
          {
            providerId: "documents-dms",
            status,
            message: `auth=${extension.authenticationStatus}; api=${extension.apiStatus}`,
          },
        ],
        reasons:
          status === "healthy"
            ? []
            : [
                `authentication:${extension.authenticationStatus}`,
                `api:${extension.apiStatus}`,
              ],
      };
    },

    async listDocuments(ctx, query) {
      const result = await adapter.listDocuments(toIntegrationContext(ctx), query);
      return result.documents.map(mapDocument);
    },

    async getDocument(ctx, documentId) {
      const engineId = requireEngineId(documentId);
      const document = await adapter.getDocument(toIntegrationContext(ctx), engineId);
      return mapDocument(document);
    },

    async downloadDocument(ctx, documentId) {
      const engineId = requireEngineId(documentId);
      const downloaded = await adapter.downloadDocument(
        toIntegrationContext(ctx),
        engineId,
      );
      return {
        documentId: toPublicDocumentId(engineId),
        bytes: downloaded.bytes,
        contentType: downloaded.contentType,
        fileName: downloaded.fileName || `document-${toPublicDocumentId(engineId)}`,
      };
    },

    async uploadDocument(ctx, input) {
      const result = await adapter.uploadDocument(toIntegrationContext(ctx), input);
      return {
        status: "accepted",
        ingestId: toPublicIngestId(result.taskId),
        fileName: input.fileName,
        title: input.title?.trim() || undefined,
      };
    },
  };
}
