import type { EventRegistrationIssue } from "./event-metadata";

/** Structured issue for atomic batch registration failures. */
export interface EventBatchRegistrationResult {
  readonly ok: boolean;
  readonly registeredCount: number;
  readonly errors: readonly EventRegistrationIssue[];
}
