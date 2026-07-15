/** Offset and cursor paging contracts shared by all platform services. */

export interface PageRequest {
  readonly page?: number;
  readonly perPage?: number;
  readonly cursor?: string;
}

export interface PageResult<TItem> {
  readonly items: readonly TItem[];
  readonly totalCount: number;
  readonly page: number;
  readonly perPage: number;
  readonly hasNextPage: boolean;
  readonly nextCursor?: string;
}

export interface CursorPageRequest {
  readonly cursor?: string;
  readonly limit?: number;
}

export interface CursorPageResult<TItem> {
  readonly items: readonly TItem[];
  readonly nextCursor?: string;
  readonly hasNextPage: boolean;
}
