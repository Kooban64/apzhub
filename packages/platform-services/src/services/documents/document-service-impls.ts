/**
 * Document Platform Services — thin gateway facets (APZDOCS-003).
 * All business logic remains in @apzhub/document-core.
 */

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  DocumentContentService,
  DocumentPlatformGateway,
  DocumentRequestContext,
  PlatformDocumentService,
} from "@apzhub/document-contracts";
import type { DocumentPlatformFoundation } from "@apzhub/document-core";

function toDocumentCtx(ctx: ServiceRequestContext): DocumentRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    correlationId: ctx.correlationId,
    organisationId: ctx.organisationId,
    permissions: ctx.permissions,
  };
}

export type DocumentPlatformServiceImpls = DocumentPlatformGateway;

export function createDocumentPlatformServiceImpls(input: {
  readonly foundation: DocumentPlatformFoundation;
  readonly maxObjectBytes?: number;
  readonly getStorageObject?: (
    ctx: DocumentRequestContext,
    versionId: string,
  ) => Promise<import("@apzhub/document-contracts").DocumentStorageObjectRecord | null>;
}): DocumentPlatformServiceImpls {
  const docs: PlatformDocumentService = input.foundation.documents;
  const content: DocumentContentService = input.foundation.content;
  const provider = input.foundation.provider;

  return {
    documents: {
      create: (ctx, createInput) =>
        docs.createDocument(toDocumentCtx(ctx), createInput),
      get: (ctx, documentId) => docs.getDocument(toDocumentCtx(ctx), documentId),
      summarize: (ctx, documentId) =>
        docs.summarizeDocument(toDocumentCtx(ctx), documentId),
      archive: (ctx, documentId) =>
        docs.archiveDocument(toDocumentCtx(ctx), documentId),
      restore: (ctx, documentId) =>
        docs.restoreDocument(toDocumentCtx(ctx), documentId),
    },
    documentMetadata: {
      update: (ctx, updateInput) =>
        docs.updateMetadata(toDocumentCtx(ctx), updateInput),
    },
    documentClassification: {
      classify: (ctx, classifyInput) =>
        docs.classifyDocument(toDocumentCtx(ctx), classifyInput),
    },
    documentTags: {
      tag: (ctx, tagInput) => docs.tagDocument(toDocumentCtx(ctx), tagInput),
      list: (ctx) => docs.listTags(toDocumentCtx(ctx)),
      get: (ctx, tagId) => docs.getTag(toDocumentCtx(ctx), tagId),
    },
    documentRelationships: {
      relate: (ctx, relateInput) =>
        docs.relateDocument(toDocumentCtx(ctx), relateInput),
    },
    documentFolders: {
      assign: (ctx, assignInput) => docs.assignFolder(toDocumentCtx(ctx), assignInput),
    },
    documentCollections: {
      assign: (ctx, assignInput) =>
        docs.assignCollection(toDocumentCtx(ctx), assignInput),
    },
    documentRetention: {
      apply: (ctx, retentionInput) =>
        docs.applyRetention(toDocumentCtx(ctx), retentionInput),
    },
    documentAudit: {
      list: (ctx, documentId) => docs.listAudit(toDocumentCtx(ctx), documentId),
    },
    documentVersions: {
      list: (ctx, documentId) => content.listVersions(toDocumentCtx(ctx), documentId),
      get: (ctx, documentId, versionId) =>
        content.getVersion(toDocumentCtx(ctx), documentId, versionId),
    },
    documentStorage: {
      async getStorageMetadata(ctx, documentId, versionId) {
        const domainCtx = toDocumentCtx(ctx);
        const version = await content.getVersion(domainCtx, documentId, versionId);
        const storageObject = input.getStorageObject
          ? await input.getStorageObject(domainCtx, versionId)
          : null;
        return { version, storageObject };
      },
      verifyIntegrity: (ctx, documentId, versionId) =>
        content.verifyContent(toDocumentCtx(ctx), { documentId, versionId }),
      inspectReconciliation: (ctx) => content.inspectReconciliation(toDocumentCtx(ctx)),
    },
    documentSearchMetadata: {
      find: (ctx, findInput) => docs.findDocuments(toDocumentCtx(ctx), findInput),
    },
    documentDiagnostics: {
      async getDiagnostics(ctx) {
        const domainCtx = toDocumentCtx(ctx);
        const health = await provider.healthCheck();
        const inspection = await content.inspectReconciliation(domainCtx);
        const caps = provider.listCapabilities();
        return {
          providerReady: health.healthy,
          providerId: provider.id,
          providerKind: provider.kind,
          repositoryReady: true,
          storageReady: health.healthy,
          checksumReady: true,
          reconciliationIssueCount: inspection.issues.length,
          maxObjectBytes: input.maxObjectBytes,
          capabilities: {
            put: caps.put,
            get: caps.get,
            head: caps.head,
            delete: caps.delete,
            copy: caps.copy,
            multipart: caps.multipart,
            implemented: caps.implemented,
          },
        };
      },
    },
  };
}
