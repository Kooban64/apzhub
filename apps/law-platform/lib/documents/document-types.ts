/** UI form model for Document Management screens — LAW-004-01. */
import type {
  Document,
  DocumentStatus,
  DocumentType,
} from "@apzhub/legal-business-core";

export type {
  Document,
  DocumentSearchCriteria,
  DocumentStatus,
  DocumentType,
} from "@apzhub/legal-business-core";
export { DOCUMENT_STATUSES, DOCUMENT_TYPES } from "@apzhub/legal-business-core";

export interface DocumentFormValues {
  readonly documentReference: string;
  readonly title: string;
  readonly documentType: DocumentType;
  readonly documentStatus: DocumentStatus;
  readonly documentCategoryId: string;
  readonly matterId: string;
  readonly folderId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: string;
  readonly createdByUserId: string;
  readonly tags: string;
  readonly customFields: string;
}

export interface DocumentListCriteria {
  readonly query?: string;
  readonly matterId?: string;
  readonly clientId?: string;
  readonly documentStatus?: DocumentStatus | "all";
  readonly documentCategoryId?: string;
  readonly folderId?: string;
}

export function documentToFormValues(document: Document): DocumentFormValues {
  return {
    documentReference: document.documentReference,
    title: document.title,
    documentType: document.documentType,
    documentStatus: document.documentStatus,
    documentCategoryId: document.documentCategoryId,
    matterId: document.matterId,
    folderId: document.folderId ?? "",
    fileName: document.fileName,
    mimeType: document.mimeType,
    sizeBytes: String(document.sizeBytes),
    createdByUserId: document.createdByUserId,
    tags: document.tags.join(", "),
    customFields: Object.entries(document.customFields)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n"),
  };
}

export function createEmptyDocumentFormValues(matterId = ""): DocumentFormValues {
  return {
    documentReference: "",
    title: "",
    documentType: "other",
    documentStatus: "draft",
    documentCategoryId: "correspondence",
    matterId,
    folderId: "",
    fileName: "",
    mimeType: "application/pdf",
    sizeBytes: "0",
    createdByUserId: "user-legal-workbench",
    tags: "",
    customFields: "",
  };
}
