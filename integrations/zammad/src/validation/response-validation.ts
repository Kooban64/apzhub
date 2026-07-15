import type { ValidationResult } from "./request-validation";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateZammadTicketResponse(value: unknown): ValidationResult {
  const issues: string[] = [];
  if (!isRecord(value)) {
    return { ok: false, issues: ["ticket response must be an object"] };
  }
  if (typeof value.id !== "number") issues.push("ticket.id must be a number");
  if (typeof value.title !== "string" || !value.title.trim()) {
    issues.push("ticket.title must be a non-empty string");
  }
  if (typeof value.group_id !== "number") issues.push("ticket.group_id must be a number");
  if (typeof value.customer_id !== "number") {
    issues.push("ticket.customer_id must be a number");
  }
  if (typeof value.created_at !== "string") issues.push("ticket.created_at must be a string");
  if (typeof value.updated_at !== "string") issues.push("ticket.updated_at must be a string");
  return { ok: issues.length === 0, issues };
}

export function validateZammadOrganizationResponse(value: unknown): ValidationResult {
  const issues: string[] = [];
  if (!isRecord(value)) {
    return { ok: false, issues: ["organization response must be an object"] };
  }
  if (typeof value.id !== "number") issues.push("organization.id must be a number");
  if (typeof value.name !== "string" || !value.name.trim()) {
    issues.push("organization.name must be a non-empty string");
  }
  if (typeof value.created_at !== "string") {
    issues.push("organization.created_at must be a string");
  }
  if (typeof value.updated_at !== "string") {
    issues.push("organization.updated_at must be a string");
  }
  return { ok: issues.length === 0, issues };
}

export function validateZammadGroupResponse(value: unknown): ValidationResult {
  const issues: string[] = [];
  if (!isRecord(value)) {
    return { ok: false, issues: ["group response must be an object"] };
  }
  if (typeof value.id !== "number") issues.push("group.id must be a number");
  if (typeof value.name !== "string" || !value.name.trim()) {
    issues.push("group.name must be a non-empty string");
  }
  if (typeof value.created_at !== "string") issues.push("group.created_at must be a string");
  if (typeof value.updated_at !== "string") issues.push("group.updated_at must be a string");
  return { ok: issues.length === 0, issues };
}

export function validateZammadUserResponse(value: unknown): ValidationResult {
  const issues: string[] = [];
  if (!isRecord(value)) {
    return { ok: false, issues: ["user response must be an object"] };
  }
  if (typeof value.id !== "number") issues.push("user.id must be a number");
  return { ok: issues.length === 0, issues };
}

export function validateZammadArrayResponse(value: unknown): ValidationResult {
  if (!Array.isArray(value)) {
    return { ok: false, issues: ["list response must be an array"] };
  }
  return { ok: true, issues: [] };
}

export function validateZammadArticleResponse(value: unknown): ValidationResult {
  const issues: string[] = [];
  if (!isRecord(value)) {
    return { ok: false, issues: ["article response must be an object"] };
  }
  if (typeof value.id !== "number") issues.push("article.id must be a number");
  if (typeof value.ticket_id !== "number") {
    issues.push("article.ticket_id must be a number");
  }
  if (typeof value.created_at !== "string") {
    issues.push("article.created_at must be a string");
  }
  return { ok: issues.length === 0, issues };
}
