import type { TrustWorkbenchBundle } from "./shared-trust-workbench";

const CLIENT = "client-001";
const MATTER_1 = "matter-001";
const MATTER_2 = "matter-002";

/** Seed demo trust data for workbench UI (in-memory only). */
export function seedTrustWorkbenchData(bundle: TrustWorkbenchBundle): void {
  const {
    tenantId,
    accountId,
    ledgerService,
    allocationService,
    reconciliationService,
    interestService,
    transferService,
  } = bundle;
  const actorUserId = bundle.actorUserId;

  if (ledgerService.listTransactions(tenantId, accountId).length > 0) {
    return;
  }

  const deposit = ledgerService.postTransaction({
    tenantId,
    trustAccountId: accountId,
    trustTransactionType: "deposit",
    amount: 1000,
    currency: "ZAR",
    transactionDate: "2026-07-01",
    postingDate: "2026-07-01",
    clientId: CLIENT,
    matterId: MATTER_1,
    narrative: "Opening deposit",
    actorUserId,
  }).data!;

  allocationService.allocate({
    tenantId,
    trustTransactionId: deposit.trustTransactionId,
    actorUserId,
  });

  const deposit2 = ledgerService.postTransaction({
    tenantId,
    trustAccountId: accountId,
    trustTransactionType: "deposit",
    amount: 500,
    currency: "ZAR",
    transactionDate: "2026-07-15",
    postingDate: "2026-07-15",
    clientId: CLIENT,
    matterId: MATTER_2,
    narrative: "Second deposit",
    actorUserId,
  }).data!;

  allocationService.allocate({
    tenantId,
    trustTransactionId: deposit2.trustTransactionId,
    actorUserId,
  });

  reconciliationService.runReconciliation({
    tenantId,
    trustAccountId: accountId,
    actorUserId,
  });

  const ruleId = interestService.createRule({
    tenantId,
    trustAccountId: accountId,
    complianceProfileId: "ZA-LPC",
    accrualMethod: "simple_daily",
    annualRatePercent: 10,
    postingFrequency: "monthly",
    minimumBalance: 100,
    effectiveFrom: "2026-07-01",
    actorUserId,
  }).data!.trustInterestRuleId;

  interestService.runAccrual({
    tenantId,
    trustAccountId: accountId,
    trustInterestRuleId: ruleId,
    periodStart: "2026-07-01",
    periodEnd: "2026-07-31",
    actorUserId,
  });

  const draft = transferService.createTransferDraft({
    tenantId,
    transferType: "matter_to_matter",
    sourceTrustAccountId: accountId,
    sourceClientId: CLIENT,
    destinationClientId: CLIENT,
    sourceMatterId: MATTER_1,
    destinationMatterId: MATTER_2,
    amount: 100,
    currency: "ZAR",
    reason: "Reallocate",
    actorUserId,
  }).data!;

  transferService.approveTransfer({
    tenantId,
    trustTransferId: draft.trustTransferId,
    actorUserId,
  });

  transferService.postTransfer({
    tenantId,
    trustTransferId: draft.trustTransferId,
    postingDate: "2026-07-20",
    actorUserId,
  });

  bundle.workflowService.createDraft({
    tenantId,
    trustAccountId: accountId,
    trustTransactionType: "withdrawal",
    amount: 50,
    currency: "ZAR",
    transactionDate: "2026-07-25",
    postingDate: "2026-07-25",
    clientId: CLIENT,
    matterId: MATTER_1,
    narrative: "Pending withdrawal draft",
    actorUserId,
  });
}
