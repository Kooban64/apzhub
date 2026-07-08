import type { NextResponse } from "next/server";

import {
  jsonErrorResponse,
  jsonListSuccessResponse,
  jsonSuccessResponse,
} from "../response";
import type { LawApiListSuccessEnvelope, LawApiRequestContext } from "../types";
import type { LawApiPaginationMeta } from "./query/pagination";

/** Standard 200 success response. */
export function successResponse<T>(
  data: T,
  context: LawApiRequestContext,
  init?: ResponseInit,
): NextResponse {
  return jsonSuccessResponse(data, context, init);
}

/** Standard 201 created response. */
export function createdResponse<T>(
  data: T,
  context: LawApiRequestContext,
  init?: ResponseInit,
): NextResponse {
  return jsonSuccessResponse(data, context, {
    status: 201,
    ...init,
    headers: {
      ...(init?.headers ?? {}),
    },
  });
}

/** Standard 200 updated response with optional ETag header. */
export function updatedResponse<T>(
  data: T,
  context: LawApiRequestContext,
  options: {
    readonly etag?: string | number;
    readonly init?: ResponseInit;
  } = {},
): NextResponse {
  const headers: Record<string, string> = {
    ...(options.init?.headers as Record<string, string> | undefined),
  };

  if (options.etag !== undefined) {
    headers.ETag = String(options.etag);
  }

  return jsonSuccessResponse(data, context, {
    ...options.init,
    headers,
  });
}

/** Standard 200 archived (soft delete) response. */
export function archivedResponse<T>(
  data: T,
  context: LawApiRequestContext,
  init?: ResponseInit,
): NextResponse {
  return jsonSuccessResponse(data, context, init);
}

/** Standard paginated list response. */
export function paginatedResponse<T>(
  data: readonly T[],
  pagination: LawApiPaginationMeta,
  context: LawApiRequestContext,
  init?: ResponseInit,
): NextResponse<LawApiListSuccessEnvelope<T>> {
  return jsonListSuccessResponse(data, pagination, context, init);
}

/** Standard internal error response for unexpected workflow failures. */
export function internalErrorResponse(
  context: LawApiRequestContext,
  message = "An unexpected error occurred.",
): NextResponse {
  return jsonErrorResponse(
    500,
    {
      code: "INTERNAL_ERROR",
      message,
    },
    context,
  );
}

/** Standard malformed request response for missing required body fields. */
export function malformedRequestResponse(
  context: LawApiRequestContext,
  message: string,
): NextResponse {
  return jsonErrorResponse(
    400,
    {
      code: "MALFORMED_REQUEST",
      message,
    },
    context,
  );
}
