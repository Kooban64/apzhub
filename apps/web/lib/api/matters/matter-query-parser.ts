import type { MatterListCriteria } from "@apzhub/law-platform/api";

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

export interface MatterListQuery {
  readonly criteria: MatterListCriteria;
  readonly limit: number;
  readonly cursorOffset: number;
  readonly sort: readonly string[];
}

const MATTER_FILTER_SPEC = {
  queryParam: "query",
  enumParams: ["status", "priority"] as const,
};

/** Parse list query parameters for GET /matters (LAW-014-06). */
export function parseMatterListQuery(searchParams: URLSearchParams): MatterListQuery {
  const pagination = parsePagination(searchParams);
  const filters = parseFiltering(searchParams, MATTER_FILTER_SPEC);
  const clientIdRaw = searchParams.get("clientId");

  return {
    criteria: {
      query: filters.query,
      status: getEnumFilter(filters, "status") as MatterListCriteria["status"],
      clientId: clientIdRaw?.trim() || undefined,
      priority: getEnumFilter(filters, "priority") as MatterListCriteria["priority"],
    },
    limit: pagination.limit,
    cursorOffset: pagination.cursorOffset,
    sort: parseSorting(searchParams, { defaultSort: ["title"] }),
  };
}

/** @deprecated Use encodeListCursor from framework */
export const encodeMatterListCursor = encodeListCursor;

export function sortMattersForApi<
  T extends {
    title: string;
    matterStatus: string;
    priority: string;
    createdAt?: string;
  },
>(matters: readonly T[], sortFields: readonly string[]): T[] {
  return sortItems(
    matters,
    sortFields,
    {
      title: (left, right) => compareStrings(left.title, right.title),
      matterStatus: (left, right) =>
        compareStrings(left.matterStatus, right.matterStatus),
      status: (left, right) => compareStrings(left.matterStatus, right.matterStatus),
      priority: (left, right) => compareStrings(left.priority, right.priority),
      createdAt: (left, right) =>
        compareStrings(left.createdAt ?? "", right.createdAt ?? ""),
    },
    ["title"],
  );
}

export function paginateMatterSummaries<T>(
  items: readonly T[],
  limit: number,
  offset: number,
) {
  return paginateItems(items, limit, offset);
}
