import type { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import type { TrustTransaction } from "./trust-ledger-types";
import type {
  TrustAllocationEffect,
  TrustAllocationLineInput,
  TrustAllocationType,
} from "./trust-allocation-types";

export interface TrustAllocationValidationInput {
  readonly tenantId: string;
  readonly transaction: TrustTransaction;
  readonly lines: readonly TrustAllocationLineInput[];
  readonly existingAllocatedTotal: number;
  readonly allowPartial?: boolean;
  readonly isAdjustment?: boolean;
}

export interface TrustAllocationValidationResult {
  readonly ok: boolean;
  readonly errors: Readonly<Record<string, string>>;
}

export function findTrustTransaction(
  ledgerRepository: InMemoryTrustLedgerRepository,
  tenantId: string,
  trustTransactionId: string,
): TrustTransaction | undefined {
  for (const account of ledgerRepository.listAccounts(tenantId)) {
    const transaction = ledgerRepository.getTransaction(
      tenantId,
      account.trustAccountId,
      trustTransactionId,
    );
    if (transaction) {
      return transaction;
    }
  }
  return undefined;
}

export function resolveLineAllocationType(
  line: TrustAllocationLineInput,
): TrustAllocationType {
  if (line.allocationType) {
    return line.allocationType;
  }
  if (line.matterId) {
    return "matter";
  }
  return "client";
}

export function transactionAllocationEffect(
  transaction: TrustTransaction,
  ledgerRepository?: InMemoryTrustLedgerRepository,
): TrustAllocationEffect {
  if (
    transaction.trustTransactionType === "reversal" &&
    transaction.reversesTransactionId &&
    ledgerRepository
  ) {
    const original = findTrustTransaction(
      ledgerRepository,
      transaction.tenantId,
      transaction.reversesTransactionId,
    );
    if (original) {
      return transactionAllocationEffect(original, ledgerRepository) === "increase"
        ? "decrease"
        : "increase";
    }
  }

  switch (transaction.trustTransactionType) {
    case "deposit":
    case "opening_balance":
      return "increase";
    case "withdrawal":
      return "decrease";
    case "adjustment":
      return transaction.adjustmentDirection === "decrease" ? "decrease" : "increase";
    case "reversal":
      return "decrease";
    case "transfer_out":
      return "decrease";
    case "transfer_in":
      return "increase";
    default:
      return "increase";
  }
}

/** Validates allocation lines against a posted trust transaction (LAW-015-04). */
export class TrustAllocationValidator {
  validate(input: TrustAllocationValidationInput): TrustAllocationValidationResult {
    const errors: Record<string, string> = {};
    const { transaction, lines, existingAllocatedTotal, allowPartial, isAdjustment } =
      input;

    if (transaction.tenantId !== input.tenantId) {
      errors.tenantId = "Tenant scope mismatch";
    }

    if (transaction.status !== "posted") {
      errors.transaction = "Allocations require a posted transaction";
    }

    if (lines.length === 0) {
      errors.lines = "At least one allocation line is required";
    }

    let lineTotal = 0;
    let increaseTotal = 0;
    let decreaseTotal = 0;

    lines.forEach((line, index) => {
      const prefix = `lines[${index}]`;

      if (!line.clientId.trim()) {
        errors[`${prefix}.clientId`] = "Client is required";
      }

      if (line.clientId !== transaction.clientId) {
        errors[`${prefix}.clientId`] =
          "Allocation client must match transaction client";
      }

      if (!Number.isFinite(line.amount) || line.amount <= 0) {
        errors[`${prefix}.amount`] = "Amount must be positive";
      } else {
        lineTotal += line.amount;
        const effect = line.effect ?? transactionAllocationEffect(transaction);
        if (effect === "increase") {
          increaseTotal += line.amount;
        } else {
          decreaseTotal += line.amount;
        }
      }

      const allocationType = resolveLineAllocationType(line);
      if (allocationType === "matter" && !line.matterId?.trim()) {
        errors[`${prefix}.matterId`] = "Matter is required for matter allocation";
      }
      if (allocationType === "unallocated" && line.matterId) {
        errors[`${prefix}.matterId`] = "Unallocated lines must not specify a matter";
      }
    });

    if (isAdjustment) {
      if (increaseTotal !== decreaseTotal) {
        errors.adjustment = "Adjustment increases and decreases must balance";
      }
      return {
        ok: Object.keys(errors).length === 0,
        errors,
      };
    }

    const effect = transactionAllocationEffect(transaction);
    const newTotal = existingAllocatedTotal + lineTotal;
    const txAmount = transaction.amount;

    if (effect === "increase") {
      if (newTotal > txAmount) {
        errors.total = `Allocation total ${newTotal} exceeds transaction amount ${txAmount}`;
      }
      if (!allowPartial && newTotal < txAmount) {
        errors.total = `Allocation total ${newTotal} is less than transaction amount ${txAmount}`;
      }
    } else if (newTotal !== txAmount) {
      errors.total = `Withdrawal allocation must equal transaction amount (${txAmount})`;
    }

    return {
      ok: Object.keys(errors).length === 0,
      errors,
    };
  }

  validateAutoLines(transaction: TrustTransaction): TrustAllocationLineInput[] {
    if (transaction.matterId) {
      return [
        {
          clientId: transaction.clientId,
          matterId: transaction.matterId,
          amount: transaction.amount,
          allocationType: "matter",
        },
      ];
    }

    return [
      {
        clientId: transaction.clientId,
        amount: transaction.amount,
        allocationType: "client",
      },
    ];
  }
}
