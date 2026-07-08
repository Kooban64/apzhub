import { jsonErrorResponse } from "../response";
import type { LawApiRequestContext } from "../types";

export function unauthorizedResponse(
  context: LawApiRequestContext,
  message = "Authentication is required to access this resource.",
): ReturnType<typeof jsonErrorResponse> {
  return jsonErrorResponse(
    401,
    {
      code: "UNAUTHENTICATED",
      message,
    },
    context,
  );
}

export function forbiddenResponse(
  context: LawApiRequestContext,
  options: {
    readonly code?: string;
    readonly message?: string;
    readonly details?: Record<string, unknown> | readonly unknown[];
  } = {},
): ReturnType<typeof jsonErrorResponse> {
  return jsonErrorResponse(
    403,
    {
      code: options.code ?? "FORBIDDEN",
      message: options.message ?? "You do not have permission to access this resource.",
      details: options.details,
    },
    context,
  );
}

export function tenantRequiredResponse(
  context: LawApiRequestContext,
): ReturnType<typeof jsonErrorResponse> {
  return forbiddenResponse(context, {
    code: "TENANT_REQUIRED",
    message: "A valid tenant could not be resolved for this request.",
  });
}
