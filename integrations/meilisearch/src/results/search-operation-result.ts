/**
 * Meilisearch adapter SearchOperationResult — extends SDK NOT_IMPLEMENTED model
 * with OK / NOT_SUPPORTED for engine-backed operations (APZSEARCH-005).
 */

import type { SearchOperationName } from "@apzhub/integration-search-sdk";
import { NOT_SUPPORTED } from "./unsupported";

export const SEARCH_OPERATION_STATUS_OK = "OK" as const;
export const SEARCH_OPERATION_STATUS_ERROR = "ERROR" as const;

export type MeilisearchOperationName = SearchOperationName | "statistics" | "version";

export type SearchOkResult<TOp extends string, TData> = {
  readonly status: typeof SEARCH_OPERATION_STATUS_OK;
  readonly operation: TOp;
  readonly data: TData;
  readonly executionEnabled: true;
  readonly tookMs?: number;
};

export type SearchNotSupportedResult<TOp extends string> = {
  readonly status: typeof NOT_SUPPORTED;
  readonly operation: TOp;
  readonly feature: string;
  readonly message: string;
  readonly executionEnabled: false;
  readonly hits?: never;
};

export type SearchErrorResult<TOp extends string> = {
  readonly status: typeof SEARCH_OPERATION_STATUS_ERROR;
  readonly operation: TOp;
  readonly message: string;
  readonly code?: string;
  readonly category?: string;
  readonly executionEnabled: false;
  readonly hits?: never;
};

export type SearchOperationResult<TOp extends string, TData = unknown> =
  | SearchOkResult<TOp, TData>
  | SearchNotSupportedResult<TOp>
  | SearchErrorResult<TOp>;

export function createOkResult<TOp extends string, TData>(
  operation: TOp,
  data: TData,
  tookMs?: number,
): SearchOkResult<TOp, TData> {
  return {
    status: SEARCH_OPERATION_STATUS_OK,
    operation,
    data,
    executionEnabled: true,
    ...(tookMs !== undefined ? { tookMs } : {}),
  };
}

export function createNotSupportedResult<TOp extends string>(
  operation: TOp,
  feature: string,
  detail?: string,
): SearchNotSupportedResult<TOp> {
  return {
    status: NOT_SUPPORTED,
    operation,
    feature,
    message:
      detail ??
      `Meilisearch operation "${operation}" does not support feature "${feature}" (APZSEARCH-005)`,
    executionEnabled: false,
  };
}

export function createErrorResult<TOp extends string>(
  operation: TOp,
  message: string,
  code?: string,
  category?: string,
): SearchErrorResult<TOp> {
  return {
    status: SEARCH_OPERATION_STATUS_ERROR,
    operation,
    message,
    code,
    category,
    executionEnabled: false,
  };
}
