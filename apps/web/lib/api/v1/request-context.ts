import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";

import {
  PLATFORM_API_CORRELATION_ID_HEADER,
  PLATFORM_API_IDEMPOTENCY_KEY_HEADER,
  PLATFORM_API_MAX_CORRELATION_ID_LENGTH,
  PLATFORM_API_MAX_IDEMPOTENCY_KEY_LENGTH,
} from "./constants";
import type { PlatformApiTracingContext } from "./types";

const CORRELATION_ID_PATTERN = /^[\w.-]+$/;
const IDEMPOTENCY_KEY_PATTERN = /^[\w.:-]+$/;

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
    trimmed.length > PLATFORM_API_MAX_CORRELATION_ID_LENGTH ||
    !CORRELATION_ID_PATTERN.test(trimmed)
  ) {
    return undefined;
  }

  return trimmed;
}

/** Validate Idempotency-Key format/length. Returns undefined when absent. */
export function sanitizeIdempotencyKey(
  value: string | null | undefined,
): { readonly ok: true; readonly value?: string } | { readonly ok: false; readonly message: string } {
  if (!value) {
    return { ok: true, value: undefined };
  }

  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > PLATFORM_API_MAX_IDEMPOTENCY_KEY_LENGTH ||
    !IDEMPOTENCY_KEY_PATTERN.test(trimmed)
  ) {
    return {
      ok: false,
      message:
        "Idempotency-Key must be 1–128 characters matching [A-Za-z0-9_.:-]",
    };
  }

  return { ok: true, value: trimmed };
}

/**
 * Resolve per-request identifiers from an incoming Next.js request.
 * Client may supply a correlation ID via documented headers after validation.
 * Request ID is always generated server-side.
 */
export function resolvePlatformApiTracing(
  request: NextRequest,
):
  | { readonly ok: true; readonly context: PlatformApiTracingContext }
  | { readonly ok: false; readonly message: string } {
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  const incomingCorrelationId =
    sanitizeCorrelationId(request.headers.get(PLATFORM_API_CORRELATION_ID_HEADER)) ??
    sanitizeCorrelationId(request.headers.get("X-Correlation-Id"));
  const correlationId = incomingCorrelationId ?? requestId;

  const idempotency = sanitizeIdempotencyKey(
    request.headers.get(PLATFORM_API_IDEMPOTENCY_KEY_HEADER),
  );
  if (!idempotency.ok) {
    return { ok: false, message: idempotency.message };
  }

  return {
    ok: true,
    context: {
      requestId,
      correlationId,
      timestamp,
      idempotencyKey: idempotency.value,
    },
  };
}

/** Build tracing context when no NextRequest is available. */
export function createPlatformApiTracing(
  correlationId?: string,
): PlatformApiTracingContext {
  const requestId = randomUUID();
  return {
    requestId,
    correlationId: sanitizeCorrelationId(correlationId) ?? requestId,
    timestamp: new Date().toISOString(),
  };
}
