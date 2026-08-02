import type { DeliveryRecord, NotificationRecord } from "../domain/types";

export type NotificationHistoryStore = {
  saveNotification(record: NotificationRecord): void;
  getNotification(notificationId: string): NotificationRecord | undefined;
  listNotifications(tenantId: string): readonly NotificationRecord[];
};

export function createInMemoryNotificationHistoryStore(): NotificationHistoryStore {
  const byId = new Map<string, NotificationRecord>();
  return {
    saveNotification(record) {
      byId.set(record.notificationId, record);
    },
    getNotification(notificationId) {
      return byId.get(notificationId);
    },
    listNotifications(tenantId) {
      return [...byId.values()].filter((n) => n.tenantId === tenantId);
    },
  };
}

export type DeliveryHistoryView = {
  readonly notification: NotificationRecord;
  readonly deliveries: readonly DeliveryRecord[];
};
