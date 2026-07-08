/** Cursor-based pagination helpers for Law API list endpoints (LAW-014-05). */

export interface LawApiPaginationOptions {
  readonly defaultLimit?: number;
  readonly maxLimit?: number;
}

export interface LawApiParsedPagination {
  readonly limit: number;
  readonly cursorOffset: number;
}

export interface LawApiPaginationMeta {
  readonly limit: number;
  readonly hasMore: boolean;
  readonly nextCursor: string | null;
  readonly prevCursor: string | null;
  readonly totalCount?: number | null;
}

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

function parseLimit(raw: string | null, options: LawApiPaginationOptions): number {
  const defaultLimit = options.defaultLimit ?? DEFAULT_LIMIT;
  const maxLimit = options.maxLimit ?? MAX_LIMIT;

  if (!raw) {
    return defaultLimit;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return defaultLimit;
  }

  return Math.min(parsed, maxLimit);
}

function decodeCursor(raw: string | null): number {
  if (!raw) {
    return 0;
  }

  try {
    const decoded = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as {
      offset?: number;
    };
    const offset = decoded.offset ?? 0;
    return offset >= 0 ? offset : 0;
  } catch {
    return 0;
  }
}

/** Encode a cursor token from a list offset. */
export function encodeListCursor(offset: number): string {
  return Buffer.from(JSON.stringify({ offset }), "utf8").toString("base64url");
}

/** Parse `limit` and `cursor` query parameters. */
export function parsePagination(
  searchParams: URLSearchParams,
  options: LawApiPaginationOptions = {},
): LawApiParsedPagination {
  return {
    limit: parseLimit(searchParams.get("limit"), options),
    cursorOffset: decodeCursor(searchParams.get("cursor")),
  };
}

/** Slice items and produce standard pagination metadata. */
export function paginateItems<T>(
  items: readonly T[],
  limit: number,
  offset: number,
): {
  readonly page: readonly T[];
  readonly pagination: LawApiPaginationMeta;
} {
  const page = items.slice(offset, offset + limit);
  const nextOffset = offset + limit;
  const hasMore = nextOffset < items.length;

  return {
    page,
    pagination: {
      limit,
      hasMore,
      nextCursor: hasMore ? encodeListCursor(nextOffset) : null,
      prevCursor: offset > 0 ? encodeListCursor(Math.max(0, offset - limit)) : null,
    },
  };
}
