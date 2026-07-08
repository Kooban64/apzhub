import type { NotificationRegistrationIssue } from "./notification-metadata";

export interface NotificationBatchRegistrationResult {
  readonly ok: boolean;
  readonly registeredCount: number;
  readonly errors: readonly NotificationRegistrationIssue[];
}
