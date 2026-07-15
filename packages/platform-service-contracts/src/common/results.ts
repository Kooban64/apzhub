import type { CursorPageResult, PageResult } from "./paging";

/** Response metadata aligned with the platform API envelope (010). */
export interface ServiceResponseMeta {
  readonly correlationId: string;
  readonly executionTimeMs?: number;
  readonly warnings?: readonly string[];
}

/** Single-item service response wrapper. */
export interface ServiceResult<T> {
  readonly data: T;
  readonly meta: ServiceResponseMeta;
}

/** Paginated list response wrapper. */
export interface ServiceListResult<T> extends PageResult<T> {
  readonly meta: ServiceResponseMeta;
}

/** Cursor-paged list response wrapper. */
export interface ServiceCursorListResult<T> extends CursorPageResult<T> {
  readonly meta: ServiceResponseMeta;
}

/** Void mutation acknowledgement. */
export interface ServiceVoidResult {
  readonly meta: ServiceResponseMeta;
}
