import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryTrustAllocationRepository } from "./in-memory-trust-allocation-repository";
import { InMemoryTrustInterestPostingRepository } from "./in-memory-trust-interest-posting-repository";
import { InMemoryTrustInterestRuleRepository } from "./in-memory-trust-interest-rule-repository";
import { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import { InMemoryTrustTransferRepository } from "./in-memory-trust-transfer-repository";
import { TrustAllocationService } from "./trust-allocation-service";
import { resetTrustInterestDiagnostics } from "./trust-interest-diagnostics";
import { TrustInterestService } from "./trust-interest-service";
import { TrustLedgerService } from "./trust-ledger-service";
import { verifyJournalIntegrity } from "./trust-ledger-service";
import {
  getTrustTransferDiagnostics,
  resetTrustTransferDiagnostics,
} from "./trust-transfer-diagnostics";
import { InMemoryTrustTransferEventBus } from "./trust-transfer-events";
import { TrustTransferService } from "./trust-transfer-service";
import { resetTrustIdCounter } from "./trust-id";
import { resetTrustAllocationDiagnostics } from "./trust-allocation-diagnostics";
import { resetTrustLedgerDiagnostics } from "./trust-ledger-diagnostics";
import { runTrustInterestAccrual } from "./trust-interest-engine";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";
const CLIENT_A = "client-001";
const CLIENT_B = "client-002";
const MATTER_1 = "matter-001";
const MATTER_2 = "matter-002";
const ACTOR = "user-001";

describe("TrustTransferService", () => {
  let ledgerRepository: InMemoryTrustLedgerRepository;
  let ledgerService: TrustLedgerService;
  let allocationRepository: InMemoryTrustAllocationRepository;
  let allocationService: TrustAllocationService;
  let transferRepository: InMemoryTrustTransferRepository;
  let interestService: TrustInterestService;
  let eventBus: InMemoryTrustTransferEventBus;
  let transferService: TrustTransferService;
  let accountId: string;
  let accountIdB: string;

  beforeEach(() => {
    resetTrustIdCounter();
    resetTrustLedgerDiagnostics();
    resetTrustAllocationDiagnostics();
    resetTrustTransferDiagnostics();
    resetTrustInterestDiagnostics();

    ledgerRepository = new InMemoryTrustLedgerRepository();
    ledgerService = new TrustLedgerService({ repository: ledgerRepository });
    allocationRepository = new InMemoryTrustAllocationRepository();
    allocationService = new TrustAllocationService({
      allocationRepository,
      ledgerRepository,
    });
    transferRepository = new InMemoryTrustTransferRepository();
    eventBus = new InMemoryTrustTransferEventBus();
    transferService = new TrustTransferService({
      ledgerRepository,
      allocationRepository,
      transferRepository,
      ledgerService,
      allocationService,
      eventBus,
    });

    const ruleRepository = new InMemoryTrustInterestRuleRepository();
    const postingRepository = new InMemoryTrustInterestPostingRepository();
    interestService = new TrustInterestService({
      ledgerRepository,
      allocationRepository,
      ruleRepository,
      postingRepository,
      ledgerService,
      allocationService,
    });

    accountId = ledgerService.openAccount({
      tenantId: TENANT_A,
      name: "Trust A",
      currency: "ZAR",
      institutionName: "FNB",
      accountNumberMasked: "****4321",
      actorUserId: ACTOR,
    }).data!.trustAccountId;

    accountIdB = ledgerService.openAccount({
      tenantId: TENANT_A,
      name: "Trust B",
      currency: "ZAR",
      institutionName: "ABSA",
      accountNumberMasked: "****8765",
      actorUserId: ACTOR,
    }).data!.trustAccountId;
  });

  function seedMatterBalance(
    amount: number,
    options: {
      accountId?: string;
      clientId?: string;
      matterId?: string;
    } = {},
  ) {
    const trustAccountId = options.accountId ?? accountId;
    const clientId = options.clientId ?? CLIENT_A;
    const matterId = options.matterId ?? MATTER_1;

    const tx = ledgerService.postTransaction({
      tenantId: TENANT_A,
      trustAccountId,
      trustTransactionType: "deposit",
      amount,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId,
      matterId,
      narrative: "Seed deposit",
      actorUserId: ACTOR,
    }).data!;

    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });
  }

  function postApprovedTransfer(input: {
    sourceTrustAccountId: string;
    destinationTrustAccountId?: string;
    sourceClientId: string;
    destinationClientId: string;
    sourceMatterId?: string;
    destinationMatterId?: string;
    amount: number;
    transferType?: "matter_to_matter" | "client_to_client" | "account_to_account";
  }) {
    const draft = transferService.createTransferDraft({
      tenantId: TENANT_A,
      transferType: input.transferType,
      sourceTrustAccountId: input.sourceTrustAccountId,
      destinationTrustAccountId: input.destinationTrustAccountId,
      sourceClientId: input.sourceClientId,
      destinationClientId: input.destinationClientId,
      sourceMatterId: input.sourceMatterId,
      destinationMatterId: input.destinationMatterId,
      amount: input.amount,
      currency: "ZAR",
      reason: "Approved transfer",
      actorUserId: ACTOR,
    });
    expect(draft.ok).toBe(true);

    transferService.approveTransfer({
      tenantId: TENANT_A,
      trustTransferId: draft.data!.trustTransferId,
      actorUserId: ACTOR,
    });

    return transferService.postTransfer({
      tenantId: TENANT_A,
      trustTransferId: draft.data!.trustTransferId,
      postingDate: "2026-07-02",
      actorUserId: ACTOR,
    });
  }

  it("posts a matter-to-matter transfer and updates allocations", () => {
    seedMatterBalance(1000, { matterId: MATTER_1 });
    seedMatterBalance(500, { clientId: CLIENT_A, matterId: MATTER_2 });

    const posted = postApprovedTransfer({
      sourceTrustAccountId: accountId,
      sourceClientId: CLIENT_A,
      destinationClientId: CLIENT_A,
      sourceMatterId: MATTER_1,
      destinationMatterId: MATTER_2,
      amount: 300,
      transferType: "matter_to_matter",
    });

    expect(posted.ok).toBe(true);
    expect(posted.data?.transfer.status).toBe("posted");

    const sourceBalance = allocationService.getMatterAllocatedBalance(
      TENANT_A,
      accountId,
      CLIENT_A,
      MATTER_1,
    );
    const destBalance = allocationService.getMatterAllocatedBalance(
      TENANT_A,
      accountId,
      CLIENT_A,
      MATTER_2,
    );

    expect(sourceBalance?.balanceAmount).toBe(700);
    expect(destBalance?.balanceAmount).toBe(800);
  });

  it("posts a client-to-client transfer", () => {
    seedMatterBalance(800, { clientId: CLIENT_A, matterId: MATTER_1 });
    seedMatterBalance(400, { clientId: CLIENT_B, matterId: MATTER_1 });

    const posted = postApprovedTransfer({
      sourceTrustAccountId: accountId,
      sourceClientId: CLIENT_A,
      destinationClientId: CLIENT_B,
      sourceMatterId: MATTER_1,
      amount: 200,
      transferType: "client_to_client",
    });

    expect(posted.ok).toBe(true);

    const sourceBalance = allocationService.getClientAllocatedBalance(
      TENANT_A,
      accountId,
      CLIENT_A,
    );
    const destBalance = allocationService.getClientAllocatedBalance(
      TENANT_A,
      accountId,
      CLIENT_B,
    );

    expect(sourceBalance?.balanceAmount).toBe(600);
    expect(destBalance?.balanceAmount).toBe(600);
  });

  it("posts an account-to-account transfer", () => {
    seedMatterBalance(1000, { accountId, matterId: MATTER_1 });
    seedMatterBalance(100, {
      accountId: accountIdB,
      clientId: CLIENT_B,
      matterId: MATTER_2,
    });

    const posted = postApprovedTransfer({
      sourceTrustAccountId: accountId,
      destinationTrustAccountId: accountIdB,
      sourceClientId: CLIENT_A,
      destinationClientId: CLIENT_B,
      sourceMatterId: MATTER_1,
      destinationMatterId: MATTER_2,
      amount: 250,
      transferType: "account_to_account",
    });

    expect(posted.ok).toBe(true);

    const sourceBalance = allocationService.getMatterAllocatedBalance(
      TENANT_A,
      accountId,
      CLIENT_A,
      MATTER_1,
    );
    const destBalance = allocationService.getMatterAllocatedBalance(
      TENANT_A,
      accountIdB,
      CLIENT_B,
      MATTER_2,
    );

    expect(sourceBalance?.balanceAmount).toBe(750);
    expect(destBalance?.balanceAmount).toBe(350);
  });

  it("rejects transfer when source balance is insufficient", () => {
    seedMatterBalance(100, { matterId: MATTER_1 });

    const draft = transferService.createTransferDraft({
      tenantId: TENANT_A,
      transferType: "matter_to_matter",
      sourceTrustAccountId: accountId,
      sourceClientId: CLIENT_A,
      destinationClientId: CLIENT_A,
      sourceMatterId: MATTER_1,
      destinationMatterId: MATTER_2,
      amount: 500,
      currency: "ZAR",
      reason: "Over transfer",
      actorUserId: ACTOR,
    });

    expect(draft.ok).toBe(false);
    expect(draft.error?.code).toBe("TRUST_TRANSFER_VALIDATION_FAILED");
  });

  it("rejects invalid same-endpoint transfer", () => {
    seedMatterBalance(500, { matterId: MATTER_1 });

    const draft = transferService.createTransferDraft({
      tenantId: TENANT_A,
      transferType: "matter_to_matter",
      sourceTrustAccountId: accountId,
      sourceClientId: CLIENT_A,
      destinationClientId: CLIENT_A,
      sourceMatterId: MATTER_1,
      destinationMatterId: MATTER_1,
      amount: 100,
      currency: "ZAR",
      reason: "Invalid same matter",
      actorUserId: ACTOR,
    });

    expect(draft.ok).toBe(false);
  });

  it("reverses a posted transfer", () => {
    seedMatterBalance(1000, { matterId: MATTER_1 });
    seedMatterBalance(200, { matterId: MATTER_2 });

    const posted = postApprovedTransfer({
      sourceTrustAccountId: accountId,
      sourceClientId: CLIENT_A,
      destinationClientId: CLIENT_A,
      sourceMatterId: MATTER_1,
      destinationMatterId: MATTER_2,
      amount: 150,
      transferType: "matter_to_matter",
    }).data!;

    const reversed = transferService.reverseTransfer({
      tenantId: TENANT_A,
      trustTransferId: posted.transfer.trustTransferId,
      postingDate: "2026-07-03",
      reason: "Correction",
      actorUserId: ACTOR,
    });

    expect(reversed.ok).toBe(true);
    expect(reversed.data?.status).toBe("reversed");

    const sourceBalance = allocationService.getMatterAllocatedBalance(
      TENANT_A,
      accountId,
      CLIENT_A,
      MATTER_1,
    );
    const destBalance = allocationService.getMatterAllocatedBalance(
      TENANT_A,
      accountId,
      CLIENT_A,
      MATTER_2,
    );

    expect(sourceBalance?.balanceAmount).toBe(1000);
    expect(destBalance?.balanceAmount).toBe(200);
    expect(
      eventBus
        .listEvents()
        .some((event) => event.eventId === "legal.trust.transfer.reversed"),
    ).toBe(true);
  });

  it("preserves ledger integrity after transfer posting", () => {
    seedMatterBalance(900, { matterId: MATTER_1 });
    seedMatterBalance(100, { matterId: MATTER_2 });

    postApprovedTransfer({
      sourceTrustAccountId: accountId,
      sourceClientId: CLIENT_A,
      destinationClientId: CLIENT_A,
      sourceMatterId: MATTER_1,
      destinationMatterId: MATTER_2,
      amount: 200,
      transferType: "matter_to_matter",
    });

    const journal = ledgerRepository.getJournalEntries(TENANT_A, accountId);
    expect(verifyJournalIntegrity(journal)).toBe(true);
  });

  it("preserves historical interest and reflects new balances on future accrual", () => {
    seedMatterBalance(1000, { matterId: MATTER_1 });
    seedMatterBalance(100, { matterId: MATTER_2 });

    const ruleId = interestService.createRule({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      complianceProfileId: "ZA-LPC",
      accrualMethod: "simple_daily",
      annualRatePercent: 10,
      postingFrequency: "monthly",
      minimumBalance: 100,
      effectiveFrom: "2026-07-01",
      actorUserId: ACTOR,
    }).data!.trustInterestRuleId;

    const beforeAccrual = interestService.runAccrual({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustInterestRuleId: ruleId,
      periodStart: "2026-07-01",
      periodEnd: "2026-07-07",
      actorUserId: ACTOR,
    }).data!.posting;

    postApprovedTransfer({
      sourceTrustAccountId: accountId,
      sourceClientId: CLIENT_A,
      destinationClientId: CLIENT_A,
      sourceMatterId: MATTER_1,
      destinationMatterId: MATTER_2,
      amount: 400,
      transferType: "matter_to_matter",
    });

    expect(
      interestService.getPosting(TENANT_A, beforeAccrual.trustInterestPostingId)
        ?.status,
    ).toBe("draft");

    const allocations = allocationRepository.list({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });
    const rule = interestService.getRule(TENANT_A, ruleId)!;
    const afterAccrual = runTrustInterestAccrual({
      rule,
      trustAccountId: accountId,
      currency: "ZAR",
      periodStart: "2026-07-08",
      periodEnd: "2026-07-14",
      allocations,
    });

    const matter1Line = afterAccrual.lineItems.find(
      (line) => line.matterId === MATTER_1,
    );
    const matter2Line = afterAccrual.lineItems.find(
      (line) => line.matterId === MATTER_2,
    );
    expect(matter1Line?.principalBalance).toBe(600);
    expect(matter2Line?.principalBalance).toBe(500);
  });

  it("enforces tenant isolation", () => {
    seedMatterBalance(500, { matterId: MATTER_1 });

    const draft = transferService.createTransferDraft({
      tenantId: TENANT_A,
      transferType: "matter_to_matter",
      sourceTrustAccountId: accountId,
      sourceClientId: CLIENT_A,
      destinationClientId: CLIENT_A,
      sourceMatterId: MATTER_1,
      destinationMatterId: MATTER_2,
      amount: 100,
      currency: "ZAR",
      reason: "Tenant test",
      actorUserId: ACTOR,
    }).data!;

    const result = transferService.approveTransfer({
      tenantId: TENANT_B,
      trustTransferId: draft.trustTransferId,
      actorUserId: ACTOR,
    });

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("TRUST_TRANSFER_NOT_FOUND");
  });

  it("records diagnostics for posted transfers", () => {
    seedMatterBalance(600, { matterId: MATTER_1 });
    seedMatterBalance(100, { matterId: MATTER_2 });

    postApprovedTransfer({
      sourceTrustAccountId: accountId,
      sourceClientId: CLIENT_A,
      destinationClientId: CLIENT_A,
      sourceMatterId: MATTER_1,
      destinationMatterId: MATTER_2,
      amount: 100,
      transferType: "matter_to_matter",
    });

    const summary = getTrustTransferDiagnostics().getSummary();
    expect(summary.transfersPosted).toBe(1);
    expect(summary.successfulRuns).toBeGreaterThan(0);
  });

  it("cancels a draft transfer", () => {
    seedMatterBalance(500, { matterId: MATTER_1 });
    seedMatterBalance(100, { matterId: MATTER_2 });

    const draft = transferService.createTransferDraft({
      tenantId: TENANT_A,
      transferType: "matter_to_matter",
      sourceTrustAccountId: accountId,
      sourceClientId: CLIENT_A,
      destinationClientId: CLIENT_A,
      sourceMatterId: MATTER_1,
      destinationMatterId: MATTER_2,
      amount: 50,
      currency: "ZAR",
      reason: "Cancel me",
      actorUserId: ACTOR,
    }).data!;

    const cancelled = transferService.cancelDraft({
      tenantId: TENANT_A,
      trustTransferId: draft.trustTransferId,
      actorUserId: ACTOR,
    });

    expect(cancelled.ok).toBe(true);
    expect(cancelled.data?.status).toBe("cancelled");
  });

  it("emits transfer lifecycle events", () => {
    seedMatterBalance(500, { matterId: MATTER_1 });
    seedMatterBalance(100, { matterId: MATTER_2 });

    const draft = transferService.createTransferDraft({
      tenantId: TENANT_A,
      transferType: "matter_to_matter",
      sourceTrustAccountId: accountId,
      sourceClientId: CLIENT_A,
      destinationClientId: CLIENT_A,
      sourceMatterId: MATTER_1,
      destinationMatterId: MATTER_2,
      amount: 75,
      currency: "ZAR",
      reason: "Event test",
      actorUserId: ACTOR,
    }).data!;

    transferService.approveTransfer({
      tenantId: TENANT_A,
      trustTransferId: draft.trustTransferId,
      actorUserId: ACTOR,
    });

    transferService.postTransfer({
      tenantId: TENANT_A,
      trustTransferId: draft.trustTransferId,
      postingDate: "2026-07-02",
      actorUserId: ACTOR,
    });

    const events = eventBus.listEvents().map((event) => event.eventId);
    expect(events).toContain("legal.trust.transfer.created");
    expect(events).toContain("legal.trust.transfer.approved");
    expect(events).toContain("legal.trust.transfer.posted");
  });
});
