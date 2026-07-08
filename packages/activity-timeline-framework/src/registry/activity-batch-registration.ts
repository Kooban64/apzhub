export interface ActivityBatchRegistrationResult {
  readonly ok: boolean;
  readonly registeredCount: number;
  readonly errors: readonly import("../types/activity-metadata").ActivityRegistrationIssue[];
}
