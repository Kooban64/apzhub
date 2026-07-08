import type { NextResponse } from "next/server";

import type { LawApiRequestContext } from "../types";
import { OptimisticConcurrencyError, lawApiErrorToResponse } from "./errors";

/** Generate an ETag value from a numeric resource version. */
export function generateETag(version: number | string): string {
  return String(version);
}

/** Parse `If-Match` header to a numeric version (supports quoted and weak ETags). */
export function parseIfMatchVersion(header: string | null): number | undefined {
  if (!header) {
    return undefined;
  }

  const trimmed = header.trim().replace(/^W\//, "").replace(/^"|"$/g, "");
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Validate `If-Match` against the current resource version. Returns true when valid or absent. */
export function validateIfMatch(
  expectedVersion: number | undefined,
  currentVersion: number,
): boolean {
  if (expectedVersion === undefined) {
    return true;
  }

  return expectedVersion === currentVersion;
}

/** Assert version match — throws OptimisticConcurrencyError when mismatch. */
export function assertIfMatchVersion(
  expectedVersion: number | undefined,
  currentVersion: number,
): void {
  if (!validateIfMatch(expectedVersion, currentVersion)) {
    throw new OptimisticConcurrencyError();
  }
}

/** Return 412 response when If-Match validation fails. */
export function ifMatchPreconditionResponse(
  context: LawApiRequestContext,
  expectedVersion: number | undefined,
  currentVersion: number,
): NextResponse | null {
  if (validateIfMatch(expectedVersion, currentVersion)) {
    return null;
  }

  return lawApiErrorToResponse(new OptimisticConcurrencyError(), context);
}

/** Build response headers including ETag when version is known. */
export function etagResponseHeaders(version: number | string): HeadersInit {
  return {
    ETag: generateETag(version),
  };
}
