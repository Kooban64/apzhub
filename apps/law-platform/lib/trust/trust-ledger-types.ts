/** Trust Ledger Engine domain types (LAW-015-02). In-memory only — no persistence. */

export const TRUST_LEDGER_TRANSACTION_TYPES = [
  "opening_balance",
  "deposit",
  "withdrawal",
  "adjustment",
  "reversal",
  "interest",
  "transfer_out",
  "transfer_in",
] as const;

export type TrustLedgerTransactionType =
  (typeof TRUST_LEDGER_TRANSACTION_TYPES)[number];

export const TRUST_CHART_ACCOUNT_CODES = {
  TRUST_CASH: "TRUST-CASH",
  TRUST_LIABILITY_CLIENT: "TRUST-LIABILITY-CLIENT",
  TRUST_LIABILITY_MATTER: "TRUST-LIABILITY-MATTER",
  TRUST_INTEREST_EXPENSE: "TRUST-INTEREST-EXPENSE",
  TRUST_INTEREST_CLEARING: "TRUST-INTEREST-CLEARING",
  TRUST_TRANSFER_CLEARING: "TRUST-TRANSFER-CLEARING",
} as const;

export type TrustChartAccountCode =
  (typeof TRUST_CHART_ACCOUNT_CODES)[keyof typeof TRUST_CHART_ACCOUNT_CODES];

export const TRUST_TRANSACTION_STATUSES = ["posted", "reversed"] as const;
export type TrustTransactionStatus = (typeof TRUST_TRANSACTION_STATUSES)[number];

export const TRUST_BALANCE_SCOPES = ["account", "client", "matter"] as const;
export type TrustBalanceScope = (typeof TRUST_BALANCE_SCOPES)[number];

export type TrustAdjustmentDirection = "increase" | "decrease";

/** Regulated trust bank account (tenant-scoped). */
export interface TrustAccount {
  readonly trustAccountId: string;
  readonly trustAccountCode: string;
  readonly tenantId: string;
  readonly name: string;
  readonly currency: string;
  readonly institutionName: string;
  readonly accountNumberMasked: string;
  readonly isActive: boolean;
  readonly openedAt: string;
}

/** Logical ledger view for one trust account. */
export interface TrustLedger {
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly openedAt: string;
  readonly entryCount: number;
  readonly transactionCount: number;
}

/** Journal container — ordered append-only entries for an account. */
export interface TrustJournal {
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly entries: readonly TrustJournalEntry[];
}

/** Immutable double-entry journal record once posted. */
export interface TrustJournalEntry {
  readonly journalEntryId: string;
  readonly journalReference: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly entryDate: string;
  readonly postedAt: string;
  readonly postedByUserId: string;
  readonly lines: readonly TrustPosting[];
  readonly trustTransactionId: string;
  readonly reversesEntryId?: string;
}

/** Single debit or credit line on a journal entry. */
export interface TrustPosting {
  readonly postingId: string;
  readonly accountCode: TrustChartAccountCode | string;
  readonly side: "debit" | "credit";
  readonly amount: number;
  readonly clientId?: string;
  readonly matterId?: string;
}

/** Append-only business trust movement. */
export interface TrustTransaction {
  readonly trustTransactionId: string;
  readonly transactionReference: string;
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
  readonly status: TrustTransactionStatus;
  readonly journalEntryId: string;
  readonly postedByUserId: string;
  readonly reversesTransactionId?: string;
  readonly pairedTransactionId?: string;
  readonly adjustmentDirection?: TrustAdjustmentDirection;
}

/** Materialised balance projection (derived from journal). */
export interface TrustBalance {
  readonly scope: TrustBalanceScope;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly clientId?: string;
  readonly matterId?: string;
  readonly balanceAmount: number;
  readonly currency: string;
  readonly asOfDate: string;
  readonly lastJournalEntryId: string;
}

export interface OpenTrustAccountInput {
  readonly tenantId: string;
  readonly name: string;
  readonly currency: string;
  readonly institutionName: string;
  readonly accountNumberMasked: string;
  readonly actorUserId: string;
}

export interface PostTrustTransactionInput {
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
  readonly actorUserId: string;
  readonly adjustmentDirection?: TrustAdjustmentDirection;
  readonly reversesTransactionId?: string;
  readonly pairedTransactionId?: string;
}

export interface ReverseTrustTransactionInput {
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly trustTransactionId: string;
  readonly postingDate: string;
  readonly narrative: string;
  readonly actorUserId: string;
}

export const TRUST_LEDGER_DOMAIN_EVENTS = [
  "legal.trust.ledger.opened",
  "legal.trust.transaction.posted",
  "legal.trust.transaction.reversed",
] as const;

export type TrustLedgerDomainEventId = (typeof TRUST_LEDGER_DOMAIN_EVENTS)[number];

export interface TrustLedgerDomainEvent {
  readonly eventId: TrustLedgerDomainEventId;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly payload: Readonly<Record<string, unknown>>;
}
