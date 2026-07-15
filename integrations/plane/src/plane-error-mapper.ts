import {
  buildDefaultTranslatedError,
  resolveErrorSeverity,
  type TranslatedIntegrationError,
  type VendorErrorInput,
  type VendorErrorMapper,
} from "@apzhub/integration-sdk/errors";
import type { IntegrationErrorCategory } from "@apzhub/integration-sdk/errors";

export const PLANE_INTEGRATION_ID = "plane";

interface PlaneApiErrorBody {
  readonly error?: string;
  readonly error_code?: string;
  readonly message?: string;
  readonly detail?: string;
}

const PLANE_ERROR_CODE_CATEGORY: Readonly<Record<string, IntegrationErrorCategory>> = {
  INVALID_TOKEN: "authentication",
  AUTHENTICATION_FAILED: "authentication",
  PERMISSION_DENIED: "authorization",
  WORKSPACE_NOT_FOUND: "not_found",
  PROJECT_NOT_FOUND: "not_found",
  ISSUE_NOT_FOUND: "not_found",
  STATE_NOT_FOUND: "not_found",
  INVALID_STATE: "validation",
  INVALID_ASSIGNEE: "validation",
  INVALID_LABEL: "validation",
  INVALID_CYCLE: "validation",
  INVALID_MODULE: "validation",
  COMMENT_NOT_FOUND: "not_found",
  SUBSCRIBER_NOT_FOUND: "not_found",
  INVALID_SUBSCRIBER: "validation",
  ACTIVITY_NOT_FOUND: "not_found",
  WEBHOOK_NOT_FOUND: "not_found",
  WEBHOOK_INVALID: "validation",
  WEBHOOK_FAILED: "vendor_unavailable",
  SYNC_FAILED: "vendor_unavailable",
  EVENT_TRANSLATION_FAILED: "mapping",
  PROVIDER_TIMEOUT: "timeout",
  RATE_LIMITED: "rate_limited",
  RETRY_EXHAUSTED: "vendor_unavailable",
  VALIDATION_ERROR: "validation",
  DUPLICATE_ENTITY: "conflict",
};

function extractPlaneErrorCode(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }

  const candidate = body as PlaneApiErrorBody;
  return candidate.error_code ?? candidate.error;
}

function extractPlaneErrorMessage(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }

  const candidate = body as PlaneApiErrorBody;
  return candidate.message ?? candidate.detail ?? candidate.error;
}

function buildPlaneOperatorMessage(
  category: IntegrationErrorCategory,
  operation?: string,
): string {
  const op = operation?.toLowerCase() ?? "";

  if (op.includes("webhook")) {
    if (category === "not_found") return "Plane webhook was not found";
    if (category === "validation") return "Plane webhook configuration is invalid";
    if (category === "rate_limited") return "Plane webhook rate limit exceeded";
    if (category === "timeout") return "Plane webhook request timed out";
    if (category === "vendor_unavailable") return "Plane webhook operation failed";
  }

  if (op.includes("sync")) {
    if (category === "timeout") return "Plane synchronisation timed out";
    if (category === "rate_limited") return "Plane synchronisation rate limit exceeded";
    if (category === "vendor_unavailable") return "Plane synchronisation failed";
    if (category === "mapping") return "Plane synchronisation mapping failed";
  }

  if (op.includes("event") || op.includes("translate")) {
    return "Plane event translation failed";
  }

  if (category === "timeout") return "Plane provider request timed out";
  if (category === "rate_limited") return "Plane rate limit exceeded";

  const messages: Record<IntegrationErrorCategory, string> = {
    authentication: "Plane authentication failed",
    authorization: "Plane authorization failed",
    validation: "Plane request validation failed",
    not_found: "Plane resource was not found",
    conflict: "Plane request conflict",
    rate_limited: "Plane rate limit exceeded",
    vendor_unavailable: "Plane engine is unavailable",
    timeout: "Plane request timed out",
    mapping: "Plane entity mapping failed",
    provisioning: "Plane provisioning failed",
    version_incompatible: "Plane engine version is incompatible",
    not_implemented: "Plane operation is not implemented",
    internal: "Plane integration encountered an internal error",
  };

  return messages[category];
}

function categoryFromStatus(input: VendorErrorInput): IntegrationErrorCategory {
  if (input.statusCode === 401) return "authentication";
  if (input.statusCode === 403) return "authorization";
  if (input.statusCode === 404) return "not_found";
  if (input.statusCode === 409) return "conflict";
  if (input.statusCode === 422) return "validation";
  if (input.statusCode === 429) return "rate_limited";
  if (input.timeout) return "timeout";
  if (input.networkError || (input.statusCode ?? 0) >= 500) return "vendor_unavailable";
  return "internal";
}

export class PlaneVendorErrorMapper implements VendorErrorMapper {
  readonly integrationId = PLANE_INTEGRATION_ID;

  map(input: VendorErrorInput): TranslatedIntegrationError | null {
    const vendorCode = input.vendorCode ?? extractPlaneErrorCode(input.body);
    const categoryFromCode = vendorCode
      ? PLANE_ERROR_CODE_CATEGORY[vendorCode]
      : undefined;

    if (
      !categoryFromCode &&
      input.statusCode === undefined &&
      !input.timeout &&
      !input.networkError
    ) {
      return null;
    }

    const resolvedCategory = categoryFromCode ?? categoryFromStatus(input);
    const operation = input.context?.operation;

    const code = vendorCode
      ? `plane.${vendorCode.toLowerCase()}`
      : `plane.${resolvedCategory}.default`;

    const capturedAt = new Date().toISOString();
    const base = buildDefaultTranslatedError(
      {
        ...input,
        vendorCode,
        vendorMessage: input.vendorMessage ?? extractPlaneErrorMessage(input.body),
      },
      capturedAt,
      {
        category: resolvedCategory,
        code,
        message: buildPlaneOperatorMessage(resolvedCategory, operation),
      },
    );

    return {
      ...base,
      severity: resolveErrorSeverity(resolvedCategory),
    };
  }
}

export function createPlaneVendorErrorMapper(): PlaneVendorErrorMapper {
  return new PlaneVendorErrorMapper();
}

export function mapPlaneUnknownError(
  error: unknown,
  context: VendorErrorInput["context"],
): TranslatedIntegrationError {
  const mapper = createPlaneVendorErrorMapper();
  const statusCode =
    typeof error === "object" && error !== null && "statusCode" in error
      ? Number((error as { statusCode?: number }).statusCode)
      : undefined;
  const body =
    typeof error === "object" && error !== null && "body" in error
      ? (error as { body?: unknown }).body
      : undefined;
  const vendorCode =
    typeof error === "object" && error !== null && "vendorCode" in error
      ? String((error as { vendorCode?: string }).vendorCode)
      : undefined;

  return (
    mapper.map({
      statusCode,
      body,
      vendorCode,
      vendorMessage: error instanceof Error ? error.message : String(error),
      context,
      timeout:
        (error instanceof Error && error.name === "AbortError") ||
        vendorCode === "PROVIDER_TIMEOUT",
      networkError:
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "ECONNREFUSED",
    }) ??
    buildDefaultTranslatedError(
      {
        statusCode,
        body,
        context,
      },
      new Date().toISOString(),
    )
  );
}
