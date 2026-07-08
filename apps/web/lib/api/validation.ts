import type { NextRequest } from "next/server";

import { jsonErrorResponse } from "./response";
import type { LawApiRequestContext } from "./types";

export interface LawApiValidationFailure {
  readonly ok: false;
  readonly response: ReturnType<typeof jsonErrorResponse>;
}

export type LawApiValidationResult<T> =
  { readonly ok: true; readonly value: T } | LawApiValidationFailure;

function validationFailure(
  context: LawApiRequestContext,
  code: string,
  message: string,
  details?: Record<string, unknown> | readonly unknown[],
): LawApiValidationFailure {
  return {
    ok: false,
    response: jsonErrorResponse(
      400,
      {
        code,
        message,
        details: details ?? {},
      },
      context,
    ),
  };
}

/** Ensure the request Content-Type is application/json when a body is expected. */
export function validateJsonContentType(
  request: NextRequest,
  context: LawApiRequestContext,
): LawApiValidationResult<void> {
  const contentType = request.headers.get("content-type");
  if (!contentType) {
    return validationFailure(
      context,
      "MALFORMED_REQUEST",
      "Content-Type header is required for JSON requests.",
      { expected: "application/json" },
    );
  }

  if (!contentType.toLowerCase().includes("application/json")) {
    return validationFailure(
      context,
      "MALFORMED_REQUEST",
      "Unsupported Content-Type.",
      { received: contentType, expected: "application/json" },
    );
  }

  return { ok: true, value: undefined };
}

/** Parse JSON body — returns a standard error envelope on failure. */
export async function parseJsonBody<T = unknown>(
  request: NextRequest,
  context: LawApiRequestContext,
): Promise<LawApiValidationResult<T>> {
  const contentTypeResult = validateJsonContentType(request, context);
  if (!contentTypeResult.ok) {
    return contentTypeResult;
  }

  try {
    const value = (await request.json()) as T;
    return { ok: true, value };
  } catch {
    return validationFailure(
      context,
      "MALFORMED_REQUEST",
      "Request body must be valid JSON.",
    );
  }
}

/** Validate allowed HTTP method — for use inside handlers. */
export function validateHttpMethod(
  request: NextRequest,
  allowedMethods: readonly string[],
  context: LawApiRequestContext,
): LawApiValidationResult<void> {
  if (allowedMethods.includes(request.method)) {
    return { ok: true, value: undefined };
  }

  return {
    ok: false,
    response: jsonErrorResponse(
      405,
      {
        code: "METHOD_NOT_ALLOWED",
        message: `Method ${request.method} is not allowed for this route.`,
        details: { allowedMethods: [...allowedMethods] },
      },
      context,
      {
        headers: {
          Allow: allowedMethods.join(", "),
        },
      },
    ),
  };
}
