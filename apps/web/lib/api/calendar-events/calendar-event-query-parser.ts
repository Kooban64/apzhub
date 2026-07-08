import type { CalendarEventListCriteria } from "@apzhub/law-platform/api";

import {
  compareStrings,
  getEnumFilter,
  paginateItems,
  parseFiltering,
  parsePagination,
  parseSorting,
  sortItems,
} from "../framework";

export interface CalendarEventListQuery {
  readonly criteria: CalendarEventListCriteria;
  readonly limit: number;
  readonly cursorOffset: number;
  readonly sort: readonly string[];
}

/** Parse list query parameters for GET /calendar-events (LAW-014-06). */
export function parseCalendarEventListQuery(
  searchParams: URLSearchParams,
): CalendarEventListQuery {
  const pagination = parsePagination(searchParams);
  const filters = parseFiltering(searchParams, {
    queryParam: "query",
    enumParams: ["eventType", "calendarEventStatus"],
  });

  return {
    criteria: {
      query: filters.query,
      matterId: searchParams.get("matterId")?.trim() || undefined,
      clientId: searchParams.get("clientId")?.trim() || undefined,
      ownerUserId: searchParams.get("ownerUserId")?.trim() || undefined,
      eventType: getEnumFilter(
        filters,
        "eventType",
      ) as CalendarEventListCriteria["eventType"],
      calendarEventStatus: getEnumFilter(
        filters,
        "calendarEventStatus",
      ) as CalendarEventListCriteria["calendarEventStatus"],
    },
    limit: pagination.limit,
    cursorOffset: pagination.cursorOffset,
    sort: parseSorting(searchParams, { defaultSort: ["startsAt"] }),
  };
}

export function sortCalendarEventsForApi<
  T extends {
    title: string;
    startsAt: string;
    calendarEventStatus: string;
    createdAt?: string;
  },
>(events: readonly T[], sortFields: readonly string[]): T[] {
  return sortItems(
    events,
    sortFields,
    {
      title: (left, right) => compareStrings(left.title, right.title),
      startsAt: (left, right) => compareStrings(left.startsAt, right.startsAt),
      calendarEventStatus: (left, right) =>
        compareStrings(left.calendarEventStatus, right.calendarEventStatus),
    },
    ["startsAt"],
  );
}

export function paginateCalendarEventSummaries<T>(
  items: readonly T[],
  limit: number,
  offset: number,
) {
  return paginateItems(items, limit, offset);
}
