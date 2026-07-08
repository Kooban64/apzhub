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

/** In-memory append-only trust ledger store (LAW-015-02). */
export class InMemoryTrustLedgerRepository {
  private readonly accounts = new Map<string, TrustAccount>();
  private readonly journalEntries = new Map<string, TrustJournalEntry[]>();
  private readonly transactions = new Map<string, TrustTransaction[]>();
  private readonly balances = new Map<string, TrustBalance>();
  private readonly referenceGenerator = new ReferenceNumberGenerator();
  private journalSequence = 0;

  clear(): void {
    this.accounts.clear();
    this.journalEntries.clear();
    this.transactions.clear();
    this.balances.clear();
    this.journalSequence = 0;
  }

  saveAccount(account: TrustAccount): TrustAccount {
    this.accounts.set(
      this.accountKey(account.tenantId, account.trustAccountId),
      account,
    );
    this.journalEntries.set(
      this.accountKey(account.tenantId, account.trustAccountId),
      [],
    );
    this.transactions.set(
      this.accountKey(account.tenantId, account.trustAccountId),
      [],
    );
    return account;
  }

  getAccount(tenantId: string, trustAccountId: string): TrustAccount | undefined {
    return this.accounts.get(this.accountKey(tenantId, trustAccountId));
  }

  listAccounts(tenantId: string): readonly TrustAccount[] {
    return [...this.accounts.values()].filter(
      (account) => account.tenantId === tenantId,
    );
  }

  appendJournalEntry(entry: TrustJournalEntry): TrustJournalEntry {
    const key = this.accountKey(entry.tenantId, entry.trustAccountId);
    const existing = this.journalEntries.get(key);
    if (!existing) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_ACCOUNT_NOT_FOUND,
        "Trust account ledger not found",
      );
    }

    existing.push(Object.freeze({ ...entry, lines: Object.freeze([...entry.lines]) }));
    return entry;
  }

  getJournalEntries(
    tenantId: string,
    trustAccountId: string,
  ): readonly TrustJournalEntry[] {
    return [
      ...(this.journalEntries.get(this.accountKey(tenantId, trustAccountId)) ?? []),
    ];
  }

  appendTransaction(transaction: TrustTransaction): TrustTransaction {
    const key = this.accountKey(transaction.tenantId, transaction.trustAccountId);
    const list = this.transactions.get(key);
    if (!list) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_ACCOUNT_NOT_FOUND,
        "Trust account not found for transaction",
      );
    }
    list.push(transaction);
    return transaction;
  }

  getTransaction(
    tenantId: string,
    trustAccountId: string,
    trustTransactionId: string,
  ): TrustTransaction | undefined {
    return (
      this.transactions.get(this.accountKey(tenantId, trustAccountId)) ?? []
    ).find((item) => item.trustTransactionId === trustTransactionId);
  }

  listTransactions(
    tenantId: string,
    trustAccountId: string,
  ): readonly TrustTransaction[] {
    return [
      ...(this.transactions.get(this.accountKey(tenantId, trustAccountId)) ?? []),
    ];
  }

  /** Status-only update permitted on posted transactions when reversing. */
  markTransactionReversed(
    tenantId: string,
    trustAccountId: string,
    trustTransactionId: string,
  ): TrustTransaction {
    const list = this.transactions.get(this.accountKey(tenantId, trustAccountId));
    if (!list) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_ACCOUNT_NOT_FOUND,
        "Trust account not found",
      );
    }

    const index = list.findIndex(
      (item) => item.trustTransactionId === trustTransactionId,
    );
    if (index < 0) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_TRANSACTION_NOT_FOUND,
        "Trust transaction not found",
      );
    }

    const current = list[index]!;
    const updated: TrustTransaction = { ...current, status: "reversed" };
    list[index] = updated;
    return updated;
  }

  replaceBalances(
    tenantId: string,
    trustAccountId: string,
    balances: readonly TrustBalance[],
  ): void {
    for (const key of [...this.balances.keys()]) {
      if (key.startsWith(`${tenantId}|${trustAccountId}|`)) {
        this.balances.delete(key);
      }
    }

    for (const balance of balances) {
      this.balances.set(
        balanceKey(
          balance.tenantId,
          balance.trustAccountId,
          balance.scope,
          balance.clientId,
          balance.matterId,
        ),
        balance,
      );
    }
  }

  getBalances(tenantId: string, trustAccountId: string): readonly TrustBalance[] {
    return [...this.balances.values()].filter(
      (balance) =>
        balance.tenantId === tenantId && balance.trustAccountId === trustAccountId,
    );
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

  private accountKey(tenantId: string, trustAccountId: string): string {
    return `${tenantId}::${trustAccountId}`;
  }
}
