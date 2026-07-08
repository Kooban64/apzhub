/** Trust persistence model types for PostgreSQL row mapping (LAW-015-11). */

export interface LawTrustAccountPersistenceModel {
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

export interface LawTrustPostingPersistenceModel {
  readonly postingId: string;
  readonly accountCode: string;
  readonly side: "debit" | "credit";
  readonly amount: number;
  readonly clientId?: string;
  readonly matterId?: string;
}

export interface LawTrustJournalEntryPersistenceModel {
  readonly journalEntryId: string;
  readonly journalReference: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly entryDate: string;
  readonly postedAt: string;
  readonly postedByUserId: string;
  readonly lines: readonly LawTrustPostingPersistenceModel[];
  readonly trustTransactionId: string;
  readonly reversesEntryId?: string;
}

export interface LawTrustTransactionPersistenceModel {
  readonly trustTransactionId: string;
  readonly transactionReference: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly trustTransactionType: string;
  readonly amount: number;
  readonly currency: string;
  readonly transactionDate: string;
  readonly postingDate: string;
  readonly clientId: string;
  readonly matterId?: string;
  readonly narrative: string;
  readonly status: string;
  readonly journalEntryId: string;
  readonly postedByUserId: string;
  readonly reversesTransactionId?: string;
  readonly pairedTransactionId?: string;
  readonly adjustmentDirection?: string;
}

export interface LawTrustBalancePersistenceModel {
  readonly scope: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly clientId?: string;
  readonly matterId?: string;
  readonly balanceAmount: number;
  readonly currency: string;
  readonly asOfDate: string;
}

export function trustAccountToRow(
  account: LawTrustAccountPersistenceModel,
  tenantId: string,
) {
  return {
    trustAccountId: account.trustAccountId,
    tenantId,
    trustAccountCode: account.trustAccountCode,
    name: account.name,
    currency: account.currency,
    institutionName: account.institutionName,
    accountNumberMasked: account.accountNumberMasked,
    isActive: account.isActive,
    openedAt: new Date(account.openedAt),
    createdAt: new Date(account.openedAt),
    updatedAt: new Date(),
    version: 1,
  };
}

export function rowToTrustAccount(row: {
  trustAccountId: string;
  tenantId: string;
  trustAccountCode: string;
  name: string;
  currency: string;
  institutionName: string;
  accountNumberMasked: string;
  isActive: boolean;
  openedAt: Date;
}): LawTrustAccountPersistenceModel {
  return {
    trustAccountId: row.trustAccountId,
    trustAccountCode: row.trustAccountCode,
    tenantId: row.tenantId,
    name: row.name,
    currency: row.currency,
    institutionName: row.institutionName,
    accountNumberMasked: row.accountNumberMasked,
    isActive: row.isActive,
    openedAt: row.openedAt.toISOString(),
  };
}

export function trustTransactionToRow(
  transaction: LawTrustTransactionPersistenceModel,
  tenantId: string,
) {
  return {
    trustTransactionId: transaction.trustTransactionId,
    tenantId,
    trustAccountId: transaction.trustAccountId,
    transactionReference: transaction.transactionReference,
    trustTransactionType: transaction.trustTransactionType,
    amount: transaction.amount,
    currency: transaction.currency,
    transactionDate: new Date(transaction.transactionDate),
    postingDate: new Date(transaction.postingDate),
    clientId: transaction.clientId,
    matterId: transaction.matterId ?? null,
    narrative: transaction.narrative,
    status: transaction.status,
    journalEntryId: transaction.journalEntryId,
    postedByUserId: transaction.postedByUserId,
    reversesTransactionId: transaction.reversesTransactionId ?? null,
    pairedTransactionId: transaction.pairedTransactionId ?? null,
    adjustmentDirection: transaction.adjustmentDirection ?? null,
    postedAt: new Date(),
  };
}

export function rowToTrustTransaction(row: {
  trustTransactionId: string;
  tenantId: string;
  trustAccountId: string;
  transactionReference: string;
  trustTransactionType: string;
  amount: number;
  currency: string;
  transactionDate: Date;
  postingDate: Date;
  clientId: string;
  matterId: string | null;
  narrative: string;
  status: string;
  journalEntryId: string;
  postedByUserId: string;
  reversesTransactionId: string | null;
  pairedTransactionId: string | null;
  adjustmentDirection: string | null;
}): LawTrustTransactionPersistenceModel {
  return {
    trustTransactionId: row.trustTransactionId,
    transactionReference: row.transactionReference,
    tenantId: row.tenantId,
    trustAccountId: row.trustAccountId,
    trustTransactionType: row.trustTransactionType,
    amount: row.amount,
    currency: row.currency,
    transactionDate: row.transactionDate.toISOString(),
    postingDate: row.postingDate.toISOString(),
    clientId: row.clientId,
    matterId: row.matterId ?? undefined,
    narrative: row.narrative,
    status: row.status,
    journalEntryId: row.journalEntryId,
    postedByUserId: row.postedByUserId,
    reversesTransactionId: row.reversesTransactionId ?? undefined,
    pairedTransactionId: row.pairedTransactionId ?? undefined,
    adjustmentDirection: row.adjustmentDirection ?? undefined,
  };
}

export function trustJournalEntryToRow(
  entry: LawTrustJournalEntryPersistenceModel,
  tenantId: string,
) {
  return {
    journalEntryId: entry.journalEntryId,
    tenantId,
    trustAccountId: entry.trustAccountId,
    journalReference: entry.journalReference,
    entryDate: new Date(entry.entryDate),
    postedAt: new Date(entry.postedAt),
    postedByUserId: entry.postedByUserId,
    trustTransactionId: entry.trustTransactionId,
    reversesEntryId: entry.reversesEntryId ?? null,
    lines: entry.lines as unknown as Record<string, unknown>[],
  };
}

export function rowToTrustJournalEntry(row: {
  journalEntryId: string;
  tenantId: string;
  trustAccountId: string;
  journalReference: string;
  entryDate: Date;
  postedAt: Date;
  postedByUserId: string;
  trustTransactionId: string;
  reversesEntryId: string | null;
  lines: Record<string, unknown>[];
}): LawTrustJournalEntryPersistenceModel {
  return {
    journalEntryId: row.journalEntryId,
    journalReference: row.journalReference,
    tenantId: row.tenantId,
    trustAccountId: row.trustAccountId,
    entryDate: row.entryDate.toISOString(),
    postedAt: row.postedAt.toISOString(),
    postedByUserId: row.postedByUserId,
    lines: row.lines as unknown as readonly LawTrustPostingPersistenceModel[],
    trustTransactionId: row.trustTransactionId,
    reversesEntryId: row.reversesEntryId ?? undefined,
  };
}

export function trustBalanceToRow(
  balance: LawTrustBalancePersistenceModel,
  tenantId: string,
  balanceId: string,
) {
  return {
    balanceId,
    tenantId,
    trustAccountId: balance.trustAccountId,
    scope: balance.scope,
    clientId: balance.clientId ?? null,
    matterId: balance.matterId ?? null,
    balanceAmount: balance.balanceAmount,
    currency: balance.currency,
    asOfDate: new Date(balance.asOfDate),
  };
}

export function rowToTrustBalance(row: {
  tenantId: string;
  trustAccountId: string;
  scope: string;
  clientId: string | null;
  matterId: string | null;
  balanceAmount: number;
  currency: string;
  asOfDate: Date;
}): LawTrustBalancePersistenceModel {
  return {
    scope: row.scope,
    tenantId: row.tenantId,
    trustAccountId: row.trustAccountId,
    clientId: row.clientId ?? undefined,
    matterId: row.matterId ?? undefined,
    balanceAmount: row.balanceAmount,
    currency: row.currency,
    asOfDate: row.asOfDate.toISOString(),
  };
}

export function payloadToRow<T extends Record<string, unknown>>(
  entity: T,
): Record<string, unknown> {
  return structuredClone(entity) as Record<string, unknown>;
}

export function rowPayloadToEntity<T>(payload: Record<string, unknown>): T {
  return structuredClone(payload) as T;
}
