/**
 * Claim, lease, and fenced completion ports (ADR-0073 / ENG-001B-P2/P3).
 */

import type {
  NotificationDeliveryId,
  NotificationDeliveryRecord,
  NotificationDeliveryTry,
  NotificationInAppItem,
} from "./domain";
import type { NotificationDeliveryDurableStorePort } from "./durable-store-port";
import type { NotificationFailureClass, NotificationReceiptLevel } from "./lifecycle";

export type ClaimBatchInput = {
  readonly workerId: string;
  readonly limit: number;
  readonly leaseTtlMs: number;
  readonly now?: string;
};

export type ReclaimExpiredLeasesInput = {
  readonly limit: number;
  readonly now?: string;
};

export type RenewLeaseInput = {
  readonly deliveryId: NotificationDeliveryId;
  readonly workerId: string;
  readonly leaseTtlMs: number;
  readonly now?: string;
};

export type ReleaseLeaseInput = {
  readonly deliveryId: NotificationDeliveryId;
  readonly workerId: string;
  /** Target status after release — defaults to queued or retry_scheduled by attempt_count. */
  readonly status?: "queued" | "retry_scheduled";
  readonly requeueReason?: string;
  readonly now?: string;
};

export type ValidateClaimInput = {
  readonly deliveryId: NotificationDeliveryId;
  readonly workerId: string;
  readonly tenantId?: string;
  readonly organisationId?: string;
};

export type CompleteDeliverySuccessInput = {
  readonly deliveryId: NotificationDeliveryId;
  readonly workerId: string;
  readonly attemptCount: number;
  readonly receiptLevel: NotificationReceiptLevel;
  readonly tryRecord: NotificationDeliveryTry;
  readonly inAppItem?: NotificationInAppItem;
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly now?: string;
};

export type CompleteDeliveryRetryInput = {
  readonly deliveryId: NotificationDeliveryId;
  readonly workerId: string;
  readonly attemptCount: number;
  readonly nextAttemptAt: string;
  readonly tryRecord: NotificationDeliveryTry;
  readonly lastFailureClass?: NotificationFailureClass;
  readonly lastFailureCode?: string;
  readonly receiptLevel?: NotificationReceiptLevel;
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly now?: string;
};

export type CompleteDeliveryDeadLetterInput = {
  readonly deliveryId: NotificationDeliveryId;
  readonly workerId: string;
  readonly attemptCount: number;
  readonly tryRecord: NotificationDeliveryTry;
  readonly terminalAt: string;
  readonly lastFailureClass?: NotificationFailureClass;
  readonly lastFailureCode?: string;
  readonly receiptLevel?: NotificationReceiptLevel;
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly now?: string;
};

/**
 * Claim/lease + fenced completion operations for durable delivery rows.
 */
export type NotificationDeliveryClaimPort = {
  claimBatch(input: ClaimBatchInput): Promise<readonly NotificationDeliveryRecord[]>;
  reclaimExpiredLeases(
    input: ReclaimExpiredLeasesInput,
  ): Promise<readonly NotificationDeliveryRecord[]>;
  renewLease(input: RenewLeaseInput): Promise<NotificationDeliveryRecord | null>;
  releaseLease(input: ReleaseLeaseInput): Promise<NotificationDeliveryRecord | null>;
  validateClaim(input: ValidateClaimInput): Promise<boolean>;
  /** Fenced success — null when lease ownership / tenant fencing fails. */
  completeDeliverySuccess(
    input: CompleteDeliverySuccessInput,
  ): Promise<NotificationDeliveryRecord | null>;
  /** Fenced retry schedule — null when fencing fails. */
  completeDeliveryRetry(
    input: CompleteDeliveryRetryInput,
  ): Promise<NotificationDeliveryRecord | null>;
  /** Fenced permanent failure / dead-letter — null when fencing fails. */
  completeDeliveryDeadLetter(
    input: CompleteDeliveryDeadLetterInput,
  ): Promise<NotificationDeliveryRecord | null>;
};

/** Combined durable store + claim/lease/completion engine. */
export type NotificationDeliveryDurableRuntimeStore =
  NotificationDeliveryDurableStorePort & NotificationDeliveryClaimPort;
