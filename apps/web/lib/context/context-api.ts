/**
 * Enterprise Context client — GET /api/v1/context only.
 * Consumers ask for composition; they do not query sibling SoRs.
 */

import type {
  ContextFocusType,
  EnterpriseContextComposition,
} from "@apzhub/platform-service-contracts";

export class ContextApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ContextApiError";
    this.status = status;
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function fetchEnterpriseContext(options: {
  readonly focusType?: ContextFocusType;
  readonly focusId: string;
  readonly projectName?: string;
  readonly projectIdentifier?: string;
  readonly focusName?: string;
  readonly focusIdentifier?: string;
  readonly signal?: AbortSignal;
}): Promise<EnterpriseContextComposition> {
  const focusType = options.focusType ?? "project";
  const params = new URLSearchParams({
    focusType,
    focusId: options.focusId,
  });
  const name = options.focusName ?? options.projectName;
  const identifier = options.focusIdentifier ?? options.projectIdentifier;
  if (name) {
    params.set("focusName", name);
    if (focusType === "project") params.set("projectName", name);
  }
  if (identifier) {
    params.set("focusIdentifier", identifier);
    if (focusType === "project") params.set("projectIdentifier", identifier);
  }

  const response = await fetch(`/api/v1/context?${params.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    signal: options.signal,
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const error = isRecord(body) && isRecord(body.error) ? body.error : undefined;
    throw new ContextApiError(
      typeof error?.message === "string"
        ? error.message
        : "Failed to load Enterprise Context",
      response.status,
      typeof error?.code === "string" ? error.code : undefined,
    );
  }

  if (!isRecord(body) || !("data" in body)) {
    throw new ContextApiError("Unexpected Context response envelope.", 502);
  }

  return body.data as EnterpriseContextComposition;
}

export function isContextApiError(error: unknown): error is ContextApiError {
  return error instanceof ContextApiError;
}
