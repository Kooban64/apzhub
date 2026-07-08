import type { InMemoryTrustAllocationRepository } from "./in-memory-trust-allocation-repository";
import { InMemoryTrustAllocationRepository as InMemoryTrustAllocationRepositoryClass } from "./in-memory-trust-allocation-repository";
import type { InMemoryTrustInterestPostingRepository } from "./in-memory-trust-interest-posting-repository";
import { InMemoryTrustInterestPostingRepository as InMemoryTrustInterestPostingRepositoryClass } from "./in-memory-trust-interest-posting-repository";
import type { InMemoryTrustInterestRuleRepository } from "./in-memory-trust-interest-rule-repository";
import { InMemoryTrustInterestRuleRepository as InMemoryTrustInterestRuleRepositoryClass } from "./in-memory-trust-interest-rule-repository";
import type { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import { InMemoryTrustLedgerRepository as InMemoryTrustLedgerRepositoryClass } from "./in-memory-trust-ledger-repository";
import { TrustAllocationService } from "./trust-allocation-service";
import { finalizeInterestRun, recordInterestStage } from "./trust-interest-diagnostics";
import { InMemoryTrustInterestEventBus } from "./trust-interest-events";
import {
  TRUST_INTEREST_ERROR_CODES,
  TrustInterestError,
  isTrustInterestError,
} from "./trust-interest-errors";
import {
  runTrustInterestAccrual,
  validateInterestPeriod,
} from "./trust-interest-engine";
import type {
  ApproveTrustInterestPostingInput,
  CreateTrustInterestRuleInput,
  PostTrustInterestPostingInput,
  RunTrustInterestAccrualInput,
  TrustInterestAccrualResult,
  TrustInterestDomainEvent,
  TrustInterestPostResult,
  TrustInterestPosting,
  TrustInterestPostingHistoryCriteria,
  TrustInterestRule,
  TrustInterestServiceResult,
  TrustInterestStageRecord,
} from "./trust-interest-types";
import { createTrustId } from "./trust-id";
import type { TrustApprovalService } from "./trust-approval-service";
import {
  assertTrustApprovalForDomainApprove,
  assertTrustApprovalForPost,
  markTrustApprovalPosted,
} from "./trust-approval-gate";
import { TrustLedgerService } from "./trust-ledger-service";

export interface TrustInterestServiceOptions {
  readonly ledgerRepository: InMemoryTrustLedgerRepository;
  readonly allocationRepository: InMemoryTrustAllocationRepository;
  readonly ruleRepository: InMemoryTrustInterestRuleRepository;
  readonly postingRepository: InMemoryTrustInterestPostingRepository;
  readonly ledgerService: TrustLedgerService;
  readonly allocationService: TrustAllocationService;
  readonly eventBus?: InMemoryTrustInterestEventBus;
  readonly approvalService?: TrustApprovalService;
}

/** Trust Interest accrual and posting workflow (LAW-015-06). */
export class TrustInterestService {
  private readonly ledgerRepository: InMemoryTrustLedgerRepository;
  private readonly allocationRepository: InMemoryTrustAllocationRepository;
  private readonly ruleRepository: InMemoryTrustInterestRuleRepository;
  private readonly postingRepository: InMemoryTrustInterestPostingRepository;
  private readonly ledgerService: TrustLedgerService;
  private readonly allocationService: TrustAllocationService;
  private readonly eventBus: InMemoryTrustInterestEventBus;
  private readonly approvalService: TrustApprovalService | undefined;

  constructor(options: TrustInterestServiceOptions) {
    this.ledgerRepository = options.ledgerRepository;
    this.allocationRepository = options.allocationRepository;
    this.ruleRepository = options.ruleRepository;
    this.postingRepository = options.postingRepository;
    this.ledgerService = options.ledgerService;
    this.allocationService = options.allocationService;
    this.eventBus = options.eventBus ?? new InMemoryTrustInterestEventBus();
    this.approvalService = options.approvalService;
  }

  getEventBus(): InMemoryTrustInterestEventBus {
    return this.eventBus;
  }

  createRule(
    input: CreateTrustInterestRuleInput,
  ): TrustInterestServiceResult<TrustInterestRule> {
    const startedAt = performance.now();
    const stages: TrustInterestStageRecord[] = [];

    try {
      const validationStarted = performance.now();
      if (!Number.isFinite(input.annualRatePercent) || input.annualRatePercent <= 0) {
        throw new TrustInterestError(
          TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_INVALID_RATE,
          "Annual rate must be positive",
        );
      }
      if (input.trustAccountId) {
        const account = this.ledgerRepository.getAccount(
          input.tenantId,
          input.trustAccountId,
        );
        if (!account) {
          throw new TrustInterestError(
            TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_ACCOUNT_NOT_FOUND,
            "Trust account not found",
          );
        }
      }
      recordInterestStage(stages, "createRule", "validation", validationStarted, true);

      const rule: TrustInterestRule = {
        trustInterestRuleId: createTrustId("irul"),
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        complianceProfileId: input.complianceProfileId,
        accrualMethod: input.accrualMethod,
        annualRatePercent: input.annualRatePercent,
        postingFrequency: input.postingFrequency,
        minimumBalance: input.minimumBalance,
        strategyRef: input.strategyRef,
        isActive: true,
        version: 1,
        effectiveFrom: input.effectiveFrom,
        createdAt: new Date().toISOString(),
        createdByUserId: input.actorUserId,
      };

      const persistStarted = performance.now();
      this.ruleRepository.save(rule);
      recordInterestStage(stages, "createRule", "persist", persistStarted, true);

      return {
        ok: true,
        data: rule,
        run: finalizeInterestRun("createRule", startedAt, stages, true, {
          trustInterestRuleId: rule.trustInterestRuleId,
        }),
      };
    } catch (error) {
      return this.fail("createRule", startedAt, stages, error);
    }
  }

  listRules(tenantId: string, trustAccountId?: string): readonly TrustInterestRule[] {
    return this.ruleRepository.list(tenantId, trustAccountId);
  }

  getRule(
    tenantId: string,
    trustInterestRuleId: string,
  ): TrustInterestRule | undefined {
    return this.ruleRepository.getById(tenantId, trustInterestRuleId);
  }

  runAccrual(
    input: RunTrustInterestAccrualInput,
  ): TrustInterestServiceResult<TrustInterestAccrualResult> {
    const startedAt = performance.now();
    const stages: TrustInterestStageRecord[] = [];

    try {
      const validationStarted = performance.now();
      const account = this.requireAccount(input.tenantId, input.trustAccountId);
      const rule = this.requireActiveRule(input.tenantId, input.trustInterestRuleId);
      if (rule.trustAccountId && rule.trustAccountId !== input.trustAccountId) {
        throw new TrustInterestError(
          TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_RULE_ACCOUNT_MISMATCH,
          "Interest rule does not apply to this trust account",
        );
      }
      if (!validateInterestPeriod(input.periodStart, input.periodEnd)) {
        throw new TrustInterestError(
          TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_INVALID_PERIOD,
          "Invalid interest period",
        );
      }
      recordInterestStage(stages, "runAccrual", "validation", validationStarted, true);

      const accrueStarted = performance.now();
      const allocations = this.allocationRepository.list({
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
      });
      const engineOutput = runTrustInterestAccrual({
        rule,
        trustAccountId: input.trustAccountId,
        currency: account.currency,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        allocations,
      });

      if (engineOutput.lineItems.length === 0) {
        throw new TrustInterestError(
          TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_NO_ACCRUAL_LINES,
          "No interest accrual lines generated for period",
        );
      }
      recordInterestStage(stages, "runAccrual", "accrue", accrueStarted, true);

      const persistStarted = performance.now();
      const posting: TrustInterestPosting = {
        trustInterestPostingId: createTrustId("ipst"),
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        trustInterestRuleId: rule.trustInterestRuleId,
        status: "draft",
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        lineItems: engineOutput.lineItems,
        totalInterestAmount: engineOutput.totalInterestAmount,
        currency: account.currency,
        draftCreatedAt: new Date().toISOString(),
        draftCreatedByUserId: input.actorUserId,
        linkedTransactionIds: [],
      };
      this.postingRepository.save(posting);
      recordInterestStage(stages, "runAccrual", "persist", persistStarted, true);

      this.publishEvent({
        eventId: "legal.trust.interest.accrued",
        occurredAt: posting.draftCreatedAt,
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        payload: {
          trustInterestPostingId: posting.trustInterestPostingId,
          trustInterestRuleId: rule.trustInterestRuleId,
          totalInterestAmount: posting.totalInterestAmount,
          lineCount: posting.lineItems.length,
          actorUserId: input.actorUserId,
        },
      });

      return {
        ok: true,
        data: { posting },
        run: finalizeInterestRun("runAccrual", startedAt, stages, true, {
          trustInterestPostingId: posting.trustInterestPostingId,
          trustInterestRuleId: rule.trustInterestRuleId,
        }),
      };
    } catch (error) {
      return this.fail("runAccrual", startedAt, stages, error);
    }
  }

  approvePosting(
    input: ApproveTrustInterestPostingInput,
  ): TrustInterestServiceResult<TrustInterestPosting> {
    const startedAt = performance.now();
    const stages: TrustInterestStageRecord[] = [];

    try {
      const validationStarted = performance.now();
      const posting = this.requirePosting(input.tenantId, input.trustInterestPostingId);
      if (posting.status !== "draft") {
        throw new TrustInterestError(
          TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_INVALID_STATUS,
          "Only draft interest postings can be approved",
        );
      }

      assertTrustApprovalForDomainApprove(
        this.approvalService,
        input.tenantId,
        "interest_posting",
        input.trustInterestPostingId,
      );

      recordInterestStage(
        stages,
        "approvePosting",
        "validation",
        validationStarted,
        true,
      );

      const approveStarted = performance.now();
      const approvedAt = new Date().toISOString();
      const approved: TrustInterestPosting = {
        ...posting,
        status: "approved",
        approvedAt,
        approvedByUserId: input.actorUserId,
      };
      this.postingRepository.save(approved);
      recordInterestStage(stages, "approvePosting", "approve", approveStarted, true);

      this.publishEvent({
        eventId: "legal.trust.interest.approved",
        occurredAt: approvedAt,
        tenantId: input.tenantId,
        trustAccountId: approved.trustAccountId,
        payload: {
          trustInterestPostingId: approved.trustInterestPostingId,
          approvedByUserId: input.actorUserId,
        },
      });

      return {
        ok: true,
        data: approved,
        run: finalizeInterestRun("approvePosting", startedAt, stages, true, {
          trustInterestPostingId: approved.trustInterestPostingId,
        }),
      };
    } catch (error) {
      return this.fail("approvePosting", startedAt, stages, error);
    }
  }

  postInterest(
    input: PostTrustInterestPostingInput,
  ): TrustInterestServiceResult<TrustInterestPostResult> {
    const startedAt = performance.now();
    const stages: TrustInterestStageRecord[] = [];

    try {
      const validationStarted = performance.now();
      const posting = this.requirePosting(input.tenantId, input.trustInterestPostingId);
      if (posting.status !== "approved") {
        throw new TrustInterestError(
          TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_INVALID_STATUS,
          "Only approved interest postings can be posted",
        );
      }

      assertTrustApprovalForPost(
        this.approvalService,
        input.tenantId,
        "interest_posting",
        input.trustInterestPostingId,
        posting.totalInterestAmount,
      );

      recordInterestStage(
        stages,
        "postInterest",
        "validation",
        validationStarted,
        true,
      );

      const postStarted = performance.now();
      const transactionIds: string[] = [];

      for (const line of posting.lineItems) {
        const ledgerResult = this.ledgerService.postTransaction({
          tenantId: input.tenantId,
          trustAccountId: posting.trustAccountId,
          trustTransactionType: "interest",
          amount: line.interestAmount,
          currency: line.currency,
          transactionDate: input.postingDate,
          postingDate: input.postingDate,
          clientId: line.clientId,
          matterId: line.matterId,
          narrative: `Trust interest ${posting.periodStart} to ${posting.periodEnd}`,
          actorUserId: input.actorUserId,
        });

        if (!ledgerResult.ok || !ledgerResult.data) {
          throw new TrustInterestError(
            TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_POST_FAILED,
            ledgerResult.error?.message ?? "Failed to post interest ledger transaction",
          );
        }

        const allocationResult = this.allocationService.allocate({
          tenantId: input.tenantId,
          trustTransactionId: ledgerResult.data.trustTransactionId,
          actorUserId: input.actorUserId,
        });

        if (!allocationResult.ok) {
          throw new TrustInterestError(
            TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_POST_FAILED,
            allocationResult.error?.message ??
              "Failed to allocate interest transaction",
          );
        }

        transactionIds.push(ledgerResult.data.trustTransactionId);
      }
      recordInterestStage(stages, "postInterest", "post", postStarted, true);

      const persistStarted = performance.now();
      const postedAt = new Date().toISOString();
      const posted: TrustInterestPosting = {
        ...posting,
        status: "posted",
        postedAt,
        postedByUserId: input.actorUserId,
        linkedTransactionIds: transactionIds,
      };
      this.postingRepository.save(posted);
      recordInterestStage(stages, "postInterest", "persist", persistStarted, true);

      this.publishEvent({
        eventId: "legal.trust.interest.posted",
        occurredAt: postedAt,
        tenantId: input.tenantId,
        trustAccountId: posted.trustAccountId,
        payload: {
          trustInterestPostingId: posted.trustInterestPostingId,
          transactionIds,
          totalInterestAmount: posted.totalInterestAmount,
          postedByUserId: input.actorUserId,
        },
      });

      markTrustApprovalPosted(this.approvalService, {
        tenantId: input.tenantId,
        approvalType: "interest_posting",
        subjectId: posted.trustInterestPostingId,
        actorUserId: input.actorUserId,
      });

      return {
        ok: true,
        data: { posting: posted, transactionIds },
        run: finalizeInterestRun("postInterest", startedAt, stages, true, {
          trustInterestPostingId: posted.trustInterestPostingId,
        }),
      };
    } catch (error) {
      return this.fail("postInterest", startedAt, stages, error);
    }
  }

  listPostings(
    criteria: TrustInterestPostingHistoryCriteria,
  ): readonly TrustInterestPosting[] {
    return this.postingRepository.list(criteria);
  }

  getPosting(
    tenantId: string,
    trustInterestPostingId: string,
  ): TrustInterestPosting | undefined {
    return this.postingRepository.getById(tenantId, trustInterestPostingId);
  }

  private requireAccount(tenantId: string, trustAccountId: string) {
    const account = this.ledgerRepository.getAccount(tenantId, trustAccountId);
    if (!account) {
      throw new TrustInterestError(
        TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_ACCOUNT_NOT_FOUND,
        "Trust account not found",
      );
    }
    return account;
  }

  private requireActiveRule(
    tenantId: string,
    trustInterestRuleId: string,
  ): TrustInterestRule {
    const rule = this.ruleRepository.getById(tenantId, trustInterestRuleId);
    if (!rule) {
      throw new TrustInterestError(
        TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_RULE_NOT_FOUND,
        "Interest rule not found",
      );
    }
    if (!rule.isActive) {
      throw new TrustInterestError(
        TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_RULE_INACTIVE,
        "Interest rule is inactive",
      );
    }
    return rule;
  }

  private requirePosting(
    tenantId: string,
    trustInterestPostingId: string,
  ): TrustInterestPosting {
    const posting = this.postingRepository.getById(tenantId, trustInterestPostingId);
    if (!posting) {
      throw new TrustInterestError(
        TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_POSTING_NOT_FOUND,
        "Interest posting not found",
      );
    }
    if (posting.tenantId !== tenantId) {
      throw new TrustInterestError(
        TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_TENANT_MISMATCH,
        "Tenant scope mismatch",
      );
    }
    return posting;
  }

  private publishEvent(event: TrustInterestDomainEvent): void {
    this.eventBus.publish(event);
  }

  private fail<T>(
    operation: TrustInterestStageRecord["operation"],
    startedAt: number,
    stages: TrustInterestStageRecord[],
    error: unknown,
  ): TrustInterestServiceResult<T> {
    const mapped = mapInterestError(error);
    return {
      ok: false,
      error: mapped,
      run: finalizeInterestRun(operation, startedAt, stages, false, {
        errorCode: mapped.code,
        errorMessage: mapped.message,
      }),
    };
  }
}

function mapInterestError(error: unknown): { code: string; message: string } {
  if (isTrustInterestError(error)) {
    return { code: error.code, message: error.message };
  }
  return {
    code: TRUST_INTEREST_ERROR_CODES.TRUST_INTEREST_FAILED,
    message: error instanceof Error ? error.message : "Unknown interest error",
  };
}

export function createTrustInterestFixture(): {
  readonly ledgerRepository: InMemoryTrustLedgerRepository;
  readonly ledgerService: TrustLedgerService;
  readonly allocationRepository: InMemoryTrustAllocationRepository;
  readonly allocationService: TrustAllocationService;
  readonly ruleRepository: InMemoryTrustInterestRuleRepository;
  readonly postingRepository: InMemoryTrustInterestPostingRepository;
  readonly interestService: TrustInterestService;
  readonly eventBus: InMemoryTrustInterestEventBus;
  readonly accountId: string;
} {
  const ledgerRepository = new InMemoryTrustLedgerRepositoryClass();
  const ledgerService = new TrustLedgerService({ repository: ledgerRepository });
  const allocationRepository = new InMemoryTrustAllocationRepositoryClass();
  const allocationService = new TrustAllocationService({
    allocationRepository,
    ledgerRepository,
  });
  const ruleRepository = new InMemoryTrustInterestRuleRepositoryClass();
  const postingRepository = new InMemoryTrustInterestPostingRepositoryClass();
  const eventBus = new InMemoryTrustInterestEventBus();
  const interestService = new TrustInterestService({
    ledgerRepository,
    allocationRepository,
    ruleRepository,
    postingRepository,
    ledgerService,
    allocationService,
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
    ruleRepository,
    postingRepository,
    interestService,
    eventBus,
    accountId: account.trustAccountId,
  };
}
