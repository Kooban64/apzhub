/** Trust Transfer domain types (LAW-015-07). In-memory only — no persistence. */

export const TRUST_TRANSFER_TYPES = [
  "matter_to_matter",
  "client_to_client",
  "matter_to_client",
  "client_to_matter",
  "account_to_account",
  "allocation_correction",
  "reversal",
] as const;

export type TrustTransferType = (typeof TRUST_TRANSFER_TYPES)[number];

export const TRUST_TRANSFER_STATUSES = [
  "draft",
  "approved",
  "posted",
  "reversed",
  "cancelled",
] as const;

export type TrustTransferStatus = (typeof TRUST_TRANSFER_STATUSES)[number];

/** Controlled trust fund movement aggregate (LAW-015-07). */
export interface TrustTransfer {
  readonly trustTransferId: string;
  readonly tenantId: string;
  readonly transferType: TrustTransferType;
  readonly status: TrustTransferStatus;
  readonly sourceTrustAccountId: string;
  readonly destinationTrustAccountId: string;
  readonly sourceClientId: string;
  readonly destinationClientId: string;
  readonly sourceMatterId?: string;
  readonly destinationMatterId?: string;
  readonly amount: number;
  readonly currency: string;
  readonly reason: string;
  readonly reversesTransferId?: string;
  readonly transferOutTransactionId?: string;
  readonly transferInTransactionId?: string;
  readonly reversalOutTransactionId?: string;
  readonly reversalInTransactionId?: string;
  readonly createdAt: string;
  readonly createdByUserId: string;
  readonly approvedAt?: string;
  readonly approvedByUserId?: string;
  readonly postedAt?: string;
  readonly postedByUserId?: string;
  readonly reversedAt?: string;
  readonly reversedByUserId?: string;
  readonly cancelledAt?: string;
  readonly cancelledByUserId?: string;
  readonly sourceBalanceBefore?: number;
  readonly destinationBalanceBefore?: number;
}

export interface CreateTrustTransferDraftInput {
  readonly tenantId: string;
  readonly transferType?: TrustTransferType;
  readonly sourceTrustAccountId: string;
  readonly destinationTrustAccountId?: string;
  readonly sourceClientId: string;
  readonly destinationClientId: string;
  readonly sourceMatterId?: string;
  readonly destinationMatterId?: string;
  readonly amount: number;
  readonly currency: string;
  readonly reason: string;
  readonly reversesTransferId?: string;
  readonly actorUserId: string;
}

export interface ApproveTrustTransferInput {
  readonly tenantId: string;
  readonly trustTransferId: string;
  readonly actorUserId: string;
}

export interface PostTrustTransferInput {
  readonly tenantId: string;
  readonly trustTransferId: string;
  readonly postingDate: string;
  readonly actorUserId: string;
}

export interface ReverseTrustTransferInput {
  readonly tenantId: string;
  readonly trustTransferId: string;
  readonly postingDate: string;
  readonly reason: string;
  readonly actorUserId: string;
}

export interface CancelTrustTransferDraftInput {
  readonly tenantId: string;
  readonly trustTransferId: string;
  readonly actorUserId: string;
}

export interface TrustTransferHistoryCriteria {
  readonly tenantId: string;
  readonly trustAccountId?: string;
  readonly status?: TrustTransferStatus;
}

export interface TrustTransferValidationResult {
  readonly ok: boolean;
  readonly errors: Readonly<Record<string, string>>;
  readonly sourceBalance?: number;
  readonly destinationBalance?: number;
}

export const TRUST_TRANSFER_DOMAIN_EVENTS = [
  "legal.trust.transfer.created",
  "legal.trust.transfer.approved",
  "legal.trust.transfer.posted",
  "legal.trust.transfer.reversed",
] as const;

export type TrustTransferDomainEventId = (typeof TRUST_TRANSFER_DOMAIN_EVENTS)[number];

export interface TrustTransferDomainEvent {
  readonly eventId: TrustTransferDomainEventId;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export type TrustTransferOperation =
  "createDraft" | "validate" | "approve" | "post" | "reverse" | "cancel";

export interface TrustTransferStageRecord {
  readonly operation: TrustTransferOperation;
  readonly stage:
    "validation" | "approve" | "post" | "reverse" | "persist" | "allocate";
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface TrustTransferRunRecord {
  readonly operation: TrustTransferOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly stages: readonly TrustTransferStageRecord[];
  readonly trustTransferId?: string;
  readonly errorCode?: string;
  readonly errorMessage?: string;
  readonly validationErrors?: Readonly<Record<string, string>>;
}

export interface TrustTransferServiceResult<T = unknown> {
  readonly ok: boolean;
  readonly data?: T;
  readonly error?: { readonly code: string; readonly message: string };
  readonly validation?: TrustTransferValidationResult;
  readonly run: TrustTransferRunRecord;
}

export interface TrustTransferPostResult {
  readonly transfer: TrustTransfer;
  readonly transferOutTransactionId: string;
  readonly transferInTransactionId: string;
}
