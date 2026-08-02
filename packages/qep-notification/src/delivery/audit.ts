import type { NotificationAuditEntry } from "../domain/types";

export type NotificationAudit = {
  record(
    entry: Omit<NotificationAuditEntry, "auditId"> & { readonly auditId?: string },
  ): void;
  list(notificationId?: string): readonly NotificationAuditEntry[];
};

export function createInMemoryNotificationAudit(): NotificationAudit {
  const entries: NotificationAuditEntry[] = [];
  let seq = 0;
  return {
    record(entry) {
      entries.push({
        auditId: entry.auditId ?? `naudit-${++seq}`,
        notificationId: entry.notificationId,
        ...(entry.deliveryId ? { deliveryId: entry.deliveryId } : {}),
        action: entry.action,
        detail: entry.detail,
        at: entry.at,
        correlationId: entry.correlationId,
        ...(entry.metadata ? { metadata: entry.metadata } : {}),
      });
    },
    list(notificationId) {
      return notificationId
        ? entries.filter((e) => e.notificationId === notificationId)
        : [...entries];
    },
  };
}
