import type {
  TrustAccount,
  TrustBalance,
  TrustTransaction,
} from "@apzhub/law-platform/api";

export interface TrustAccountSummaryV1 {
  readonly trustAccountId: string;
  readonly trustAccountCode: string;
  readonly name: string;
  readonly currency: string;
  readonly institutionName: string;
  readonly accountNumberMasked: string;
  readonly isActive: boolean;
  readonly openedAt: string;
}

export interface TrustAccountDetailV1 extends TrustAccountSummaryV1 {
  readonly balances: readonly TrustBalanceSummaryV1[];
}

export interface TrustBalanceSummaryV1 {
  readonly scope: string;
  readonly clientId?: string;
  readonly matterId?: string;
  readonly balanceAmount: number;
  readonly currency: string;
  readonly asOfDate: string;
}

export interface CreateTrustAccountV1Request {
  readonly name: string;
  readonly currency: string;
  readonly institutionName: string;
  readonly accountNumberMasked: string;
}

export interface TrustTransactionSummaryV1 {
  readonly trustTransactionId: string;
  readonly transactionReference: string;
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
}

export interface CreateTrustTransactionDraftV1Request {
  readonly trustAccountId: string;
  readonly trustTransactionType: string;
  readonly amount: number;
  readonly currency: string;
  readonly transactionDate: string;
  readonly postingDate: string;
  readonly clientId: string;
  readonly matterId?: string;
  readonly narrative: string;
  readonly adjustmentDirection?: "increase" | "decrease";
}

export interface TrustDiagnosticsV1 {
  readonly repositoryMode: string;
  readonly accountCount: number;
  readonly pendingApprovals: number;
}

export function mapTrustAccountToSummaryV1(
  account: TrustAccount,
): TrustAccountSummaryV1 {
  return {
    trustAccountId: account.trustAccountId,
    trustAccountCode: account.trustAccountCode,
    name: account.name,
    currency: account.currency,
    institutionName: account.institutionName,
    accountNumberMasked: account.accountNumberMasked,
    isActive: account.isActive,
    openedAt: account.openedAt,
  };
}

export function mapTrustBalanceToSummaryV1(
  balance: TrustBalance,
): TrustBalanceSummaryV1 {
  return {
    scope: balance.scope,
    clientId: balance.clientId,
    matterId: balance.matterId,
    balanceAmount: balance.balanceAmount,
    currency: balance.currency,
    asOfDate: balance.asOfDate,
  };
}

export function mapTrustTransactionToSummaryV1(
  transaction: TrustTransaction,
): TrustTransactionSummaryV1 {
  return {
    trustTransactionId: transaction.trustTransactionId,
    transactionReference: transaction.transactionReference,
    trustAccountId: transaction.trustAccountId,
    trustTransactionType: transaction.trustTransactionType,
    amount: transaction.amount,
    currency: transaction.currency,
    transactionDate: transaction.transactionDate,
    postingDate: transaction.postingDate,
    clientId: transaction.clientId,
    matterId: transaction.matterId,
    narrative: transaction.narrative,
    status: transaction.status,
  };
}
