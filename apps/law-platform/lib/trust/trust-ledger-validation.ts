import { ReferenceNumberGenerator } from "@apzhub/legal-business-core";

import { TRUST_LEDGER_ERROR_CODES, TrustLedgerError } from "./trust-ledger-errors";
import { isBalanced } from "./trust-ledger-posting-builder";
import type {
  OpenTrustAccountInput,
  PostTrustTransactionInput,
  ReverseTrustTransactionInput,
  TrustAccount,
  TrustJournalEntry,
  TrustPosting,
  TrustTransaction,
} from "./trust-ledger-types";
import { TRUST_LEDGER_TRANSACTION_TYPES } from "./trust-ledger-types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function assertTenantScope(
  tenantId: string,
  entityTenantId: string,
  code: keyof typeof TRUST_LEDGER_ERROR_CODES,
): void {
  if (tenantId !== entityTenantId) {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES[code],
      "Tenant scope violation",
    );
  }
}

export function assertIsoDate(value: string, field: string): void {
  if (!ISO_DATE_PATTERN.test(value.trim())) {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES.TRUST_INVALID_DATE,
      `${field} must be ISO date YYYY-MM-DD`,
    );
  }
}

export function assertPositiveAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES.TRUST_INVALID_AMOUNT,
      "Amount must be a positive number",
    );
  }
}

export function assertNonEmpty(
  value: string,
  code: keyof typeof TRUST_LEDGER_ERROR_CODES,
  field: string,
): void {
  if (value.trim().length === 0) {
    throw new TrustLedgerError(TRUST_LEDGER_ERROR_CODES[code], `${field} is required`);
  }
}

export function validateOpenTrustAccountInput(input: OpenTrustAccountInput): void {
  assertNonEmpty(input.tenantId, "TRUST_TENANT_MISMATCH", "tenantId");
  assertNonEmpty(input.name, "TRUST_INVALID_REFERENCE", "name");
  assertNonEmpty(input.currency, "TRUST_CURRENCY_MISMATCH", "currency");
  assertNonEmpty(input.institutionName, "TRUST_INVALID_REFERENCE", "institutionName");
  assertNonEmpty(
    input.accountNumberMasked,
    "TRUST_INVALID_REFERENCE",
    "accountNumberMasked",
  );
  assertNonEmpty(input.actorUserId, "TRUST_INVALID_REFERENCE", "actorUserId");
}

export function validatePostTrustTransactionInput(
  input: PostTrustTransactionInput,
  account: TrustAccount,
): void {
  assertNonEmpty(input.tenantId, "TRUST_TENANT_MISMATCH", "tenantId");
  assertTenantScope(input.tenantId, account.tenantId, "TRUST_TENANT_MISMATCH");

  if (!account.isActive) {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES.TRUST_ACCOUNT_INACTIVE,
      "Trust account is not active",
    );
  }

  if (input.trustAccountId !== account.trustAccountId) {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES.TRUST_ACCOUNT_NOT_FOUND,
      "Trust account id mismatch",
    );
  }

  if (!TRUST_LEDGER_TRANSACTION_TYPES.includes(input.trustTransactionType)) {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES.TRUST_UNSUPPORTED_TYPE,
      `Unsupported transaction type: ${input.trustTransactionType}`,
    );
  }

  assertPositiveAmount(input.amount);

  if (input.currency.trim().toUpperCase() !== account.currency.trim().toUpperCase()) {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES.TRUST_CURRENCY_MISMATCH,
      "Transaction currency must match trust account currency",
    );
  }

  assertNonEmpty(input.clientId, "TRUST_MISSING_CLIENT", "clientId");
  assertIsoDate(input.transactionDate, "transactionDate");
  assertIsoDate(input.postingDate, "postingDate");
  assertNonEmpty(input.narrative, "TRUST_INVALID_REFERENCE", "narrative");
  assertNonEmpty(input.actorUserId, "TRUST_INVALID_REFERENCE", "actorUserId");

  if (input.trustTransactionType === "adjustment") {
    if (
      input.adjustmentDirection !== "increase" &&
      input.adjustmentDirection !== "decrease"
    ) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_INVALID_ADJUSTMENT,
        "adjustmentDirection must be increase or decrease",
      );
    }
  }

  if (input.trustTransactionType === "reversal") {
    if (!input.reversesTransactionId?.trim()) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_MISSING_REVERSAL_TARGET,
        "reversesTransactionId is required for reversal transactions",
      );
    }
  }
}

export function validateReverseTrustTransactionInput(
  input: ReverseTrustTransactionInput,
  account: TrustAccount,
  original: TrustTransaction,
): void {
  assertNonEmpty(input.tenantId, "TRUST_TENANT_MISMATCH", "tenantId");
  assertTenantScope(input.tenantId, account.tenantId, "TRUST_TENANT_MISMATCH");
  assertTenantScope(input.tenantId, original.tenantId, "TRUST_TENANT_MISMATCH");

  if (original.trustAccountId !== input.trustAccountId) {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES.TRUST_REVERSAL_INVALID,
      "Transaction does not belong to trust account",
    );
  }

  if (original.status === "reversed") {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES.TRUST_ALREADY_REVERSED,
      "Transaction is already reversed",
    );
  }

  assertIsoDate(input.postingDate, "postingDate");
  assertNonEmpty(input.narrative, "TRUST_INVALID_REFERENCE", "narrative");
  assertNonEmpty(input.actorUserId, "TRUST_INVALID_REFERENCE", "actorUserId");
}

export function validateBalancedPostings(lines: readonly TrustPosting[]): void {
  if (!isBalanced(lines)) {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES.TRUST_JOURNAL_UNBALANCED,
      "Journal entry debits must equal credits",
    );
  }
}

export function validateReferenceFormat(reference: string, prefix: string): void {
  const pattern = new RegExp(`^${prefix}-\\d{4}-\\d{6}$`);
  if (!pattern.test(reference)) {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES.TRUST_INVALID_REFERENCE,
      `Invalid reference format: ${reference}`,
    );
  }
}

export function validateReversalTarget(
  original: TrustTransaction,
  reversesTransactionId: string,
): void {
  if (original.trustTransactionId !== reversesTransactionId) {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES.TRUST_REVERSAL_INVALID,
      "Reversal target does not match original transaction",
    );
  }

  if (original.status === "reversed") {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES.TRUST_ALREADY_REVERSED,
      "Original transaction is already reversed",
    );
  }
}

export function assertJournalImmutable(
  existing: TrustJournalEntry,
  patch: Partial<TrustJournalEntry>,
): void {
  const immutableKeys: (keyof TrustJournalEntry)[] = [
    "journalEntryId",
    "journalReference",
    "tenantId",
    "trustAccountId",
    "entryDate",
    "postedAt",
    "postedByUserId",
    "lines",
    "trustTransactionId",
  ];

  for (const key of immutableKeys) {
    if (key in patch && patch[key] !== undefined && patch[key] !== existing[key]) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_IMMUTABLE_VIOLATION,
        `Journal entry field ${key} is immutable`,
      );
    }
  }
}

export function createReferenceGenerator(): ReferenceNumberGenerator {
  return new ReferenceNumberGenerator();
}
