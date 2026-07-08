import type { InMemoryTrustApprovalRepository } from "./in-memory-trust-approval-repository";
import { InMemoryTrustApprovalRepository as InMemoryTrustApprovalRepositoryClass } from "./in-memory-trust-approval-repository";
import {
  finalizeApprovalRun,
  getTrustApprovalDiagnostics,
  recordApprovalStage,
} from "./trust-approval-diagnostics";
import { InMemoryTrustApprovalEventBus } from "./trust-approval-events";
import {
  TRUST_APPROVAL_ERROR_CODES,
  TrustApprovalError,
  isTrustApprovalError,
} from "./trust-approval-errors";
import type {
  ApproveTrustApprovalInput,
  CancelTrustApprovalInput,
  CreateTrustApprovalRuleInput,
  MarkTrustApprovalPostedInput,
  RejectTrustApprovalInput,
  SubmitTrustApprovalInput,
  TrustApprovalDiagnosticsSnapshot,
  TrustApprovalDomainEvent,
  TrustApprovalHistoryRecord,
  TrustApprovalListCriteria,
  TrustApprovalRequest,
  TrustApprovalRule,
  TrustApprovalServiceResult,
  TrustApprovalStageRecord,
  TrustApprovalType,
  TrustApprovalValidationResult,
} from "./trust-approval-types";
import { TrustApprovalValidator } from "./trust-approval-validator";
import { createTrustId } from "./trust-id";

export interface TrustApprovalServiceOptions {
  readonly repository?: InMemoryTrustApprovalRepository;
  readonly validator?: TrustApprovalValidator;
  readonly eventBus?: InMemoryTrustApprovalEventBus;
}

/** Trust operational approval governance — no accounting logic (LAW-015-10). */
export class TrustApprovalService {
  private readonly repository: InMemoryTrustApprovalRepository;
  private readonly validator: TrustApprovalValidator;
  private readonly eventBus: InMemoryTrustApprovalEventBus;
  private readonly ruleUsage = new Map<string, number>();

  constructor(options: TrustApprovalServiceOptions = {}) {
    this.repository = options.repository ?? new InMemoryTrustApprovalRepositoryClass();
    this.validator = options.validator ?? new TrustApprovalValidator();
    this.eventBus = options.eventBus ?? new InMemoryTrustApprovalEventBus();
  }

  getEventBus(): InMemoryTrustApprovalEventBus {
    return this.eventBus;
  }

  getRepository(): InMemoryTrustApprovalRepository {
    return this.repository;
  }

  createRule(
    input: CreateTrustApprovalRuleInput,
  ): TrustApprovalServiceResult<TrustApprovalRule> {
    const startedAt = performance.now();
    const stages: TrustApprovalStageRecord[] = [];

    try {
      const validationStarted = performance.now();
      if (!input.tenantId.trim()) {
        throw new TrustApprovalError(
          TRUST_APPROVAL_ERROR_CODES.TRUST_APPROVAL_VALIDATION_FAILED,
          "Tenant is required",
        );
      }
      recordApprovalStage(stages, "createRule", "validation", validationStarted, true);

      const now = new Date().toISOString();
      const rule: TrustApprovalRule = {
        trustApprovalRuleId: createTrustId("tapr"),
        tenantId: input.tenantId,
        approvalType: input.approvalType,
        mode: input.mode,
        isActive: true,
        amountThreshold: input.amountThreshold,
        requiredApprovalCount:
          input.requiredApprovalCount ?? defaultRequiredCount(input.mode),
        allowedRoles: input.allowedRoles ?? defaultAllowedRoles(input.mode),
        preventSelfApproval: input.preventSelfApproval ?? true,
        createdAt: now,
        createdByUserId: input.actorUserId,
      };

      const persistStarted = performance.now();
      this.repository.saveRule(rule);
      recordApprovalStage(stages, "createRule", "persist", persistStarted, true);

      return {
        ok: true,
        data: rule,
        run: finalizeApprovalRun("createRule", startedAt, stages, true, {
          trustApprovalRequestId: rule.trustApprovalRuleId,
        }),
      };
    } catch (error) {
      return this.fail("createRule", startedAt, stages, error);
    }
  }

  listRules(
    tenantId: string,
    approvalType?: TrustApprovalType,
  ): readonly TrustApprovalRule[] {
    return this.repository
      .listRules(tenantId, approvalType)
      .filter((rule) => rule.isActive);
  }

  submitForApproval(
    input: SubmitTrustApprovalInput,
  ): TrustApprovalServiceResult<TrustApprovalRequest> {
    const startedAt = performance.now();
    const stages: TrustApprovalStageRecord[] = [];

    try {
      const validationStarted = performance.now();
      const inputValidation = this.validator.validateSubmitInput(input);
      if (!inputValidation.ok) {
        recordApprovalStage(stages, "submit", "validation", validationStarted, false);
        return this.validationFailure("submit", startedAt, stages, inputValidation);
      }

      const existing = this.repository.findActiveRequest(
        input.tenantId,
        input.approvalType,
        input.subjectId,
      );
      if (existing && existing.status !== "draft") {
        throw new TrustApprovalError(
          TRUST_APPROVAL_ERROR_CODES.TRUST_APPROVAL_DUPLICATE,
          "An active approval request already exists for this subject",
        );
      }
      recordApprovalStage(stages, "submit", "validation", validationStarted, true);

      const resolveStarted = performance.now();
      const rule = this.resolveActiveRule(input.tenantId, input.approvalType);
      const resolved = rule
        ? this.validator.resolveRequiredApprovalCount(rule, input.amount)
        : { mode: "no_approval_required" as const, count: 0 };
      recordApprovalStage(stages, "submit", "resolveRule", resolveStarted, true);

      const now = new Date().toISOString();
      let request: TrustApprovalRequest = existing ?? {
        trustApprovalRequestId: createTrustId("tapq"),
        tenantId: input.tenantId,
        approvalType: input.approvalType,
        status: "draft",
        subjectId: input.subjectId,
        trustAccountId: input.trustAccountId,
        amount: input.amount,
        currency: input.currency.trim().toUpperCase(),
        requestedByUserId: input.actorUserId,
        requiredApprovalCount: resolved.count,
        appliedRuleId: rule?.trustApprovalRuleId,
        appliedRuleMode: resolved.mode,
        decisions: [],
        submitReason: input.reason?.trim(),
        createdAt: now,
        updatedAt: now,
      };

      if (resolved.count === 0) {
        request = {
          ...request,
          status: "approved",
          submittedAt: now,
          approvedAt: now,
          updatedAt: now,
        };
      } else {
        request = {
          ...request,
          status: "submitted",
          submittedAt: now,
          updatedAt: now,
        };
      }

      const persistStarted = performance.now();
      this.repository.saveRequest(request);
      if (rule?.trustApprovalRuleId) {
        this.trackRuleUsage(rule.trustApprovalRuleId);
      }
      recordApprovalStage(stages, "submit", "persist", persistStarted, true);

      const historyStarted = performance.now();
      this.appendHistory({
        request,
        actorUserId: input.actorUserId,
        action: "submit",
        reason: input.reason,
        previousStatus: existing?.status ?? "draft",
        newStatus: request.status,
      });
      recordApprovalStage(stages, "submit", "history", historyStarted, true);

      if (request.status === "submitted") {
        this.publishEvent({
          eventId: "legal.trust.approval.submitted",
          occurredAt: now,
          tenantId: input.tenantId,
          trustAccountId: input.trustAccountId,
          payload: {
            trustApprovalRequestId: request.trustApprovalRequestId,
            approvalType: input.approvalType,
            subjectId: input.subjectId,
            amount: input.amount,
            actorUserId: input.actorUserId,
          },
        });
      }

      if (request.status === "approved") {
        this.publishEvent({
          eventId: "legal.trust.approval.approved",
          occurredAt: now,
          tenantId: input.tenantId,
          trustAccountId: input.trustAccountId,
          payload: {
            trustApprovalRequestId: request.trustApprovalRequestId,
            approvalType: input.approvalType,
            subjectId: input.subjectId,
            autoApproved: true,
          },
        });
      }

      return {
        ok: true,
        data: request,
        run: finalizeApprovalRun("submit", startedAt, stages, true, {
          trustApprovalRequestId: request.trustApprovalRequestId,
        }),
      };
    } catch (error) {
      return this.fail("submit", startedAt, stages, error);
    }
  }

  approve(
    input: ApproveTrustApprovalInput,
  ): TrustApprovalServiceResult<TrustApprovalRequest> {
    const startedAt = performance.now();
    const stages: TrustApprovalStageRecord[] = [];

    try {
      const request = this.requireRequest(input.tenantId, input.trustApprovalRequestId);
      const rule = request.appliedRuleId
        ? this.repository.getRule(input.tenantId, request.appliedRuleId)
        : undefined;

      const validationStarted = performance.now();
      const validation = this.validator.validateApprove(request, input, rule);
      if (!validation.ok) {
        recordApprovalStage(stages, "approve", "validation", validationStarted, false);
        return this.validationFailure("approve", startedAt, stages, validation);
      }
      recordApprovalStage(stages, "approve", "validation", validationStarted, true);

      const now = new Date().toISOString();
      const decisions = [
        ...request.decisions,
        {
          actorUserId: input.actorUserId,
          actorRoles: [...input.actorRoles],
          approvedAt: now,
        },
      ];

      const fullyApproved = decisions.length >= request.requiredApprovalCount;
      const nextStatus = fullyApproved ? "approved" : request.status;

      if (nextStatus !== request.status) {
        const transition = this.validator.validateStatusTransition(
          request.status,
          nextStatus,
        );
        if (!transition.ok) {
          return this.validationFailure("approve", startedAt, stages, transition);
        }
      }

      const approved: TrustApprovalRequest = {
        ...request,
        status: nextStatus,
        decisions,
        approvedAt: fullyApproved ? now : request.approvedAt,
        updatedAt: now,
      };

      const persistStarted = performance.now();
      this.repository.saveRequest(approved);
      recordApprovalStage(stages, "approve", "persist", persistStarted, true);

      const historyStarted = performance.now();
      this.appendHistory({
        request: approved,
        actorUserId: input.actorUserId,
        action: "approve",
        reason: input.reason,
        previousStatus: request.status,
        newStatus: approved.status,
      });
      recordApprovalStage(stages, "approve", "history", historyStarted, true);

      if (fullyApproved) {
        this.publishEvent({
          eventId: "legal.trust.approval.approved",
          occurredAt: now,
          tenantId: input.tenantId,
          trustAccountId: approved.trustAccountId,
          payload: {
            trustApprovalRequestId: approved.trustApprovalRequestId,
            approvalType: approved.approvalType,
            subjectId: approved.subjectId,
            approvedByUserIds: decisions.map((decision) => decision.actorUserId),
          },
        });
      }

      return {
        ok: true,
        data: approved,
        run: finalizeApprovalRun("approve", startedAt, stages, true, {
          trustApprovalRequestId: approved.trustApprovalRequestId,
        }),
      };
    } catch (error) {
      return this.fail("approve", startedAt, stages, error);
    }
  }

  reject(
    input: RejectTrustApprovalInput,
  ): TrustApprovalServiceResult<TrustApprovalRequest> {
    const startedAt = performance.now();
    const stages: TrustApprovalStageRecord[] = [];

    try {
      const request = this.requireRequest(input.tenantId, input.trustApprovalRequestId);
      const rule = request.appliedRuleId
        ? this.repository.getRule(input.tenantId, request.appliedRuleId)
        : undefined;

      const validationStarted = performance.now();
      const validation = this.validator.validateReject(request, input, rule);
      if (!validation.ok) {
        recordApprovalStage(stages, "reject", "validation", validationStarted, false);
        return this.validationFailure("reject", startedAt, stages, validation);
      }

      const transition = this.validator.validateStatusTransition(
        request.status,
        "rejected",
      );
      if (!transition.ok) {
        recordApprovalStage(stages, "reject", "validation", validationStarted, false);
        return this.validationFailure("reject", startedAt, stages, transition);
      }
      recordApprovalStage(stages, "reject", "validation", validationStarted, true);

      const now = new Date().toISOString();
      const rejected: TrustApprovalRequest = {
        ...request,
        status: "rejected",
        rejectReason: input.reason.trim(),
        rejectedAt: now,
        updatedAt: now,
      };

      const persistStarted = performance.now();
      this.repository.saveRequest(rejected);
      recordApprovalStage(stages, "reject", "persist", persistStarted, true);

      const historyStarted = performance.now();
      this.appendHistory({
        request: rejected,
        actorUserId: input.actorUserId,
        action: "reject",
        reason: input.reason,
        previousStatus: request.status,
        newStatus: rejected.status,
      });
      recordApprovalStage(stages, "reject", "history", historyStarted, true);

      this.publishEvent({
        eventId: "legal.trust.approval.rejected",
        occurredAt: now,
        tenantId: input.tenantId,
        trustAccountId: rejected.trustAccountId,
        payload: {
          trustApprovalRequestId: rejected.trustApprovalRequestId,
          approvalType: rejected.approvalType,
          subjectId: rejected.subjectId,
          reason: input.reason,
          actorUserId: input.actorUserId,
        },
      });

      return {
        ok: true,
        data: rejected,
        run: finalizeApprovalRun("reject", startedAt, stages, true, {
          trustApprovalRequestId: rejected.trustApprovalRequestId,
        }),
      };
    } catch (error) {
      return this.fail("reject", startedAt, stages, error);
    }
  }

  cancel(
    input: CancelTrustApprovalInput,
  ): TrustApprovalServiceResult<TrustApprovalRequest> {
    const startedAt = performance.now();
    const stages: TrustApprovalStageRecord[] = [];

    try {
      const request = this.requireRequest(input.tenantId, input.trustApprovalRequestId);

      const validationStarted = performance.now();
      const validation = this.validator.validateCancel(request, input);
      if (!validation.ok) {
        recordApprovalStage(stages, "cancel", "validation", validationStarted, false);
        return this.validationFailure("cancel", startedAt, stages, validation);
      }

      const transition = this.validator.validateStatusTransition(
        request.status,
        "cancelled",
      );
      if (!transition.ok) {
        recordApprovalStage(stages, "cancel", "validation", validationStarted, false);
        return this.validationFailure("cancel", startedAt, stages, transition);
      }
      recordApprovalStage(stages, "cancel", "validation", validationStarted, true);

      const now = new Date().toISOString();
      const cancelled: TrustApprovalRequest = {
        ...request,
        status: "cancelled",
        cancelReason: input.reason?.trim(),
        cancelledAt: now,
        updatedAt: now,
      };

      const persistStarted = performance.now();
      this.repository.saveRequest(cancelled);
      recordApprovalStage(stages, "cancel", "persist", persistStarted, true);

      const historyStarted = performance.now();
      this.appendHistory({
        request: cancelled,
        actorUserId: input.actorUserId,
        action: "cancel",
        reason: input.reason,
        previousStatus: request.status,
        newStatus: cancelled.status,
      });
      recordApprovalStage(stages, "cancel", "history", historyStarted, true);

      this.publishEvent({
        eventId: "legal.trust.approval.cancelled",
        occurredAt: now,
        tenantId: input.tenantId,
        trustAccountId: cancelled.trustAccountId,
        payload: {
          trustApprovalRequestId: cancelled.trustApprovalRequestId,
          approvalType: cancelled.approvalType,
          subjectId: cancelled.subjectId,
          actorUserId: input.actorUserId,
        },
      });

      return {
        ok: true,
        data: cancelled,
        run: finalizeApprovalRun("cancel", startedAt, stages, true, {
          trustApprovalRequestId: cancelled.trustApprovalRequestId,
        }),
      };
    } catch (error) {
      return this.fail("cancel", startedAt, stages, error);
    }
  }

  markPosted(
    input: MarkTrustApprovalPostedInput,
  ): TrustApprovalServiceResult<TrustApprovalRequest> {
    const startedAt = performance.now();
    const stages: TrustApprovalStageRecord[] = [];

    try {
      const request = this.repository.findActiveRequest(
        input.tenantId,
        input.approvalType,
        input.subjectId,
      );

      if (!request) {
        return {
          ok: true,
          run: finalizeApprovalRun("markPosted", startedAt, stages, true),
        };
      }

      if (request.status !== "approved") {
        throw new TrustApprovalError(
          TRUST_APPROVAL_ERROR_CODES.TRUST_APPROVAL_INVALID_STATUS,
          "Only approved requests can be marked posted",
        );
      }

      const transition = this.validator.validateStatusTransition(
        request.status,
        "posted",
      );
      if (!transition.ok) {
        return this.validationFailure("markPosted", startedAt, stages, transition);
      }

      const now = new Date().toISOString();
      const posted: TrustApprovalRequest = {
        ...request,
        status: "posted",
        postedAt: now,
        updatedAt: now,
      };

      this.repository.saveRequest(posted);
      this.appendHistory({
        request: posted,
        actorUserId: input.actorUserId,
        action: "mark_posted",
        previousStatus: request.status,
        newStatus: posted.status,
      });

      return {
        ok: true,
        data: posted,
        run: finalizeApprovalRun("markPosted", startedAt, stages, true, {
          trustApprovalRequestId: posted.trustApprovalRequestId,
        }),
      };
    } catch (error) {
      return this.fail("markPosted", startedAt, stages, error);
    }
  }

  assertCanPost(
    tenantId: string,
    approvalType: TrustApprovalType,
    subjectId: string,
    amount: number,
  ): TrustApprovalServiceResult<void> {
    const startedAt = performance.now();
    const stages: TrustApprovalStageRecord[] = [];

    try {
      const rule = this.resolveActiveRule(tenantId, approvalType);
      const request = this.repository.findActiveRequest(
        tenantId,
        approvalType,
        subjectId,
      );

      if (this.validator.isPostingAllowed(request, rule, amount)) {
        return {
          ok: true,
          run: finalizeApprovalRun("assertCanPost", startedAt, stages, true),
        };
      }

      throw new TrustApprovalError(
        TRUST_APPROVAL_ERROR_CODES.TRUST_APPROVAL_REQUIRED,
        "Operational approval is required before posting",
      );
    } catch (error) {
      return this.fail("assertCanPost", startedAt, stages, error);
    }
  }

  getRequest(
    tenantId: string,
    trustApprovalRequestId: string,
  ): TrustApprovalRequest | undefined {
    return this.repository.getRequest(tenantId, trustApprovalRequestId);
  }

  findRequestForSubject(
    tenantId: string,
    approvalType: TrustApprovalType,
    subjectId: string,
  ): TrustApprovalRequest | undefined {
    return this.repository.findActiveRequest(tenantId, approvalType, subjectId);
  }

  listRequests(criteria: TrustApprovalListCriteria): readonly TrustApprovalRequest[] {
    return this.repository.listRequests(criteria);
  }

  getHistory(
    tenantId: string,
    trustApprovalRequestId: string,
  ): readonly TrustApprovalHistoryRecord[] {
    return this.repository.listHistory(tenantId, trustApprovalRequestId);
  }

  buildDiagnosticsSnapshot(tenantId: string): TrustApprovalDiagnosticsSnapshot {
    const requests = this.repository.listRequests({ tenantId });
    const pendingApprovals = requests.filter(
      (request) => request.status === "submitted",
    ).length;
    const approvedCount = requests.filter(
      (request) => request.status === "approved" || request.status === "posted",
    ).length;
    const rejectedCount = requests.filter(
      (request) => request.status === "rejected",
    ).length;
    const cancelledCount = requests.filter(
      (request) => request.status === "cancelled",
    ).length;

    return getTrustApprovalDiagnostics().buildSnapshot({
      pendingApprovals,
      approvedCount,
      rejectedCount,
      cancelledCount,
      ruleUsage: Object.fromEntries(this.ruleUsage),
    });
  }

  private resolveActiveRule(
    tenantId: string,
    approvalType: TrustApprovalType,
  ): TrustApprovalRule | undefined {
    const rules = this.listRules(tenantId, approvalType);
    return rules.at(-1);
  }

  private requireRequest(
    tenantId: string,
    trustApprovalRequestId: string,
  ): TrustApprovalRequest {
    const request = this.repository.getRequest(tenantId, trustApprovalRequestId);
    if (!request) {
      throw new TrustApprovalError(
        TRUST_APPROVAL_ERROR_CODES.TRUST_APPROVAL_NOT_FOUND,
        "Approval request not found",
      );
    }
    if (request.tenantId !== tenantId) {
      throw new TrustApprovalError(
        TRUST_APPROVAL_ERROR_CODES.TRUST_APPROVAL_TENANT_MISMATCH,
        "Tenant scope mismatch",
      );
    }
    return request;
  }

  private appendHistory(input: {
    readonly request: TrustApprovalRequest;
    readonly actorUserId: string;
    readonly action: TrustApprovalHistoryRecord["action"];
    readonly reason?: string;
    readonly previousStatus: TrustApprovalRequest["status"];
    readonly newStatus: TrustApprovalRequest["status"];
  }): TrustApprovalHistoryRecord {
    return this.repository.appendHistory({
      trustApprovalHistoryId: createTrustId("taph"),
      trustApprovalRequestId: input.request.trustApprovalRequestId,
      tenantId: input.request.tenantId,
      actorUserId: input.actorUserId,
      action: input.action,
      reason: input.reason?.trim(),
      previousStatus: input.previousStatus,
      newStatus: input.newStatus,
      occurredAt: new Date().toISOString(),
    });
  }

  private trackRuleUsage(ruleId: string): void {
    this.ruleUsage.set(ruleId, (this.ruleUsage.get(ruleId) ?? 0) + 1);
  }

  private publishEvent(event: TrustApprovalDomainEvent): void {
    this.eventBus.publish(event);
  }

  private validationFailure<T>(
    operation: TrustApprovalStageRecord["operation"],
    startedAt: number,
    stages: TrustApprovalStageRecord[],
    validation: TrustApprovalValidationResult,
  ): TrustApprovalServiceResult<T> {
    return {
      ok: false,
      validation,
      error: {
        code: TRUST_APPROVAL_ERROR_CODES.TRUST_APPROVAL_VALIDATION_FAILED,
        message: "Approval validation failed",
      },
      run: finalizeApprovalRun(operation, startedAt, stages, false, {
        validationErrors: validation.errors,
      }),
    };
  }

  private fail<T>(
    operation: TrustApprovalStageRecord["operation"],
    startedAt: number,
    stages: TrustApprovalStageRecord[],
    error: unknown,
  ): TrustApprovalServiceResult<T> {
    const mapped = mapApprovalError(error);
    return {
      ok: false,
      error: mapped,
      run: finalizeApprovalRun(operation, startedAt, stages, false, {
        errorCode: mapped.code,
        errorMessage: mapped.message,
      }),
    };
  }
}

function mapApprovalError(error: unknown): { code: string; message: string } {
  if (isTrustApprovalError(error)) {
    return { code: error.code, message: error.message };
  }
  return {
    code: TRUST_APPROVAL_ERROR_CODES.TRUST_APPROVAL_FAILED,
    message: error instanceof Error ? error.message : "Unknown approval error",
  };
}

function defaultRequiredCount(mode: TrustApprovalRule["mode"]): number {
  switch (mode) {
    case "dual_approval":
      return 2;
    case "single_approver":
    case "role_based":
      return 1;
    case "threshold_based":
      return 2;
    default:
      return 0;
  }
}

function defaultAllowedRoles(mode: TrustApprovalRule["mode"]): readonly string[] {
  switch (mode) {
    case "role_based":
      return ["trust_approver"];
    case "dual_approval":
    case "single_approver":
      return ["trust_approver", "trust_manager"];
    default:
      return [];
  }
}

export function createTrustApprovalFixture(): {
  readonly repository: InMemoryTrustApprovalRepository;
  readonly approvalService: TrustApprovalService;
  readonly eventBus: InMemoryTrustApprovalEventBus;
} {
  const repository = new InMemoryTrustApprovalRepositoryClass();
  const eventBus = new InMemoryTrustApprovalEventBus();
  const approvalService = new TrustApprovalService({ repository, eventBus });

  return { repository, approvalService, eventBus };
}
