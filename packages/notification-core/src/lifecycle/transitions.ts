/**
 * Notification lifecycle transitions (APZNOTIFY-001).
 * Fail closed — only explicitly allowed transitions succeed.
 * No delivery engine — status metadata only.
 */

import type { NotificationStatus } from "@apzhub/notification-contracts";
import {
  isNotificationStatus,
  NOTIFICATION_STATUSES,
} from "@apzhub/notification-contracts";

import { NotificationDomainError } from "../ports/repository-ports";

const ALLOWED: Readonly<
  Record<NotificationStatus, readonly NotificationStatus[]>
> = {
  draft: ["pending", "expired", "archived"],
  pending: ["queued", "draft", "dismissed", "expired", "archived"],
  queued: ["delivered", "dismissed", "expired", "archived"],
  delivered: ["read", "acknowledged", "dismissed", "expired", "archived"],
  read: ["acknowledged", "dismissed", "expired", "archived"],
  acknowledged: ["dismissed", "expired", "archived"],
  dismissed: ["expired", "archived"],
  expired: ["archived"],
  archived: ["draft"],
};

export function listAllowedNotificationLifecycleTransitions(
  from: NotificationStatus,
): readonly NotificationStatus[] {
  return ALLOWED[from];
}

export { isNotificationStatus, NOTIFICATION_STATUSES };

export function canTransitionNotificationLifecycle(
  from: NotificationStatus,
  to: NotificationStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED[from].includes(to);
}

export function assertNotificationLifecycleTransition(
  from: NotificationStatus,
  to: NotificationStatus,
): void {
  if (!canTransitionNotificationLifecycle(from, to)) {
    throw new NotificationDomainError(
      "invalid_lifecycle_transition",
      `Cannot transition notification lifecycle from ${from} to ${to}`,
      { from, to },
    );
  }
}
