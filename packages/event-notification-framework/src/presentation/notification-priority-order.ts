import type { NotificationPriority } from "../types/notification-kind";

/** Presentation severity derived from notification priority — UI-ready scaffold. */
export type NotificationPresentationSeverity =
  "critical" | "warning" | "info" | "subtle";

/** Read/unread presentation state for Experiences — does not mutate service state. */
export type NotificationReadPresentationState = "read" | "unread";

const PRIORITY_WEIGHT: Readonly<Record<NotificationPriority, number>> = Object.freeze({
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
});

const PRIORITY_SEVERITY: Readonly<
  Record<NotificationPriority, NotificationPresentationSeverity>
> = Object.freeze({
  urgent: "critical",
  high: "warning",
  normal: "info",
  low: "subtle",
});

const PRIORITY_LABEL: Readonly<Record<NotificationPriority, string>> = Object.freeze({
  urgent: "Urgent",
  high: "High priority",
  normal: "Normal",
  low: "Low priority",
});

export function getNotificationPriorityWeight(priority: NotificationPriority): number {
  return PRIORITY_WEIGHT[priority];
}

export function mapNotificationPriorityToSeverity(
  priority: NotificationPriority,
): NotificationPresentationSeverity {
  return PRIORITY_SEVERITY[priority];
}

export function getNotificationPriorityLabel(priority: NotificationPriority): string {
  return PRIORITY_LABEL[priority];
}

export function compareNotificationPriority(
  left: NotificationPriority,
  right: NotificationPriority,
): number {
  return PRIORITY_WEIGHT[left] - PRIORITY_WEIGHT[right];
}
