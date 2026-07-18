/**
 * Platform Document domain service (APZDOCS-001).
 * Metadata + lifecycle + classification only — never stores binary content.
 */

import type {
  ClassifyDocumentInput,
  CreateDocumentInput,
  Document,
  DocumentAudit,
  DocumentId,
  DocumentMetadata,
  DocumentRequestContext,
  DocumentSummary,
  DocumentTag,
  FindDocumentsInput,
  PlatformDocumentService,
  RelateDocumentInput,
  TagDocumentInput,
  UpdateDocumentMetadataInput,
} from "@apzhub/document-contracts";
import {
  asDocumentAuditId,
  asDocumentId,
  asDocumentMetadataId,
  asDocumentOwnerId,
  asDocumentRelationshipId,
  asDocumentTagId,
  DOCUMENT_TYPES,
} from "@apzhub/document-contracts";

import { buildDocumentClassification } from "../classification/validate";
import { assertDocumentLifecycleTransition } from "../lifecycle/transitions";
import {
  DocumentDomainError,
  requireFound,
  type DocumentAuditRepositoryPort,
  type DocumentMetadataRepositoryPort,
  type DocumentRelationshipRepositoryPort,
  type DocumentRepositoryPort,
  type DocumentTagRepositoryPort,
} from "../ports/types";

export type PlatformDocumentEngineDeps = {
  readonly documents: DocumentRepositoryPort;
  readonly metadata: DocumentMetadataRepositoryPort;
  readonly tags: DocumentTagRepositoryPort;
  readonly relationships: DocumentRelationshipRepositoryPort;
  readonly audits: DocumentAuditRepositoryPort;
  readonly now: () => string;
  readonly id: () => string;
};

function assertPermission(ctx: DocumentRequestContext, required: string): void {
  const granted = ctx.permissions;
  if (!granted || granted.length === 0) return;
  if (
    granted.includes("document.*") ||
    granted.includes(required) ||
    granted.includes("document.manage")
  ) {
    return;
  }
  throw new DocumentDomainError("forbidden", `Missing permission: ${required}`, {
    required,
  });
}

function toSummary(document: Document, tagNames: readonly string[]): DocumentSummary {
  return {
    documentId: document.id,
    title: document.title,
    status: document.status,
    classification: document.classification.code,
    documentType: document.documentType,
    ownerUserId: document.owner?.userId,
    updatedAt: document.updatedAt,
    tagNames,
  };
}

async function resolveTagNames(
  deps: PlatformDocumentEngineDeps,
  ctx: DocumentRequestContext,
  tagIds: readonly string[],
): Promise<string[]> {
  const names: string[] = [];
  for (const tagId of tagIds) {
    const tag = await deps.tags.get(ctx, asDocumentTagId(tagId));
    if (tag) names.push(tag.name);
  }
  return names;
}

async function appendAudit(
  deps: PlatformDocumentEngineDeps,
  ctx: DocumentRequestContext,
  documentId: DocumentId,
  action: string,
  details: Readonly<Record<string, string>> = {},
): Promise<void> {
  const audit: DocumentAudit = {
    id: asDocumentAuditId(deps.id()),
    documentId,
    tenantId: ctx.tenantId,
    action,
    actorUserId: ctx.userId,
    correlationId: ctx.correlationId,
    details,
    createdAt: deps.now(),
  };
  await deps.audits.append(ctx, audit);
}

export function createDocumentPlatformService(
  deps: PlatformDocumentEngineDeps,
): PlatformDocumentService {
  return {
    async createDocument(ctx, input: CreateDocumentInput) {
      assertPermission(ctx, "document.write");
      const title = input.title?.trim();
      if (!title) {
        throw new DocumentDomainError("validation_error", "title is required");
      }
      const documentType = input.documentType ?? "file";
      if (!(DOCUMENT_TYPES as readonly string[]).includes(documentType)) {
        throw new DocumentDomainError(
          "invalid_document_type",
          `Unknown document type: ${documentType}`,
        );
      }
      const now = deps.now();
      const id = asDocumentId(deps.id());
      const classification = buildDocumentClassification({
        code: input.classification ?? "internal",
        customCode: input.customClassification,
      });
      const tagIds = [];
      for (const name of input.tagNames ?? []) {
        const tag = await deps.tags.ensure(ctx, name);
        tagIds.push(tag.id);
      }
      const storageRef =
        input.storageProviderId && input.storageKey
          ? {
              providerId: input.storageProviderId,
              storageKey: input.storageKey,
            }
          : undefined;
      const document: Document = {
        id,
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        documentType,
        status: "draft",
        classification,
        title,
        description: input.description,
        owner: {
          id: asDocumentOwnerId(deps.id()),
          userId: ctx.userId,
        },
        creatorUserId: ctx.userId,
        mimeType: input.mimeType,
        byteLength: input.byteLength,
        checksum: input.checksumHex
          ? {
              algorithm: input.checksumAlgorithm ?? "sha256",
              hex: input.checksumHex,
            }
          : undefined,
        storageRef,
        categoryId: input.categoryId
          ? (input.categoryId as Document["categoryId"])
          : undefined,
        folderId: input.folderId ? (input.folderId as Document["folderId"]) : undefined,
        tagIds,
        permissions: [
          {
            principalType: "user",
            principalId: ctx.userId,
            action: "manage",
          },
        ],
        lifecycle: {
          state: "draft",
          changedAt: now,
          changedBy: ctx.userId,
          reason: "created",
        },
        createdAt: now,
        updatedAt: now,
      };
      const created = await deps.documents.create(ctx, document);
      await deps.metadata.upsert(ctx, {
        id: asDocumentMetadataId(deps.id()),
        documentId: created.id,
        tenantId: ctx.tenantId,
        organisationId: created.organisationId,
        title: created.title,
        description: created.description,
        mimeType: created.mimeType,
        byteLength: created.byteLength,
        custom: {},
        createdAt: now,
        updatedAt: now,
      });
      await appendAudit(deps, ctx, created.id, "document.created", {
        title: created.title,
      });
      return created;
    },

    async updateMetadata(ctx, input: UpdateDocumentMetadataInput) {
      assertPermission(ctx, "document.write");
      const document = requireFound(
        await deps.documents.get(ctx, input.documentId),
        "document",
        input.documentId,
      );
      const now = deps.now();
      const updatedDoc: Document = {
        ...document,
        title: input.title?.trim() || document.title,
        description:
          input.description !== undefined ? input.description : document.description,
        mimeType: input.mimeType !== undefined ? input.mimeType : document.mimeType,
        byteLength:
          input.byteLength !== undefined ? input.byteLength : document.byteLength,
        updatedAt: now,
      };
      await deps.documents.update(ctx, updatedDoc);
      const existing =
        (await deps.metadata.getByDocumentId(ctx, input.documentId)) ??
        ({
          id: asDocumentMetadataId(deps.id()),
          documentId: input.documentId,
          tenantId: ctx.tenantId,
          organisationId: document.organisationId,
          title: document.title,
          description: document.description,
          mimeType: document.mimeType,
          byteLength: document.byteLength,
          custom: {},
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        } satisfies DocumentMetadata);
      const metadata: DocumentMetadata = {
        ...existing,
        title: updatedDoc.title,
        description: updatedDoc.description,
        mimeType: updatedDoc.mimeType,
        byteLength: updatedDoc.byteLength,
        custom: input.custom ?? existing.custom,
        updatedAt: now,
      };
      const saved = await deps.metadata.upsert(ctx, metadata);
      await appendAudit(deps, ctx, input.documentId, "document.metadata_updated");
      return saved;
    },

    async archiveDocument(ctx, documentId) {
      assertPermission(ctx, "document.manage");
      const document = requireFound(
        await deps.documents.get(ctx, documentId),
        "document",
        documentId,
      );
      assertDocumentLifecycleTransition(document.lifecycle.state, "archived");
      const now = deps.now();
      const archived: Document = {
        ...document,
        status: "archived",
        lifecycle: {
          state: "archived",
          changedAt: now,
          changedBy: ctx.userId,
          reason: "archived",
        },
        archivedAt: now,
        updatedAt: now,
      };
      const saved = await deps.documents.update(ctx, archived);
      await appendAudit(deps, ctx, documentId, "document.archived");
      return saved;
    },

    async restoreDocument(ctx, documentId) {
      assertPermission(ctx, "document.manage");
      const document = requireFound(
        await deps.documents.get(ctx, documentId),
        "document",
        documentId,
      );
      const target =
        document.lifecycle.state === "deleted" ||
        document.lifecycle.state === "archived"
          ? "restored"
          : "active";
      const nextState =
        document.lifecycle.state === "deleted" ||
        document.lifecycle.state === "archived"
          ? "restored"
          : "active";
      assertDocumentLifecycleTransition(document.lifecycle.state, nextState);
      const now = deps.now();
      const restored: Document = {
        ...document,
        status: target === "restored" ? "restored" : "active",
        lifecycle: {
          state: nextState,
          changedAt: now,
          changedBy: ctx.userId,
          reason: "restored",
        },
        archivedAt: undefined,
        deletedAt: undefined,
        updatedAt: now,
      };
      const saved = await deps.documents.update(ctx, restored);
      await appendAudit(deps, ctx, documentId, "document.restored");
      return saved;
    },

    async classifyDocument(ctx, input: ClassifyDocumentInput) {
      assertPermission(ctx, "document.classify");
      const document = requireFound(
        await deps.documents.get(ctx, input.documentId),
        "document",
        input.documentId,
      );
      const classification = buildDocumentClassification({
        code: input.classification,
        customCode: input.customCode,
        label: input.label,
      });
      const now = deps.now();
      const updated: Document = {
        ...document,
        classification,
        updatedAt: now,
      };
      await deps.documents.update(ctx, updated);
      await appendAudit(deps, ctx, input.documentId, "document.classified", {
        classification: classification.code,
      });
      return classification;
    },

    async tagDocument(ctx, input: TagDocumentInput) {
      assertPermission(ctx, "document.write");
      const document = requireFound(
        await deps.documents.get(ctx, input.documentId),
        "document",
        input.documentId,
      );
      const tags: DocumentTag[] = [];
      const tagIds = [...document.tagIds];
      for (const name of input.tagNames) {
        const tag = await deps.tags.ensure(ctx, name);
        tags.push(tag);
        if (!tagIds.includes(tag.id)) tagIds.push(tag.id);
      }
      const now = deps.now();
      await deps.documents.update(ctx, {
        ...document,
        tagIds,
        updatedAt: now,
      });
      await appendAudit(deps, ctx, input.documentId, "document.tagged");
      return tags;
    },

    async relateDocument(ctx, input: RelateDocumentInput) {
      assertPermission(ctx, "document.write");
      requireFound(
        await deps.documents.get(ctx, input.sourceDocumentId),
        "document",
        input.sourceDocumentId,
      );
      if (input.targetDocumentId) {
        requireFound(
          await deps.documents.get(ctx, input.targetDocumentId),
          "document",
          input.targetDocumentId,
        );
      }
      if (!input.targetDocumentId && !input.reference) {
        throw new DocumentDomainError(
          "validation_error",
          "relateDocument requires targetDocumentId or reference",
        );
      }
      const relationship = await deps.relationships.create(ctx, {
        id: asDocumentRelationshipId(deps.id()),
        tenantId: ctx.tenantId,
        sourceDocumentId: input.sourceDocumentId,
        targetDocumentId: input.targetDocumentId,
        kind: input.kind,
        reference: input.reference,
        createdAt: deps.now(),
        createdBy: ctx.userId,
      });
      await appendAudit(deps, ctx, input.sourceDocumentId, "document.related", {
        kind: input.kind,
      });
      return relationship;
    },

    async findDocuments(ctx, input: FindDocumentsInput = {}) {
      assertPermission(ctx, "document.read");
      const all = await deps.documents.list(ctx);
      const q = input.query?.trim().toLowerCase();
      const filtered = [];
      for (const document of all) {
        if (input.status && document.status !== input.status) continue;
        if (
          input.classification &&
          document.classification.code !== input.classification
        ) {
          continue;
        }
        if (input.documentType && document.documentType !== input.documentType) {
          continue;
        }
        const tagNames = await resolveTagNames(deps, ctx, document.tagIds);
        if (
          input.tagName &&
          !tagNames.some((name) => name.toLowerCase() === input.tagName!.toLowerCase())
        ) {
          continue;
        }
        if (
          q &&
          !document.title.toLowerCase().includes(q) &&
          !(document.description?.toLowerCase().includes(q) ?? false) &&
          !document.id.toLowerCase().includes(q)
        ) {
          continue;
        }
        filtered.push(toSummary(document, tagNames));
      }
      const limit = input.limit && input.limit > 0 ? input.limit : 100;
      return filtered.slice(0, limit);
    },

    async summarizeDocument(ctx, documentId) {
      assertPermission(ctx, "document.read");
      const document = requireFound(
        await deps.documents.get(ctx, documentId),
        "document",
        documentId,
      );
      const tagNames = await resolveTagNames(deps, ctx, document.tagIds);
      return toSummary(document, tagNames);
    },

    async getDocument(ctx, documentId) {
      assertPermission(ctx, "document.read");
      return requireFound(
        await deps.documents.get(ctx, documentId),
        "document",
        documentId,
      );
    },

    async listAudit(ctx, documentId) {
      assertPermission(ctx, "document.audit");
      requireFound(await deps.documents.get(ctx, documentId), "document", documentId);
      return deps.audits.listByDocument(ctx, documentId);
    },

    async listTags(ctx) {
      assertPermission(ctx, "document.read");
      return deps.tags.list(ctx);
    },

    async getTag(ctx, tagId) {
      assertPermission(ctx, "document.read");
      return deps.tags.get(ctx, tagId);
    },

    async assignFolder(ctx, input) {
      assertPermission(ctx, "document.folder.write");
      const document = requireFound(
        await deps.documents.get(ctx, input.documentId),
        "document",
        input.documentId,
      );
      const now = deps.now();
      const updated: Document = {
        ...document,
        folderId: input.folderId ? (input.folderId as Document["folderId"]) : undefined,
        updatedAt: now,
      };
      const saved = await deps.documents.update(ctx, updated);
      await appendAudit(deps, ctx, input.documentId, "document.folder_assigned", {
        folderId: input.folderId ?? "",
      });
      return saved;
    },

    async assignCollection(ctx, input) {
      assertPermission(ctx, "document.collection.write");
      const document = requireFound(
        await deps.documents.get(ctx, input.documentId),
        "document",
        input.documentId,
      );
      const now = deps.now();
      // Collection id stored via categoryId until dedicated collection FK exists.
      const updated: Document = {
        ...document,
        categoryId: input.collectionId
          ? (input.collectionId as Document["categoryId"])
          : undefined,
        updatedAt: now,
      };
      const saved = await deps.documents.update(ctx, updated);
      await appendAudit(deps, ctx, input.documentId, "document.collection_assigned", {
        collectionId: input.collectionId ?? "",
      });
      return saved;
    },

    async applyRetention(ctx, input) {
      assertPermission(ctx, "document.retention");
      const document = requireFound(
        await deps.documents.get(ctx, input.documentId),
        "document",
        input.documentId,
      );
      const now = deps.now();
      if (input.retentionId) {
        assertDocumentLifecycleTransition(document.lifecycle.state, "retained");
      }
      const updated: Document = {
        ...document,
        retentionId: input.retentionId
          ? (input.retentionId as Document["retentionId"])
          : undefined,
        status: input.retentionId ? "retained" : document.status,
        lifecycle: input.retentionId
          ? {
              state: "retained",
              changedAt: now,
              changedBy: ctx.userId,
              reason: "retention_applied",
            }
          : document.lifecycle,
        updatedAt: now,
      };
      const saved = await deps.documents.update(ctx, updated);
      await appendAudit(deps, ctx, input.documentId, "document.retention_applied", {
        retentionId: input.retentionId ?? "",
      });
      return saved;
    },
  };
}
