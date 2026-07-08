import {
  createDb,
  type PostgresOutboxEventDraft,
  type PostgresTrustStoreOptions,
} from "@apzhub/config";

import { InMemoryTrustLedgerRepository } from "../trust/in-memory-trust-ledger-repository";
import { InMemoryTrustAllocationRepository } from "../trust/in-memory-trust-allocation-repository";
import { InMemoryTrustApprovalRepository } from "../trust/in-memory-trust-approval-repository";
import { InMemoryTrustInterestPostingRepository } from "../trust/in-memory-trust-interest-posting-repository";
import { InMemoryTrustInterestRuleRepository } from "../trust/in-memory-trust-interest-rule-repository";
import { InMemoryTrustReconciliationRepository } from "../trust/in-memory-trust-reconciliation-repository";
import { InMemoryTrustReportRepository } from "../trust/in-memory-trust-report-repository";
import { InMemoryTrustTransactionAuditRepository } from "../trust/in-memory-trust-transaction-audit-repository";
import { InMemoryTrustTransactionDraftRepository } from "../trust/in-memory-trust-transaction-draft-repository";
import { InMemoryTrustTransferRepository } from "../trust/in-memory-trust-transfer-repository";
import { PostgresTrustLedgerRepository } from "../trust/postgres-trust-ledger-repository";
import { createPostgresTrustRepositories } from "../trust/postgres-trust-repositories";
import type { TrustAllocationRepository } from "../trust/trust-allocation-repository";
import type { TrustApprovalRepository } from "../trust/trust-approval-repository";
import type { TrustInterestPostingRepository } from "../trust/trust-interest-posting-repository";
import type { TrustInterestRuleRepository } from "../trust/trust-interest-rule-repository";
import type { TrustReconciliationRepository } from "../trust/trust-reconciliation-repository";
import type { TrustReportRepository } from "../trust/trust-report-repository";
import type { TrustTransactionAuditRepository } from "../trust/trust-transaction-audit-repository";
import type { TrustTransactionDraftRepository } from "../trust/trust-transaction-draft-repository";
import type { TrustTransferRepository } from "../trust/trust-transfer-repository";
import { TrustAllocationService } from "../trust/trust-allocation-service";
import { TrustApprovalService } from "../trust/trust-approval-service";
import { TrustInterestService } from "../trust/trust-interest-service";
import { TrustLedgerService } from "../trust/trust-ledger-service";
import { TrustReconciliationService } from "../trust/trust-reconciliation-service";
import { TrustReportingService } from "../trust/trust-reporting-service";
import { InMemoryTrustReportingEventBus } from "../trust/trust-reporting-events";
import { TrustTransactionWorkflowService } from "../trust/trust-transaction-workflow-service";
import { TrustTransferService } from "../trust/trust-transfer-service";

import type { LawPersistenceContext } from "./law-persistence-context";
import { isOutboxEnabled } from "./outbox-config";
import { recordOutboxEvent } from "./outbox-skeleton";
import { getLawRepositoryMode } from "./repository-mode";
import { runSync } from "./run-sync";
import { applyPostgresTenantSession } from "./postgres-tenant-session";

export interface TrustRepositoryBundle {
  readonly ledgerRepository:
    InMemoryTrustLedgerRepository | PostgresTrustLedgerRepository;
  readonly draftRepository: TrustTransactionDraftRepository;
  readonly auditRepository: TrustTransactionAuditRepository;
  readonly allocationRepository: TrustAllocationRepository;
  readonly transferRepository: TrustTransferRepository;
  readonly approvalRepository: TrustApprovalRepository;
  readonly interestRuleRepository: TrustInterestRuleRepository;
  readonly interestPostingRepository: TrustInterestPostingRepository;
  readonly reconciliationRepository: TrustReconciliationRepository;
  readonly reportRepository: TrustReportRepository;
}

export interface TrustServiceBundle {
  readonly ledgerService: TrustLedgerService;
  readonly workflowService: TrustTransactionWorkflowService;
  readonly allocationService: TrustAllocationService;
  readonly transferService: TrustTransferService;
  readonly interestService: TrustInterestService;
  readonly reconciliationService: TrustReconciliationService;
  readonly approvalService: TrustApprovalService;
  readonly reportingService: TrustReportingService;
  readonly repositories: TrustRepositoryBundle;
}

let sharedMemoryTrustBundle: TrustServiceBundle | undefined;
const postgresTrustBundles = new Map<string, TrustServiceBundle>();

function createOutboxHandler(context: LawPersistenceContext) {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  return async (
    db: Parameters<typeof recordOutboxEvent>[1],
    draft: PostgresOutboxEventDraft,
  ) => {
    await recordOutboxEvent(context, db, {
      aggregateType: "trust",
      aggregateId: draft.aggregateId,
      eventType: draft.eventType,
      payload: draft.payload,
    });
  };
}

function createPostgresStoreOptions(
  context: LawPersistenceContext,
): PostgresTrustStoreOptions {
  const db = context.db ?? createDb();
  return {
    tenantId: context.tenantId,
    db,
    runSync,
    runInTransaction: async (operation) =>
      db.transaction(async (tx) => {
        await applyPostgresTenantSession(tx, context);
        return operation(tx);
      }),
    onOutboxEvent: createOutboxHandler(context),
  };
}

export function createTrustRepositoryBundle(
  context: LawPersistenceContext,
): TrustRepositoryBundle {
  if (getLawRepositoryMode() === "memory") {
    return {
      ledgerRepository: new InMemoryTrustLedgerRepository(),
      draftRepository: new InMemoryTrustTransactionDraftRepository(),
      auditRepository: new InMemoryTrustTransactionAuditRepository(),
      allocationRepository: new InMemoryTrustAllocationRepository(),
      transferRepository: new InMemoryTrustTransferRepository(),
      approvalRepository: new InMemoryTrustApprovalRepository(),
      interestRuleRepository: new InMemoryTrustInterestRuleRepository(),
      interestPostingRepository: new InMemoryTrustInterestPostingRepository(),
      reconciliationRepository: new InMemoryTrustReconciliationRepository(),
      reportRepository: new InMemoryTrustReportRepository(),
    };
  }

  const storeOptions = createPostgresStoreOptions(context);
  const ledgerRepository = new PostgresTrustLedgerRepository(storeOptions);
  const postgres = createPostgresTrustRepositories(storeOptions);

  return {
    ledgerRepository,
    draftRepository: postgres.draftRepository,
    auditRepository: postgres.auditRepository,
    allocationRepository: postgres.allocationRepository,
    transferRepository: postgres.transferRepository,
    approvalRepository: postgres.approvalRepository,
    interestRuleRepository: postgres.interestRuleRepository,
    interestPostingRepository: postgres.interestPostingRepository,
    reconciliationRepository: postgres.reconciliationRepository,
    reportRepository: postgres.reportRepository,
  };
}

export function createTrustServiceBundle(
  context: LawPersistenceContext,
): TrustServiceBundle {
  const repositories = createTrustRepositoryBundle(context);
  const ledgerRepository =
    repositories.ledgerRepository as InMemoryTrustLedgerRepository;
  const ledgerService = new TrustLedgerService({ repository: ledgerRepository });
  const allocationService = new TrustAllocationService({
    allocationRepository:
      repositories.allocationRepository as InMemoryTrustAllocationRepository,
    ledgerRepository,
  });
  const approvalService = new TrustApprovalService({
    repository: repositories.approvalRepository as InMemoryTrustApprovalRepository,
  });

  const workflowService = new TrustTransactionWorkflowService({
    ledgerService,
    ledgerRepository,
    draftRepository:
      repositories.draftRepository as InMemoryTrustTransactionDraftRepository,
    auditRepository:
      repositories.auditRepository as InMemoryTrustTransactionAuditRepository,
    approvalService,
  });

  const transferService = new TrustTransferService({
    ledgerRepository,
    allocationRepository:
      repositories.allocationRepository as InMemoryTrustAllocationRepository,
    transferRepository:
      repositories.transferRepository as InMemoryTrustTransferRepository,
    ledgerService,
    allocationService,
    approvalService,
  });

  const interestService = new TrustInterestService({
    ledgerRepository,
    allocationRepository:
      repositories.allocationRepository as InMemoryTrustAllocationRepository,
    ruleRepository:
      repositories.interestRuleRepository as InMemoryTrustInterestRuleRepository,
    postingRepository:
      repositories.interestPostingRepository as InMemoryTrustInterestPostingRepository,
    ledgerService,
    allocationService,
    approvalService,
  });

  const reconciliationService = new TrustReconciliationService({
    ledgerRepository,
    allocationRepository:
      repositories.allocationRepository as InMemoryTrustAllocationRepository,
    reconciliationRepository:
      repositories.reconciliationRepository as InMemoryTrustReconciliationRepository,
  });

  const reportingService = new TrustReportingService({
    ledgerService,
    workflowService,
    allocationService,
    reconciliationService,
    interestService,
    transferService,
    reportRepository: repositories.reportRepository as InMemoryTrustReportRepository,
    eventBus: new InMemoryTrustReportingEventBus(),
  });

  return {
    ledgerService,
    workflowService,
    allocationService,
    transferService,
    interestService,
    reconciliationService,
    approvalService,
    reportingService,
    repositories,
  };
}

export function getSharedTrustServiceBundle(
  context: LawPersistenceContext,
): TrustServiceBundle {
  if (getLawRepositoryMode() === "memory") {
    sharedMemoryTrustBundle ??= createTrustServiceBundle(context);
    return sharedMemoryTrustBundle;
  }

  const cacheKey = context.tenantId;
  let bundle = postgresTrustBundles.get(cacheKey);
  if (!bundle) {
    bundle = createTrustServiceBundle(context);
    postgresTrustBundles.set(cacheKey, bundle);
  }
  return bundle;
}

export function resetSharedTrustServiceBundle(): void {
  sharedMemoryTrustBundle = undefined;
  postgresTrustBundles.clear();
}
