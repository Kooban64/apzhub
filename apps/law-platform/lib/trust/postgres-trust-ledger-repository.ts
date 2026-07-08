import { PostgresTrustStore, type PostgresTrustStoreOptions } from "@apzhub/config";

import { ReferenceNumberGenerator } from "@apzhub/legal-business-core";

import { TRUST_LEDGER_ERROR_CODES, TrustLedgerError } from "./trust-ledger-errors";
import { balanceKey, computeAllBalances } from "./trust-ledger-balance";
import { createTrustId } from "./trust-id";
import type {
  TrustAccount,
  TrustBalance,
  TrustJournalEntry,
  TrustTransaction,
} from "./trust-ledger-types";

/** PostgreSQL-backed trust ledger repository (LAW-015-11). */
export class PostgresTrustLedgerRepository {
  private readonly store: PostgresTrustStore;
  private readonly referenceGenerator = new ReferenceNumberGenerator();
  private journalSequence = 0;

  constructor(options: PostgresTrustStoreOptions) {
    this.store = new PostgresTrustStore(options);
  }

  getStore(): PostgresTrustStore {
    return this.store;
  }

  saveAccount(account: TrustAccount): TrustAccount {
    this.store.saveAccount(account);
    return account;
  }

  getAccount(tenantId: string, trustAccountId: string): TrustAccount | undefined {
    const account = this.store.getAccount(trustAccountId);
    if (account && account.tenantId !== tenantId) {
      return undefined;
    }
    return account as TrustAccount | undefined;
  }

  listAccounts(tenantId: string): readonly TrustAccount[] {
    return this.store.listAccounts().filter((account) => account.tenantId === tenantId);
  }

  appendJournalEntry(entry: TrustJournalEntry): TrustJournalEntry {
    if (!this.getAccount(entry.tenantId, entry.trustAccountId)) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_ACCOUNT_NOT_FOUND,
        "Trust account ledger not found",
      );
    }
    this.store.appendJournalEntry(
      entry as Parameters<PostgresTrustStore["appendJournalEntry"]>[0],
    );
    return entry;
  }

  getJournalEntries(
    tenantId: string,
    trustAccountId: string,
  ): readonly TrustJournalEntry[] {
    return this.store
      .getJournalEntries(trustAccountId)
      .filter((entry) => entry.tenantId === tenantId) as readonly TrustJournalEntry[];
  }

  appendTransaction(transaction: TrustTransaction): TrustTransaction {
    if (!this.getAccount(transaction.tenantId, transaction.trustAccountId)) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_ACCOUNT_NOT_FOUND,
        "Trust account not found for transaction",
      );
    }
    this.store.appendTransaction(
      transaction as Parameters<PostgresTrustStore["appendTransaction"]>[0],
    );
    return transaction;
  }

  getTransaction(
    tenantId: string,
    trustAccountId: string,
    trustTransactionId: string,
  ): TrustTransaction | undefined {
    const transaction = this.store.getTransaction(trustAccountId, trustTransactionId);
    if (!transaction || transaction.tenantId !== tenantId) {
      return undefined;
    }
    return transaction as TrustTransaction;
  }

  listTransactions(
    tenantId: string,
    trustAccountId: string,
  ): readonly TrustTransaction[] {
    return this.store
      .listTransactions(trustAccountId)
      .filter(
        (transaction) => transaction.tenantId === tenantId,
      ) as readonly TrustTransaction[];
  }

  markTransactionReversed(
    tenantId: string,
    trustAccountId: string,
    trustTransactionId: string,
  ): TrustTransaction {
    const updated = this.store.markTransactionReversed(
      trustAccountId,
      trustTransactionId,
    );
    if (!updated || updated.tenantId !== tenantId) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_TRANSACTION_NOT_FOUND,
        "Trust transaction not found",
      );
    }
    return updated as TrustTransaction;
  }

  replaceBalances(
    tenantId: string,
    trustAccountId: string,
    balances: readonly TrustBalance[],
  ): void {
    this.store.replaceBalances(
      trustAccountId,
      balances.filter(
        (balance) =>
          balance.tenantId === tenantId && balance.trustAccountId === trustAccountId,
      ) as Parameters<PostgresTrustStore["replaceBalances"]>[1],
    );
  }

  getBalances(tenantId: string, trustAccountId: string): readonly TrustBalance[] {
    return this.store
      .getBalances(trustAccountId)
      .filter(
        (balance) => balance.tenantId === tenantId,
      ) as unknown as readonly TrustBalance[];
  }

  rebuildBalancesFromJournal(
    tenantId: string,
    trustAccountId: string,
  ): readonly TrustBalance[] {
    const account = this.getAccount(tenantId, trustAccountId);
    if (!account) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_ACCOUNT_NOT_FOUND,
        "Trust account not found",
      );
    }

    const entries = this.getJournalEntries(tenantId, trustAccountId);
    const balances = computeAllBalances(entries, {
      tenantId,
      trustAccountId,
      currency: account.currency,
    });
    this.replaceBalances(tenantId, trustAccountId, balances);
    return balances;
  }

  nextTrustAccountCode(year?: number): string {
    return this.referenceGenerator.nextTrustAccountCode(year);
  }

  nextTransactionReference(year?: number): string {
    return this.referenceGenerator.nextTrustTransactionReference(year);
  }

  nextJournalReference(year?: number): string {
    this.journalSequence += 1;
    const y = year ?? new Date().getFullYear();
    return `JE-${y}-${String(this.journalSequence).padStart(6, "0")}`;
  }

  createAccountId(): string {
    return createTrustId("tac");
  }
}

export function balanceKeyFromTrustBalance(balance: TrustBalance): string {
  return balanceKey(
    balance.tenantId,
    balance.trustAccountId,
    balance.scope,
    balance.clientId,
    balance.matterId,
  );
}
