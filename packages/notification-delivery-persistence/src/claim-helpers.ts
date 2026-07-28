/**
 * Shared helpers for claim/lease engine (ENG-001B-P2).
 */

import type { NotificationDeliveryRecord } from "@apzhub/notification-contracts";
import {
  asNotificationDeliveryId,
  asNotificationIntentId,
} from "@apzhub/notification-contracts";
import type {
  NotificationDeliveryStatus,
  NotificationFailureClass,
  NotificationReceiptLevel,
} from "@apzhub/notification-contracts";

export function nowIso(now?: string): string {
  return now ?? new Date().toISOString();
}

export function leaseExpiresIso(now: string, leaseTtlMs: number): string {
  return new Date(new Date(now).getTime() + leaseTtlMs).toISOString();
}

export function isClaimable(
  delivery: NotificationDeliveryRecord,
  now: string,
): boolean {
  if (delivery.status === "queued") return true;
  if (delivery.status === "retry_scheduled") {
    if (!delivery.nextAttemptAt) return true;
    return delivery.nextAttemptAt <= now;
  }
  return false;
}

export function releaseStatusFor(
  delivery: NotificationDeliveryRecord,
  explicit?: "queued" | "retry_scheduled",
): "queued" | "retry_scheduled" {
  if (explicit) return explicit;
  return delivery.attemptCount > 0 ? "retry_scheduled" : "queued";
}

type SqlDeliveryRow = {
  id: string;
  intent_id: string;
  tenant_id: string;
  organisation_id: string | null;
  user_id: string;
  channel: string;
  provider_id: string;
  status: string;
  receipt_level: string;
  idempotency_key: string;
  correlation_id: string;
  attempt_count: number;
  max_attempts: number;
  next_attempt_at: string | Date | null;
  last_failure_class: string | null;
  last_failure_code: string | null;
  in_app_notification_id: string | null;
  terminal_at: string | Date | null;
  dead_letter: boolean;
  claimed_by: string | null;
  claimed_at: string | Date | null;
  lease_expires_at: string | Date | null;
  requeue_reason: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

function toIso(value: string | Date | null | undefined): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString();
  return value;
}

export function mapSqlDeliveryRow(row: SqlDeliveryRow): NotificationDeliveryRecord {
  return {
    id: asNotificationDeliveryId(row.id),
    intentId: asNotificationIntentId(row.intent_id),
    tenantId: row.tenant_id,
    organisationId: row.organisation_id ?? undefined,
    userId: row.user_id,
    channel: "in_app",
    providerId: "in_app",
    status: row.status as NotificationDeliveryStatus,
    receiptLevel: row.receipt_level as NotificationReceiptLevel,
    idempotencyKey: row.idempotency_key,
    correlationId: row.correlation_id,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    nextAttemptAt: toIso(row.next_attempt_at),
    lastFailureClass:
      (row.last_failure_class as NotificationFailureClass | null) ?? undefined,
    lastFailureCode: row.last_failure_code ?? undefined,
    inAppNotificationId: row.in_app_notification_id ?? undefined,
    terminalAt: toIso(row.terminal_at),
    deadLetter: row.dead_letter,
    claimedBy: row.claimed_by ?? undefined,
    claimedAt: toIso(row.claimed_at),
    leaseExpiresAt: toIso(row.lease_expires_at),
    requeueReason: row.requeue_reason ?? undefined,
    createdAt: toIso(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date(0).toISOString(),
  };
}

export function asSqlRows(result: unknown): SqlDeliveryRow[] {
  if (Array.isArray(result)) return result as SqlDeliveryRow[];
  if (
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows: unknown }).rows)
  ) {
    return (result as { rows: SqlDeliveryRow[] }).rows;
  }
  return [];
}

/** Lease + optional tenant/org fencing for completion writes. */
export function passesCompletionFence(
  current: NotificationDeliveryRecord | null | undefined,
  input: {
    readonly workerId: string;
    readonly tenantId?: string;
    readonly organisationId?: string;
  },
): current is NotificationDeliveryRecord {
  if (!current) return false;
  if (current.status !== "processing") return false;
  if (current.claimedBy !== input.workerId) return false;
  if (input.tenantId !== undefined && current.tenantId !== input.tenantId) {
    return false;
  }
  if (
    input.organisationId !== undefined &&
    (current.organisationId ?? undefined) !== input.organisationId
  ) {
    return false;
  }
  return true;
}

/** Redact secrets / credentials from safe error notes. */
export function redactErrorMetadata(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value
    .replace(
      /(password|secret|token|api[_-]?key|authorization)\s*[:=]\s*\S+/gi,
      "$1=[REDACTED]",
    )
    .slice(0, 500);
}
