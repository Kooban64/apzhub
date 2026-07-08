import type { InMemoryTrustAllocationRepository } from "./in-memory-trust-allocation-repository";
import type { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import type { InMemoryTrustReconciliationRepository } from "./in-memory-trust-reconciliation-repository";
import { InMemoryTrustAllocationRepository as InMemoryTrustAllocationRepositoryClass } from "./in-memory-trust-allocation-repository";
import { InMemoryTrustLedgerRepository as InMemoryTrustLedgerRepositoryClass } from "./in-memory-trust-ledger-repository";
import { InMemoryTrustReconciliationRepository as InMemoryTrustReconciliationRepositoryClass } from "./in-memory-trust-reconciliation-repository";
import {
  buildReconciliationDiagnosticsSnapshot,
  finalizeReconciliationRun,
  getTrustReconciliationDiagnostics,
  recordReconciliationStage,
} from "./trust-reconciliation-diagnostics";
import { InMemoryTrustReconciliationEventBus } from "./trust-reconciliation-events";
import {
  TRUST_RECONCILIATION_ERROR_CODES,
  TrustReconciliationError,
  isTrustReconciliationError,
} from "./trust-reconciliation-errors";
import { runTrustReconciliationChecks } from "./trust-reconciliation-engine";
import type {
  RunTrustReconciliationInput,
  TrustReconciliationAccountSummary,
  TrustReconciliationDomainEvent,
  TrustReconciliationHistoryCriteria,
  TrustReconciliationRun,
  TrustReconciliationServiceResult,
  TrustReconciliationStageRecord,
} from "./trust-reconciliation-types";
import { createTrustId } from "./trust-id";
import { TrustLedgerService } from "./trust-ledger-service";
import { TrustAllocationService } from "./trust-allocation-service";

export interface TrustReconciliationServiceOptions {
  readonly ledgerRepository: InMemoryTrustLedgerRepository;
  readonly allocationRepository: InMemoryTrustAllocationRepository;
  readonly reconciliationRepository: InMemoryTrustReconciliationRepository;
  readonly eventBus?: InMemoryTrustReconciliationEventBus;
}

/** Read-only Trust Reconciliation Engine (LAW-015-05). */
export class TrustReconciliationService {
  private readonly ledgerRepository: InMemoryTrustLedgerRepository;
  private readonly allocationRepository: InMemoryTrustAllocationRepository;
  private readonly reconciliationRepository: InMemoryTrustReconciliationRepository;
  private readonly eventBus: InMemoryTrustReconciliationEventBus;

  constructor(options: TrustReconciliationServiceOptions) {
    this.ledgerRepository = options.ledgerRepository;
    this.allocationRepository = options.allocationRepository;
    this.reconciliationRepository = options.reconciliationRepository;
    this.eventBus = options.eventBus ?? new InMemoryTrustReconciliationEventBus();
  }

  getEventBus(): InMemoryTrustReconciliationEventBus {
    return this.eventBus;
  }

  runReconciliation(
    input: RunTrustReconciliationInput,
  ): TrustReconciliationServiceResult {
    const startedAt = performance.now();
    const stages: TrustReconciliationStageRecord[] = [];
    const reconciliationId = createTrustId("trc");
    const runStartedAt = new Date().toISOString();

    try {
      const validationStarted = performance.now();
      const account = this.ledgerRepository.getAccount(
        input.tenantId,
        input.trustAccountId,
      );
      if (!account) {
        throw new TrustReconciliationError(
          TRUST_RECONCILIATION_ERROR_CODES.TRUST_RECONCILIATION_ACCOUNT_NOT_FOUND,
          "Trust account not found",
        );
      }
      if (account.tenantId !== input.tenantId) {
        throw new TrustReconciliationError(
          TRUST_RECONCILIATION_ERROR_CODES.TRUST_RECONCILIATION_TENANT_MISMATCH,
          "Tenant scope mismatch",
        );
      }
      recordReconciliationStage(
        stages,
        "runReconciliation",
        "validation",
        validationStarted,
        true,
      );

      this.publishEvent({
        eventId: "legal.trust.reconciliation.started",
        occurredAt: runStartedAt,
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        payload: {
          reconciliationId,
          actorUserId: input.actorUserId,
        },
      });

      const reconcileStarted = performance.now();
      const journalEntries = this.ledgerRepository.getJournalEntries(
        input.tenantId,
        input.trustAccountId,
      );
      const transactions = this.ledgerRepository.listTransactions(
        input.tenantId,
        input.trustAccountId,
      );
      const allocations = this.allocationRepository.list({
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
      });

      const engineOutput = runTrustReconciliationChecks({
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        currency: account.currency,
        journalEntries,
        transactions,
        allocations,
      });
      recordReconciliationStage(
        stages,
        "runReconciliation",
        "reconcile",
        reconcileStarted,
        true,
      );

      const completedAt = new Date().toISOString();
      const durationMs = performance.now() - startedAt;
      const status = engineOutput.errorCount > 0 ? "failed" : "completed";
      const diagnosticsSnapshot = buildReconciliationDiagnosticsSnapshot({
        repositoryRunCount:
          this.reconciliationRepository.list({ tenantId: input.tenantId }).length + 1,
        domainEventCount: this.eventBus.listEvents().length + 1,
      });

      const run: TrustReconciliationRun = {
        reconciliationId,
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        startedAt: runStartedAt,
        completedAt,
        durationMs,
        status,
        totalTransactions: transactions.length,
        totalAllocations: allocations.length,
        balanceSummary: engineOutput.balanceSummary,
        variances: engineOutput.variances,
        warningCount: engineOutput.warningCount,
        errorCount: engineOutput.errorCount,
        diagnosticsSnapshot,
      };

      const repoStarted = performance.now();
      this.reconciliationRepository.append(run);
      recordReconciliationStage(
        stages,
        "runReconciliation",
        "repository",
        repoStarted,
        true,
      );

      const eventStarted = performance.now();
      const eventId =
        engineOutput.errorCount > 0
          ? ("legal.trust.reconciliation.failed" as const)
          : ("legal.trust.reconciliation.completed" as const);

      this.publishEvent({
        eventId,
        occurredAt: completedAt,
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        payload: {
          reconciliationId,
          warningCount: engineOutput.warningCount,
          errorCount: engineOutput.errorCount,
          actorUserId: input.actorUserId,
        },
      });
      recordReconciliationStage(
        stages,
        "runReconciliation",
        "event",
        eventStarted,
        true,
      );

      const serviceRun = finalizeReconciliationRun(
        "runReconciliation",
        startedAt,
        stages,
        engineOutput.errorCount === 0,
        {
          tenantId: input.tenantId,
          trustAccountId: input.trustAccountId,
          reconciliationId,
        },
      );

      return {
        ok: engineOutput.errorCount === 0,
        result: { ok: engineOutput.errorCount === 0, run },
        run: serviceRun,
      };
    } catch (error) {
      const normalized = normalizeReconciliationError(error);
      recordReconciliationStage(
        stages,
        "runReconciliation",
        "validation",
        startedAt,
        false,
        normalized.code,
      );

      this.publishEvent({
        eventId: "legal.trust.reconciliation.failed",
        occurredAt: new Date().toISOString(),
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        payload: {
          reconciliationId,
          errorCode: normalized.code,
          actorUserId: input.actorUserId,
        },
      });

      const serviceRun = finalizeReconciliationRun(
        "runReconciliation",
        startedAt,
        stages,
        false,
        {
          tenantId: input.tenantId,
          trustAccountId: input.trustAccountId,
          reconciliationId,
          errorCode: normalized.code,
        },
      );

      return { ok: false, error: normalized, run: serviceRun };
    }
  }

  getRun(
    tenantId: string,
    reconciliationId: string,
  ): TrustReconciliationRun | undefined {
    return this.reconciliationRepository.getById(tenantId, reconciliationId);
  }

  listRuns(
    criteria: TrustReconciliationHistoryCriteria,
  ): readonly TrustReconciliationRun[] {
    return this.reconciliationRepository.list(criteria);
  }

  getAccountSummaries(tenantId: string): readonly TrustReconciliationAccountSummary[] {
    const runs = this.reconciliationRepository.list({ tenantId });
    return getTrustReconciliationDiagnostics().buildAccountSummaries(runs);
  }

  getDiagnosticsSummary(): ReturnType<
    ReturnType<typeof getTrustReconciliationDiagnostics>["getSummary"]
  > {
    return getTrustReconciliationDiagnostics().getSummary();
  }

  private publishEvent(event: TrustReconciliationDomainEvent): void {
    this.eventBus.publish(event);
  }
}

function normalizeReconciliationError(error: unknown): {
  code: string;
  message: string;
} {
  if (isTrustReconciliationError(error)) {
    return { code: error.code, message: error.message };
  }
  return {
    code: TRUST_RECONCILIATION_ERROR_CODES.TRUST_RECONCILIATION_FAILED,
    message: error instanceof Error ? error.message : "Unknown reconciliation error",
  };
}

export function createTrustReconciliationFixture(): {
  readonly ledgerRepository: InMemoryTrustLedgerRepository;
  readonly ledgerService: TrustLedgerService;
  readonly allocationRepository: InMemoryTrustAllocationRepository;
  readonly allocationService: TrustAllocationService;
  readonly reconciliationRepository: InMemoryTrustReconciliationRepository;
  readonly reconciliationService: TrustReconciliationService;
  readonly eventBus: InMemoryTrustReconciliationEventBus;
  readonly accountId: string;
} {
  const ledgerRepository = new InMemoryTrustLedgerRepositoryClass();
  const ledgerService = new TrustLedgerService({ repository: ledgerRepository });
  const allocationRepository = new InMemoryTrustAllocationRepositoryClass();
  const allocationService = new TrustAllocationService({
    allocationRepository,
    ledgerRepository,
  });
  const reconciliationRepository = new InMemoryTrustReconciliationRepositoryClass();
  const eventBus = new InMemoryTrustReconciliationEventBus();
  const reconciliationService = new TrustReconciliationService({
    ledgerRepository,
    allocationRepository,
    reconciliationRepository,
    eventBus,
  });

  const account = ledgerService.openAccount({
    tenantId: "tenant-test",
    name: "Trust",
    currency: "ZAR",
    institutionName: "Bank",
    accountNumberMasked: "****9999",
    actorUserId: "user-test",
  }).data!;

  return {
    ledgerRepository,
    ledgerService,
    allocationRepository,
    allocationService,
    reconciliationRepository,
    reconciliationService,
    eventBus,
    accountId: account.trustAccountId,
  };
}
