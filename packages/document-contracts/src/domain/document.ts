/**
 * APZHUB Platform Document domain models (APZDOCS-001).
 * Product-agnostic authoritative document management domain — metadata only (no binary blobs).
 */

import type {
  DocumentAttachmentId,
  DocumentAuditId,
  DocumentCategoryId,
  DocumentCollectionId,
  DocumentFolderId,
  DocumentId,
  DocumentLinkId,
  DocumentMetadataId,
  DocumentOwnerId,
  DocumentRelationshipId,
  DocumentRetentionId,
  DocumentRevisionId,
  DocumentTagId,
  DocumentVersionId,
} from "../identifiers";
import type {
  DocumentClassificationCode,
  DocumentConsumerProduct,
  DocumentLifecycleState,
  DocumentPermissionAction,
  DocumentRelationshipKind,
  DocumentStatus,
  DocumentType,
} from "../enums/catalogue";

export type DocumentChecksum = {
  readonly algorithm: "sha256" | "sha512" | "md5";
  readonly hex: string;
};

export type DocumentSignature = {
  readonly algorithm: string;
  readonly value: string;
  readonly signedBy?: string;
  readonly signedAt?: string;
};

/** Opaque storage locator — never a binary payload. */
export type DocumentStorageReference = {
  readonly providerId: string;
  readonly storageKey: string;
  readonly bucket?: string;
  readonly region?: string;
};

export type DocumentClassification = {
  readonly code: DocumentClassificationCode;
  readonly label?: string;
  /** Custom label when code === "custom". */
  readonly customCode?: string;
};

export type DocumentOwner = {
  readonly id: DocumentOwnerId;
  readonly userId: string;
  readonly displayName?: string;
};

export type DocumentTag = {
  readonly id: DocumentTagId;
  readonly tenantId: string;
  readonly name: string;
  readonly createdAt: string;
};

export type DocumentCategory = {
  readonly id: DocumentCategoryId;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string;
  readonly parentCategoryId?: DocumentCategoryId;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DocumentFolder = {
  readonly id: DocumentFolderId;
  readonly tenantId: string;
  readonly name: string;
  readonly parentFolderId?: DocumentFolderId;
  readonly path: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DocumentCollection = {
  readonly id: DocumentCollectionId;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string;
  readonly documentIds: readonly DocumentId[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DocumentLifecycle = {
  readonly state: DocumentLifecycleState;
  readonly changedAt: string;
  readonly changedBy: string;
  readonly reason?: string;
};

export type DocumentRetention = {
  readonly id: DocumentRetentionId;
  readonly documentId: DocumentId;
  readonly tenantId: string;
  readonly policyKey: string;
  readonly retainUntil?: string;
  readonly legalHold: boolean;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DocumentPermission = {
  readonly principalType: "user" | "role" | "service";
  readonly principalId: string;
  readonly action: DocumentPermissionAction;
};

export type DocumentReference = {
  readonly product: DocumentConsumerProduct;
  readonly externalId: string;
  readonly label?: string;
};

export type DocumentRelationship = {
  readonly id: DocumentRelationshipId;
  readonly tenantId: string;
  readonly sourceDocumentId: DocumentId;
  readonly targetDocumentId?: DocumentId;
  readonly kind: DocumentRelationshipKind;
  readonly reference?: DocumentReference;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type DocumentLink = {
  readonly id: DocumentLinkId;
  readonly documentId: DocumentId;
  readonly href: string;
  readonly label?: string;
  readonly createdAt: string;
};

export type DocumentAttachment = {
  readonly id: DocumentAttachmentId;
  readonly documentId: DocumentId;
  readonly name: string;
  readonly mimeType?: string;
  readonly byteLength?: number;
  readonly storageRef?: DocumentStorageReference;
  readonly checksum?: DocumentChecksum;
  readonly createdAt: string;
};

export type DocumentTemplateReference = {
  readonly templateId: string;
  readonly templateVersion?: string;
  readonly product?: DocumentConsumerProduct;
};

export type DocumentGenerationReference = {
  readonly generationId: string;
  readonly reportType?: string;
  readonly generatedAt?: string;
  readonly product?: DocumentConsumerProduct;
};

export type DocumentVersion = {
  readonly id: DocumentVersionId;
  readonly documentId: DocumentId;
  readonly versionNumber: number;
  readonly label?: string;
  readonly storageRef?: DocumentStorageReference;
  readonly checksum?: DocumentChecksum;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type DocumentRevision = {
  readonly id: DocumentRevisionId;
  readonly documentId: DocumentId;
  readonly versionId: DocumentVersionId;
  readonly revisionNumber: number;
  readonly changeSummary?: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type DocumentMetadata = {
  readonly id: DocumentMetadataId;
  readonly documentId: DocumentId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly title: string;
  readonly description?: string;
  readonly mimeType?: string;
  readonly byteLength?: number;
  readonly language?: string;
  readonly custom: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DocumentSummary = {
  readonly documentId: DocumentId;
  readonly title: string;
  readonly status: DocumentStatus;
  readonly classification: DocumentClassificationCode;
  readonly documentType: DocumentType;
  readonly ownerUserId?: string;
  readonly updatedAt: string;
  readonly tagNames: readonly string[];
};

export type DocumentAudit = {
  readonly id: DocumentAuditId;
  readonly documentId: DocumentId;
  readonly tenantId: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly correlationId?: string;
  readonly details: Readonly<Record<string, string>>;
  readonly createdAt: string;
};

/** Canonical document aggregate (metadata authoritative; binaries via storageRef only). */
export type Document = {
  readonly id: DocumentId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly documentType: DocumentType;
  readonly status: DocumentStatus;
  readonly classification: DocumentClassification;
  readonly title: string;
  readonly description?: string;
  readonly owner?: DocumentOwner;
  readonly creatorUserId: string;
  readonly mimeType?: string;
  readonly byteLength?: number;
  readonly checksum?: DocumentChecksum;
  readonly signature?: DocumentSignature;
  readonly storageRef?: DocumentStorageReference;
  readonly categoryId?: DocumentCategoryId;
  readonly folderId?: DocumentFolderId;
  readonly tagIds: readonly DocumentTagId[];
  readonly permissions: readonly DocumentPermission[];
  readonly lifecycle: DocumentLifecycle;
  readonly retentionId?: DocumentRetentionId;
  readonly templateRef?: DocumentTemplateReference;
  readonly generationRef?: DocumentGenerationReference;
  readonly currentVersionId?: DocumentVersionId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string;
  readonly deletedAt?: string;
};
