import {
  buildDefaultTranslatedError,
  resolveErrorSeverity,
  type TranslatedIntegrationError,
  type VendorErrorInput,
  type VendorErrorMapper,
} from "@apzhub/integration-sdk/errors";
import type { IntegrationErrorCategory } from "@apzhub/integration-sdk/errors";

import { KIMAI_INTEGRATION_ID } from "./version";

interface KimaiApiErrorBody {
  readonly message?: string;
  readonly code?: number | string;
}

const KIMAI_ERROR_CODE_CATEGORY: Readonly<Record<string, IntegrationErrorCategory>> = {
  UNAUTHORIZED: "authentication",
  AUTHENTICATION_ERROR: "authentication",
  FORBIDDEN: "authorization",
  NOT_FOUND: "not_found",
  VALIDATION_ERROR: "validation",
  BAD_REQUEST: "validation",
  RATE_LIMITED: "rate_limited",
  SERVICE_UNAVAILABLE: "vendor_unavailable",
};

function extractMessage(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const candidate = body as KimaiApiErrorBody;
  return candidate.message;
}

function extractCode(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const candidate = body as KimaiApiErrorBody;
  if (candidate.code !== undefined) {
    return String(candidate.code).toUpperCase();
  }
  const msg = (candidate.message ?? "").toLowerCase();
  if (msg.includes("unauthorized") || msg.includes("authentication")) {
    return "UNAUTHORIZED";
  }
  if (msg.includes("forbidden")) return "FORBIDDEN";
  if (msg.includes("not found")) return "NOT_FOUND";
  if (msg.includes("rate limit")) return "RATE_LIMITED";
  return undefined;
}

function buildOperatorMessage(category: IntegrationErrorCategory): string {
  const messages: Record<IntegrationErrorCategory, string> = {
    authentication: "Kimai authentication failed",
    authorization: "Kimai authorization failed",
    validation: "Kimai request validation failed",
    not_found: "Kimai resource was not found",
    conflict: "Kimai request conflict",
    rate_limited: "Kimai rate limit exceeded",
    vendor_unavailable: "Kimai API is unavailable",
    timeout: "Kimai request timed out",
    mapping: "Kimai entity mapping failed",
    provisioning: "Kimai provisioning failed",
    version_incompatible: "Kimai API version is incompatible",
    not_implemented: "Kimai operation is not supported by this foundation adapter",
    internal: "Kimai integration encountered an internal error",
  };
  return messages[category];
}

function categoryFromStatus(input: VendorErrorInput): IntegrationErrorCategory {
  if (input.statusCode === 401) return "authentication";
  if (input.statusCode === 403) return "authorization";
  if (input.statusCode === 404) return "not_found";
  if (input.statusCode === 409) return "conflict";
  if (input.statusCode === 400 || input.statusCode === 422) return "validation";
  if (input.statusCode === 429) return "rate_limited";
  if (input.statusCode === 501) return "not_implemented";
  if (input.timeout) return "timeout";
  if (input.networkError || (input.statusCode ?? 0) >= 500) {
    return "vendor_unavailable";
  }
  return "internal";
}

export class KimaiVendorErrorMapper implements VendorErrorMapper {
  readonly integrationId = KIMAI_INTEGRATION_ID;

  map(input: VendorErrorInput): TranslatedIntegrationError | null {
    const vendorCode = input.vendorCode ?? extractCode(input.body);
    const categoryFromCode = vendorCode
      ? KIMAI_ERROR_CODE_CATEGORY[vendorCode]
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
    const code = vendorCode
      ? `kimai.${vendorCode.toLowerCase()}`
      : `kimai.${resolvedCategory}.default`;

    const capturedAt = new Date().toISOString();
    const base = buildDefaultTranslatedError(
      {
        ...input,
        vendorCode,
        vendorMessage: input.vendorMessage ?? extractMessage(input.body),
      },
      capturedAt,
      {
        category: resolvedCategory,
        code,
        message: buildOperatorMessage(resolvedCategory),
      },
    );

    return {
      ...base,
      severity: resolveErrorSeverity(resolvedCategory),
    };
  }
}

export function createKimaiVendorErrorMapper(): KimaiVendorErrorMapper {
  return new KimaiVendorErrorMapper();
}

export function mapKimaiUnknownError(
  error: unknown,
  context: VendorErrorInput["context"],
): TranslatedIntegrationError {
  const mapper = createKimaiVendorErrorMapper();
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

export { KIMAI_INTEGRATION_ID };
