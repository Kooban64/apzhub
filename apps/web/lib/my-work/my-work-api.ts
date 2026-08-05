/**
 * My Work client — GET /api/v1/my-work only.
 * Composition references; never product SoR writes.
 */

import type { MyWorkComposition } from "@apzhub/platform-service-contracts";

export class MyWorkApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "MyWorkApiError";
    this.status = status;
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function fetchMyWorkComposition(options?: {
  readonly signal?: AbortSignal;
}): Promise<MyWorkComposition> {
  const response = await fetch("/api/v1/my-work", {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const error = isRecord(body) && isRecord(body.error) ? body.error : undefined;
    throw new MyWorkApiError(
      typeof error?.message === "string" ? error.message : "Failed to load My Work",
      response.status,
      typeof error?.code === "string" ? error.code : undefined,
    );
  }

  if (!isRecord(body) || !("data" in body)) {
    throw new MyWorkApiError("Unexpected My Work response envelope.", 502);
  }

  return body.data as MyWorkComposition;
}

export function isMyWorkApiError(error: unknown): error is MyWorkApiError {
  return error instanceof MyWorkApiError;
}
