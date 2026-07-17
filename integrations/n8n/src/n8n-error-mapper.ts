import {
  buildDefaultTranslatedError,
  resolveErrorSeverity,
  type TranslatedIntegrationError,
  type VendorErrorInput,
  type VendorErrorMapper,
} from "@apzhub/integration-sdk/errors";
import type { IntegrationErrorCategory } from "@apzhub/integration-sdk/errors";

import { N8N_INTEGRATION_ID } from "./version";

interface N8nApiErrorBody {
  readonly message?: string;
  readonly code?: string;
  readonly name?: string;
  readonly hint?: string;
}

const N8N_ERROR_CODE_CATEGORY: Readonly<Record<string, IntegrationErrorCategory>> = {
  UNAUTHORIZED: "authentication",
  AUTHENTICATION_ERROR: "authentication",
  FORBIDDEN: "authorization",
  NOT_FOUND: "not_found",
  VALIDATION_ERROR: "validation",
  BAD_REQUEST: "validation",
  RATE_LIMITED: "rate_limited",
  SERVICE_UNAVAILABLE: "vendor_unavailable",
  NOT_IMPLEMENTED: "not_implemented",
  UNSUPPORTED: "not_implemented",
};

function extractMessage(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const candidate = body as N8nApiErrorBody;
  return candidate.message ?? candidate.hint ?? candidate.name;
}

function extractCode(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const candidate = body as N8nApiErrorBody;
  if (candidate.code) return candidate.code.toUpperCase();
  const msg = (candidate.message ?? "").toLowerCase();
  if (msg.includes("unauthorized") || msg.includes("api key")) return "UNAUTHORIZED";
  if (msg.includes("forbidden")) return "FORBIDDEN";
  if (msg.includes("not found")) return "NOT_FOUND";
  if (msg.includes("rate limit")) return "RATE_LIMITED";
  return undefined;
}

function buildOperatorMessage(
  category: IntegrationErrorCategory,
  operation?: string,
): string {
  if (operation && /execute|activate|deactivate|schedule|webhook/i.test(operation)) {
    return `n8n adapter does not support ${operation}`;
  }
  const messages: Record<IntegrationErrorCategory, string> = {
    authentication: "n8n authentication failed",
    authorization: "n8n authorization failed",
    validation: "n8n request validation failed",
    not_found: "n8n resource was not found",
    conflict: "n8n request conflict",
    rate_limited: "n8n rate limit exceeded",
    vendor_unavailable: "n8n API is unavailable",
    timeout: "n8n request timed out",
    mapping: "n8n entity mapping failed",
    provisioning: "n8n provisioning failed",
    version_incompatible: "n8n API version is incompatible",
    not_implemented: "n8n operation is not supported by this adapter",
    internal: "n8n integration encountered an internal error",
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
  if (input.networkError || (input.statusCode ?? 0) >= 500) return "vendor_unavailable";
  return "internal";
}

export class N8nVendorErrorMapper implements VendorErrorMapper {
  readonly integrationId = N8N_INTEGRATION_ID;

  map(input: VendorErrorInput): TranslatedIntegrationError | null {
    const vendorCode = input.vendorCode ?? extractCode(input.body);
    const categoryFromCode = vendorCode
      ? N8N_ERROR_CODE_CATEGORY[vendorCode]
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
      ? `n8n.${vendorCode.toLowerCase()}`
      : `n8n.${resolvedCategory}.default`;

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
        message: buildOperatorMessage(resolvedCategory, input.context?.operation),
      },
    );

    return {
      ...base,
      severity: resolveErrorSeverity(resolvedCategory),
    };
  }
}

export function createN8nVendorErrorMapper(): N8nVendorErrorMapper {
  return new N8nVendorErrorMapper();
}

export function mapN8nUnknownError(
  error: unknown,
  context: VendorErrorInput["context"],
): TranslatedIntegrationError {
  const mapper = createN8nVendorErrorMapper();
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

export { N8N_INTEGRATION_ID };
