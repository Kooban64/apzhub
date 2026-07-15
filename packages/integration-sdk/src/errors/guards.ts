import type { IntegrationError, IntegrationErrorCategory } from "./types";

const ERROR_CATEGORIES: readonly IntegrationErrorCategory[] = [
  "authentication",
  "authorization",
  "validation",
  "not_found",
  "conflict",
  "rate_limited",
  "vendor_unavailable",
  "timeout",
  "mapping",
  "provisioning",
  "version_incompatible",
  "not_implemented",
  "internal",
] as const;

const categorySet = new Set<string>(ERROR_CATEGORIES);

export function isIntegrationErrorCategory(
  value: unknown,
): value is IntegrationErrorCategory {
  return typeof value === "string" && categorySet.has(value);
}

export function isIntegrationError(value: unknown): value is IntegrationError {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<IntegrationError>;

  return (
    isIntegrationErrorCategory(candidate.category) &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.retryable === "boolean" &&
    typeof candidate.correlationId === "string"
  );
}
