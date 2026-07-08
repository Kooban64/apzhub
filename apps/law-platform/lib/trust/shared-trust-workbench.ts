import { InMemoryTrustInterestPostingRepository } from "./in-memory-trust-interest-posting-repository";
import { InMemoryTrustInterestRuleRepository } from "./in-memory-trust-interest-rule-repository";
import { InMemoryTrustReportRepository } from "./in-memory-trust-report-repository";
import { InMemoryTrustTransactionAuditRepository } from "./in-memory-trust-transaction-audit-repository";
import { InMemoryTrustTransactionDraftRepository } from "./in-memory-trust-transaction-draft-repository";
import { InMemoryTrustTransferRepository } from "./in-memory-trust-transfer-repository";
import { InMemoryTrustApprovalRepository } from "./in-memory-trust-approval-repository";
import { resetTrustAllocationDiagnostics } from "./trust-allocation-diagnostics";
import { TrustAllocationService } from "./trust-allocation-service";
import { resetTrustIdCounter } from "./trust-id";
import { resetTrustInterestDiagnostics } from "./trust-interest-diagnostics";
import { TrustInterestService } from "./trust-interest-service";
import { resetTrustLedgerDiagnostics } from "./trust-ledger-diagnostics";
import type { TrustLedgerService } from "./trust-ledger-service";
import { resetTrustReconciliationDiagnostics } from "./trust-reconciliation-diagnostics";
import { createTrustReconciliationFixture } from "./trust-reconciliation-service";
import type { TrustReconciliationService } from "./trust-reconciliation-service";
import { resetTrustReportingDiagnostics } from "./trust-reporting-diagnostics";
import { InMemoryTrustReportingEventBus } from "./trust-reporting-events";
import { TrustReportingService } from "./trust-reporting-service";
import { resetTrustTransferDiagnostics } from "./trust-transfer-diagnostics";
import { TrustTransferService } from "./trust-transfer-service";
import { resetTrustApprovalDiagnostics } from "./trust-approval-diagnostics";
import { TrustApprovalService } from "./trust-approval-service";
import type { TrustTransactionWorkflowService } from "./trust-transaction-workflow-service";
import { TrustTransactionWorkflowService as TrustTransactionWorkflowServiceClass } from "./trust-transaction-workflow-service";
import { resetTrustTransactionWorkflowDiagnostics } from "./trust-transaction-workflow-diagnostics";
import { seedTrustWorkbenchData } from "./seed-trust-workbench";

export const TRUST_WORKBENCH_TENANT_ID = "tenant-test";
export const TRUST_WORKBENCH_ACTOR_ID = "user-001";

export interface TrustWorkbenchBundle {
  readonly tenantId: string;
  readonly actorUserId: string;
  readonly accountId: string;
  readonly ledgerService: TrustLedgerService;
  readonly workflowService: TrustTransactionWorkflowService;
  readonly allocationService: TrustAllocationService;
  readonly reconciliationService: TrustReconciliationService;
  readonly interestService: TrustInterestService;
  readonly transferService: TrustTransferService;
  readonly reportingService: TrustReportingService;
  readonly approvalService: TrustApprovalService;
  readonly draftRepository: InMemoryTrustTransactionDraftRepository;
  readonly reportRepository: InMemoryTrustReportRepository;
}

let sharedTrustWorkbench: TrustWorkbenchBundle | undefined;

function buildTrustWorkbenchBundle(): TrustWorkbenchBundle {
  const recon = createTrustReconciliationFixture();
  const draftRepository = new InMemoryTrustTransactionDraftRepository();
  const reportRepository = new InMemoryTrustReportRepository();
  const eventBus = new InMemoryTrustReportingEventBus();
  const approvalRepository = new InMemoryTrustApprovalRepository();
  const approvalService = new TrustApprovalService({ repository: approvalRepository });

  const interestService = new TrustInterestService({
    ledgerRepository: recon.ledgerRepository,
    allocationRepository: recon.allocationRepository,
    ruleRepository: new InMemoryTrustInterestRuleRepository(),
    postingRepository: new InMemoryTrustInterestPostingRepository(),
    ledgerService: recon.ledgerService,
    allocationService: recon.allocationService,
    approvalService,
  });

  const transferService = new TrustTransferService({
    ledgerRepository: recon.ledgerRepository,
    allocationRepository: recon.allocationRepository,
    transferRepository: new InMemoryTrustTransferRepository(),
    ledgerService: recon.ledgerService,
    allocationService: recon.allocationService,
    approvalService,
  });

  const workflowService = new TrustTransactionWorkflowServiceClass({
    ledgerService: recon.ledgerService,
    ledgerRepository: recon.ledgerRepository,
    draftRepository,
    auditRepository: new InMemoryTrustTransactionAuditRepository(),
    approvalService,
  });

  const reportingService = new TrustReportingService({
    ledgerService: recon.ledgerService,
    workflowService,
    allocationService: recon.allocationService,
    reconciliationService: recon.reconciliationService,
    interestService,
    transferService,
    reportRepository,
    eventBus,
  });

  return {
    tenantId: TRUST_WORKBENCH_TENANT_ID,
    actorUserId: TRUST_WORKBENCH_ACTOR_ID,
    accountId: recon.accountId,
    ledgerService: recon.ledgerService,
    workflowService,
    allocationService: recon.allocationService,
    reconciliationService: recon.reconciliationService,
    interestService,
    transferService,
    reportingService,
    approvalService,
    draftRepository,
    reportRepository,
  };
}

export function getSharedTrustWorkbench(): TrustWorkbenchBundle {
  if (!sharedTrustWorkbench) {
    sharedTrustWorkbench = buildTrustWorkbenchBundle();
    seedTrustWorkbenchData(sharedTrustWorkbench);
  }

  return sharedTrustWorkbench;
}

export function resetSharedTrustWorkbench(): void {
  sharedTrustWorkbench = undefined;
  resetTrustIdCounter();
  resetTrustLedgerDiagnostics();
  resetTrustTransactionWorkflowDiagnostics();
  resetTrustAllocationDiagnostics();
  resetTrustReconciliationDiagnostics();
  resetTrustInterestDiagnostics();
  resetTrustTransferDiagnostics();
  resetTrustReportingDiagnostics();
  resetTrustApprovalDiagnostics();
}
