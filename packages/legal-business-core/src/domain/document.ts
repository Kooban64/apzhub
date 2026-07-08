import type { ApprovalStatus, DocumentStatus, DocumentType } from "./enums";

export interface Document {
  readonly documentId: string;
  readonly documentReference: string;
  readonly title: string;
  readonly documentType: DocumentType;
  readonly documentStatus: DocumentStatus;
  readonly documentCategoryId: string;
  readonly matterId: string;
  readonly clientId?: string;
  readonly folderId?: string;
  readonly version: number;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly createdByUserId: string;
  readonly tags: readonly string[];
  readonly customFields: Readonly<Record<string, string>>;
}

export interface DocumentCategory {
  readonly documentCategoryId: string;
  readonly categoryCode: string;
  readonly name: string;
  readonly parentCategoryId?: string;
  readonly matterTypeIds?: readonly string[];
  readonly retentionPolicy?: string;
}

export interface Folder {
  readonly folderId: string;
  readonly name: string;
  readonly parentFolderId?: string;
  readonly matterId?: string;
  readonly clientId?: string;
  readonly sortOrder: number;
}

export interface Attachment {
  readonly attachmentId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly storageRef: string;
  readonly parentEntityType: string;
  readonly parentEntityId: string;
  readonly uploadedAt: string;
}

export interface Template {
  readonly templateId: string;
  readonly templateCode: string;
  readonly name: string;
  readonly documentCategoryId: string;
  readonly practiceAreaId?: string;
  readonly mergeFields: readonly string[];
  readonly storageRef: string;
  readonly version: number;
}

export interface Precedent {
  readonly precedentId: string;
  readonly precedentCode: string;
  readonly title: string;
  readonly practiceAreaId: string;
  readonly documentCategoryId: string;
  readonly sourceDocumentId?: string;
  readonly approvalStatus: ApprovalStatus;
  readonly effectiveFrom?: string;
}

export interface DocumentSearchCriteria {
  readonly query?: string;
  readonly matterId?: string;
  readonly clientId?: string;
  readonly documentStatus?: DocumentStatus | "all";
}
