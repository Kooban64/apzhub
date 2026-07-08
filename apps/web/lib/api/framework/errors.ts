import type { NextResponse } from "next/server";

import { jsonErrorResponse } from "../response";
import type { LawApiErrorBody, LawApiRequestContext } from "../types";

/** Base class for typed Law API errors (LAW-014-05). */
export class LawApiError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly details?: LawApiErrorBody["details"];

  constructor(
    code: string,
    message: string,
    httpStatus: number,
    details?: LawApiErrorBody["details"],
  ) {
    super(message);
    this.name = "LawApiError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }
}

export class ValidationError extends LawApiError {
  constructor(
    message = "One or more fields failed validation.",
    details?: LawApiErrorBody["details"],
  ) {
    super("VALIDATION_FAILED", message, 422, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends LawApiError {
  constructor(message = "Resource not found.", details?: LawApiErrorBody["details"]) {
    super("NOT_FOUND", message, 404, details);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends LawApiError {
  constructor(
    message = "Resource state conflict.",
    details?: LawApiErrorBody["details"],
  ) {
    super("CONFLICT", message, 409, details);
    this.name = "ConflictError";
  }
}

export class PermissionError extends LawApiError {
  constructor(
    message = "You do not have permission to access this resource.",
    details?: LawApiErrorBody["details"],
  ) {
    super("FORBIDDEN", message, 403, details);
    this.name = "PermissionError";
  }
}

export class TenantIsolationError extends LawApiError {
  constructor(
    message = "Resource is not accessible in the current tenant.",
    details?: LawApiErrorBody["details"],
  ) {
    super("TENANT_MISMATCH", message, 403, details);
    this.name = "TenantIsolationError";
  }
}

export class OptimisticConcurrencyError extends LawApiError {
  constructor(
    message = "Resource version mismatch.",
    details?: LawApiErrorBody["details"],
  ) {
    super("PRECONDITION_FAILED", message, 412, details);
    this.name = "OptimisticConcurrencyError";
  }
}

/** Map a typed Law API error to a standard error envelope response. */
export function lawApiErrorToResponse(
  error: LawApiError,
  context: LawApiRequestContext,
): NextResponse {
  return jsonErrorResponse(
    error.httpStatus,
    {
      code: error.code,
      message: error.message,
      details: error.details,
    },
    context,
  );
}

/** Translate unknown thrown values to a standard API error response. */
export function translateLawApiError(
  error: unknown,
  context: LawApiRequestContext,
): NextResponse {
  if (error instanceof LawApiError) {
    return lawApiErrorToResponse(error, context);
  }

  return jsonErrorResponse(
    500,
    {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    },
    context,
  );
}

export function notFoundResponse(
  context: LawApiRequestContext,
  message = "Resource not found.",
): NextResponse {
  return lawApiErrorToResponse(new NotFoundError(message), context);
}

export function validationErrorResponse(
  context: LawApiRequestContext,
  errors: Readonly<Record<string, string>>,
): NextResponse {
  return lawApiErrorToResponse(
    new ValidationError(
      "One or more fields failed validation.",
      Object.entries(errors).map(([field, fieldMessage]) => ({
        field,
        code: "INVALID",
        message: fieldMessage,
      })),
    ),
    context,
  );
}

export function conflictResponse(
  context: LawApiRequestContext,
  message = "Resource state conflict.",
  details?: LawApiErrorBody["details"],
): NextResponse {
  return lawApiErrorToResponse(new ConflictError(message, details), context);
}

export function permissionErrorResponse(
  context: LawApiRequestContext,
  message = "You do not have permission to access this resource.",
  details?: LawApiErrorBody["details"],
): NextResponse {
  return lawApiErrorToResponse(new PermissionError(message, details), context);
}

export function tenantIsolationErrorResponse(
  context: LawApiRequestContext,
  message = "Resource is not accessible in the current tenant.",
  details?: LawApiErrorBody["details"],
): NextResponse {
  return lawApiErrorToResponse(new TenantIsolationError(message, details), context);
}

export function preconditionFailedResponse(
  context: LawApiRequestContext,
  message = "Resource version mismatch.",
): NextResponse {
  return lawApiErrorToResponse(new OptimisticConcurrencyError(message), context);
}

/** Map workflow validation errors to a standard 422 response. */
export function workflowValidationToResponse(
  context: LawApiRequestContext,
  validationErrors: Readonly<Record<string, string>>,
): NextResponse {
  return validationErrorResponse(context, validationErrors);
}
