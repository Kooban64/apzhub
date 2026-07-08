import type { TimeEntryListCriteria } from "@apzhub/law-platform/api";

import {
  compareStrings,
  getEnumFilter,
  paginateItems,
  parseFiltering,
  parsePagination,
  parseSorting,
  sortItems,
} from "../framework";

export interface TimeEntryListQuery {
  readonly criteria: TimeEntryListCriteria;
  readonly limit: number;
  readonly cursorOffset: number;
  readonly sort: readonly string[];
}

/** Parse list query parameters for GET /time-entries (LAW-014-06). */
export function parseTimeEntryListQuery(
  searchParams: URLSearchParams,
): TimeEntryListQuery {
  const pagination = parsePagination(searchParams);
  const filters = parseFiltering(searchParams, {
    queryParam: "query",
    enumParams: ["billableFilter", "entryDateFilter"],
  });

  return {
    criteria: {
      query: filters.query,
      matterId: searchParams.get("matterId")?.trim() || undefined,
      userId: searchParams.get("userId")?.trim() || undefined,
      billableFilter: getEnumFilter(
        filters,
        "billableFilter",
      ) as TimeEntryListCriteria["billableFilter"],
      entryDateFilter: getEnumFilter(
        filters,
        "entryDateFilter",
      ) as TimeEntryListCriteria["entryDateFilter"],
    },
    limit: pagination.limit,
    cursorOffset: pagination.cursorOffset,
    sort: parseSorting(searchParams, { defaultSort: ["entryDate"] }),
  };
}

export function sortTimeEntriesForApi<
  T extends {
    entryDate: string;
    narrative: string;
    durationMinutes: number;
    createdAt?: string;
  },
>(entries: readonly T[], sortFields: readonly string[]): T[] {
  return sortItems(
    entries,
    sortFields,
    {
      entryDate: (left, right) => compareStrings(left.entryDate, right.entryDate),
      narrative: (left, right) => compareStrings(left.narrative, right.narrative),
      durationMinutes: (left, right) => left.durationMinutes - right.durationMinutes,
    },
    ["entryDate"],
  );
}

export function paginateTimeEntrySummaries<T>(
  items: readonly T[],
  limit: number,
  offset: number,
) {
  return paginateItems(items, limit, offset);
}
