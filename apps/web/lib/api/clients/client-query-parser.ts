import type { ClientSearchCriteria } from "@apzhub/legal-business-core";

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

export interface ClientListQuery {
  readonly criteria: ClientSearchCriteria;
  readonly limit: number;
  readonly cursorOffset: number;
  readonly sort: readonly string[];
}

const CLIENT_FILTER_SPEC = {
  queryParam: "query",
  enumParams: ["status", "clientType"] as const,
};

/** Parse list query parameters for GET /clients (LAW-014-04, refactored LAW-014-05). */
export function parseClientListQuery(searchParams: URLSearchParams): ClientListQuery {
  const pagination = parsePagination(searchParams);
  const filters = parseFiltering(searchParams, CLIENT_FILTER_SPEC);

  return {
    criteria: {
      query: filters.query,
      status: getEnumFilter(filters, "status") as ClientSearchCriteria["status"],
      clientType: getEnumFilter(
        filters,
        "clientType",
      ) as ClientSearchCriteria["clientType"],
    },
    limit: pagination.limit,
    cursorOffset: pagination.cursorOffset,
    sort: parseSorting(searchParams, { defaultSort: ["displayName"] }),
  };
}

/** @deprecated Use encodeListCursor from framework */
export const encodeClientListCursor = encodeListCursor;

export function sortClientsForApi<
  T extends { displayName: string; status: string; createdAt?: string },
>(clients: readonly T[], sortFields: readonly string[]): T[] {
  return sortItems(
    clients,
    sortFields,
    {
      displayName: (left, right) => compareStrings(left.displayName, right.displayName),
      status: (left, right) => compareStrings(left.status, right.status),
    },
    ["displayName"],
  );
}

export function paginateClientSummaries<T>(
  items: readonly T[],
  limit: number,
  offset: number,
) {
  return paginateItems(items, limit, offset);
}
