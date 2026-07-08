import {
  assertSufficientBalance,
  computeAllBalances,
  getAvailableBalance,
} from "./trust-ledger-balance";
import {
  TRUST_LEDGER_ERROR_CODES,
  TrustLedgerError,
  isTrustLedgerError,
} from "./trust-ledger-errors";
import { InMemoryTrustLedgerEventBus } from "./trust-ledger-events";
import {
  buildPostingsForTransaction,
  invertPostings,
} from "./trust-ledger-posting-builder";
import {
  assertJournalImmutable,
  validateBalancedPostings,
  validateOpenTrustAccountInput,
  validatePostTrustTransactionInput,
  validateReverseTrustTransactionInput,
  validateReversalTarget,
} from "./trust-ledger-validation";
import type { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import {
  getTrustLedgerDiagnostics,
  type TrustLedgerRunRecord,
  type TrustLedgerStageRecord,
} from "./trust-ledger-diagnostics";
import { createTrustId } from "./trust-id";
import type {
  OpenTrustAccountInput,
  PostTrustTransactionInput,
  ReverseTrustTransactionInput,
  TrustAccount,
  TrustJournal,
  TrustJournalEntry,
  TrustLedger,
  TrustLedgerDomainEvent,
  TrustTransaction,
  TrustBalance,
} from "./trust-ledger-types";

export interface TrustLedgerServiceOptions {
  readonly repository: InMemoryTrustLedgerRepository;
  readonly eventBus?: InMemoryTrustLedgerEventBus;
}

export interface TrustLedgerServiceResult<T> {
  readonly ok: boolean;
  readonly data?: T;
  readonly error?: TrustLedgerError;
  readonly run: TrustLedgerRunRecord;
}

function recordStage(
  stages: TrustLedgerStageRecord[],
  operation: TrustLedgerRunRecord["operation"],
  stage: TrustLedgerStageRecord["stage"],
  startedAt: number,
  ok: boolean,
  detail?: string,
): void {
  stages.push({
    operation,
    stage,
    ok,
    durationMs: performance.now() - startedAt,
    detail,
  });
}

function finalizeRun(
  operation: TrustLedgerRunRecord["operation"],
  startedAt: number,
  stages: TrustLedgerStageRecord[],
  ok: boolean,
  extras: Partial<TrustLedgerRunRecord> = {},
): TrustLedgerRunRecord {
  const run: TrustLedgerRunRecord = {
    operation,
    startedAt: new Date(startedAt).toISOString(),
    durationMs: performance.now() - startedAt,
    ok,
    stages,
    ...extras,
  };
  getTrustLedgerDiagnostics().record(run);
  return run;
}

/** Core in-memory Trust Ledger Engine (LAW-015-02). */
export class TrustLedgerService {
  private readonly repository: InMemoryTrustLedgerRepository;
  private readonly eventBus: InMemoryTrustLedgerEventBus;

  constructor(options: TrustLedgerServiceOptions) {
    this.repository = options.repository;
    this.eventBus = options.eventBus ?? new InMemoryTrustLedgerEventBus();
  }

  getEventBus(): InMemoryTrustLedgerEventBus {
    return this.eventBus;
  }

  openAccount(input: OpenTrustAccountInput): TrustLedgerServiceResult<TrustAccount> {
    const startedAt = performance.now();
    const stages: TrustLedgerStageRecord[] = [];

    try {
      const validationStarted = performance.now();
      validateOpenTrustAccountInput(input);
      recordStage(stages, "openAccount", "validation", validationStarted, true);

      const repoStarted = performance.now();
      const openedAt = new Date().toISOString();
      const account: TrustAccount = {
        trustAccountId: this.repository.createAccountId(),
        trustAccountCode: this.repository.nextTrustAccountCode(),
        tenantId: input.tenantId,
        name: input.name.trim(),
        currency: input.currency.trim().toUpperCase(),
        institutionName: input.institutionName.trim(),
        accountNumberMasked: input.accountNumberMasked.trim(),
        isActive: true,
        openedAt,
      };
      this.repository.saveAccount(account);
      recordStage(stages, "openAccount", "repository", repoStarted, true);

      const eventStarted = performance.now();
      this.publishEvent({
        eventId: "legal.trust.ledger.opened",
        occurredAt: openedAt,
        tenantId: account.tenantId,
        trustAccountId: account.trustAccountId,
        payload: {
          trustAccountCode: account.trustAccountCode,
          name: account.name,
          currency: account.currency,
          actorUserId: input.actorUserId,
        },
      });
      recordStage(stages, "openAccount", "event", eventStarted, true);

      const run = finalizeRun("openAccount", startedAt, stages, true, {
        tenantId: account.tenantId,
        trustAccountId: account.trustAccountId,
      });

      return { ok: true, data: account, run };
    } catch (error) {
      const ledgerError = toTrustLedgerError(error);
      recordStage(
        stages,
        "openAccount",
        "validation",
        startedAt,
        false,
        ledgerError.code,
      );
      const run = finalizeRun("openAccount", startedAt, stages, false, {
        tenantId: input.tenantId,
        errorCode: ledgerError.code,
      });
      return { ok: false, error: ledgerError, run };
    }
  }

  postTransaction(
    input: PostTrustTransactionInput,
  ): TrustLedgerServiceResult<TrustTransaction> {
    const startedAt = performance.now();
    const stages: TrustLedgerStageRecord[] = [];

    try {
      const validationStarted = performance.now();
      const account = this.requireAccount(input.tenantId, input.trustAccountId);
      validatePostTrustTransactionInput(input, account);

      if (input.trustTransactionType === "reversal" && input.reversesTransactionId) {
        const original = this.requireTransaction(
          input.tenantId,
          input.trustAccountId,
          input.reversesTransactionId,
        );
        validateReversalTarget(original, input.reversesTransactionId);
      }

      if (
        input.trustTransactionType === "withdrawal" ||
        input.trustTransactionType === "transfer_out" ||
        (input.trustTransactionType === "adjustment" &&
          input.adjustmentDirection === "decrease")
      ) {
        const balances = this.repository.getBalances(
          input.tenantId,
          input.trustAccountId,
        );
        const available = getAvailableBalance(balances, {
          tenantId: input.tenantId,
          trustAccountId: input.trustAccountId,
          clientId: input.clientId,
          matterId: input.matterId,
        });
        assertSufficientBalance(available, input.amount);
      }

      recordStage(stages, "postTransaction", "validation", validationStarted, true);

      const postingStarted = performance.now();
      let lines;
      let reversesEntryId: string | undefined;

      if (input.trustTransactionType === "reversal") {
        const original = this.requireTransaction(
          input.tenantId,
          input.trustAccountId,
          input.reversesTransactionId!,
        );
        const originalEntry = this.requireJournalEntry(
          input.tenantId,
          input.trustAccountId,
          original.journalEntryId,
        );
        lines = invertPostings(originalEntry.lines);
        reversesEntryId = originalEntry.journalEntryId;
      } else {
        lines = buildPostingsForTransaction({
          trustTransactionType: input.trustTransactionType,
          amount: input.amount,
          clientId: input.clientId,
          matterId: input.matterId,
          adjustmentDirection: input.adjustmentDirection,
        });
      }

      validateBalancedPostings(lines);
      recordStage(stages, "postTransaction", "posting", postingStarted, true);

      const repoStarted = performance.now();
      const postedAt = new Date().toISOString();
      const trustTransactionId = createTrustId("trx");
      const journalEntryId = createTrustId("jen");

      const journalEntry: TrustJournalEntry = Object.freeze({
        journalEntryId,
        journalReference: this.repository.nextJournalReference(
          Number.parseInt(input.postingDate.slice(0, 4), 10),
        ),
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        entryDate: input.postingDate,
        postedAt,
        postedByUserId: input.actorUserId,
        lines: Object.freeze([...lines]),
        trustTransactionId,
        reversesEntryId,
      });

      this.repository.appendJournalEntry(journalEntry);

      const transaction: TrustTransaction = {
        trustTransactionId,
        transactionReference: this.repository.nextTransactionReference(
          Number.parseInt(input.postingDate.slice(0, 4), 10),
        ),
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        trustTransactionType: input.trustTransactionType,
        amount: input.amount,
        currency: input.currency.trim().toUpperCase(),
        transactionDate: input.transactionDate,
        postingDate: input.postingDate,
        clientId: input.clientId,
        matterId: input.matterId,
        narrative: input.narrative.trim(),
        status: "posted",
        journalEntryId,
        postedByUserId: input.actorUserId,
        reversesTransactionId: input.reversesTransactionId,
        pairedTransactionId: input.pairedTransactionId,
        adjustmentDirection: input.adjustmentDirection,
      };

      this.repository.appendTransaction(transaction);

      if (input.trustTransactionType === "reversal" && input.reversesTransactionId) {
        this.repository.markTransactionReversed(
          input.tenantId,
          input.trustAccountId,
          input.reversesTransactionId,
        );
      }

      recordStage(stages, "postTransaction", "repository", repoStarted, true);

      const balanceStarted = performance.now();
      this.repository.rebuildBalancesFromJournal(input.tenantId, input.trustAccountId);
      recordStage(stages, "postTransaction", "balance", balanceStarted, true);

      const eventStarted = performance.now();
      this.publishEvent({
        eventId: "legal.trust.transaction.posted",
        occurredAt: postedAt,
        tenantId: transaction.tenantId,
        trustAccountId: transaction.trustAccountId,
        payload: {
          trustTransactionId: transaction.trustTransactionId,
          transactionReference: transaction.transactionReference,
          trustTransactionType: transaction.trustTransactionType,
          amount: transaction.amount,
          currency: transaction.currency,
          clientId: transaction.clientId,
          matterId: transaction.matterId ?? "",
          journalEntryId: transaction.journalEntryId,
          actorUserId: input.actorUserId,
        },
      });
      recordStage(stages, "postTransaction", "event", eventStarted, true);

      const run = finalizeRun("postTransaction", startedAt, stages, true, {
        tenantId: transaction.tenantId,
        trustAccountId: transaction.trustAccountId,
        trustTransactionId: transaction.trustTransactionId,
      });

      return { ok: true, data: transaction, run };
    } catch (error) {
      const ledgerError = toTrustLedgerError(error);
      recordStage(
        stages,
        "postTransaction",
        "validation",
        startedAt,
        false,
        ledgerError.code,
      );
      const run = finalizeRun("postTransaction", startedAt, stages, false, {
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        errorCode: ledgerError.code,
      });
      return { ok: false, error: ledgerError, run };
    }
  }

  reverseTransaction(
    input: ReverseTrustTransactionInput,
  ): TrustLedgerServiceResult<TrustTransaction> {
    const startedAt = performance.now();
    const stages: TrustLedgerStageRecord[] = [];

    try {
      const validationStarted = performance.now();
      const account = this.requireAccount(input.tenantId, input.trustAccountId);
      const original = this.requireTransaction(
        input.tenantId,
        input.trustAccountId,
        input.trustTransactionId,
      );
      validateReverseTrustTransactionInput(input, account, original);
      recordStage(stages, "reverseTransaction", "validation", validationStarted, true);

      const postResult = this.postTransaction({
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        trustTransactionType: "reversal",
        amount: original.amount,
        currency: original.currency,
        transactionDate: input.postingDate,
        postingDate: input.postingDate,
        clientId: original.clientId,
        matterId: original.matterId,
        narrative: input.narrative,
        actorUserId: input.actorUserId,
        reversesTransactionId: original.trustTransactionId,
      });

      if (!postResult.ok || !postResult.data) {
        throw (
          postResult.error ??
          new TrustLedgerError(
            TRUST_LEDGER_ERROR_CODES.TRUST_REVERSAL_INVALID,
            "Reversal post failed",
          )
        );
      }

      const eventStarted = performance.now();
      this.publishEvent({
        eventId: "legal.trust.transaction.reversed",
        occurredAt: new Date().toISOString(),
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        payload: {
          trustTransactionId: postResult.data.trustTransactionId,
          reversesTransactionId: original.trustTransactionId,
          amount: original.amount,
          actorUserId: input.actorUserId,
        },
      });
      recordStage(stages, "reverseTransaction", "event", eventStarted, true);

      const run = finalizeRun("reverseTransaction", startedAt, stages, true, {
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        trustTransactionId: postResult.data.trustTransactionId,
      });

      return { ok: true, data: postResult.data, run };
    } catch (error) {
      const ledgerError = toTrustLedgerError(error);
      recordStage(
        stages,
        "reverseTransaction",
        "validation",
        startedAt,
        false,
        ledgerError.code,
      );
      const run = finalizeRun("reverseTransaction", startedAt, stages, false, {
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        trustTransactionId: input.trustTransactionId,
        errorCode: ledgerError.code,
      });
      return { ok: false, error: ledgerError, run };
    }
  }

  rebuildBalances(
    tenantId: string,
    trustAccountId: string,
  ): TrustLedgerServiceResult<readonly import("./trust-ledger-types").TrustBalance[]> {
    const startedAt = performance.now();
    const stages: TrustLedgerStageRecord[] = [];

    try {
      this.requireAccount(tenantId, trustAccountId);
      const balances = this.repository.rebuildBalancesFromJournal(
        tenantId,
        trustAccountId,
      );
      recordStage(stages, "rebuildBalances", "balance", startedAt, true);
      const run = finalizeRun("rebuildBalances", startedAt, stages, true, {
        tenantId,
        trustAccountId,
      });
      return { ok: true, data: balances, run };
    } catch (error) {
      const ledgerError = toTrustLedgerError(error);
      const run = finalizeRun("rebuildBalances", startedAt, stages, false, {
        tenantId,
        trustAccountId,
        errorCode: ledgerError.code,
      });
      return { ok: false, error: ledgerError, run };
    }
  }

  getLedger(tenantId: string, trustAccountId: string): TrustLedger | undefined {
    const account = this.repository.getAccount(tenantId, trustAccountId);
    if (!account) {
      return undefined;
    }

    return {
      tenantId,
      trustAccountId,
      openedAt: account.openedAt,
      entryCount: this.repository.getJournalEntries(tenantId, trustAccountId).length,
      transactionCount: this.repository.listTransactions(tenantId, trustAccountId)
        .length,
    };
  }

  getJournal(tenantId: string, trustAccountId: string): TrustJournal {
    return {
      tenantId,
      trustAccountId,
      entries: this.repository.getJournalEntries(tenantId, trustAccountId),
    };
  }

  listAccounts(tenantId: string): readonly TrustAccount[] {
    return this.repository.listAccounts(tenantId);
  }

  getAccount(tenantId: string, trustAccountId: string): TrustAccount | undefined {
    return this.repository.getAccount(tenantId, trustAccountId);
  }

  listTransactions(
    tenantId: string,
    trustAccountId: string,
  ): readonly TrustTransaction[] {
    this.requireAccount(tenantId, trustAccountId);
    return this.repository.listTransactions(tenantId, trustAccountId);
  }

  getBalances(tenantId: string, trustAccountId: string): readonly TrustBalance[] {
    this.requireAccount(tenantId, trustAccountId);
    return this.repository.getBalances(tenantId, trustAccountId);
  }

  /** Guard against journal mutation — exposed for tests. */
  assertJournalEntryImmutable(
    existing: TrustJournalEntry,
    patch: Partial<TrustJournalEntry>,
  ): void {
    assertJournalImmutable(existing, patch);
  }

  private requireAccount(tenantId: string, trustAccountId: string): TrustAccount {
    const account = this.repository.getAccount(tenantId, trustAccountId);
    if (!account) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_ACCOUNT_NOT_FOUND,
        "Trust account not found",
      );
    }
    return account;
  }

  private requireTransaction(
    tenantId: string,
    trustAccountId: string,
    trustTransactionId: string,
  ): TrustTransaction {
    const transaction = this.repository.getTransaction(
      tenantId,
      trustAccountId,
      trustTransactionId,
    );
    if (!transaction) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_TRANSACTION_NOT_FOUND,
        "Trust transaction not found",
      );
    }
    return transaction;
  }

  private requireJournalEntry(
    tenantId: string,
    trustAccountId: string,
    journalEntryId: string,
  ): TrustJournalEntry {
    const entry = this.repository
      .getJournalEntries(tenantId, trustAccountId)
      .find((item) => item.journalEntryId === journalEntryId);
    if (!entry) {
      throw new TrustLedgerError(
        TRUST_LEDGER_ERROR_CODES.TRUST_TRANSACTION_NOT_FOUND,
        "Journal entry not found",
      );
    }
    return entry;
  }

  private publishEvent(event: TrustLedgerDomainEvent): void {
    this.eventBus.publish(event);
  }
}

function toTrustLedgerError(error: unknown): TrustLedgerError {
  if (isTrustLedgerError(error)) {
    return error;
  }
  return new TrustLedgerError(
    TRUST_LEDGER_ERROR_CODES.TRUST_REVERSAL_INVALID,
    error instanceof Error ? error.message : "Unknown trust ledger error",
  );
}

export function verifyJournalIntegrity(entries: readonly TrustJournalEntry[]): boolean {
  return entries.every((entry) => {
    const debits = entry.lines
      .filter((line) => line.side === "debit")
      .reduce((sum, line) => sum + line.amount, 0);
    const credits = entry.lines
      .filter((line) => line.side === "credit")
      .reduce((sum, line) => sum + line.amount, 0);
    return debits === credits && debits > 0;
  });
}

export function recomputeBalancesFromJournal(
  entries: readonly TrustJournalEntry[],
  tenantId: string,
  trustAccountId: string,
  currency: string,
) {
  return computeAllBalances(entries, { tenantId, trustAccountId, currency });
}
