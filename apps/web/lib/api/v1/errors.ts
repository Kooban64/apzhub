import { PlatformServiceError, isPlatformServiceError } from "@apzhub/platform-service-contracts";

import { jsonErrorResponse } from "./response";
import type { PlatformApiErrorBody, PlatformApiTracingContext } from "./types";

/** Map platform / HTTP-layer errors to HTTP status codes. */
export function mapPlatformErrorToHttpStatus(error: PlatformServiceError): number {
  switch (error.code) {
    case "VALIDATION_FAILED":
    case "INVALID_REQUEST_CONTEXT":
    case "INVALID_GLOBAL_ID":
    case "INVALID_AUTHORIZATION_CONFIGURATION":
      return 400;
    case "UNAUTHENTICATED":
    case "AUTHENTICATION_REQUIRED":
      return 401;
    case "FORBIDDEN":
    case "PERMISSION_DENIED":
    case "POLICY_DENIED":
    case "IMPERSONATION_DENIED":
    case "INVALID_ACTOR":
    case "INACTIVE_ACTOR":
    case "TENANT_MEMBERSHIP_REQUIRED":
    case "ORGANISATION_SCOPE_MISMATCH":
      return 403;
    case "NOT_FOUND":
    case "MAPPING_NOT_FOUND":
    case "PROVIDER_ENTITY_NOT_FOUND":
      return 404;
    case "CONFLICT":
    case "MAPPING_CONFLICT":
    case "MAPPING_REVISION_CONFLICT":
    case "RECONCILIATION_REQUIRED":
      return 409;
    case "PROVIDER_CAPABILITY_UNSUPPORTED":
      return 501;
    case "INTEGRATION_UNAVAILABLE":
    case "CONNECTOR_ERROR":
    case "PROVIDER_UNAVAILABLE":
    case "TEMPORARY_FAILURE":
    case "PERSISTENCE_UNAVAILABLE":
    case "AUTHORIZATION_UNAVAILABLE":
    case "MAPPING_PERSISTENCE_FAILED":
      return 503;
    case "CONFIGURATION_ERROR":
    case "BUSINESS_RULE_VIOLATION":
    case "MAPPING_TYPE_MISMATCH":
    case "MAPPING_INACTIVE":
    case "INTERNAL_ERROR":
    default:
      if (error.category === "validation") return 400;
      if (error.category === "authentication") return 401;
      if (error.category === "authorization") return 403;
      if (error.category === "not_found") return 404;
      if (error.category === "conflict") return 409;
      if (error.category === "temporary_failure" || error.category === "integration") {
        return 503;
      }
      return 500;
  }
}

/**
 * Cross-tenant / forbidden resource existence must not be enumerable.
 * Prefer 404 for not_found-style denials that could leak resource presence.
 */
export function publicStatusForPlatformError(error: PlatformServiceError): number {
  const status = mapPlatformErrorToHttpStatus(error);
  if (
    status === 403 &&
    (error.code === "MAPPING_NOT_FOUND" ||
      error.message.toLowerCase().includes("tenant") === false)
  ) {
    // Keep 403 for clear authz denials; mapping not found already maps to 404.
  }
  // Mapping tenant mismatch often surfaces as FORBIDDEN/PERMISSION_DENIED —
  // use 404 when details indicate cross-tenant isolation.
  if (
    status === 403 &&
    typeof error.details?.reason === "string" &&
    error.details.reason.includes("tenant")
  ) {
    return 404;
  }
  return status;
}

function sanitizeErrorDetails(
  details: Readonly<Record<string, unknown>> | undefined,
): Readonly<Record<string, unknown>> | undefined {
  if (!details) {
    return undefined;
  }

  const blocked = new Set([
    "stack",
    "sql",
    "query",
    "password",
    "token",
    "secret",
    "credentials",
    "authorization",
    "cookie",
    "vendorPayload",
    "raw",
  ]);

  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    if (blocked.has(key.toLowerCase())) {
      continue;
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      safe[key] = value;
    } else if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      safe[key] = value;
    } else if (
      value &&
      typeof value === "object" &&
      (key === "fieldErrors" || key === "formErrors" || "fieldErrors" in (value as object))
    ) {
      safe[key] = value;
    }
  }

  return Object.keys(safe).length > 0 ? safe : undefined;
}

export function toPublicErrorBody(error: PlatformServiceError): PlatformApiErrorBody {
  return {
    code: error.code,
    message: error.message,
    details: sanitizeErrorDetails(error.details),
  };
}

export function toPublicHttpErrorBody(body: PlatformApiErrorBody): PlatformApiErrorBody {
  return {
    code: body.code,
    message: body.message,
    details: sanitizeErrorDetails(body.details),
  };
}

export function translatePlatformApiError(
  error: unknown,
  tracing: PlatformApiTracingContext,
): Response {
  if (isPlatformServiceError(error)) {
    return jsonErrorResponse(
      publicStatusForPlatformError(error),
      toPublicErrorBody(error),
      tracing,
    );
  }

  if (error instanceof PlatformApiHttpError) {
    return jsonErrorResponse(error.status, toPublicHttpErrorBody(error.body), tracing);
  }

  return jsonErrorResponse(
    500,
    {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    },
    tracing,
  );
}

/** Controlled HTTP-layer error (validation, auth presence) before gateway invocation. */
export class PlatformApiHttpError extends Error {
  readonly status: number;
  readonly body: PlatformApiErrorBody;

  constructor(status: number, body: PlatformApiErrorBody) {
    super(body.message);
    this.name = "PlatformApiHttpError";
    this.status = status;
    this.body = body;
  }
}

export function validationError(
  message: string,
  details?: Readonly<Record<string, unknown>>,
): PlatformApiHttpError {
  return new PlatformApiHttpError(400, {
    code: "VALIDATION_FAILED",
    message,
    details,
  });
}

export function authenticationRequiredError(): PlatformApiHttpError {
  return new PlatformApiHttpError(401, {
    code: "AUTHENTICATION_REQUIRED",
    message: "Authentication is required.",
  });
}

export function tenantRequiredError(): PlatformApiHttpError {
  return new PlatformApiHttpError(403, {
    code: "TENANT_MEMBERSHIP_REQUIRED",
    message: "Active tenant membership is required.",
  });
}
