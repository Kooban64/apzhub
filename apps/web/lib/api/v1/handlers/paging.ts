import type { PageResult } from "@apzhub/platform-service-contracts";

import type { PlatformApiPage } from "../types";
import { resolvePageLimit, type PaginationQuery } from "../schemas/common";

export function toPlatformApiPage<T>(
  result: PageResult<T>,
  query: PaginationQuery,
): PlatformApiPage {
  const limit = resolvePageLimit(query);
  return {
    cursor: query.cursor ?? null,
    nextCursor: result.nextCursor ?? null,
    limit: result.perPage || limit,
    hasMore: result.hasNextPage,
  };
}

export function toListQuery(query: PaginationQuery): {
  page?: { page?: number; perPage?: number; cursor?: string };
  sort?: readonly { field: string; direction: "asc" | "desc" }[];
} {
  const limit = resolvePageLimit(query);
  return {
    page: {
      page: query.page,
      perPage: limit,
      cursor: query.cursor,
    },
    sort: query.sort
      ? [{ field: query.sort, direction: query.order ?? "asc" }]
      : undefined,
  };
}
