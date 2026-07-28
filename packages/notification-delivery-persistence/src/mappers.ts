/**
 * Row ↔ domain mappers for Notification Delivery plane (0065 + 0066).
 */

import type {
  platformNotificationDeliveryRecord,
  platformNotificationDeliveryTry,
  platformNotificationInAppItem,
  platformNotificationIntent,
} from "@apzhub/config";
import type {
  NotificationDeliveryRecord,
  NotificationDeliveryTry,
  NotificationInAppItem,
  NotificationIntent,
  NotificationPriority,
  NotificationRecipientHint,
  NotificationSourceProduct,
  NotificationDeliveryStatus,
  NotificationFailureClass,
  NotificationIntentStatus,
  NotificationReceiptLevel,
} from "@apzhub/notification-contracts";
import {
  asNotificationDeliveryId,
  asNotificationDeliveryTryId,
  asNotificationIntentId,
} from "@apzhub/notification-contracts";

type IntentRow = typeof platformNotificationIntent.$inferSelect;
type DeliveryRow = typeof platformNotificationDeliveryRecord.$inferSelect;
type TryRow = typeof platformNotificationDeliveryTry.$inferSelect;
type InAppRow = typeof platformNotificationInAppItem.$inferSelect;

function toIso(value: Date | null | undefined): string | undefined {
  return value ? value.toISOString() : undefined;
}

export function mapIntentRow(row: IntentRow): NotificationIntent {
  return {
    id: asNotificationIntentId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    sourceProduct: row.sourceProduct as NotificationSourceProduct,
    sourceEvent: row.sourceEvent ?? undefined,
    category: row.category,
    priority: row.priority as NotificationPriority,
    subject: row.subject,
    summary: row.summary ?? undefined,
    payload: (row.payloadJson ?? {}) as Readonly<Record<string, unknown>>,
    recipientHints: (row.recipientHintsJson ??
      []) as readonly NotificationRecipientHint[],
    mandatory: row.mandatory,
    correlationId: row.correlationId,
    idempotencyKey: row.idempotencyKey,
    createdAt: row.createdAt.toISOString(),
    requestedBy: row.requestedBy,
    expiresAt: toIso(row.expiresAt),
    templateId: row.templateId ?? undefined,
    templateVersion: row.templateVersion ?? undefined,
    metadata: row.metadataJson ?? undefined,
    status: row.status as NotificationIntentStatus,
    suppressionReason: row.suppressionReason ?? undefined,
    policyRef: row.policyRef ?? undefined,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function intentToRow(
  intent: NotificationIntent,
): typeof platformNotificationIntent.$inferInsert {
  return {
    id: intent.id,
    tenantId: intent.tenantId,
    organisationId: intent.organisationId ?? null,
    sourceProduct: intent.sourceProduct,
    sourceEvent: intent.sourceEvent ?? null,
    category: intent.category,
    priority: intent.priority,
    subject: intent.subject,
    summary: intent.summary ?? null,
    payloadJson: { ...intent.payload },
    recipientHintsJson: [...intent.recipientHints],
    mandatory: intent.mandatory,
    correlationId: intent.correlationId,
    idempotencyKey: intent.idempotencyKey,
    createdAt: new Date(intent.createdAt),
    requestedBy: intent.requestedBy,
    expiresAt: intent.expiresAt ? new Date(intent.expiresAt) : null,
    templateId: intent.templateId ?? null,
    templateVersion: intent.templateVersion ?? null,
    metadataJson: intent.metadata ? { ...intent.metadata } : null,
    status: intent.status,
    suppressionReason: intent.suppressionReason ?? null,
    policyRef: intent.policyRef ?? null,
    updatedAt: new Date(intent.updatedAt),
  };
}

export function mapDeliveryRow(row: DeliveryRow): NotificationDeliveryRecord {
  return {
    id: asNotificationDeliveryId(row.id),
    intentId: asNotificationIntentId(row.intentId),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    userId: row.userId,
    channel: "in_app",
    providerId: "in_app",
    status: row.status as NotificationDeliveryStatus,
    receiptLevel: row.receiptLevel as NotificationReceiptLevel,
    idempotencyKey: row.idempotencyKey,
    correlationId: row.correlationId,
    attemptCount: row.attemptCount,
    maxAttempts: row.maxAttempts,
    nextAttemptAt: toIso(row.nextAttemptAt),
    lastFailureClass:
      (row.lastFailureClass as NotificationFailureClass | null) ?? undefined,
    lastFailureCode: row.lastFailureCode ?? undefined,
    inAppNotificationId: row.inAppNotificationId ?? undefined,
    terminalAt: toIso(row.terminalAt),
    deadLetter: row.deadLetter,
    claimedBy: row.claimedBy ?? undefined,
    claimedAt: toIso(row.claimedAt),
    leaseExpiresAt: toIso(row.leaseExpiresAt),
    requeueReason: row.requeueReason ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function deliveryToRow(
  delivery: NotificationDeliveryRecord,
): typeof platformNotificationDeliveryRecord.$inferInsert {
  return {
    id: delivery.id,
    intentId: delivery.intentId,
    tenantId: delivery.tenantId,
    organisationId: delivery.organisationId ?? null,
    userId: delivery.userId,
    channel: delivery.channel,
    providerId: delivery.providerId,
    status: delivery.status,
    receiptLevel: delivery.receiptLevel,
    idempotencyKey: delivery.idempotencyKey,
    correlationId: delivery.correlationId,
    attemptCount: delivery.attemptCount,
    maxAttempts: delivery.maxAttempts,
    nextAttemptAt: delivery.nextAttemptAt ? new Date(delivery.nextAttemptAt) : null,
    lastFailureClass: delivery.lastFailureClass ?? null,
    lastFailureCode: delivery.lastFailureCode ?? null,
    inAppNotificationId: delivery.inAppNotificationId ?? null,
    terminalAt: delivery.terminalAt ? new Date(delivery.terminalAt) : null,
    deadLetter: delivery.deadLetter,
    claimedBy: delivery.claimedBy ?? null,
    claimedAt: delivery.claimedAt ? new Date(delivery.claimedAt) : null,
    leaseExpiresAt: delivery.leaseExpiresAt ? new Date(delivery.leaseExpiresAt) : null,
    requeueReason: delivery.requeueReason ?? null,
    createdAt: new Date(delivery.createdAt),
    updatedAt: new Date(delivery.updatedAt),
  };
}

export function mapTryRow(row: TryRow): NotificationDeliveryTry {
  return {
    id: asNotificationDeliveryTryId(row.id),
    deliveryId: asNotificationDeliveryId(row.deliveryId),
    attemptNumber: row.attemptNumber,
    providerId: "in_app",
    startedAt: row.startedAt.toISOString(),
    finishedAt: toIso(row.finishedAt),
    receiptLevel: row.receiptLevel as NotificationReceiptLevel,
    failureClass: (row.failureClass as NotificationFailureClass | null) ?? undefined,
    failureCode: row.failureCode ?? undefined,
    note: row.note ?? undefined,
    providerReference: row.providerReference ?? undefined,
    workerId: row.workerId ?? undefined,
  };
}

export function tryToRow(
  tryRecord: NotificationDeliveryTry,
): typeof platformNotificationDeliveryTry.$inferInsert {
  return {
    id: tryRecord.id,
    deliveryId: tryRecord.deliveryId,
    attemptNumber: tryRecord.attemptNumber,
    providerId: tryRecord.providerId,
    startedAt: new Date(tryRecord.startedAt),
    finishedAt: tryRecord.finishedAt ? new Date(tryRecord.finishedAt) : null,
    receiptLevel: tryRecord.receiptLevel,
    failureClass: tryRecord.failureClass ?? null,
    failureCode: tryRecord.failureCode ?? null,
    note: tryRecord.note ?? null,
    providerReference: tryRecord.providerReference ?? null,
    workerId: tryRecord.workerId ?? null,
  };
}

export function mapInAppRow(row: InAppRow): NotificationInAppItem {
  return {
    id: row.id,
    deliveryId: asNotificationDeliveryId(row.deliveryId),
    intentId: asNotificationIntentId(row.intentId),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    userId: row.userId,
    category: row.category,
    priority: row.priority as NotificationPriority,
    title: row.title,
    summary: row.summary ?? undefined,
    body: row.body ?? undefined,
    sourceProduct: row.sourceProduct as NotificationSourceProduct,
    sourceObjectRef: row.sourceObjectRef ?? undefined,
    readAt: toIso(row.readAt),
    createdAt: row.createdAt.toISOString(),
    expiresAt: toIso(row.expiresAt),
  };
}

export function inAppToRow(
  item: NotificationInAppItem,
): typeof platformNotificationInAppItem.$inferInsert {
  return {
    id: item.id,
    deliveryId: item.deliveryId,
    intentId: item.intentId,
    tenantId: item.tenantId,
    organisationId: item.organisationId ?? null,
    userId: item.userId,
    category: item.category,
    priority: item.priority,
    title: item.title,
    summary: item.summary ?? null,
    body: item.body ?? null,
    sourceProduct: item.sourceProduct,
    sourceObjectRef: item.sourceObjectRef ?? null,
    readAt: item.readAt ? new Date(item.readAt) : null,
    createdAt: new Date(item.createdAt),
    expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
  };
}
