/**
 * Search operation execution status — APZSEARCH-004 forbids engine execution.
 * All operational runners return this status until a later milestone binds an engine.
 */

export const SEARCH_OPERATION_STATUS_NOT_IMPLEMENTED = "NOT_IMPLEMENTED" as const;

export type SearchOperationStatus = typeof SEARCH_OPERATION_STATUS_NOT_IMPLEMENTED;

export type SearchOperationName =
  | "query"
  | "index"
  | "collection"
  | "document"
  | "health"
  | "diagnostics"
  | "configuration"
  | "lifecycle"
  | "statistics"
  | "capabilities"
  | "validation";

export type SearchNotImplementedResult<
  TOperation extends SearchOperationName = SearchOperationName,
> = {
  readonly status: typeof SEARCH_OPERATION_STATUS_NOT_IMPLEMENTED;
  readonly operation: TOperation;
  readonly message: string;
  readonly executionEnabled: false;
  readonly hits?: never;
};

export function createNotImplementedResult<TOperation extends SearchOperationName>(
  operation: TOperation,
  detail?: string,
): SearchNotImplementedResult<TOperation> {
  return {
    status: SEARCH_OPERATION_STATUS_NOT_IMPLEMENTED,
    operation,
    message:
      detail ??
      `Search operation "${operation}" is not implemented in APZSEARCH-004 (Search Integration SDK only)`,
    executionEnabled: false,
  };
}

/** Alias matching milestone vocabulary. */
export const NOT_IMPLEMENTED = SEARCH_OPERATION_STATUS_NOT_IMPLEMENTED;
