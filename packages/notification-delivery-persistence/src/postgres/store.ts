/**
 * PostgreSQL durable Notification Delivery store (ADR-0073 / ENG-001B-P1/P2).
 * P2 adds SKIP LOCKED claim/lease engine — no dispatch.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  platformNotificationDeliveryRecord,
  platformNotificationDeliveryTry,
  platformNotificationInAppItem,
  platformNotificationIntent,
} from "@apzhub/config";
import type {
  ClearLeaseInput,
  NotificationDeliveryDurableRuntimeStore,
  NotificationDeliveryId,
  NotificationDeliveryRecord,
  NotificationDeliveryTry,
  NotificationInAppItem,
  NotificationIntent,
  PersistDeadLetterInput,
  PersistLeaseInput,
  PersistRetryScheduleInput,
} from "@apzhub/notification-contracts";
import { asNotificationDeliveryId } from "@apzhub/notification-contracts";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";

import {
  asSqlRows,
  leaseExpiresIso,
  mapSqlDeliveryRow,
  nowIso,
  passesCompletionFence,
} from "../claim-helpers";
import {
  deliveryToRow,
  inAppToRow,
  intentToRow,
  mapDeliveryRow,
  mapInAppRow,
  mapIntentRow,
  mapTryRow,
  tryToRow,
} from "../mappers";

export function createPostgresNotificationDeliveryDurableStore(
  db: DatabaseExecutor,
): NotificationDeliveryDurableRuntimeStore {
  if (!db) {
    throw new Error(
      "createPostgresNotificationDeliveryDurableStore requires db — in-memory fallback is forbidden",
    );
  }

  async function loadDelivery(
    deliveryId: NotificationDeliveryId,
  ): Promise<NotificationDeliveryRecord | null> {
    const rows = await db
      .select()
      .from(platformNotificationDeliveryRecord)
      .where(eq(platformNotificationDeliveryRecord.id, deliveryId))
      .limit(1);
    const row = rows[0];
    return row ? mapDeliveryRow(row) : null;
  }

  return {
    kind: "postgresql_durable",

    async insertIntent(intent: NotificationIntent) {
      const existing = await db
        .select()
        .from(platformNotificationIntent)
        .where(
          and(
            eq(platformNotificationIntent.tenantId, intent.tenantId),
            eq(platformNotificationIntent.idempotencyKey, intent.idempotencyKey),
          ),
        )
        .limit(1);
      if (existing[0]) return mapIntentRow(existing[0]);

      await db.insert(platformNotificationIntent).values(intentToRow(intent));
      return intent;
    },

    async getIntent(id) {
      const rows = await db
        .select()
        .from(platformNotificationIntent)
        .where(eq(platformNotificationIntent.id, id))
        .limit(1);
      const row = rows[0];
      return row ? mapIntentRow(row) : null;
    },

    async getIntentByIdempotency(tenantId, idempotencyKey) {
      const rows = await db
        .select()
        .from(platformNotificationIntent)
        .where(
          and(
            eq(platformNotificationIntent.tenantId, tenantId),
            eq(platformNotificationIntent.idempotencyKey, idempotencyKey),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapIntentRow(row) : null;
    },

    async updateIntent(intent) {
      await db
        .update(platformNotificationIntent)
        .set(intentToRow(intent))
        .where(eq(platformNotificationIntent.id, intent.id));
      return intent;
    },

    async insertDelivery(delivery: NotificationDeliveryRecord) {
      const existing = await db
        .select()
        .from(platformNotificationDeliveryRecord)
        .where(
          and(
            eq(platformNotificationDeliveryRecord.tenantId, delivery.tenantId),
            eq(
              platformNotificationDeliveryRecord.idempotencyKey,
              delivery.idempotencyKey,
            ),
          ),
        )
        .limit(1);
      if (existing[0]) return mapDeliveryRow(existing[0]);

      await db
        .insert(platformNotificationDeliveryRecord)
        .values(deliveryToRow(delivery));
      return delivery;
    },

    async getDelivery(id) {
      return loadDelivery(id);
    },

    async getDeliveryByIdempotency(tenantId, idempotencyKey) {
      const rows = await db
        .select()
        .from(platformNotificationDeliveryRecord)
        .where(
          and(
            eq(platformNotificationDeliveryRecord.tenantId, tenantId),
            eq(platformNotificationDeliveryRecord.idempotencyKey, idempotencyKey),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapDeliveryRow(row) : null;
    },

    async updateDelivery(delivery) {
      await db
        .update(platformNotificationDeliveryRecord)
        .set(deliveryToRow(delivery))
        .where(eq(platformNotificationDeliveryRecord.id, delivery.id));
      return delivery;
    },

    async persistLease(deliveryId, lease: PersistLeaseInput) {
      const patch: Record<string, unknown> = {
        claimedBy: lease.claimedBy ?? null,
        claimedAt: lease.claimedAt ? new Date(lease.claimedAt) : null,
        leaseExpiresAt: lease.leaseExpiresAt ? new Date(lease.leaseExpiresAt) : null,
        requeueReason: lease.requeueReason ?? null,
        updatedAt: new Date(lease.updatedAt),
      };
      if (lease.status) patch.status = lease.status;

      await db
        .update(platformNotificationDeliveryRecord)
        .set(patch)
        .where(eq(platformNotificationDeliveryRecord.id, deliveryId));
      return loadDelivery(deliveryId);
    },

    async clearLease(deliveryId, input: ClearLeaseInput) {
      const patch: Record<string, unknown> = {
        claimedBy: null,
        claimedAt: null,
        leaseExpiresAt: null,
        requeueReason: input.requeueReason ?? null,
        updatedAt: new Date(input.updatedAt),
      };
      if (input.status) patch.status = input.status;

      await db
        .update(platformNotificationDeliveryRecord)
        .set(patch)
        .where(eq(platformNotificationDeliveryRecord.id, deliveryId));
      return loadDelivery(deliveryId);
    },

    async insertTry(tryRecord: NotificationDeliveryTry) {
      const existing = await db
        .select()
        .from(platformNotificationDeliveryTry)
        .where(
          and(
            eq(platformNotificationDeliveryTry.deliveryId, tryRecord.deliveryId),
            eq(platformNotificationDeliveryTry.attemptNumber, tryRecord.attemptNumber),
          ),
        )
        .limit(1);
      if (existing[0]) return mapTryRow(existing[0]);

      await db.insert(platformNotificationDeliveryTry).values(tryToRow(tryRecord));
      return tryRecord;
    },

    async listTries(deliveryId) {
      const rows = await db
        .select()
        .from(platformNotificationDeliveryTry)
        .where(eq(platformNotificationDeliveryTry.deliveryId, deliveryId))
        .orderBy(asc(platformNotificationDeliveryTry.attemptNumber));
      return rows.map(mapTryRow);
    },

    async updateTry(tryRecord) {
      await db
        .update(platformNotificationDeliveryTry)
        .set(tryToRow(tryRecord))
        .where(eq(platformNotificationDeliveryTry.id, tryRecord.id));
      return tryRecord;
    },

    async persistRetrySchedule(deliveryId, input: PersistRetryScheduleInput) {
      const patch: Record<string, unknown> = {
        status: input.status,
        nextAttemptAt: new Date(input.nextAttemptAt),
        attemptCount: input.attemptCount,
        lastFailureClass: input.lastFailureClass ?? null,
        lastFailureCode: input.lastFailureCode ?? null,
        updatedAt: new Date(input.updatedAt),
      };
      if (input.clearLease) {
        patch.claimedBy = null;
        patch.claimedAt = null;
        patch.leaseExpiresAt = null;
      }

      await db
        .update(platformNotificationDeliveryRecord)
        .set(patch)
        .where(eq(platformNotificationDeliveryRecord.id, deliveryId));
      return loadDelivery(deliveryId);
    },

    async persistDeadLetter(deliveryId, input: PersistDeadLetterInput) {
      const patch: Record<string, unknown> = {
        status: input.status,
        deadLetter: input.deadLetter,
        terminalAt: new Date(input.terminalAt),
        lastFailureClass: input.lastFailureClass ?? null,
        lastFailureCode: input.lastFailureCode ?? null,
        updatedAt: new Date(input.updatedAt),
      };
      if (input.attemptCount !== undefined) patch.attemptCount = input.attemptCount;
      if (input.clearLease) {
        patch.claimedBy = null;
        patch.claimedAt = null;
        patch.leaseExpiresAt = null;
      }

      await db
        .update(platformNotificationDeliveryRecord)
        .set(patch)
        .where(eq(platformNotificationDeliveryRecord.id, deliveryId));
      return loadDelivery(deliveryId);
    },

    async insertReplayDelivery(delivery) {
      return this.insertDelivery(delivery);
    },

    async insertInAppItem(item: NotificationInAppItem) {
      await db.insert(platformNotificationInAppItem).values(inAppToRow(item));
      return item;
    },

    async getInAppItem(id) {
      const rows = await db
        .select()
        .from(platformNotificationInAppItem)
        .where(eq(platformNotificationInAppItem.id, id))
        .limit(1);
      const row = rows[0];
      return row ? mapInAppRow(row) : null;
    },

    async updateInAppItem(item) {
      await db
        .update(platformNotificationInAppItem)
        .set(inAppToRow(item))
        .where(eq(platformNotificationInAppItem.id, item.id));
      return item;
    },

    async listInAppItemsForUser(input) {
      const conditions = [
        eq(platformNotificationInAppItem.tenantId, input.tenantId),
        eq(platformNotificationInAppItem.userId, input.userId),
      ];
      if (input.organisationId !== undefined) {
        conditions.push(
          eq(platformNotificationInAppItem.organisationId, input.organisationId),
        );
      }
      if (input.unreadOnly) {
        conditions.push(isNull(platformNotificationInAppItem.readAt));
      }
      const rows = await db
        .select()
        .from(platformNotificationInAppItem)
        .where(and(...conditions))
        .orderBy(desc(platformNotificationInAppItem.createdAt));
      return rows.map(mapInAppRow);
    },

    async claimBatch(input) {
      const now = nowIso(input.now);
      const leaseExpires = leaseExpiresIso(now, input.leaseTtlMs);
      const result = await db.execute(sql`
        WITH candidates AS (
          SELECT id
          FROM platform_notification_delivery_record
          WHERE status = 'queued'
             OR (
               status = 'retry_scheduled'
               AND (next_attempt_at IS NULL OR next_attempt_at <= ${now}::timestamptz)
             )
          ORDER BY next_attempt_at NULLS FIRST, created_at ASC
          LIMIT ${input.limit}
          FOR UPDATE SKIP LOCKED
        )
        UPDATE platform_notification_delivery_record AS d
        SET status = 'processing',
            claimed_by = ${input.workerId},
            claimed_at = ${now}::timestamptz,
            lease_expires_at = ${leaseExpires}::timestamptz,
            requeue_reason = NULL,
            updated_at = ${now}::timestamptz
        FROM candidates
        WHERE d.id = candidates.id
        RETURNING d.*
      `);
      return asSqlRows(result).map(mapSqlDeliveryRow);
    },

    async reclaimExpiredLeases(input) {
      const now = nowIso(input.now);
      const result = await db.execute(sql`
        WITH expired AS (
          SELECT id, attempt_count
          FROM platform_notification_delivery_record
          WHERE status = 'processing'
            AND lease_expires_at IS NOT NULL
            AND lease_expires_at < ${now}::timestamptz
          ORDER BY lease_expires_at ASC
          LIMIT ${input.limit}
          FOR UPDATE SKIP LOCKED
        )
        UPDATE platform_notification_delivery_record AS d
        SET status = CASE
              WHEN expired.attempt_count > 0 THEN 'retry_scheduled'
              ELSE 'queued'
            END,
            claimed_by = NULL,
            claimed_at = NULL,
            lease_expires_at = NULL,
            requeue_reason = 'lease_expired',
            updated_at = ${now}::timestamptz
        FROM expired
        WHERE d.id = expired.id
        RETURNING d.*
      `);
      return asSqlRows(result).map(mapSqlDeliveryRow);
    },

    async renewLease(input) {
      const now = nowIso(input.now);
      const leaseExpires = leaseExpiresIso(now, input.leaseTtlMs);
      const result = await db.execute(sql`
        UPDATE platform_notification_delivery_record
        SET lease_expires_at = ${leaseExpires}::timestamptz,
            updated_at = ${now}::timestamptz
        WHERE id = ${input.deliveryId}
          AND status = 'processing'
          AND claimed_by = ${input.workerId}
        RETURNING *
      `);
      const row = asSqlRows(result)[0];
      return row ? mapSqlDeliveryRow(row) : null;
    },

    async releaseLease(input) {
      const now = nowIso(input.now);
      const current = await loadDelivery(input.deliveryId);
      if (!current) return null;
      if (current.claimedBy !== input.workerId || current.status !== "processing") {
        return null;
      }
      const status =
        input.status ?? (current.attemptCount > 0 ? "retry_scheduled" : "queued");
      const result = await db.execute(sql`
        UPDATE platform_notification_delivery_record
        SET status = ${status},
            claimed_by = NULL,
            claimed_at = NULL,
            lease_expires_at = NULL,
            requeue_reason = ${input.requeueReason ?? null},
            updated_at = ${now}::timestamptz
        WHERE id = ${input.deliveryId}
          AND status = 'processing'
          AND claimed_by = ${input.workerId}
        RETURNING *
      `);
      const row = asSqlRows(result)[0];
      return row ? mapSqlDeliveryRow(row) : null;
    },

    async validateClaim(input) {
      const current = await loadDelivery(input.deliveryId);
      return passesCompletionFence(current, input);
    },

    async completeDeliverySuccess(input) {
      const current = await loadDelivery(input.deliveryId);
      if (!passesCompletionFence(current, input)) return null;
      const now = nowIso(input.now);
      await this.updateTry(input.tryRecord);
      if (input.inAppItem) {
        await this.insertInAppItem(input.inAppItem);
      }
      const result = await db.execute(sql`
        UPDATE platform_notification_delivery_record
        SET status = 'delivered',
            attempt_count = ${input.attemptCount},
            receipt_level = ${input.receiptLevel},
            in_app_notification_id = ${input.inAppItem?.id ?? current.inAppNotificationId ?? null},
            next_attempt_at = NULL,
            last_failure_class = NULL,
            last_failure_code = NULL,
            claimed_by = NULL,
            claimed_at = NULL,
            lease_expires_at = NULL,
            requeue_reason = NULL,
            terminal_at = ${now}::timestamptz,
            updated_at = ${now}::timestamptz
        WHERE id = ${input.deliveryId}
          AND status = 'processing'
          AND claimed_by = ${input.workerId}
        RETURNING *
      `);
      const row = asSqlRows(result)[0];
      return row ? mapSqlDeliveryRow(row) : null;
    },

    async completeDeliveryRetry(input) {
      const current = await loadDelivery(input.deliveryId);
      if (!passesCompletionFence(current, input)) return null;
      const now = nowIso(input.now);
      await this.updateTry(input.tryRecord);
      const result = await db.execute(sql`
        UPDATE platform_notification_delivery_record
        SET status = 'retry_scheduled',
            attempt_count = ${input.attemptCount},
            next_attempt_at = ${input.nextAttemptAt}::timestamptz,
            last_failure_class = ${input.lastFailureClass ?? null},
            last_failure_code = ${input.lastFailureCode ?? null},
            receipt_level = ${input.receiptLevel ?? current.receiptLevel},
            claimed_by = NULL,
            claimed_at = NULL,
            lease_expires_at = NULL,
            requeue_reason = NULL,
            updated_at = ${now}::timestamptz
        WHERE id = ${input.deliveryId}
          AND status = 'processing'
          AND claimed_by = ${input.workerId}
        RETURNING *
      `);
      const row = asSqlRows(result)[0];
      return row ? mapSqlDeliveryRow(row) : null;
    },

    async completeDeliveryDeadLetter(input) {
      const current = await loadDelivery(input.deliveryId);
      if (!passesCompletionFence(current, input)) return null;
      const now = nowIso(input.now);
      await this.updateTry(input.tryRecord);
      const result = await db.execute(sql`
        UPDATE platform_notification_delivery_record
        SET status = 'permanent_failure',
            dead_letter = TRUE,
            terminal_at = ${input.terminalAt}::timestamptz,
            attempt_count = ${input.attemptCount},
            last_failure_class = ${input.lastFailureClass ?? null},
            last_failure_code = ${input.lastFailureCode ?? null},
            receipt_level = ${input.receiptLevel ?? current.receiptLevel},
            claimed_by = NULL,
            claimed_at = NULL,
            lease_expires_at = NULL,
            requeue_reason = NULL,
            updated_at = ${now}::timestamptz
        WHERE id = ${input.deliveryId}
          AND status = 'processing'
          AND claimed_by = ${input.workerId}
        RETURNING *
      `);
      const row = asSqlRows(result)[0];
      return row ? mapSqlDeliveryRow(row) : null;
    },

    async listDeliveriesAdmin(filter) {
      const result = await db.execute(sql`
        SELECT *
        FROM platform_notification_delivery_record
        WHERE tenant_id = ${filter.tenantId}
      `);
      const statuses = filter.status
        ? Array.isArray(filter.status)
          ? filter.status
          : [filter.status]
        : undefined;
      const search = filter.search?.trim().toLowerCase();
      let rows = asSqlRows(result)
        .map(mapSqlDeliveryRow)
        .filter((row) => {
          if (
            filter.organisationId !== undefined &&
            (row.organisationId ?? undefined) !== filter.organisationId
          ) {
            return false;
          }
          if (statuses && !statuses.includes(row.status)) return false;
          if (filter.deadLetterOnly && !row.deadLetter) return false;
          if (filter.processingLeasesOnly) {
            if (row.status !== "processing" || !row.claimedBy) return false;
          }
          if (filter.retryScheduledOnly && row.status !== "retry_scheduled") {
            return false;
          }
          if (search) {
            const hay =
              `${row.id} ${row.userId} ${row.correlationId} ${row.idempotencyKey}`.toLowerCase();
            if (!hay.includes(search)) return false;
          }
          return true;
        });
      const sortBy = filter.sortBy ?? "createdAt";
      const dir = filter.sortDir === "asc" ? 1 : -1;
      rows = rows.sort((a, b) => {
        const av = (a[sortBy] as string | undefined) ?? "";
        const bv = (b[sortBy] as string | undefined) ?? "";
        if (av === bv) return 0;
        return av < bv ? -1 * dir : 1 * dir;
      });
      const total = rows.length;
      const limit = Math.min(Math.max(filter.limit ?? 50, 1), 500);
      const offset = Math.max(filter.offset ?? 0, 0);
      return { items: rows.slice(offset, offset + limit), total, limit, offset };
    },

    async countDeliveriesAdmin(input) {
      const listed = await this.listDeliveriesAdmin({
        tenantId: input.tenantId,
        organisationId: input.organisationId,
        limit: 100_000,
        offset: 0,
      });
      const now = nowIso();
      const rows = listed.items;
      const byStatus = (status: string) => rows.filter((r) => r.status === status);
      const queuedRows = byStatus("queued");
      const retryRows = byStatus("retry_scheduled");
      const deadRows = rows.filter((r) => r.deadLetter);
      const abandoned = rows.filter(
        (r) =>
          r.status === "processing" && !!r.leaseExpiresAt && r.leaseExpiresAt < now,
      );
      const oldest = (
        list: typeof rows,
        field: "createdAt" | "nextAttemptAt" | "terminalAt",
      ) => {
        const sorted = [...list].sort((a, b) =>
          (a[field] ?? "").localeCompare(b[field] ?? ""),
        );
        return sorted[0]?.[field];
      };
      return {
        queued: queuedRows.length,
        processing: byStatus("processing").length,
        retryScheduled: retryRows.length,
        delivered: byStatus("delivered").length,
        permanentFailure: byStatus("permanent_failure").length,
        deadLetter: deadRows.length,
        abandonedLeases: abandoned.length,
        oldestQueuedAt: oldest(queuedRows, "createdAt"),
        oldestRetryAt: oldest(retryRows, "nextAttemptAt"),
        oldestDeadLetterAt: oldest(deadRows, "terminalAt"),
      };
    },

    async appendAdminAudit(record) {
      await db.execute(sql`
        INSERT INTO platform_notification_delivery_admin_audit (
          id, tenant_id, organisation_id, actor_user_id, operation, delivery_id,
          reason, result, detail, correlation_id, created_at
        ) VALUES (
          ${record.id},
          ${record.tenantId},
          ${record.organisationId ?? null},
          ${record.actorUserId},
          ${record.operation},
          ${record.deliveryId},
          ${record.reason ?? null},
          ${record.result},
          ${record.detail ?? null},
          ${record.correlationId},
          ${record.createdAt}::timestamptz
        )
      `);
      return record;
    },

    async listAdminAudits(input) {
      const limit = Math.min(input.limit ?? 100, 500);
      const result = await db.execute(sql`
        SELECT *
        FROM platform_notification_delivery_admin_audit
        WHERE tenant_id = ${input.tenantId}
          AND (${input.organisationId ?? null}::text IS NULL OR organisation_id = ${input.organisationId ?? null})
          AND (${input.deliveryId ?? null}::text IS NULL OR delivery_id = ${input.deliveryId ?? null})
        ORDER BY created_at DESC
        LIMIT ${limit}
      `);
      return asSqlRows(result).map((row) => {
        const r = row as Record<string, unknown>;
        return {
          id: String(r.id),
          tenantId: String(r.tenant_id),
          organisationId: r.organisation_id ? String(r.organisation_id) : undefined,
          actorUserId: String(r.actor_user_id),
          operation: String(r.operation),
          deliveryId: asNotificationDeliveryId(String(r.delivery_id)),
          reason: r.reason ? String(r.reason) : undefined,
          result: r.result as "success" | "denied" | "failed" | "rejected",
          detail: r.detail ? String(r.detail) : undefined,
          correlationId: String(r.correlation_id),
          createdAt:
            r.created_at instanceof Date
              ? r.created_at.toISOString()
              : String(r.created_at),
        };
      });
    },
  };
}
