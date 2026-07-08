import type { DocumentListCriteria } from "@apzhub/law-platform/api";

import {
  compareStrings,
  encodeListCursor,
  getEnumFilter,
  paginateItems,
  parseFiltering,
  parsePagination,
  parseSorting,
  sortItems,
} from "../framework";

export interface DocumentListQuery {
  readonly criteria: DocumentListCriteria;
  readonly limit: number;
  readonly cursorOffset: number;
  readonly sort: readonly string[];
}

const DOCUMENT_FILTER_SPEC = {
  queryParam: "query",
  enumParams: ["documentStatus"] as const,
};

function readStringFilter(
  searchParams: URLSearchParams,
  param: string,
): string | undefined {
  const raw = searchParams.get(param);
  return raw?.trim() ? raw.trim() : undefined;
}

/** Parse list query parameters for GET /documents (LAW-014-06). */
export function parseDocumentListQuery(
  searchParams: URLSearchParams,
): DocumentListQuery {
  const pagination = parsePagination(searchParams);
  const filters = parseFiltering(searchParams, DOCUMENT_FILTER_SPEC);

  return {
    criteria: {
      query: filters.query,
      matterId: readStringFilter(searchParams, "matterId"),
      clientId: readStringFilter(searchParams, "clientId"),
      documentStatus: getEnumFilter(
        filters,
        "documentStatus",
      ) as DocumentListCriteria["documentStatus"],
      documentCategoryId: readStringFilter(searchParams, "documentCategoryId"),
      folderId: readStringFilter(searchParams, "folderId"),
    },
    limit: pagination.limit,
    cursorOffset: pagination.cursorOffset,
    sort: parseSorting(searchParams, { defaultSort: ["-createdAt"] }),
  };
}

/** @deprecated Use encodeListCursor from framework */
export const encodeDocumentListCursor = encodeListCursor;

export function sortDocumentsForApi<
  T extends {
    title: string;
    documentStatus: string;
    documentType: string;
    createdAt?: string;
  },
>(documents: readonly T[], sortFields: readonly string[]): T[] {
  return sortItems(
    documents,
    sortFields,
    {
      title: (left, right) => compareStrings(left.title, right.title),
      documentStatus: (left, right) =>
        compareStrings(left.documentStatus, right.documentStatus),
      documentType: (left, right) =>
        compareStrings(left.documentType, right.documentType),
      createdAt: (left, right) =>
        compareStrings(left.createdAt ?? "", right.createdAt ?? ""),
    },
    ["title"],
  );
}

export function paginateDocumentSummaries<T>(
  items: readonly T[],
  limit: number,
  offset: number,
) {
  return paginateItems(items, limit, offset);
}
