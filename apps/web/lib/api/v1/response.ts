import { NextResponse } from "next/server";

import { HttpSecurityHeaderService } from "@apzhub/platform-security/headers";

import {
  PLATFORM_API_CACHE_CONTROL,
  PLATFORM_API_CORRELATION_ID_HEADER,
  PLATFORM_API_REQUEST_ID_HEADER,
} from "./constants";
import type {
  PlatformApiCollectionEnvelope,
  PlatformApiErrorBody,
  PlatformApiMeta,
  PlatformApiPage,
  PlatformApiSuccessEnvelope,
  PlatformApiTracingContext,
} from "./types";

function buildMeta(tracing: PlatformApiTracingContext): PlatformApiMeta {
  return {
    requestId: tracing.requestId,
    correlationId: tracing.correlationId,
  };
}

const apiSecurityHeaders = new HttpSecurityHeaderService().getApiResponseHeaders("web");

function responseHeaders(meta: PlatformApiMeta): HeadersInit {
  return {
    ...apiSecurityHeaders,
    "cache-control": PLATFORM_API_CACHE_CONTROL,
    "content-type": "application/json; charset=utf-8",
    [PLATFORM_API_REQUEST_ID_HEADER]: meta.requestId,
    [PLATFORM_API_CORRELATION_ID_HEADER]: meta.correlationId,
  };
}

/** Successful single-resource JSON response. */
export function jsonDataResponse<T>(
  data: T,
  tracing: PlatformApiTracingContext,
  init?: ResponseInit,
): NextResponse<PlatformApiSuccessEnvelope<T>> {
  const meta = buildMeta(tracing);
  const body: PlatformApiSuccessEnvelope<T> = { data, meta };
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...responseHeaders(meta),
      ...(init?.headers ?? {}),
    },
  });
}

/** Successful collection JSON response with page metadata. */
export function jsonCollectionResponse<T>(
  data: readonly T[],
  page: PlatformApiPage,
  tracing: PlatformApiTracingContext,
  init?: ResponseInit,
): NextResponse<PlatformApiCollectionEnvelope<T>> {
  const meta = buildMeta(tracing);
  const body: PlatformApiCollectionEnvelope<T> = { data, page, meta };
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...responseHeaders(meta),
      ...(init?.headers ?? {}),
    },
  });
}

/** Error JSON response. */
export function jsonErrorResponse(
  status: number,
  error: PlatformApiErrorBody,
  tracing: PlatformApiTracingContext,
  init?: ResponseInit,
): NextResponse {
  const meta = buildMeta(tracing);
  return NextResponse.json(
    { error, meta },
    {
      status,
      ...init,
      headers: {
        ...responseHeaders(meta),
        ...(init?.headers ?? {}),
      },
    },
  );
}

/** Method not allowed with Allow header. */
export function methodNotAllowedResponse(
  allowed: readonly string[],
  tracing: PlatformApiTracingContext,
  method: string,
): NextResponse {
  return jsonErrorResponse(
    405,
    {
      code: "METHOD_NOT_ALLOWED",
      message: `Method ${method} is not allowed for this resource.`,
      details: { allowed: [...allowed] },
    },
    tracing,
    { headers: { allow: allowed.join(", ") } },
  );
}
