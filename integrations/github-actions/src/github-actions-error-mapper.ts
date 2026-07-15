import {
  buildDefaultTranslatedError,
  resolveErrorSeverity,
  type TranslatedIntegrationError,
  type VendorErrorInput,
  type VendorErrorMapper,
} from "@apzhub/integration-sdk/errors";
import type { IntegrationErrorCategory } from "@apzhub/integration-sdk/errors";

export const GITHUB_ACTIONS_INTEGRATION_ID = "github-actions";

interface GitHubApiErrorBody {
  readonly message?: string;
  readonly documentation_url?: string;
  readonly errors?: readonly { readonly message?: string; readonly code?: string }[];
}

const GITHUB_ERROR_CODE_CATEGORY: Readonly<Record<string, IntegrationErrorCategory>> = {
  BAD_CREDENTIALS: "authentication",
  REQUIRES_AUTHENTICATION: "authentication",
  UNAUTHORIZED: "authentication",
  FORBIDDEN: "authorization",
  NOT_FOUND: "not_found",
  VALIDATION_FAILED: "validation",
  RATE_LIMITED: "rate_limited",
  ABUSE_RATE_LIMIT: "rate_limited",
  SERVICE_UNAVAILABLE: "vendor_unavailable",
  NOT_IMPLEMENTED: "not_implemented",
  UNSUPPORTED: "not_implemented",
};

function extractGitHubErrorMessage(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }
  const candidate = body as GitHubApiErrorBody;
  if (candidate.message) return candidate.message;
  const first = candidate.errors?.[0]?.message;
  return first;
}

function extractGitHubErrorCode(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }
  const candidate = body as GitHubApiErrorBody;
  const msg = (candidate.message ?? "").toLowerCase();
  if (msg.includes("bad credentials")) return "BAD_CREDENTIALS";
  if (msg.includes("requires authentication")) return "REQUIRES_AUTHENTICATION";
  if (msg.includes("rate limit")) return "RATE_LIMITED";
  if (msg.includes("not found")) return "NOT_FOUND";
  if (msg.includes("validation failed")) return "VALIDATION_FAILED";
  return candidate.errors?.[0]?.code?.toUpperCase();
}

function buildOperatorMessage(
  category: IntegrationErrorCategory,
  operation?: string,
): string {
  const op = (operation ?? "").toLowerCase();
  if (op.includes("approval")) {
    if (category === "not_found") return "GitHub Actions approvals endpoint unavailable";
    return "GitHub Actions approvals request failed";
  }
  if (op.includes("rate")) {
    return "GitHub API rate limit exceeded";
  }

  const messages: Record<IntegrationErrorCategory, string> = {
    authentication: "GitHub Actions authentication failed",
    authorization: "GitHub Actions authorization failed",
    validation: "GitHub Actions request validation failed",
    not_found: "GitHub Actions resource was not found",
    conflict: "GitHub Actions request conflict",
    rate_limited: "GitHub API rate limit exceeded",
    vendor_unavailable: "GitHub Actions API is unavailable",
    timeout: "GitHub Actions request timed out",
    mapping: "GitHub Actions entity mapping failed",
    provisioning: "GitHub Actions provisioning failed",
    version_incompatible: "GitHub Actions API version is incompatible",
    not_implemented: "GitHub Actions operation is not implemented",
    internal: "GitHub Actions integration encountered an internal error",
  };

  return messages[category];
}

function categoryFromStatus(input: VendorErrorInput): IntegrationErrorCategory {
  if (input.statusCode === 401) return "authentication";
  if (input.statusCode === 403) {
    const msg = (extractGitHubErrorMessage(input.body) ?? "").toLowerCase();
    if (msg.includes("rate limit") || msg.includes("secondary rate")) {
      return "rate_limited";
    }
    return "authorization";
  }
  if (input.statusCode === 404) return "not_found";
  if (input.statusCode === 409) return "conflict";
  if (input.statusCode === 422 || input.statusCode === 400) return "validation";
  if (input.statusCode === 429) return "rate_limited";
  if (input.statusCode === 501) return "not_implemented";
  if (input.timeout) return "timeout";
  if (input.networkError || (input.statusCode ?? 0) >= 500) return "vendor_unavailable";
  return "internal";
}

export class GitHubActionsVendorErrorMapper implements VendorErrorMapper {
  readonly integrationId = GITHUB_ACTIONS_INTEGRATION_ID;

  map(input: VendorErrorInput): TranslatedIntegrationError | null {
    const vendorCode = input.vendorCode ?? extractGitHubErrorCode(input.body);
    const categoryFromCode = vendorCode
      ? GITHUB_ERROR_CODE_CATEGORY[vendorCode]
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
      ? `github-actions.${vendorCode.toLowerCase()}`
      : `github-actions.${resolvedCategory}.default`;

    const capturedAt = new Date().toISOString();
    const base = buildDefaultTranslatedError(
      {
        ...input,
        vendorCode,
        vendorMessage: input.vendorMessage ?? extractGitHubErrorMessage(input.body),
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

export function createGitHubActionsVendorErrorMapper(): GitHubActionsVendorErrorMapper {
  return new GitHubActionsVendorErrorMapper();
}

export function mapGitHubActionsUnknownError(
  error: unknown,
  context: VendorErrorInput["context"],
): TranslatedIntegrationError {
  const mapper = createGitHubActionsVendorErrorMapper();
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
