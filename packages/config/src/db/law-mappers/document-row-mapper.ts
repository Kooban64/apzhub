import type { Document } from "@apzhub/legal-business-core";

import { lawDocument } from "../legal-schema";

type DocumentRow = typeof lawDocument.$inferSelect;

export function documentToRow(
  document: Document,
  tenantId: string,
): typeof lawDocument.$inferInsert {
  return {
    documentId: document.documentId,
    tenantId,
    matterId: document.matterId,
    clientId: document.clientId ?? null,
    documentReference: document.documentReference,
    title: document.title,
    documentType: document.documentType,
    documentStatus: document.documentStatus,
    documentCategoryId: document.documentCategoryId,
    folderId: document.folderId ?? null,
    version: document.version,
    fileName: document.fileName,
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes,
    createdByUserId: document.createdByUserId,
    tags: [...document.tags],
    customFields: { ...document.customFields },
  };
}

export function rowToDocument(row: DocumentRow): Document {
  return {
    documentId: row.documentId,
    documentReference: row.documentReference,
    title: row.title,
    documentType: row.documentType as Document["documentType"],
    documentStatus: row.documentStatus as Document["documentStatus"],
    documentCategoryId: row.documentCategoryId,
    matterId: row.matterId,
    clientId: row.clientId ?? undefined,
    folderId: row.folderId ?? undefined,
    version: row.version,
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    createdByUserId: row.createdByUserId,
    tags: row.tags ?? [],
    customFields: row.customFields ?? {},
  };
}
