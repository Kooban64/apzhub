import type { InMemoryTrustAllocationRepository } from "./in-memory-trust-allocation-repository";
import type { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import {
  computeClientAllocatedBalance,
  computeMatterAllocatedBalance,
} from "./trust-allocation-balance";
import type {
  CreateTrustTransferDraftInput,
  TrustTransfer,
  TrustTransferType,
  TrustTransferValidationResult,
} from "./trust-transfer-types";

/** Validates trust transfer drafts and posted transfers (LAW-015-07). */
export class TrustTransferValidator {
  validateDraft(
    input: CreateTrustTransferDraftInput,
    ledgerRepository: InMemoryTrustLedgerRepository,
    allocationRepository: InMemoryTrustAllocationRepository,
    existingTransfer?: TrustTransfer,
  ): TrustTransferValidationResult {
    const errors: Record<string, string> = {};
    const destAccountId = input.destinationTrustAccountId ?? input.sourceTrustAccountId;

    const sourceAccount = ledgerRepository.getAccount(
      input.tenantId,
      input.sourceTrustAccountId,
    );
    if (!sourceAccount) {
      errors.sourceTrustAccountId = "Source trust account not found";
    } else if (!sourceAccount.isActive) {
      errors.sourceTrustAccountId = "Source trust account is inactive";
    } else if (sourceAccount.tenantId !== input.tenantId) {
      errors.tenantId = "Tenant scope mismatch on source account";
    }

    const destAccount = ledgerRepository.getAccount(input.tenantId, destAccountId);
    if (!destAccount) {
      errors.destinationTrustAccountId = "Destination trust account not found";
    } else if (!destAccount.isActive) {
      errors.destinationTrustAccountId = "Destination trust account is inactive";
    } else if (destAccount.tenantId !== input.tenantId) {
      errors.tenantId = "Tenant scope mismatch on destination account";
    }

    if (sourceAccount && destAccount) {
      if (sourceAccount.currency !== destAccount.currency) {
        errors.currency = "Source and destination accounts must share currency";
      }
      if (input.currency.trim().toUpperCase() !== sourceAccount.currency) {
        errors.currency = "Transfer currency must match account currency";
      }
    }

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      errors.amount = "Amount must be a positive number";
    }

    if (!input.reason.trim()) {
      errors.reason = "Transfer reason is required";
    }

    if (!input.sourceClientId.trim()) {
      errors.sourceClientId = "Source client is required";
    }
    if (!input.destinationClientId.trim()) {
      errors.destinationClientId = "Destination client is required";
    }

    const transferType = input.transferType ?? inferTransferType(input);

    if (transferType === "reversal" && !input.reversesTransferId?.trim()) {
      errors.reversesTransferId = "Reversal transfers require reversesTransferId";
    }

    if (
      transferType !== "allocation_correction" &&
      transferType !== "reversal" &&
      isSameEndpoint(input)
    ) {
      errors.endpoints = "Source and destination must differ";
    }

    if (
      transferType === "matter_to_matter" &&
      (!input.sourceMatterId || !input.destinationMatterId)
    ) {
      errors.matterId =
        "Matter-to-matter transfers require source and destination matters";
    }

    if (transferType === "client_to_client" && input.destinationMatterId) {
      errors.matterId =
        "Client-to-client transfers must not specify a destination matter";
    }

    if (
      transferType === "matter_to_client" &&
      (!input.sourceMatterId || input.destinationMatterId)
    ) {
      errors.matterId =
        "Matter-to-client requires source matter and no destination matter";
    }

    if (
      transferType === "client_to_matter" &&
      (input.sourceMatterId || !input.destinationMatterId)
    ) {
      errors.matterId =
        "Client-to-matter requires destination matter and no source matter";
    }

    if (
      transferType === "account_to_account" &&
      destAccountId === input.sourceTrustAccountId
    ) {
      errors.destinationTrustAccountId =
        "Account transfer requires different trust accounts";
    }

    let sourceBalance: number | undefined;
    let destinationBalance: number | undefined;

    if (
      sourceAccount &&
      Object.keys(errors).length === 0 &&
      transferType !== "reversal"
    ) {
      sourceBalance = readSourceBalance(
        allocationRepository,
        input.tenantId,
        input.sourceTrustAccountId,
        input.sourceClientId,
        input.sourceMatterId,
        sourceAccount.currency,
      );

      if (sourceBalance < input.amount) {
        errors.sourceBalance = `Insufficient source balance (${sourceBalance} available, ${input.amount} requested)`;
      }
    }

    if (destAccount && Object.keys(errors).length === 0) {
      destinationBalance = readDestinationBalance(
        allocationRepository,
        input.tenantId,
        destAccountId,
        input.destinationClientId,
        input.destinationMatterId,
        destAccount.currency,
      );
    }

    if (existingTransfer && existingTransfer.status === "reversed") {
      errors.status = "Transfer already reversed";
    }

    return {
      ok: Object.keys(errors).length === 0,
      errors,
      sourceBalance,
      destinationBalance,
    };
  }

  validateForPost(transfer: TrustTransfer): TrustTransferValidationResult {
    const errors: Record<string, string> = {};

    if (transfer.status !== "approved") {
      errors.status = "Only approved transfers can be posted";
    }

    if (transfer.transferType === "reversal" && !transfer.reversesTransferId) {
      errors.reversesTransferId = "Reversal transfer missing original reference";
    }

    return {
      ok: Object.keys(errors).length === 0,
      errors,
      sourceBalance: transfer.sourceBalanceBefore,
      destinationBalance: transfer.destinationBalanceBefore,
    };
  }
}

export function inferTransferType(
  input: CreateTrustTransferDraftInput,
): TrustTransferType {
  if (input.reversesTransferId) {
    return "reversal";
  }

  const destAccountId = input.destinationTrustAccountId ?? input.sourceTrustAccountId;

  if (destAccountId !== input.sourceTrustAccountId) {
    return "account_to_account";
  }

  if (input.sourceMatterId && input.destinationMatterId) {
    return "matter_to_matter";
  }

  if (input.sourceMatterId && !input.destinationMatterId) {
    return "matter_to_client";
  }

  if (!input.sourceMatterId && input.destinationMatterId) {
    return "client_to_matter";
  }

  if (input.sourceClientId !== input.destinationClientId) {
    return "client_to_client";
  }

  return "allocation_correction";
}

function isSameEndpoint(input: CreateTrustTransferDraftInput): boolean {
  const destAccountId = input.destinationTrustAccountId ?? input.sourceTrustAccountId;
  return (
    input.sourceTrustAccountId === destAccountId &&
    input.sourceClientId === input.destinationClientId &&
    (input.sourceMatterId ?? "") === (input.destinationMatterId ?? "")
  );
}

function readSourceBalance(
  allocationRepository: InMemoryTrustAllocationRepository,
  tenantId: string,
  trustAccountId: string,
  clientId: string,
  matterId: string | undefined,
  currency: string,
): number {
  const allocations = allocationRepository.list({ tenantId, trustAccountId });
  if (matterId) {
    return computeMatterAllocatedBalance(
      allocations,
      tenantId,
      trustAccountId,
      clientId,
      matterId,
      currency,
    ).balanceAmount;
  }
  return computeClientAllocatedBalance(
    allocations,
    tenantId,
    trustAccountId,
    clientId,
    currency,
  ).balanceAmount;
}

function readDestinationBalance(
  allocationRepository: InMemoryTrustAllocationRepository,
  tenantId: string,
  trustAccountId: string,
  clientId: string,
  matterId: string | undefined,
  currency: string,
): number {
  return readSourceBalance(
    allocationRepository,
    tenantId,
    trustAccountId,
    clientId,
    matterId,
    currency,
  );
}
