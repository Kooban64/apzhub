import type { ValidationResult } from "./request-validation";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

export function validatePlanePaginatedResponse(
  body: unknown,
  itemField = "results",
): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, issues: ["response body must be an object"] };
  }

  const candidate = body as Record<string, unknown>;
  const items = candidate[itemField];

  if (!Array.isArray(items)) {
    return { ok: false, issues: [`response.${itemField} must be an array`] };
  }

  return { ok: true, issues: [] };
}

export function validatePlaneEntity(
  body: unknown,
  requiredFields: readonly string[],
): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, issues: ["entity must be an object"] };
  }

  const candidate = body as Record<string, unknown>;
  const issues: string[] = [];

  for (const field of requiredFields) {
    if (!isNonEmptyString(candidate[field]) && typeof candidate[field] !== "number") {
      if (field === "id" && isNonEmptyString(candidate[field])) {
        continue;
      }
      if (!isNonEmptyString(candidate[field])) {
        issues.push(`entity.${field} is required`);
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

export function validatePlaneProjectResponse(body: unknown): ValidationResult {
  return validatePlaneEntity(body, [
    "id",
    "name",
    "identifier",
    "created_at",
    "updated_at",
  ]);
}

export function validatePlaneWorkspaceResponse(body: unknown): ValidationResult {
  return validatePlaneEntity(body, ["id", "name", "slug"]);
}

export function validatePlaneStateResponse(body: unknown): ValidationResult {
  return validatePlaneEntity(body, ["id", "name", "group"]);
}

export function validatePlaneLabelResponse(body: unknown): ValidationResult {
  return validatePlaneEntity(body, ["id", "name"]);
}

export function validatePlaneCycleResponse(body: unknown): ValidationResult {
  return validatePlaneEntity(body, ["id", "name"]);
}

export function validatePlaneModuleResponse(body: unknown): ValidationResult {
  return validatePlaneEntity(body, ["id", "name"]);
}

export function validatePlaneMemberResponse(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, issues: ["member must be an object"] };
  }

  const candidate = body as Record<string, unknown>;
  const issues: string[] = [];

  if (!isNonEmptyString(candidate.id) && !isNonEmptyString(candidate.member_id)) {
    issues.push("member.id is required");
  }

  if (!isNonEmptyString(candidate.member) && !isNonEmptyString(candidate.user_id)) {
    issues.push("member.user reference is required");
  }

  return { ok: issues.length === 0, issues };
}

export function validatePlaneIssueResponse(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, issues: ["issue must be an object"] };
  }

  const candidate = body as Record<string, unknown>;
  const issues: string[] = [];

  if (!isNonEmptyString(candidate.id)) {
    issues.push("issue.id is required");
  }
  if (!isNonEmptyString(candidate.name)) {
    issues.push("issue.name is required");
  }
  if (!isNonEmptyString(candidate.created_at)) {
    issues.push("issue.created_at is required");
  }
  if (!isNonEmptyString(candidate.updated_at)) {
    issues.push("issue.updated_at is required");
  }

  return { ok: issues.length === 0, issues };
}

export function validatePlaneCommentResponse(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, issues: ["comment must be an object"] };
  }
  const candidate = body as Record<string, unknown>;
  const issues: string[] = [];
  if (!isNonEmptyString(candidate.id)) {
    issues.push("comment.id is required");
  }
  if (!isNonEmptyString(candidate.created_at)) {
    issues.push("comment.created_at is required");
  }
  if (!isNonEmptyString(candidate.updated_at)) {
    issues.push("comment.updated_at is required");
  }
  return { ok: issues.length === 0, issues };
}

export function validatePlaneActivityResponse(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, issues: ["activity must be an object"] };
  }
  const candidate = body as Record<string, unknown>;
  const issues: string[] = [];
  if (!isNonEmptyString(candidate.id)) {
    issues.push("activity.id is required");
  }
  if (!isNonEmptyString(candidate.created_at)) {
    issues.push("activity.created_at is required");
  }
  return { ok: issues.length === 0, issues };
}

export function validatePlaneSubscriberResponse(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, issues: ["subscriber must be an object"] };
  }
  const candidate = body as Record<string, unknown>;
  const issues: string[] = [];
  if (!isNonEmptyString(candidate.id)) {
    issues.push("subscriber.id is required");
  }
  if (
    !isNonEmptyString(candidate.subscriber) &&
    !(
      typeof candidate.subscriber === "object" &&
      candidate.subscriber !== null &&
      isNonEmptyString((candidate.subscriber as { id?: unknown }).id)
    )
  ) {
    issues.push("subscriber.subscriber is required");
  }
  return { ok: issues.length === 0, issues };
}

export function validateOptionalDescription(value: unknown): ValidationResult {
  if (!isOptionalString(value)) {
    return { ok: false, issues: ["description must be a string when provided"] };
  }
  return { ok: true, issues: [] };
}
