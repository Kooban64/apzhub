import { beforeEach, describe, expect, it } from "vitest";

import {
  InMemoryTrustLedgerEventBus,
  InMemoryTrustLedgerRepository,
  TrustLedgerError,
  TrustLedgerService,
  buildTrustLedgerDiagnosticsSnapshot,
  getTrustLedgerDiagnostics,
  isBalanced,
  resetTrustIdCounter,
  resetTrustLedgerDiagnostics,
  verifyJournalIntegrity,
} from "./index";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";
const CLIENT_1 = "client-001";
const CLIENT_2 = "client-002";
const MATTER_1 = "matter-001";
const ACTOR = "user-001";

describe("TrustLedgerService", () => {
  let repository: InMemoryTrustLedgerRepository;
  let eventBus: InMemoryTrustLedgerEventBus;
  let service: TrustLedgerService;

  beforeEach(() => {
    resetTrustIdCounter();
    resetTrustLedgerDiagnostics();
    repository = new InMemoryTrustLedgerRepository();
    eventBus = new InMemoryTrustLedgerEventBus();
    service = new TrustLedgerService({ repository, eventBus });
  });

  function openDefaultAccount(tenantId = TENANT_A) {
    const result = service.openAccount({
      tenantId,
      name: "Main Trust",
      currency: "ZAR",
      institutionName: "First National Bank",
      accountNumberMasked: "****1234",
      actorUserId: ACTOR,
    });
    expect(result.ok).toBe(true);
    return result.data!;
  }

  it("opens a trust ledger and emits legal.trust.ledger.opened", () => {
    const account = openDefaultAccount();
    const events = eventBus.listEvents();

    expect(account.trustAccountCode).toMatch(/^TRU-\d{4}-\d{6}$/);
    expect(account.isActive).toBe(true);
    expect(events).toHaveLength(1);
    expect(events[0]?.eventId).toBe("legal.trust.ledger.opened");
    expect(events[0]?.tenantId).toBe(TENANT_A);
  });

  it("posts a balanced deposit transaction", () => {
    const account = openDefaultAccount();

    const result = service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "deposit",
      amount: 1000,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT_1,
      narrative: "Client deposit",
      actorUserId: ACTOR,
    });

    expect(result.ok).toBe(true);
    expect(result.data?.transactionReference).toMatch(/^TRX-\d{4}-\d{6}$/);

    const journal = service.getJournal(TENANT_A, account.trustAccountId);
    expect(journal.entries).toHaveLength(1);
    expect(verifyJournalIntegrity(journal.entries)).toBe(true);
    expect(isBalanced(journal.entries[0]!.lines)).toBe(true);

    const postedEvents = eventBus
      .listEvents()
      .filter((event) => event.eventId === "legal.trust.transaction.posted");
    expect(postedEvents).toHaveLength(1);
  });

  it("rejects unbalanced postings at validation layer", () => {
    expect(
      isBalanced([
        {
          postingId: "p1",
          accountCode: "TRUST-CASH",
          side: "debit",
          amount: 100,
        },
        {
          postingId: "p2",
          accountCode: "TRUST-LIABILITY-CLIENT",
          side: "credit",
          amount: 50,
          clientId: CLIENT_1,
        },
      ]),
    ).toBe(false);
  });

  it("rejects deposit with invalid amount or currency mismatch", () => {
    const account = openDefaultAccount();

    const invalidAmount = service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "deposit",
      amount: 0,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT_1,
      narrative: "Invalid",
      actorUserId: ACTOR,
    });
    expect(invalidAmount.ok).toBe(false);
    expect(invalidAmount.error?.code).toBe("TRUST_INVALID_AMOUNT");

    const currencyMismatch = service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "deposit",
      amount: 100,
      currency: "USD",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT_1,
      narrative: "Wrong currency",
      actorUserId: ACTOR,
    });
    expect(currencyMismatch.ok).toBe(false);
    expect(currencyMismatch.error?.code).toBe("TRUST_CURRENCY_MISMATCH");
  });

  it("keeps journal entries immutable after post", () => {
    const account = openDefaultAccount();
    const posted = service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "deposit",
      amount: 500,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT_1,
      narrative: "Deposit",
      actorUserId: ACTOR,
    }).data!;

    const entry = service.getJournal(TENANT_A, account.trustAccountId).entries[0]!;

    expect(() =>
      service.assertJournalEntryImmutable(entry, { amount: 999 } as never),
    ).not.toThrow();

    expect(() => service.assertJournalEntryImmutable(entry, { lines: [] })).toThrow(
      TrustLedgerError,
    );

    expect(() =>
      service.assertJournalEntryImmutable(entry, {
        journalReference: "JE-2026-000999",
      }),
    ).toThrow(TrustLedgerError);

    expect(posted.status).toBe("posted");
  });

  it("reverses a posted transaction and marks original as reversed", () => {
    const account = openDefaultAccount();
    const deposit = service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "deposit",
      amount: 800,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT_1,
      narrative: "Deposit to reverse",
      actorUserId: ACTOR,
    }).data!;

    const reversal = service.reverseTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionId: deposit.trustTransactionId,
      postingDate: "2026-07-02",
      narrative: "Reversal",
      actorUserId: ACTOR,
    });

    expect(reversal.ok).toBe(true);
    expect(reversal.data?.trustTransactionType).toBe("reversal");

    const original = repository.getTransaction(
      TENANT_A,
      account.trustAccountId,
      deposit.trustTransactionId,
    );
    expect(original?.status).toBe("reversed");

    const reversedEvents = eventBus
      .listEvents()
      .filter((event) => event.eventId === "legal.trust.transaction.reversed");
    expect(reversedEvents).toHaveLength(1);

    const balances = repository.getBalances(TENANT_A, account.trustAccountId);
    const clientBalance = balances.find(
      (balance) => balance.scope === "client" && balance.clientId === CLIENT_1,
    );
    expect(clientBalance?.balanceAmount).toBe(0);
  });

  it("rejects reversal of already reversed transaction", () => {
    const account = openDefaultAccount();
    const deposit = service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "deposit",
      amount: 300,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT_1,
      narrative: "Deposit",
      actorUserId: ACTOR,
    }).data!;

    service.reverseTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionId: deposit.trustTransactionId,
      postingDate: "2026-07-02",
      narrative: "First reversal",
      actorUserId: ACTOR,
    });

    const second = service.reverseTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionId: deposit.trustTransactionId,
      postingDate: "2026-07-03",
      narrative: "Second reversal",
      actorUserId: ACTOR,
    });

    expect(second.ok).toBe(false);
    expect(second.error?.code).toBe("TRUST_ALREADY_REVERSED");
  });

  it("calculates account, client, and matter balances", () => {
    const account = openDefaultAccount();

    service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "deposit",
      amount: 1000,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT_1,
      matterId: MATTER_1,
      narrative: "Matter deposit",
      actorUserId: ACTOR,
    });

    service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "deposit",
      amount: 400,
      currency: "ZAR",
      transactionDate: "2026-07-02",
      postingDate: "2026-07-02",
      clientId: CLIENT_1,
      narrative: "Unallocated client pool",
      actorUserId: ACTOR,
    });

    const balances = repository.getBalances(TENANT_A, account.trustAccountId);
    const accountBalance = balances.find((balance) => balance.scope === "account");
    const clientBalance = balances.find(
      (balance) => balance.scope === "client" && balance.clientId === CLIENT_1,
    );
    const matterBalance = balances.find(
      (balance) => balance.scope === "matter" && balance.matterId === MATTER_1,
    );

    expect(accountBalance?.balanceAmount).toBe(1400);
    expect(clientBalance?.balanceAmount).toBe(400);
    expect(matterBalance?.balanceAmount).toBe(1000);
  });

  it("rejects withdrawal when client balance is insufficient", () => {
    const account = openDefaultAccount();

    service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "deposit",
      amount: 200,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT_1,
      narrative: "Small deposit",
      actorUserId: ACTOR,
    });

    const withdrawal = service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "withdrawal",
      amount: 500,
      currency: "ZAR",
      transactionDate: "2026-07-02",
      postingDate: "2026-07-02",
      clientId: CLIENT_1,
      narrative: "Too much",
      actorUserId: ACTOR,
    });

    expect(withdrawal.ok).toBe(false);
    expect(withdrawal.error?.code).toBe("TRUST_INSUFFICIENT_BALANCE");
  });

  it("enforces tenant isolation", () => {
    const accountA = openDefaultAccount(TENANT_A);
    openDefaultAccount(TENANT_B);

    const crossTenant = service.postTransaction({
      tenantId: TENANT_B,
      trustAccountId: accountA.trustAccountId,
      trustTransactionType: "deposit",
      amount: 100,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT_1,
      narrative: "Cross tenant",
      actorUserId: ACTOR,
    });

    expect(crossTenant.ok).toBe(false);
    expect(crossTenant.error?.code).toBe("TRUST_ACCOUNT_NOT_FOUND");

    expect(service.getLedger(TENANT_B, accountA.trustAccountId)).toBeUndefined();
    expect(repository.listAccounts(TENANT_A)).toHaveLength(1);
    expect(repository.listAccounts(TENANT_B)).toHaveLength(1);
  });

  it("supports opening_balance and adjustment transaction types", () => {
    const account = openDefaultAccount();

    const opening = service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "opening_balance",
      amount: 2500,
      currency: "ZAR",
      transactionDate: "2026-01-01",
      postingDate: "2026-01-01",
      clientId: CLIENT_2,
      narrative: "Opening balance",
      actorUserId: ACTOR,
    });
    expect(opening.ok).toBe(true);

    const decrease = service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "adjustment",
      amount: 100,
      currency: "ZAR",
      transactionDate: "2026-07-03",
      postingDate: "2026-07-03",
      clientId: CLIENT_2,
      adjustmentDirection: "decrease",
      narrative: "Adjustment down",
      actorUserId: ACTOR,
    });
    expect(decrease.ok).toBe(true);

    const balances = repository.getBalances(TENANT_A, account.trustAccountId);
    const clientBalance = balances.find(
      (balance) => balance.scope === "client" && balance.clientId === CLIENT_2,
    );
    expect(clientBalance?.balanceAmount).toBe(2400);
  });

  it("rebuilds balances from journal via maintenance command", () => {
    const account = openDefaultAccount();

    service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "deposit",
      amount: 750,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT_1,
      narrative: "Deposit",
      actorUserId: ACTOR,
    });

    const rebuild = service.rebuildBalances(TENANT_A, account.trustAccountId);
    expect(rebuild.ok).toBe(true);
    expect(
      rebuild.data?.some(
        (balance) => balance.scope === "account" && balance.balanceAmount === 750,
      ),
    ).toBe(true);
  });

  it("records diagnostics summary for operations", () => {
    const account = openDefaultAccount();

    service.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: account.trustAccountId,
      trustTransactionType: "deposit",
      amount: 100,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT_1,
      narrative: "Deposit",
      actorUserId: ACTOR,
    });

    const diagnostics = getTrustLedgerDiagnostics();
    const summary = diagnostics.getSummary();

    expect(summary.accountsOpened).toBe(1);
    expect(summary.transactionsPosted).toBe(1);
    expect(summary.successfulRuns).toBeGreaterThanOrEqual(2);

    const snapshot = buildTrustLedgerDiagnosticsSnapshot({
      repositoryAccountCount: repository.listAccounts(TENANT_A).length,
      repositoryJournalEntryCount: service.getJournal(TENANT_A, account.trustAccountId)
        .entries.length,
      repositoryTransactionCount: repository.listTransactions(
        TENANT_A,
        account.trustAccountId,
      ).length,
      domainEventCount: eventBus.listEvents().length,
    });

    expect(snapshot.accountCount).toBe(1);
    expect(snapshot.journalEntryCount).toBe(1);
    expect(snapshot.transactionCount).toBe(1);
    expect(snapshot.domainEventCount).toBe(2);
  });
});

describe("InMemoryTrustLedgerRepository", () => {
  it("stores accounts per tenant without cross-tenant leakage", () => {
    const repository = new InMemoryTrustLedgerRepository();

    repository.saveAccount({
      trustAccountId: "acc-a",
      trustAccountCode: "TRU-2026-000001",
      tenantId: TENANT_A,
      name: "A",
      currency: "ZAR",
      institutionName: "Bank",
      accountNumberMasked: "****1",
      isActive: true,
      openedAt: new Date().toISOString(),
    });

    expect(repository.getAccount(TENANT_A, "acc-a")).toBeDefined();
    expect(repository.getAccount(TENANT_B, "acc-a")).toBeUndefined();
  });
});
