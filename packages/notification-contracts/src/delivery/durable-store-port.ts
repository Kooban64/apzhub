import type {
  NotificationDeliveryId,
  NotificationDeliveryLeaseFields,
  NotificationDeliveryRecord,
  NotificationDeliveryTry,
  NotificationInAppItem,
  NotificationIntent,
  NotificationIntentId,
} from "./domain";
import type { NotificationDeliveryStatus, NotificationFailureClass } from "./lifecycle";
import type {
  NotificationDeliveryAdminAuditRecord,
  NotificationDeliveryAdminListFilter,
  NotificationDeliveryAdminListResult,
} from "./admin";

export type PersistRetryScheduleInput = {
  readonly status: "retry_scheduled";
  readonly nextAttemptAt: string;
  readonly attemptCount: number;
  readonly lastFailureClass?: NotificationFailureClass;
  readonly lastFailureCode?: string;
  readonly updatedAt: string;
  /** Clears lease fields when scheduling retry (persistence only). */
  readonly clearLease?: boolean;
};

export type PersistDeadLetterInput = {
  readonly status: "permanent_failure";
  readonly deadLetter: true;
  readonly terminalAt: string;
  readonly attemptCount?: number;
  readonly lastFailureClass?: NotificationFailureClass;
  readonly lastFailureCode?: string;
  readonly updatedAt: string;
  readonly clearLease?: boolean;
};

export type PersistLeaseInput = NotificationDeliveryLeaseFields & {
  readonly updatedAt: string;
  /** Optional status write (e.g. processing) — not a claim loop. */
  readonly status?: NotificationDeliveryStatus;
};

export type ClearLeaseInput = {
  readonly updatedAt: string;
  readonly status?: NotificationDeliveryStatus;
  readonly requeueReason?: string;
};

/**
 * Persistence port for the durable delivery plane (0065 + 0066 + P4 admin).
 */
export type NotificationDeliveryDurableStorePort = {
  readonly kind: "postgresql_durable" | "memory_durable";

  insertIntent(intent: NotificationIntent): Promise<NotificationIntent>;
  getIntent(id: NotificationIntentId): Promise<NotificationIntent | null>;
  getIntentByIdempotency(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<NotificationIntent | null>;
  updateIntent(intent: NotificationIntent): Promise<NotificationIntent>;

  insertDelivery(
    delivery: NotificationDeliveryRecord,
  ): Promise<NotificationDeliveryRecord>;
  getDelivery(id: NotificationDeliveryId): Promise<NotificationDeliveryRecord | null>;
  getDeliveryByIdempotency(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<NotificationDeliveryRecord | null>;
  updateDelivery(
    delivery: NotificationDeliveryRecord,
  ): Promise<NotificationDeliveryRecord>;

  /** Persist lease columns only (no SKIP LOCKED / claim acquisition). */
  persistLease(
    deliveryId: NotificationDeliveryId,
    lease: PersistLeaseInput,
  ): Promise<NotificationDeliveryRecord | null>;
  clearLease(
    deliveryId: NotificationDeliveryId,
    input: ClearLeaseInput,
  ): Promise<NotificationDeliveryRecord | null>;

  insertTry(tryRecord: NotificationDeliveryTry): Promise<NotificationDeliveryTry>;
  listTries(
    deliveryId: NotificationDeliveryId,
  ): Promise<readonly NotificationDeliveryTry[]>;
  updateTry(tryRecord: NotificationDeliveryTry): Promise<NotificationDeliveryTry>;

  persistRetrySchedule(
    deliveryId: NotificationDeliveryId,
    input: PersistRetryScheduleInput,
  ): Promise<NotificationDeliveryRecord | null>;

  persistDeadLetter(
    deliveryId: NotificationDeliveryId,
    input: PersistDeadLetterInput,
  ): Promise<NotificationDeliveryRecord | null>;

  /**
   * Replay persistence: insert a new delivery row (terminal source unchanged).
   * Lineage encoded in idempotency key / domain field — no claim/dispatch.
   */
  insertReplayDelivery(
    delivery: NotificationDeliveryRecord,
  ): Promise<NotificationDeliveryRecord>;

  insertInAppItem(item: NotificationInAppItem): Promise<NotificationInAppItem>;
  getInAppItem(id: string): Promise<NotificationInAppItem | null>;
  updateInAppItem(item: NotificationInAppItem): Promise<NotificationInAppItem>;
  /** Inbox query — tenant + recipient scoped. */
  listInAppItemsForUser(input: {
    readonly tenantId: string;
    readonly userId: string;
    readonly organisationId?: string;
    readonly unreadOnly?: boolean;
  }): Promise<readonly NotificationInAppItem[]>;

  /** P4 — admin list with tenant/org isolation (mandatory tenantId). */
  listDeliveriesAdmin(
    filter: NotificationDeliveryAdminListFilter,
  ): Promise<NotificationDeliveryAdminListResult>;

  /** P4 — aggregate counts for health/diagnostics (tenant scoped). */
  countDeliveriesAdmin(input: {
    readonly tenantId: string;
    readonly organisationId?: string;
  }): Promise<{
    readonly queued: number;
    readonly processing: number;
    readonly retryScheduled: number;
    readonly delivered: number;
    readonly permanentFailure: number;
    readonly deadLetter: number;
    readonly abandonedLeases: number;
    readonly oldestQueuedAt?: string;
    readonly oldestRetryAt?: string;
    readonly oldestDeadLetterAt?: string;
  }>;

  appendAdminAudit(
    record: NotificationDeliveryAdminAuditRecord,
  ): Promise<NotificationDeliveryAdminAuditRecord>;
  listAdminAudits(input: {
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly deliveryId?: NotificationDeliveryId;
    readonly limit?: number;
  }): Promise<readonly NotificationDeliveryAdminAuditRecord[]>;
};

export type NotificationDeliveryDurableStoreFactory =
  () => NotificationDeliveryDurableStorePort;
