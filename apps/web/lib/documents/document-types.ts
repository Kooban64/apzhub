/** Platform Document typed client view models (APZDOCS-004 / N-03). */

import type { DocumentWorkReference } from "./work-context";

export type DocumentClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly headers?: HeadersInit;
};

export type { DocumentWorkReference };

export type DocumentCollectionResult<T> = {
  readonly items: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

export type DocumentSummaryViewModel = {
  readonly documentId: string;
  readonly title: string;
  readonly status: string;
  readonly classification: string;
  readonly documentType: string;
  readonly updatedAt: string;
  readonly tagNames: readonly string[];
  readonly folderId?: string;
  readonly collectionId?: string;
  readonly ownerUserId?: string;
};

export type DocumentViewModel = {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly classification: string;
  readonly documentType: string;
  readonly description?: string;
  readonly updatedAt: string;
  readonly createdAt: string;
  readonly folderId?: string;
  readonly collectionId?: string;
  readonly retentionId?: string;
  readonly ownerUserId?: string;
  readonly tagNames?: readonly string[];
  /** Presentation references only (N-03) — not a foreign SoR. */
  readonly workReferences?: readonly DocumentWorkReference[];
};

export type DocumentMetadataViewModel = {
  readonly id: string;
  readonly documentId: string;
  readonly title: string;
  readonly description?: string;
  readonly updatedAt: string;
};

export type DocumentVersionViewModel = {
  readonly id: string;
  readonly documentId: string;
  readonly versionNumber: number;
  readonly mimeType: string;
  readonly byteLength: number;
  readonly checksumHex: string;
  readonly storageStatus: string;
  readonly createdAt: string;
};

export type DocumentStorageMetadataViewModel = {
  readonly version: DocumentVersionViewModel & {
    readonly storageKeyPresent?: boolean;
  };
  readonly storageObject: {
    readonly id: string;
    readonly status: string;
    readonly checksumHex: string;
    readonly byteLength: number;
    readonly storageKeyPresent?: boolean;
  } | null;
};

export type DocumentDiagnosticsViewModel = {
  readonly providerReady: boolean;
  readonly providerId: string;
  readonly providerKind: string;
  readonly repositoryReady: boolean;
  readonly storageReady: boolean;
  readonly checksumReady: boolean;
  readonly reconciliationIssueCount: number;
};

export type CreateDocumentClientInput = {
  readonly title: string;
  readonly description?: string;
  readonly documentType?: string;
  readonly classification?: string;
  readonly tagNames?: readonly string[];
};

export type UpdateDocumentMetadataClientInput = {
  readonly title?: string;
  readonly description?: string;
  readonly mimeType?: string;
  readonly custom?: Readonly<Record<string, string>>;
};

export type ClassifyDocumentClientInput = {
  readonly classification: string;
  readonly customCode?: string;
  readonly label?: string;
};

export type TagDocumentClientInput = {
  readonly tagNames: readonly string[];
};

export type RelateDocumentClientInput = {
  readonly kind: string;
  readonly targetDocumentId?: string;
};

export type ListDocumentsClientQuery = {
  readonly query?: string;
  readonly status?: string;
  readonly classification?: string;
  readonly tagName?: string;
  readonly limit?: number;
  readonly folderId?: string;
  readonly collectionId?: string;
};
