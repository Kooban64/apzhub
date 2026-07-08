import type { NextRequest } from "next/server";

import { createRequestContext, resolveRequestContext } from "./request-context";
import { jsonErrorResponse } from "./response";
import type { LawApiRequestContext } from "./types";

/** Build a 405 Method Not Allowed response for scaffold routes. */
export function methodNotAllowedResponse(
  allowedMethods: readonly string[],
  context?: LawApiRequestContext,
  method = "UNKNOWN",
): ReturnType<typeof jsonErrorResponse> {
  const resolvedContext = context ?? createRequestContext();

  return jsonErrorResponse(
    405,
    {
      code: "METHOD_NOT_ALLOWED",
      message: `Method ${method} is not allowed for this route.`,
      details: { allowedMethods: [...allowedMethods] },
    },
    resolvedContext,
    {
      headers: {
        Allow: allowedMethods.join(", "),
      },
    },
  );
}

/** Resolve context from request when available, otherwise create a fresh context. */
export function resolveContextForMethodGuard(
  request?: NextRequest,
): LawApiRequestContext {
  if (request) {
    return resolveRequestContext(request);
  }

  return createRequestContext();
}
