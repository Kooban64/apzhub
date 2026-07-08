export interface TimelineBatchRegistrationResult {
  readonly ok: boolean;
  readonly registeredCount: number;
  readonly errors: readonly import("../types/timeline-metadata").TimelineRegistrationIssue[];
}
