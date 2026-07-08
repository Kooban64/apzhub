import type { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import { getAvailableBalance } from "./trust-ledger-balance";
import { TRUST_LEDGER_TRANSACTION_TYPES } from "./trust-ledger-types";
import type {
  TrustAdjustmentDirection,
  TrustLedgerTransactionType,
} from "./trust-ledger-types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface TrustDraftValidationOptions {
  /** When true, enforces balance checks for withdrawals/adjustments (default true). */
  readonly forPost?: boolean;
}

export interface TrustDraftValidationInput {
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
  readonly reversesTrustTransactionId?: string;
}

export interface TrustDraftValidationResult {
  readonly ok: boolean;
  readonly errors: Readonly<Record<string, string>>;
}

function fieldError(
  errors: Record<string, string>,
  field: string,
  message: string,
): void {
  errors[field] = message;
}

/** Validates draft fields before ledger post (LAW-015-03). */
export class TrustTransactionValidator {
  constructor(private readonly ledgerRepository: InMemoryTrustLedgerRepository) {}

  validate(
    input: TrustDraftValidationInput,
    options: TrustDraftValidationOptions = {},
  ): TrustDraftValidationResult {
    const forPost = options.forPost ?? true;
    const errors: Record<string, string> = {};

    if (!input.tenantId.trim()) {
      fieldError(errors, "tenantId", "Tenant is required");
    }

    if (!input.trustAccountId.trim()) {
      fieldError(errors, "trustAccountId", "Trust account is required");
    }

    const account = this.ledgerRepository.getAccount(
      input.tenantId,
      input.trustAccountId,
    );
    if (!account) {
      fieldError(errors, "trustAccountId", "Trust account not found");
    } else {
      if (account.tenantId !== input.tenantId) {
        fieldError(errors, "tenantId", "Tenant scope mismatch");
      }
      if (!account.isActive) {
        fieldError(errors, "trustAccountId", "Trust account is inactive");
      }
      if (
        input.currency.trim().length > 0 &&
        input.currency.trim().toUpperCase() !== account.currency.toUpperCase()
      ) {
        fieldError(errors, "currency", "Currency must match trust account");
      }
    }

    if (!TRUST_LEDGER_TRANSACTION_TYPES.includes(input.trustTransactionType)) {
      fieldError(errors, "trustTransactionType", "Unsupported transaction type");
    }

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      fieldError(errors, "amount", "Amount must be positive");
    }

    if (!input.currency.trim()) {
      fieldError(errors, "currency", "Currency is required");
    }

    if (!input.clientId.trim()) {
      fieldError(errors, "clientId", "Client is required");
    }

    if (!ISO_DATE_PATTERN.test(input.transactionDate.trim())) {
      fieldError(errors, "transactionDate", "Transaction date must be YYYY-MM-DD");
    }

    if (!ISO_DATE_PATTERN.test(input.postingDate.trim())) {
      fieldError(errors, "postingDate", "Posting date must be YYYY-MM-DD");
    }

    if (!input.narrative.trim()) {
      fieldError(errors, "narrative", "Narrative is required");
    }

    if (input.trustTransactionType === "adjustment") {
      if (
        input.adjustmentDirection !== "increase" &&
        input.adjustmentDirection !== "decrease"
      ) {
        fieldError(errors, "adjustmentDirection", "Adjustment direction is required");
      }
    }

    if (input.trustTransactionType === "reversal") {
      if (!input.reversesTrustTransactionId?.trim()) {
        fieldError(errors, "reversesTrustTransactionId", "Reversal target is required");
      } else if (account) {
        const original = this.ledgerRepository.getTransaction(
          input.tenantId,
          input.trustAccountId,
          input.reversesTrustTransactionId,
        );
        if (!original) {
          fieldError(
            errors,
            "reversesTrustTransactionId",
            "Original transaction not found",
          );
        } else if (original.status === "reversed") {
          fieldError(
            errors,
            "reversesTrustTransactionId",
            "Original transaction already reversed",
          );
        }
      }
    }

    if (
      forPost &&
      account &&
      Object.keys(errors).length === 0 &&
      (input.trustTransactionType === "withdrawal" ||
        (input.trustTransactionType === "adjustment" &&
          input.adjustmentDirection === "decrease"))
    ) {
      const balances = this.ledgerRepository.getBalances(
        input.tenantId,
        input.trustAccountId,
      );
      const available = getAvailableBalance(balances, {
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        clientId: input.clientId,
        matterId: input.matterId,
      });
      if (available < input.amount) {
        fieldError(
          errors,
          "amount",
          `Insufficient trust balance (available ${available})`,
        );
      }
    }

    return {
      ok: Object.keys(errors).length === 0,
      errors,
    };
  }
}
