import type { Document } from "@apzhub/legal-business-core";

import type { DocumentListCriteria } from "./document-types";

export function matchesDocumentCriteria(
  document: Document,
  criteria?: DocumentListCriteria,
): boolean {
  if (!criteria) {
    return true;
  }

  if (
    criteria.documentStatus &&
    criteria.documentStatus !== "all" &&
    document.documentStatus !== criteria.documentStatus
  ) {
    return false;
  }

  if (
    criteria.matterId &&
    criteria.matterId !== "all" &&
    document.matterId !== criteria.matterId
  ) {
    return false;
  }

  if (
    criteria.clientId &&
    criteria.clientId !== "all" &&
    document.clientId !== criteria.clientId
  ) {
    return false;
  }

  if (
    criteria.documentCategoryId &&
    criteria.documentCategoryId !== "all" &&
    document.documentCategoryId !== criteria.documentCategoryId
  ) {
    return false;
  }

  if (
    criteria.folderId &&
    criteria.folderId !== "all" &&
    document.folderId !== criteria.folderId
  ) {
    return false;
  }

  const query = criteria.query?.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    document.title,
    document.documentReference,
    document.documentType,
    document.documentStatus,
    document.documentCategoryId,
    document.fileName,
    ...document.tags,
    ...Object.values(document.customFields),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function sortDocumentsByTitle(documents: readonly Document[]): Document[] {
  return [...documents].sort((left, right) => left.title.localeCompare(right.title));
}
