import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";

import {
  LAW_API_CORRELATION_ID_HEADER,
  LAW_API_MAX_CORRELATION_ID_LENGTH,
} from "./constants";
import type { LawApiRequestContext } from "./types";

const CORRELATION_ID_PATTERN = /^[\w.-]+$/;

/** Sanitize incoming correlation ID — reject empty or unsafe values. */
export function sanitizeCorrelationId(
  value: string | null | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > LAW_API_MAX_CORRELATION_ID_LENGTH ||
    !CORRELATION_ID_PATTERN.test(trimmed)
  ) {
    return undefined;
  }

  return trimmed;
}

/** Resolve per-request identifiers from an incoming Next.js request. */
export function resolveRequestContext(request: NextRequest): LawApiRequestContext {
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  const incomingCorrelationId =
    sanitizeCorrelationId(request.headers.get(LAW_API_CORRELATION_ID_HEADER)) ??
    sanitizeCorrelationId(request.headers.get("X-Correlation-Id"));
  const correlationId = incomingCorrelationId ?? requestId;

  return {
    requestId,
    correlationId,
    timestamp,
  };
}

/** Build request context when no NextRequest is available (e.g. method-not-allowed stubs). */
export function createRequestContext(correlationId?: string): LawApiRequestContext {
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();

  return {
    requestId,
    correlationId: sanitizeCorrelationId(correlationId) ?? requestId,
    timestamp,
  };
}
