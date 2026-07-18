/**
 * DocumentsSearchEntityMapper — canonical Document models → SearchEntityDraft (APZSEARCH-012).
 *
 * ## Version publication decision (preferred default + optional version entities)
 *
 * 1. **Primary:** map `Document` with current-version metadata fields
 *    (`currentVersionId`, `versionNumber` when provided via mapping extras).
 * 2. **Optional:** independent `document_version` entities for version-level discovery —
 *    parent documentId, versionNumber, label, createdAt, createdBy, checksumPresent,
 *    immutable lifecycle; inherit classification/permissions/tenant from supplied
 *    parent Document context. NEVER storageRef, NEVER checksum hex.
 *
 * Metadata-only — omit Document.storageRef, checksum hex, signature.
 */

import type {
  Document,
  DocumentCategory,
  DocumentClassificationCode,
  DocumentCollection,
  DocumentFolder,
  DocumentRetention,
  DocumentTag,
  DocumentVersion,
} from "@apzhub/document-contracts";
import type { SearchClassification } from "@apzhub/search-contracts";
import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { DocumentsSearchPublicationContext } from "../context/documents-search-publication-context";
import {
  assertPlatformEntityId,
  type DocumentsSearchEntityType,
} from "../types/entity-types";

export type DocumentsSearchMappingExtras = {
  readonly currentVersion?: DocumentVersion;
  readonly parentDocument?: Document;
  readonly retention?: DocumentRetention;
};

export type DocumentsSearchMappableEntity =
  | {
      readonly entityType: "document";
      readonly entity: Document;
      readonly extras?: DocumentsSearchMappingExtras;
    }
  | {
      readonly entityType: "document_version";
      readonly entity: DocumentVersion;
      readonly extras?: DocumentsSearchMappingExtras;
    }
  | {
      readonly entityType: "document_collection";
      readonly entity: DocumentCollection;
    }
  | {
      readonly entityType: "document_folder";
      readonly entity: DocumentFolder;
    }
  | {
      readonly entityType: "document_category";
      readonly entity: DocumentCategory;
    }
  | {
      readonly entityType: "document_tag";
      readonly entity: DocumentTag;
    };

/** Absolute / storage-like folder paths must never be indexed. */
const UNSAFE_FOLDER_PATH = /^([A-Za-z]:\\|\/|s3:)/i;

export function mapDocumentClassification(
  code: DocumentClassificationCode | undefined,
): SearchClassification {
  if (!code) {
    throw new Error("classification is required on Document — fail-closed");
  }
  switch (code) {
    case "public":
      return "public";
    case "internal":
    case "template":
    case "attachment":
      return "internal";
    case "confidential":
    case "legal":
    case "financial":
    case "compliance":
    case "generated_report":
      return "confidential";
    case "restricted":
    case "evidence":
      return "restricted";
    case "custom":
      // Fail-closed stricter: treat unknown custom as confidential.
      return "confidential";
    default:
      return "confidential";
  }
}

function navigationTarget(entityType: DocumentsSearchEntityType, id: string): string {
  switch (entityType) {
    case "document":
      return `/workspace/documents/${id}`;
    case "document_version":
      return `/workspace/documents/versions/${id}`;
    case "document_collection":
      return `/workspace/documents/collections/${id}`;
    case "document_folder":
      return `/workspace/documents/folders/${id}`;
    case "document_category":
      return `/workspace/documents/categories/${id}`;
    case "document_tag":
      return `/workspace/documents/tags/${id}`;
  }
}

function permissionTokens(
  context: DocumentsSearchPublicationContext,
  documentPermissions: readonly {
    readonly principalType: string;
    readonly principalId: string;
    readonly action: string;
  }[],
  status?: string,
  classificationCode?: string,
): string[] {
  const tokens = [
    ...context.permissions,
    ...documentPermissions.map(
      (p) => `${p.principalType}:${p.principalId}:${p.action}`,
    ),
  ];
  if (status) tokens.push(`status:${status}`);
  if (classificationCode) tokens.push(`classification:${classificationCode}`);
  return tokens;
}

function retentionMetadata(
  retention: DocumentRetention | undefined,
): Record<string, string> {
  if (!retention) return {};
  // NEVER publish retention.notes
  return {
    legalHold: retention.legalHold ? "true" : "false",
    retentionPolicyKey: retention.policyKey,
    ...(retention.retainUntil ? { retainUntil: retention.retainUntil } : {}),
  };
}

function generationMetadata(doc: Document): Record<string, string> {
  const ref = doc.generationRef;
  if (!ref) return {};
  return {
    generationId: ref.generationId,
    ...(ref.reportType ? { reportType: ref.reportType } : {}),
    ...(ref.generatedAt ? { generatedAt: ref.generatedAt } : {}),
    ...(ref.product ? { generationProduct: ref.product } : {}),
  };
}

function templateMetadata(doc: Document): Record<string, string> {
  const ref = doc.templateRef;
  if (!ref) return {};
  return {
    templateId: ref.templateId,
    ...(ref.templateVersion ? { templateVersion: ref.templateVersion } : {}),
    ...(ref.product ? { templateProduct: ref.product } : {}),
  };
}

function safeLogicalFolderPath(path: string): string | undefined {
  const trimmed = path.trim();
  if (!trimmed) return undefined;
  if (UNSAFE_FOLDER_PATH.test(trimmed)) return undefined;
  if (/\/var\/|\/tmp\/|s3:\/\//i.test(trimmed)) return undefined;
  return trimmed;
}

export class DocumentsSearchEntityMapper {
  map(
    context: DocumentsSearchPublicationContext,
    input: DocumentsSearchMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "document":
        return this.mapDocument(context, input.entity, input.extras);
      case "document_version":
        return this.mapDocumentVersion(context, input.entity, input.extras);
      case "document_collection":
        return this.mapDocumentCollection(context, input.entity);
      case "document_folder":
        return this.mapDocumentFolder(context, input.entity);
      case "document_category":
        return this.mapDocumentCategory(context, input.entity);
      case "document_tag":
        return this.mapDocumentTag(context, input.entity);
    }
  }

  mapDocument(
    context: DocumentsSearchPublicationContext,
    document: Document,
    extras?: DocumentsSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(document.id, "document.id");
    this.assertTenant(document.tenantId, context);
    if (!document.classification?.code) {
      throw new Error("classification is required on Document — fail-closed");
    }
    const classification = mapDocumentClassification(document.classification.code);
    const currentVersion = extras?.currentVersion;
    const retention = extras?.retention;
    // Primary document draft may carry current-version metadata only (no binary).
    const metadata: Record<string, string> = {
      documentType: document.documentType,
      status: document.status,
      ...(document.mimeType ? { mimeType: document.mimeType } : {}),
      ...(document.byteLength !== undefined
        ? { byteLength: String(document.byteLength) }
        : {}),
      ...(document.currentVersionId
        ? { currentVersionId: document.currentVersionId }
        : {}),
      ...(currentVersion
        ? {
            versionNumber: String(currentVersion.versionNumber),
            checksumPresent: currentVersion.checksum ? "true" : "false",
          }
        : document.checksum
          ? { checksumPresent: "true" }
          : {}),
      ...(document.folderId ? { folderId: document.folderId } : {}),
      ...(document.categoryId ? { categoryId: document.categoryId } : {}),
      ...(document.owner?.userId ? { ownerUserId: document.owner.userId } : {}),
      ...retentionMetadata(retention),
      ...generationMetadata(document),
      ...templateMetadata(document),
    };

    return {
      entityId: document.id,
      entityType: "document",
      title: document.title,
      summary: document.description,
      organisationId: document.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        document.permissions,
        document.status,
        document.classification.code,
      ),
      metadata,
      keywords: [
        document.title,
        document.documentType,
        document.status,
        document.classification.code,
        ...(document.mimeType ? [document.mimeType] : []),
      ],
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      navigationTarget: navigationTarget("document", document.id),
      sourceId: "documents:document",
      ownerUserId: document.owner?.userId ?? document.creatorUserId,
      version: currentVersion ? String(currentVersion.versionNumber) : undefined,
    };
  }

  mapDocumentVersion(
    context: DocumentsSearchPublicationContext,
    version: DocumentVersion,
    extras?: DocumentsSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(version.id, "document_version.id");
    assertPlatformEntityId(version.documentId, "document_version.documentId");
    const parent = extras?.parentDocument;
    if (!parent) {
      throw new Error(
        "parentDocument is required when mapping document_version — classification/permissions inherit from parent",
      );
    }
    this.assertTenant(parent.tenantId, context);
    if (parent.id !== version.documentId) {
      throw new Error("parentDocument.id must match document_version.documentId");
    }
    if (!parent.classification?.code) {
      throw new Error("classification is required on parent Document — fail-closed");
    }
    const classification = mapDocumentClassification(parent.classification.code);
    // NEVER storageRef, NEVER checksum hex — presence indicator only.
    const metadata: Record<string, string> = {
      documentId: version.documentId,
      versionNumber: String(version.versionNumber),
      createdBy: version.createdBy,
      checksumPresent: version.checksum ? "true" : "false",
      immutable: "true",
      ...(version.label ? { label: version.label } : {}),
      status: parent.status,
      documentType: parent.documentType,
      ...retentionMetadata(extras?.retention),
    };

    return {
      entityId: version.id,
      entityType: "document_version",
      title: version.label?.trim() || `${parent.title} v${version.versionNumber}`,
      summary: parent.description,
      organisationId: parent.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        parent.permissions,
        parent.status,
        parent.classification.code,
      ),
      metadata,
      keywords: [
        parent.title,
        String(version.versionNumber),
        ...(version.label ? [version.label] : []),
      ],
      createdAt: version.createdAt,
      updatedAt: version.createdAt,
      navigationTarget: navigationTarget("document_version", version.id),
      sourceId: "documents:document_version",
      ownerUserId: version.createdBy,
      version: String(version.versionNumber),
      lifecycleState: "validated",
    };
  }

  mapDocumentCollection(
    context: DocumentsSearchPublicationContext,
    collection: DocumentCollection,
  ): SearchEntityDraft {
    assertPlatformEntityId(collection.id, "document_collection.id");
    this.assertTenant(collection.tenantId, context);
    return {
      entityId: collection.id,
      entityType: "document_collection",
      title: collection.name,
      summary: collection.description,
      organisationId: context.organisationId,
      classification: context.classification ?? "internal",
      permissions: [...context.permissions],
      metadata: {
        documentCount: String(collection.documentIds.length),
      },
      keywords: [collection.name],
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      navigationTarget: navigationTarget("document_collection", collection.id),
      sourceId: "documents:document_collection",
      ownerUserId: context.actorUserId,
    };
  }

  mapDocumentFolder(
    context: DocumentsSearchPublicationContext,
    folder: DocumentFolder,
  ): SearchEntityDraft {
    assertPlatformEntityId(folder.id, "document_folder.id");
    this.assertTenant(folder.tenantId, context);
    // Prefer folder.name for summary; include logical path only when safe.
    const safePath = safeLogicalFolderPath(folder.path);
    return {
      entityId: folder.id,
      entityType: "document_folder",
      title: folder.name,
      summary: folder.name,
      organisationId: context.organisationId,
      classification: context.classification ?? "internal",
      permissions: [...context.permissions],
      metadata: {
        ...(folder.parentFolderId ? { parentFolderId: folder.parentFolderId } : {}),
        ...(safePath ? { path: safePath } : {}),
      },
      keywords: [folder.name, ...(safePath ? [safePath] : [])],
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      navigationTarget: navigationTarget("document_folder", folder.id),
      sourceId: "documents:document_folder",
      ownerUserId: context.actorUserId,
    };
  }

  mapDocumentCategory(
    context: DocumentsSearchPublicationContext,
    category: DocumentCategory,
  ): SearchEntityDraft {
    assertPlatformEntityId(category.id, "document_category.id");
    this.assertTenant(category.tenantId, context);
    return {
      entityId: category.id,
      entityType: "document_category",
      title: category.name,
      summary: category.description,
      organisationId: context.organisationId,
      classification: context.classification ?? "internal",
      permissions: [...context.permissions],
      metadata: {
        ...(category.parentCategoryId
          ? { parentCategoryId: category.parentCategoryId }
          : {}),
      },
      keywords: [category.name],
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      navigationTarget: navigationTarget("document_category", category.id),
      sourceId: "documents:document_category",
      ownerUserId: context.actorUserId,
    };
  }

  mapDocumentTag(
    context: DocumentsSearchPublicationContext,
    tag: DocumentTag,
  ): SearchEntityDraft {
    assertPlatformEntityId(tag.id, "document_tag.id");
    this.assertTenant(tag.tenantId, context);
    return {
      entityId: tag.id,
      entityType: "document_tag",
      title: tag.name,
      organisationId: context.organisationId,
      classification: context.classification ?? "internal",
      permissions: [...context.permissions],
      metadata: {},
      keywords: [tag.name],
      createdAt: tag.createdAt,
      updatedAt: tag.createdAt,
      navigationTarget: navigationTarget("document_tag", tag.id),
      sourceId: "documents:document_tag",
      ownerUserId: context.actorUserId,
    };
  }

  private assertTenant(
    entityTenantId: string,
    context: DocumentsSearchPublicationContext,
  ): void {
    if (entityTenantId !== context.tenantId) {
      throw new Error(
        "tenant mismatch between Documents entity and publication context",
      );
    }
  }
}
