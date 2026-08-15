import { createHash } from "node:crypto";

import type { PaperlessAdapter } from "@apzhub/integration-paperless";
import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { DocumentsDmsHealth, DocumentsDmsProvider } from "./documents-dms-types";

function toIntegrationContext(ctx: ServiceRequestContext): IntegrationRequestContext {
  return {
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId ?? "documents-dms",
  };
}

function toPublicDocumentId(engineId: number): string {
  const digest = createHash("sha256")
    .update(`documents-dms:${engineId}`)
    .digest("hex")
    .slice(0, 24);
  return `dmsdoc_${digest}`;
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
      return result.documents.map((document) => ({
        id: toPublicDocumentId(document.id),
        title: document.title?.trim() || "Untitled document",
        addedAt: document.added,
        createdAt: document.created,
        modifiedAt: document.modified,
        originalFileName: document.original_file_name,
        archiveSerialNumber: document.archive_serial_number ?? undefined,
        tagCount: document.tags?.length ?? 0,
      }));
    },
  };
}
