/** Catalogues and limits — APZQEP-ENG-060A / OES-ENG-060A. */

export const PLAN_TITLE_MAX = 200;
export const PLAN_DESCRIPTION_MAX = 10_000;
export const PLAN_OBJECTIVE_MAX = 10_000;
export const PLAN_NUMBER_MAX = 64;
export const PLAN_NOTES_MAX = 4000;
export const PLAN_INITIAL_VERSION_LABEL = "0.1";
export const PLAN_FIRST_SEALED_VERSION = "1.0";

export const PLAN_STATUSES = [
  "draft",
  "review",
  "approved",
  "ready",
  "in_execution",
  "completed",
  "archived",
  "rejected",
  "cancelled",
  "superseded",
] as const;

export const PLAN_TYPES = [
  "release",
  "product",
  "feature",
  "milestone",
  "sprint",
  "regression",
  "certification",
  "custom",
] as const;

export const PLAN_PRIORITIES = ["critical", "high", "medium", "low"] as const;

export const PLAN_ITEM_STATUSES = [
  "included",
  "optional",
  "deferred",
  "removed",
] as const;

export const APPROVAL_DECISIONS = ["approved", "rejected"] as const;

export const APPROVAL_STATES = [
  "none",
  "pending_review",
  "approved",
  "rejected",
] as const;

export const READINESS_REASON_CODES = [
  "NOT_APPROVED",
  "NO_INCLUDED_ITEMS",
  "MISSING_VERSION_PIN",
  "HAS_INVALID_CUSTOM_SCOPE",
  "OBJECTIVE_MISSING",
  "TITLE_MISSING",
] as const;

export const CONTENT_EDITABLE_STATUSES = ["draft", "rejected"] as const;

export const SCHEDULE_EDITABLE_STATUSES = [
  "draft",
  "rejected",
  "approved",
  "ready",
] as const;

export const ASSIGNMENT_EDITABLE_STATUSES = [
  "draft",
  "rejected",
  "approved",
  "ready",
] as const;

export const TERMINAL_STATUSES = ["archived", "cancelled", "superseded"] as const;

export const SUPERSEDE_ELIGIBLE_STATUSES = ["approved", "ready", "completed"] as const;

export const CANCELLABLE_STATUSES = ["draft", "review", "approved", "ready"] as const;

export const REJECT_COMMENT_MIN_LENGTH = 3;
