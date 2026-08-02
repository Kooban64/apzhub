import type {
  DeliveryFailureClass,
  DeliveryRecord,
  DeliveryStatus,
} from "../domain/types";

export type DeliveryStore = {
  save(record: DeliveryRecord): void;
  get(deliveryId: string): DeliveryRecord | undefined;
  listByNotification(notificationId: string): readonly DeliveryRecord[];
  list(tenantId?: string): readonly DeliveryRecord[];
  updateStatus(input: {
    readonly deliveryId: string;
    readonly status: DeliveryStatus;
    readonly now: string;
    readonly failureClass?: DeliveryFailureClass;
    readonly lastError?: string;
    readonly attempt?: number;
  }): DeliveryRecord | undefined;
};

export function createInMemoryDeliveryStore(): DeliveryStore {
  const byId = new Map<string, DeliveryRecord>();
  return {
    save(record) {
      byId.set(record.deliveryId, record);
    },
    get(deliveryId) {
      return byId.get(deliveryId);
    },
    listByNotification(notificationId) {
      return [...byId.values()].filter((r) => r.notificationId === notificationId);
    },
    list(tenantId) {
      const all = [...byId.values()];
      return tenantId ? all.filter((r) => r.tenantId === tenantId) : all;
    },
    updateStatus(input) {
      const existing = byId.get(input.deliveryId);
      if (!existing) return undefined;
      const next: DeliveryRecord = {
        ...existing,
        status: input.status,
        updatedAt: input.now,
        attempt: input.attempt ?? existing.attempt,
        ...(input.failureClass !== undefined
          ? { failureClass: input.failureClass }
          : {}),
        ...(input.lastError !== undefined ? { lastError: input.lastError } : {}),
        ...(input.status === "delivered" || input.status === "acknowledged"
          ? { deliveredAt: existing.deliveredAt ?? input.now }
          : {}),
        ...(input.status === "acknowledged" ? { acknowledgedAt: input.now } : {}),
      };
      byId.set(input.deliveryId, next);
      return next;
    },
  };
}
