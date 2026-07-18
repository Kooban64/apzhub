import type { PageRequest, SortField } from "../models/query";

export interface ValidationResult {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

export function validatePageRequest(input: Partial<PageRequest>): ValidationResult {
  const issues: string[] = [];

  if (input.page !== undefined && input.page < 1) {
    issues.push("page must be at least 1");
  }

  if (input.perPage !== undefined && (input.perPage < 1 || input.perPage > 100)) {
    issues.push("perPage must be between 1 and 100");
  }

  return { ok: issues.length === 0, issues };
}

export function validateSortFields<TField extends string>(
  fields: readonly SortField<TField>[],
  allowed: readonly TField[],
): ValidationResult {
  const issues: string[] = [];

  for (const sort of fields) {
    if (!allowed.includes(sort.field)) {
      issues.push(`sort field "${sort.field}" is not supported`);
    }
    if (sort.direction !== "asc" && sort.direction !== "desc") {
      issues.push(`sort direction for "${sort.field}" must be asc or desc`);
    }
  }

  return { ok: issues.length === 0, issues };
}

export function validateRequiredString(
  value: string | undefined,
  field: string,
  options?: { readonly maxLength?: number },
): ValidationResult {
  const issues: string[] = [];

  if (!value?.trim()) {
    issues.push(`${field} is required`);
  } else if (options?.maxLength && value.length > options.maxLength) {
    issues.push(`${field} must be at most ${options.maxLength} characters`);
  }

  return { ok: issues.length === 0, issues };
}

export function mergeValidation(
  ...results: readonly ValidationResult[]
): ValidationResult {
  const issues = results.flatMap((result) => result.issues);
  return { ok: issues.length === 0, issues };
}

export function assertValid(result: ValidationResult, prefix: string): void {
  if (!result.ok) {
    const message = `${prefix}: ${result.issues.join("; ")}`;
    const code = `plane.validation.${prefix.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`;
    throw Object.assign(new Error(message), {
      category: "validation" as const,
      code,
      message,
      retryable: false,
      correlationId: "plane-validation",
    });
  }
}
