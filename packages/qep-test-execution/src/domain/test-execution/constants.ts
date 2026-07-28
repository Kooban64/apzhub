/** Catalogues and limits — APZQEP-OES-ENG-090A PART-02 / APPENDIX-B. */

export const EXECUTION_NUMBER_MAX = 64;
export const EXECUTION_TEXT_MAX = 10_000;
export const EXECUTION_REASON_MIN = 3;
export const EXECUTION_OBSERVATION_MAX = 4000;

export const EXECUTION_STATUSES = [
  "draft",
  "ready",
  "assigned",
  "in_progress",
  "paused",
  "blocked",
  "completed",
  "submitted_for_review",
  "accepted",
  "rejected",
  "cancelled",
  "superseded",
] as const;

export const EXECUTION_MODES = [
  "manual",
  "assisted_manual",
  "automated",
  "imported",
] as const;

export const STEP_OUTCOMES = [
  "passed",
  "failed",
  "blocked",
  "skipped",
  "not_applicable",
  "inconclusive",
  "not_executed",
  "cancelled",
] as const;

export const EXECUTION_OUTCOMES = [
  "passed",
  "failed",
  "blocked",
  "inconclusive",
  "cancelled",
] as const;

export const REVIEW_DECISIONS = ["accepted", "rejected"] as const;

export const TERMINAL_STATUSES = ["accepted", "cancelled", "superseded"] as const;

export const CANCELLABLE_STATUSES = [
  "draft",
  "ready",
  "assigned",
  "in_progress",
  "paused",
  "blocked",
  "completed",
  "submitted_for_review",
  "rejected",
] as const;

export const SUPERSEDE_ELIGIBLE_STATUSES = ["accepted", "rejected"] as const;

export const CONTENT_MUTABLE_STATUSES = [
  "draft",
  "ready",
  "assigned",
  "in_progress",
  "paused",
  "blocked",
  "completed",
  "submitted_for_review",
  "rejected",
] as const;

export const STEP_MUTABLE_STATUSES = ["in_progress"] as const;

export const DEFAULT_DOMAIN_POLICY = {
  reviewRequired: true,
  fastPathAccept: false,
  reviewerMustDifferFromExecutor: true,
} as const;
