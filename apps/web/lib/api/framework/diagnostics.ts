import type { NextRequest } from "next/server";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import { parseFieldSelectionAndIncludes } from "./query/field-selection";
import { parseFiltering } from "./query/filtering";
import { parsePagination } from "./query/pagination";
import { parseSorting } from "./query/sorting";
import { parseIfMatchVersion } from "./concurrency";

export interface LawApiRequestDiagnostics {
  readonly requestId: string;
  readonly correlationId: string;
  readonly method: string;
  readonly path: string;
  readonly query: Record<string, string>;
  readonly pagination: ReturnType<typeof parsePagination>;
  readonly sorting: readonly string[];
  readonly filtering: ReturnType<typeof parseFiltering>;
  readonly fieldSelection: ReturnType<typeof parseFieldSelectionAndIncludes>;
  readonly ifMatchVersion?: number;
  readonly tenantId?: string;
  readonly userId?: string;
  readonly authenticated: boolean;
}

export interface LawApiDiagnosticsOptions {
  readonly filterSpec?: Parameters<typeof parseFiltering>[1];
  readonly defaultSort?: readonly string[];
}

/** Build a structured diagnostics snapshot for the current request (LAW-014-05). */
export function buildLawApiRequestDiagnostics(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  options: LawApiDiagnosticsOptions = {},
): LawApiRequestDiagnostics {
  const searchParams = request.nextUrl.searchParams;
  const query: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    query[key] = value;
  });

  return {
    requestId: context.requestId,
    correlationId: context.correlationId,
    method: request.method,
    path: request.nextUrl.pathname,
    query,
    pagination: parsePagination(searchParams),
    sorting: parseSorting(searchParams, { defaultSort: options.defaultSort }),
    filtering: parseFiltering(searchParams, options.filterSpec),
    fieldSelection: parseFieldSelectionAndIncludes(searchParams),
    ifMatchVersion: parseIfMatchVersion(request.headers.get("if-match")),
    tenantId: context.tenantId,
    userId: context.user?.userId,
    authenticated: context.authenticated,
  };
}
