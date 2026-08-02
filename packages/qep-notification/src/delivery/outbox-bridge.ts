/**
 * S08 Outbox integration — durable notification delivery intents.
 * Optional: when configured, delivery intents are enqueued for reliable drain.
 */

import {
  enqueueOutboxEvent,
  type EnqueueResult,
  type OutboxStore,
} from "@apzhub/platform-outbox";

export const NOTIFICATION_DELIVERY_OUTBOX_EVENT =
  "qep.notification.delivery.requested" as const;

export type NotificationDeliveryIntent = {
  readonly notificationId: string;
  readonly deliveryId: string;
  readonly tenantId: string;
  readonly channelId: string;
  readonly correlationId: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export async function enqueueNotificationDeliveryIntent(input: {
  readonly store: OutboxStore;
  readonly intent: NotificationDeliveryIntent;
  readonly now: string;
}): Promise<EnqueueResult> {
  return enqueueOutboxEvent(input.store, {
    outboxEventId: `outbox-notify-${input.intent.deliveryId}`,
    tenantId: input.intent.tenantId,
    aggregateType: "qep.notification.delivery",
    aggregateId: input.intent.notificationId,
    eventType: NOTIFICATION_DELIVERY_OUTBOX_EVENT,
    payload: {
      ...input.intent.payload,
      notificationId: input.intent.notificationId,
      deliveryId: input.intent.deliveryId,
      channelId: input.intent.channelId,
      correlationId: input.intent.correlationId,
    },
    idempotencyKey: `notify-delivery:${input.intent.deliveryId}`,
    createdAt: input.now,
    correlationId: input.intent.correlationId,
  });
}
