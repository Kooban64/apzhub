import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryTrustAllocationRepository } from "./in-memory-trust-allocation-repository";
import { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import {
  buildTrustAllocationDiagnosticsSnapshot,
  getTrustAllocationDiagnostics,
  resetTrustAllocationDiagnostics,
} from "./trust-allocation-diagnostics";
import { InMemoryTrustAllocationEventBus } from "./trust-allocation-events";
import { TrustAllocationService } from "./trust-allocation-service";
import { TrustLedgerService } from "./trust-ledger-service";
import { resetTrustIdCounter } from "./trust-id";
import { resetTrustLedgerDiagnostics } from "./trust-ledger-diagnostics";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";
const CLIENT = "client-001";
const OTHER_CLIENT = "client-002";
const MATTER_1 = "matter-001";
const MATTER_2 = "matter-002";
const ACTOR = "user-001";

describe("TrustAllocationService", () => {
  let ledgerRepository: InMemoryTrustLedgerRepository;
  let ledgerService: TrustLedgerService;
  let allocationRepository: InMemoryTrustAllocationRepository;
  let eventBus: InMemoryTrustAllocationEventBus;
  let allocationService: TrustAllocationService;
  let accountId: string;

  beforeEach(() => {
    resetTrustIdCounter();
    resetTrustLedgerDiagnostics();
    resetTrustAllocationDiagnostics();

    ledgerRepository = new InMemoryTrustLedgerRepository();
    ledgerService = new TrustLedgerService({ repository: ledgerRepository });
    allocationRepository = new InMemoryTrustAllocationRepository();
    eventBus = new InMemoryTrustAllocationEventBus();
    allocationService = new TrustAllocationService({
      allocationRepository,
      ledgerRepository,
      eventBus,
    });

    accountId = ledgerService.openAccount({
      tenantId: TENANT_A,
      name: "Trust",
      currency: "ZAR",
      institutionName: "FNB",
      accountNumberMasked: "****4321",
      actorUserId: ACTOR,
    }).data!.trustAccountId;
  });

  function postDeposit(
    amount: number,
    options: { matterId?: string; clientId?: string } = {},
  ) {
    const result = ledgerService.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustTransactionType: "deposit",
      amount,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: options.clientId ?? CLIENT,
      matterId: options.matterId,
      narrative: "Deposit",
      actorUserId: ACTOR,
    });
    expect(result.ok).toBe(true);
    return result.data!;
  }

  it("allocates a full deposit to a matter automatically", () => {
    const tx = postDeposit(1000, { matterId: MATTER_1 });
    const result = allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });

    expect(result.ok).toBe(true);
    expect(result.allocations).toHaveLength(1);
    expect(result.allocations![0]?.allocationType).toBe("matter");
    expect(result.allocations![0]?.amount).toBe(1000);
    expect(result.summary?.remainingUnallocated).toBe(0);

    expect(
      eventBus.listEvents().some((e) => e.eventId === "legal.trust.allocation.created"),
    ).toBe(true);
  });

  it("allocates a split deposit across multiple matters", () => {
    const tx = postDeposit(1000);
    const result = allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      lines: [
        { clientId: CLIENT, matterId: MATTER_1, amount: 600, allocationType: "matter" },
        { clientId: CLIENT, matterId: MATTER_2, amount: 400, allocationType: "matter" },
      ],
      actorUserId: ACTOR,
    });

    expect(result.ok).toBe(true);
    expect(result.allocations).toHaveLength(2);
    expect(result.summary?.totalAllocated).toBe(1000);
    expect(result.summary?.remainingUnallocated).toBe(0);
  });

  it("allocates client-only when transaction has no matter", () => {
    const tx = postDeposit(500);
    const result = allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });

    expect(result.ok).toBe(true);
    expect(result.allocations![0]?.allocationType).toBe("client");
    expect(result.allocations![0]?.matterId).toBeUndefined();
  });

  it("supports partial allocation with remaining unallocated balance", () => {
    const tx = postDeposit(1000);
    const partial = allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      lines: [
        { clientId: CLIENT, matterId: MATTER_1, amount: 600, allocationType: "matter" },
      ],
      allowPartial: true,
      actorUserId: ACTOR,
    });

    expect(partial.ok).toBe(true);
    expect(partial.summary?.totalAllocated).toBe(600);
    expect(partial.summary?.remainingUnallocated).toBe(400);

    const remainder = allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      lines: [{ clientId: CLIENT, amount: 400, allocationType: "unallocated" }],
      allowPartial: true,
      actorUserId: ACTOR,
    });

    expect(remainder.ok).toBe(true);
    expect(remainder.summary?.totalAllocated).toBe(1000);
    expect(remainder.summary?.remainingUnallocated).toBe(0);
    expect(
      eventBus.listEvents().some((e) => e.eventId === "legal.trust.allocation.updated"),
    ).toBe(true);
  });

  it("rejects invalid allocation with client mismatch", () => {
    const tx = postDeposit(500);
    const result = allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      lines: [{ clientId: OTHER_CLIENT, amount: 500, allocationType: "client" }],
      actorUserId: ACTOR,
    });

    expect(result.ok).toBe(false);
    expect(result.validationErrors?.["lines[0].clientId"]).toBeDefined();
  });

  it("rejects over-allocation", () => {
    const tx = postDeposit(500);
    const result = allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      lines: [
        { clientId: CLIENT, matterId: MATTER_1, amount: 300, allocationType: "matter" },
        { clientId: CLIENT, matterId: MATTER_2, amount: 300, allocationType: "matter" },
      ],
      actorUserId: ACTOR,
    });

    expect(result.ok).toBe(false);
    expect(result.validationErrors?.total).toBeDefined();
  });

  it("rejects allocation for unposted transaction", () => {
    const result = allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: "missing-tx",
      actorUserId: ACTOR,
    });

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("TRUST_ALLOCATION_TRANSACTION_NOT_FOUND");
  });

  it("reverses allocations when ledger reversal is posted", () => {
    const tx = postDeposit(800, { matterId: MATTER_1 });
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });

    const reversal = ledgerService.reverseTransaction({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustTransactionId: tx.trustTransactionId,
      postingDate: "2026-07-02",
      narrative: "Reverse deposit",
      actorUserId: ACTOR,
    });
    expect(reversal.ok).toBe(true);

    const reversed = allocationService.reverse({
      tenantId: TENANT_A,
      reversalTransactionId: reversal.data!.trustTransactionId,
      actorUserId: ACTOR,
    });

    expect(reversed.ok).toBe(true);
    expect(reversed.allocations![0]?.allocationType).toBe("reversal");
    expect(reversed.allocations![0]?.effect).toBe("decrease");
    expect(reversed.allocations![0]?.reversesAllocationId).toBeDefined();
    expect(
      eventBus
        .listEvents()
        .some((e) => e.eventId === "legal.trust.allocation.reversed"),
    ).toBe(true);
  });

  it("projects client, matter, and unallocated balances", () => {
    const tx = postDeposit(1000);
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      lines: [
        { clientId: CLIENT, matterId: MATTER_1, amount: 700, allocationType: "matter" },
        { clientId: CLIENT, amount: 300, allocationType: "unallocated" },
      ],
      actorUserId: ACTOR,
    });

    const clientBalance = allocationService.getClientAllocatedBalance(
      TENANT_A,
      accountId,
      CLIENT,
    );
    const matterBalance = allocationService.getMatterAllocatedBalance(
      TENANT_A,
      accountId,
      CLIENT,
      MATTER_1,
    );
    const unallocatedBalance = allocationService.getUnallocatedBalance(
      TENANT_A,
      accountId,
      CLIENT,
    );

    expect(clientBalance?.balanceAmount).toBe(1000);
    expect(matterBalance?.balanceAmount).toBe(700);
    expect(unallocatedBalance?.balanceAmount).toBe(300);
  });

  it("returns allocation history and transaction summary", () => {
    const tx = postDeposit(400, { matterId: MATTER_1 });
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });

    const history = allocationService.getAllocationHistory({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      matterId: MATTER_1,
    });
    expect(history).toHaveLength(1);

    const summary = allocationService.getTransactionSummary(
      TENANT_A,
      tx.trustTransactionId,
    );
    expect(summary?.totalAllocated).toBe(400);
    expect(summary?.remainingUnallocated).toBe(0);
  });

  it("supports allocation adjustment without mutating history", () => {
    const tx = postDeposit(1000, { matterId: MATTER_1 });
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });

    const beforeCount = allocationRepository.listByTransaction(
      TENANT_A,
      tx.trustTransactionId,
    ).length;

    const adjusted = allocationService.adjust({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      reason: "Move funds to second matter",
      lines: [
        {
          clientId: CLIENT,
          matterId: MATTER_1,
          amount: 200,
          effect: "decrease",
        },
        {
          clientId: CLIENT,
          matterId: MATTER_2,
          amount: 200,
          effect: "increase",
        },
      ],
      actorUserId: ACTOR,
    });

    expect(adjusted.ok).toBe(true);
    const after = allocationRepository.listByTransaction(
      TENANT_A,
      tx.trustTransactionId,
    );
    expect(after.length).toBe(beforeCount + 2);
    expect(after.every((item) => Object.isFrozen(item) || item.trustAllocationId)).toBe(
      true,
    );

    const matter1 = allocationService.getMatterAllocatedBalance(
      TENANT_A,
      accountId,
      CLIENT,
      MATTER_1,
    );
    const matter2 = allocationService.getMatterAllocatedBalance(
      TENANT_A,
      accountId,
      CLIENT,
      MATTER_2,
    );
    expect(matter1?.balanceAmount).toBe(800);
    expect(matter2?.balanceAmount).toBe(200);
  });

  it("records diagnostics snapshot", () => {
    const tx = postDeposit(250);
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });

    const snapshot = buildTrustAllocationDiagnosticsSnapshot({
      repositoryAllocationCount: allocationRepository.list({ tenantId: TENANT_A })
        .length,
      domainEventCount: eventBus.listEvents().length,
    });

    expect(snapshot.allocationCount).toBe(1);
    expect(snapshot.domainEventCount).toBeGreaterThan(0);
    expect(snapshot.runs.allocationsCreated).toBe(1);
    expect(getTrustAllocationDiagnostics().listRuns().length).toBeGreaterThan(0);
  });

  it("enforces tenant isolation", () => {
    const tx = postDeposit(300);
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });

    const crossTenant = allocationService.allocate({
      tenantId: TENANT_B,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });
    expect(crossTenant.ok).toBe(false);

    const history = allocationService.getAllocationHistory({ tenantId: TENANT_B });
    expect(history).toHaveLength(0);

    const summary = allocationService.getTransactionSummary(
      TENANT_B,
      tx.trustTransactionId,
    );
    expect(summary).toBeUndefined();
  });
});
