import type { Document } from "@apzhub/legal-business-core";

import type { DocumentListCriteria } from "./document-types";

/** Writable in-memory document repository — session scoped, no persistence (LAW-004-01). */
export interface WritableDocumentRepository {
  list(criteria?: DocumentListCriteria): readonly Document[];
  getById(documentId: string): Document | undefined;
  create(document: Document): Document;
  update(documentId: string, document: Document): Document | undefined;
  softArchive(documentId: string): Document | undefined;
  count(includeArchived?: boolean): number;
  isSoftArchived(documentId: string): boolean;
}
