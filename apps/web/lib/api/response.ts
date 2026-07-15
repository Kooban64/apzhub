import { NextResponse } from "next/server";

import { HttpSecurityHeaderService } from "@apzhub/platform-security/headers";

import { LAW_API_CORRELATION_ID_HEADER, LAW_API_REQUEST_ID_HEADER } from "./constants";
import type {
  LawApiErrorBody,
  LawApiMeta,
  LawApiRequestContext,
  LawApiSuccessEnvelope,
  LawApiListSuccessEnvelope,
} from "./types";

function buildMeta(context: LawApiRequestContext): LawApiMeta {
  return {
    requestId: context.requestId,
    correlationId: context.correlationId,
    timestamp: context.timestamp,
  };
}

const apiSecurityHeaders = new HttpSecurityHeaderService().getApiResponseHeaders("web");

function responseHeaders(meta: LawApiMeta): HeadersInit {
  return {
    ...apiSecurityHeaders,
    [LAW_API_REQUEST_ID_HEADER]: meta.requestId,
    [LAW_API_CORRELATION_ID_HEADER]: meta.correlationId,
  };
}

/** Standard success JSON response with envelope and tracing headers. */
export function jsonSuccessResponse<T>(
  data: T,
  context: LawApiRequestContext,
  init?: ResponseInit,
): NextResponse<LawApiSuccessEnvelope<T>> {
  const meta = buildMeta(context);
  const body: LawApiSuccessEnvelope<T> = {
    ok: true,
    data,
    meta,
  };

  return NextResponse.json(body, {
    ...init,
    headers: {
      ...responseHeaders(meta),
      ...(init?.headers ?? {}),
    },
  });
}

/** Standard list JSON response with pagination block (LAW-014-04). */
export function jsonListSuccessResponse<T>(
  data: readonly T[],
  pagination: LawApiListSuccessEnvelope<T>["pagination"],
  context: LawApiRequestContext,
  init?: ResponseInit,
): NextResponse<LawApiListSuccessEnvelope<T>> {
  const meta = buildMeta(context);
  const body: LawApiListSuccessEnvelope<T> = {
    ok: true,
    data,
    pagination,
    meta,
  };

  return NextResponse.json(body, {
    ...init,
    headers: {
      ...responseHeaders(meta),
      ...(init?.headers ?? {}),
    },
  });
}

/** Standard error JSON response with envelope and tracing headers. */
export function jsonErrorResponse(
  status: number,
  error: LawApiErrorBody,
  context: LawApiRequestContext,
  init?: ResponseInit,
): NextResponse {
  const meta = buildMeta(context);
  const body = {
    ok: false as const,
    error,
    meta,
  };

  return NextResponse.json(body, {
    status,
    ...init,
    headers: {
      ...responseHeaders(meta),
      ...(init?.headers ?? {}),
    },
  });
}
