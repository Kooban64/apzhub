/** Trust Transaction Workflow types (LAW-015-03). In-memory only. */

import type {
  TrustAdjustmentDirection,
  TrustLedgerTransactionType,
  TrustTransaction,
} from "./trust-ledger-types";

export const TRUST_DRAFT_STATUSES = [
  "draft",
  "validated",
  "posted",
  "rejected",
  "reversed",
  "cancelled",
] as const;

export type TrustDraftStatus = (typeof TRUST_DRAFT_STATUSES)[number];

/** Editable trust transaction before ledger post. */
export interface TrustTransactionDraft {
  readonly draftId: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly status: TrustDraftStatus;
  readonly trustTransactionType: TrustLedgerTransactionType;
  readonly amount: number;
  readonly currency: string;
  readonly transactionDate: string;
  readonly postingDate: string;
  readonly clientId: string;
  readonly matterId?: string;
  readonly narrative: string;
  readonly adjustmentDirection?: TrustAdjustmentDirection;
  readonly reversesTrustTransactionId?: string;
  readonly postedTrustTransactionId?: string;
  readonly idempotencyKey?: string;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly createdByUserId: string;
  readonly updatedByUserId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

export interface CreateTrustTransactionDraftInput {
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly trustTransactionType: TrustLedgerTransactionType;
  readonly amount: number;
  readonly currency: string;
  readonly transactionDate: string;
  readonly postingDate: string;
  readonly clientId: string;
  readonly matterId?: string;
  readonly narrative: string;
  readonly adjustmentDirection?: TrustAdjustmentDirection;
  readonly actorUserId: string;
}

export interface UpdateTrustTransactionDraftInput {
  readonly amount?: number;
  readonly currency?: string;
  readonly transactionDate?: string;
  readonly postingDate?: string;
  readonly clientId?: string;
  readonly matterId?: string;
  readonly narrative?: string;
  readonly adjustmentDirection?: TrustAdjustmentDirection;
  readonly actorUserId: string;
}

export interface PostTrustTransactionDraftInput {
  readonly draftId: string;
  readonly tenantId: string;
  readonly actorUserId: string;
  readonly idempotencyKey?: string;
}

export interface RequestTrustReversalInput {
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly trustTransactionId: string;
  readonly postingDate: string;
  readonly narrative: string;
  readonly actorUserId: string;
}

export interface PostTrustReversalInput {
  readonly draftId: string;
  readonly tenantId: string;
  readonly actorUserId: string;
  readonly idempotencyKey?: string;
}

export const TRUST_AUDIT_ACTIONS = [
  "draft.created",
  "draft.updated",
  "draft.validated",
  "draft.posted",
  "draft.cancelled",
  "validation.failed",
  "reversal.requested",
  "reversal.posted",
] as const;

export type TrustAuditAction = (typeof TRUST_AUDIT_ACTIONS)[number];

/** Append-only workflow audit record. */
export interface TrustTransactionAuditRecord {
  readonly auditRecordId: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly draftId?: string;
  readonly trustTransactionId?: string;
  readonly action: TrustAuditAction;
  readonly actorUserId: string;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly summary: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface TrustAuditTrailCriteria {
  readonly tenantId: string;
  readonly trustAccountId?: string;
  readonly draftId?: string;
  readonly trustTransactionId?: string;
  readonly action?: TrustAuditAction;
}

export const TRUST_WORKFLOW_DOMAIN_EVENTS = [
  "legal.trust.draft.created",
  "legal.trust.draft.validated",
  "legal.trust.draft.posted",
  "legal.trust.draft.cancelled",
  "legal.trust.reversal.requested",
  "legal.trust.reversal.posted",
] as const;

export type TrustWorkflowDomainEventId = (typeof TRUST_WORKFLOW_DOMAIN_EVENTS)[number];

export interface TrustWorkflowDomainEvent {
  readonly eventId: TrustWorkflowDomainEventId;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface TrustTransactionWorkflowResult<T = TrustTransactionDraft> {
  readonly ok: boolean;
  readonly draft?: T;
  readonly transaction?: TrustTransaction;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly idempotentReplay?: boolean;
  readonly error?: { readonly code: string; readonly message: string };
  readonly auditRecordId?: string;
}

export interface IdempotencyRecord {
  readonly tenantId: string;
  readonly idempotencyKey: string;
  readonly draftId: string;
  readonly postedTrustTransactionId: string;
  readonly recordedAt: string;
}
