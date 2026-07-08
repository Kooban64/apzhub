import { TRUST_CHART_ACCOUNT_CODES } from "./trust-ledger-types";
import type {
  TrustAdjustmentDirection,
  TrustLedgerTransactionType,
  TrustPosting,
} from "./trust-ledger-types";
import { createTrustId } from "./trust-id";

function posting(
  accountCode: string,
  side: "debit" | "credit",
  amount: number,
  clientId?: string,
  matterId?: string,
): TrustPosting {
  return {
    postingId: createTrustId("pst"),
    accountCode,
    side,
    amount,
    clientId,
    matterId,
  };
}

function liabilityAccount(matterId?: string): string {
  return matterId
    ? TRUST_CHART_ACCOUNT_CODES.TRUST_LIABILITY_MATTER
    : TRUST_CHART_ACCOUNT_CODES.TRUST_LIABILITY_CLIENT;
}

/** Builds balanced debit/credit lines for foundation transaction types. */
export function buildPostingsForTransaction(options: {
  readonly trustTransactionType: TrustLedgerTransactionType;
  readonly amount: number;
  readonly clientId: string;
  readonly matterId?: string;
  readonly adjustmentDirection?: TrustAdjustmentDirection;
}): readonly TrustPosting[] {
  const { trustTransactionType, amount, clientId, matterId, adjustmentDirection } =
    options;
  const liability = liabilityAccount(matterId);

  switch (trustTransactionType) {
    case "opening_balance":
    case "deposit":
      return [
        posting(TRUST_CHART_ACCOUNT_CODES.TRUST_CASH, "debit", amount),
        posting(liability, "credit", amount, clientId, matterId),
      ];
    case "withdrawal":
      return [
        posting(liability, "debit", amount, clientId, matterId),
        posting(TRUST_CHART_ACCOUNT_CODES.TRUST_CASH, "credit", amount),
      ];
    case "adjustment": {
      const increase = adjustmentDirection === "increase";
      if (increase) {
        return [
          posting(TRUST_CHART_ACCOUNT_CODES.TRUST_CASH, "debit", amount),
          posting(liability, "credit", amount, clientId, matterId),
        ];
      }
      return [
        posting(liability, "debit", amount, clientId, matterId),
        posting(TRUST_CHART_ACCOUNT_CODES.TRUST_CASH, "credit", amount),
      ];
    }
    case "reversal":
      throw new Error("Use invertPostings for reversal journal lines");
    case "interest":
      return [
        posting(TRUST_CHART_ACCOUNT_CODES.TRUST_INTEREST_EXPENSE, "debit", amount),
        posting(liability, "credit", amount, clientId, matterId),
      ];
    case "transfer_out":
      return [
        posting(liability, "debit", amount, clientId, matterId),
        posting(TRUST_CHART_ACCOUNT_CODES.TRUST_TRANSFER_CLEARING, "credit", amount),
      ];
    case "transfer_in":
      return [
        posting(TRUST_CHART_ACCOUNT_CODES.TRUST_TRANSFER_CLEARING, "debit", amount),
        posting(liability, "credit", amount, clientId, matterId),
      ];
    default:
      return [];
  }
}

/** Inverts journal lines for a reversal entry (debit ↔ credit). */
export function invertPostings(
  lines: readonly TrustPosting[],
): readonly TrustPosting[] {
  return lines.map((line) => ({
    ...line,
    postingId: createTrustId("pst"),
    side: line.side === "debit" ? "credit" : "debit",
  }));
}

export function sumDebits(lines: readonly TrustPosting[]): number {
  return lines
    .filter((line) => line.side === "debit")
    .reduce((sum, line) => sum + line.amount, 0);
}

export function sumCredits(lines: readonly TrustPosting[]): number {
  return lines
    .filter((line) => line.side === "credit")
    .reduce((sum, line) => sum + line.amount, 0);
}

export function isBalanced(lines: readonly TrustPosting[]): boolean {
  return sumDebits(lines) === sumCredits(lines) && sumDebits(lines) > 0;
}
