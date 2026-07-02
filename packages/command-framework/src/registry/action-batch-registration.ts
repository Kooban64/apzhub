/** Structured issue for atomic batch registration or extraction failures. */
export type ActionRegistrationIssueCode = "VALIDATION" | "DUPLICATE_ID";

export interface ActionRegistrationIssue {
  readonly code: ActionRegistrationIssueCode;
  readonly actionId?: string;
  readonly capabilityId?: string;
  readonly message: string;
  readonly field?: string;
}

export interface ActionBatchRegistrationResult {
  readonly ok: boolean;
  readonly registeredCount: number;
  readonly errors: readonly ActionRegistrationIssue[];
}
