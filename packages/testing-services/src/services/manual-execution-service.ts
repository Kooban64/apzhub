import type {
  ExecutionComment,
  ManualExecution,
  ManualExecutionService,
  ManualStepActual,
  TestResultStatus,
} from "@apzhub/testing-contracts";
import {
  asEvidenceId,
  asExecutionSessionId,
  asManualExecutionId,
  asTestCaseId,
  asTestStepId,
  canonicalizeExecutionStatus,
  type EvidenceId,
  type ExecutionApprovalState,
  type ExecutionStatus,
  type ManualExecutionId,
  type TestStepId,
} from "@apzhub/testing-contracts";
import type {
  ManualExecutionRecord,
  ManualStepActualRecord,
} from "@apzhub/testing-persistence";

import {
  assertExecutionStatusTransition,
  DomainRuleError,
  nextStatusAfterCancel,
} from "../lifecycle/state-machines";
import { toRepositoryContext } from "../mapping/context";
import {
  assertNonEmpty,
  assertValidExecutionApprovalState,
  assertValidTestResultStatus,
} from "../validation/domain-validation";
import { requireFound } from "./errors";
import type { ServiceRuntime } from "./types";

function toStepDomain(s: ManualStepActualRecord): ManualStepActual {
  return {
    stepId: asTestStepId(s.stepId),
    actualResult: s.actualResult,
    status: s.status,
    evidenceIds: s.evidenceIds?.map((id) => asEvidenceId(id)),
    notes: s.notes,
    comment: s.comment,
    comments: s.comments,
    recordedAt: s.recordedAt,
    expectedSnapshot: s.expectedSnapshot,
    expectedResult: s.expectedResult,
    recordedByUserId: s.recordedByUserId,
    parentStepId: s.parentStepId ? asTestStepId(s.parentStepId) : undefined,
    nestLevel: s.nestLevel,
    repeatIndex: s.repeatIndex,
    parameters: s.parameters,
    attachmentIds: s.attachmentIds,
    ordinal: s.ordinal,
  };
}

function toStepRecord(s: ManualStepActual): ManualStepActualRecord {
  return {
    stepId: s.stepId,
    actualResult: s.actualResult,
    status: s.status,
    evidenceIds: s.evidenceIds as readonly string[] | undefined,
    notes: s.notes,
    comment: s.comment ?? s.comments,
    comments: s.comments ?? s.comment,
    recordedAt: s.recordedAt,
    expectedSnapshot: s.expectedSnapshot,
    expectedResult: s.expectedResult,
    recordedByUserId: s.recordedByUserId,
    parentStepId: s.parentStepId,
    nestLevel: s.nestLevel,
    repeatIndex: s.repeatIndex,
    parameters: s.parameters,
    attachmentIds: s.attachmentIds,
    ordinal: s.ordinal,
  };
}

function toDomain(row: ManualExecutionRecord): ManualExecution {
  return {
    id: asManualExecutionId(row.id),
    tenantId: row.tenantId,
    sessionId: asExecutionSessionId(row.sessionId),
    caseId: asTestCaseId(row.caseId),
    status: row.status,
    assigneeId: row.assigneeId,
    testerId: row.testerId,
    reviewerId: row.reviewerId,
    startedAt: row.startedAt,
    pausedAt: row.pausedAt,
    resumedAt: row.resumedAt,
    completedAt: row.completedAt,
    approvalState: row.approvalState,
    comments: row.comments,
    stepActuals: row.stepActuals.map(toStepDomain),
    overallResult: row.overallResult,
    restartOfId: row.restartOfId ? asManualExecutionId(row.restartOfId) : undefined,
    parameterOverrides: row.parameterOverrides,
    blockReason: row.blockReason,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    archivedAt: row.archivedAt,
  };
}

function substituteTemplate(
  text: string | undefined,
  params: Readonly<Record<string, string>>,
): string | undefined {
  if (!text) return text;
  return text.replace(
    /\$\{([^}]+)\}/g,
    (_, key: string) => params[key] ?? `\${${key}}`,
  );
}

export function computeOverallResultFromSteps(
  steps: readonly ManualStepActualRecord[],
): TestResultStatus | undefined {
  if (steps.length === 0) return undefined;
  const statuses = steps.map((s) => s.status).filter(Boolean) as TestResultStatus[];
  if (statuses.length === 0) return "not_executed";
  if (statuses.some((s) => s === "fail")) return "fail";
  if (statuses.some((s) => s === "blocked")) return "blocked";
  if (statuses.every((s) => s === "pass" || s === "skipped")) {
    if (statuses.some((s) => s === "pass")) return "pass";
    return "skipped";
  }
  if (statuses.some((s) => s === "not_executed" || s === "retest"))
    return "not_executed";
  return "not_executed";
}

export function createManualExecutionService(
  rt: ServiceRuntime,
): ManualExecutionService {
  async function appendHistory(
    ctx: Parameters<ManualExecutionService["get"]>[0],
    exec: ManualExecutionRecord,
    eventType: string,
    summary: string,
    details: Record<string, unknown> = {},
  ): Promise<void> {
    await rt.persistence.executionHistory.append(toRepositoryContext(ctx), {
      id: rt.id(),
      tenantId: ctx.tenantId,
      organisationId: ctx.organisationId,
      sessionId: exec.sessionId,
      eventType,
      actorUserId: ctx.userId,
      correlationId: ctx.correlationId,
      summary,
      details: { executionId: exec.id, ...details },
    });
  }

  async function transition(
    ctx: Parameters<ManualExecutionService["get"]>[0],
    id: ManualExecutionId,
    nextStatus: ExecutionStatus,
    patch: Partial<ManualExecutionRecord> = {},
    eventType?: string,
    summary?: string,
  ): Promise<ManualExecution> {
    const rctx = toRepositoryContext(ctx);
    const existing = requireFound(
      await rt.persistence.manualExecutions.get(rctx, id),
      "manual_execution",
      id,
    );
    if (nextStatus !== existing.status) {
      assertExecutionStatusTransition(existing.status, nextStatus);
    }
    const row = await rt.persistence.manualExecutions.update(
      rctx,
      id,
      existing.revision,
      { ...patch, status: nextStatus },
    );
    const evt = eventType ?? `manual_execution.${nextStatus}`;
    await appendHistory(ctx, row, evt, summary ?? `Execution ${id} → ${nextStatus}`, {
      from: existing.status,
      to: nextStatus,
    });
    rt.events.record({
      eventType: evt as never,
      tenantId: ctx.tenantId,
      correlationId: ctx.correlationId,
      actorUserId: ctx.userId,
      payload: {
        manualExecutionId: id,
        caseId: row.caseId,
        status: nextStatus,
      },
    });
    return toDomain(row);
  }

  const service: ManualExecutionService = {
    async list(ctx) {
      const page = await rt.persistence.manualExecutions.list(toRepositoryContext(ctx));
      return page.items.map(toDomain);
    },
    async get(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.manualExecutions.get(toRepositoryContext(ctx), id),
          "manual_execution",
          id,
        ),
      );
    },
    async create(ctx, input) {
      assertNonEmpty(input.sessionId, "sessionId");
      assertNonEmpty(input.caseId, "caseId");
      const status: ExecutionStatus = input.status ?? "draft";
      const row = await rt.persistence.manualExecutions.create(
        toRepositoryContext(ctx),
        {
          sessionId: input.sessionId,
          caseId: input.caseId,
          status,
          assigneeId: input.assigneeId,
          testerId: input.testerId,
          reviewerId: input.reviewerId,
          approvalState: input.approvalState ?? "none",
          comments: [],
          stepActuals: (input.stepActuals ?? []).map(toStepRecord),
          overallResult: input.overallResult,
          restartOfId: input.restartOfId,
          parameterOverrides: input.parameterOverrides,
          organisationId: ctx.organisationId,
        },
      );
      await appendHistory(ctx, row, "manual_execution.created", "Execution created", {
        status: row.status,
      });
      rt.events.record({
        eventType: "manual_execution.created",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          manualExecutionId: row.id,
          caseId: row.caseId,
          status: row.status,
        },
      });
      return toDomain(row);
    },
    async assignTester(ctx, id, testerId: string) {
      assertNonEmpty(testerId, "testerId");
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.manualExecutions.get(rctx, id),
        "manual_execution",
        id,
      );
      const canon = canonicalizeExecutionStatus(existing.status);
      const nextStatus: ExecutionStatus =
        canon === "draft" ? "assigned" : existing.status;
      if (nextStatus !== existing.status) {
        assertExecutionStatusTransition(existing.status, nextStatus);
      }
      const row = await rt.persistence.manualExecutions.update(
        rctx,
        id,
        existing.revision,
        {
          testerId,
          assigneeId: testerId,
          status: nextStatus,
        },
      );
      await appendHistory(ctx, row, "manual_execution.assigned", "Tester assigned", {
        testerId,
      });
      rt.events.record({
        eventType: "manual_execution.assigned",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { manualExecutionId: id, assigneeId: testerId },
      });
      return toDomain(row);
    },
    async assignReviewer(ctx, id, reviewerId: string) {
      assertNonEmpty(reviewerId, "reviewerId");
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.manualExecutions.get(rctx, id),
        "manual_execution",
        id,
      );
      const row = await rt.persistence.manualExecutions.update(
        rctx,
        id,
        existing.revision,
        { reviewerId },
      );
      await appendHistory(ctx, row, "manual_execution.assigned", "Reviewer assigned", {
        reviewerId,
      });
      return toDomain(row);
    },
    async assign(ctx, id, assigneeId: string) {
      return this.assignTester(ctx, id, assigneeId);
    },
    async handover(ctx, id, toUserId: string) {
      assertNonEmpty(toUserId, "toUserId");
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.manualExecutions.get(rctx, id),
        "manual_execution",
        id,
      );
      const row = await rt.persistence.manualExecutions.update(
        rctx,
        id,
        existing.revision,
        { assigneeId: toUserId, testerId: toUserId },
      );
      await appendHistory(ctx, row, "manual_execution.assigned", "Handover", {
        toUserId,
      });
      return toDomain(row);
    },
    async setReviewer(ctx, id, reviewerId: string) {
      return this.assignReviewer(ctx, id, reviewerId);
    },
    async start(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.manualExecutions.get(rctx, id),
        "manual_execution",
        id,
      );
      const canon = canonicalizeExecutionStatus(existing.status);
      let current = existing;
      if (canon === "draft") {
        if (!existing.testerId && !existing.assigneeId) {
          current = await rt.persistence.manualExecutions.update(
            rctx,
            id,
            current.revision,
            {
              status: "assigned",
              testerId: ctx.userId,
              assigneeId: ctx.userId,
            },
          );
          await appendHistory(
            ctx,
            current,
            "manual_execution.assigned",
            "Auto-assigned on start",
          );
        } else {
          current = await rt.persistence.manualExecutions.update(
            rctx,
            id,
            current.revision,
            { status: "assigned" },
          );
        }
      }
      const afterAssign = canonicalizeExecutionStatus(current.status);
      if (afterAssign === "assigned") {
        assertExecutionStatusTransition(current.status, "ready");
        current = await rt.persistence.manualExecutions.update(
          rctx,
          id,
          current.revision,
          { status: "ready" },
        );
      }
      assertExecutionStatusTransition(current.status, "in_progress");
      const now = rt.now();
      const row = await rt.persistence.manualExecutions.update(
        rctx,
        id,
        current.revision,
        {
          status: "in_progress",
          startedAt: current.startedAt ?? now,
          testerId: current.testerId ?? ctx.userId,
          assigneeId: current.assigneeId ?? ctx.userId,
        },
      );
      await appendHistory(ctx, row, "manual_execution.started", "Execution started");
      rt.events.record({
        eventType: "manual_execution.started",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          manualExecutionId: row.id,
          caseId: row.caseId,
          status: row.status,
        },
      });
      return toDomain(row);
    },
    async pause(ctx, id) {
      return transition(
        ctx,
        id,
        "paused",
        { pausedAt: rt.now() },
        "manual_execution.paused",
      );
    },
    async resume(ctx, id) {
      return transition(
        ctx,
        id,
        "in_progress",
        { resumedAt: rt.now() },
        "manual_execution.resumed",
      );
    },
    async complete(ctx, id, overallResult) {
      if (overallResult) assertValidTestResultStatus(overallResult);
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.manualExecutions.get(rctx, id),
        "manual_execution",
        id,
      );
      const computed =
        overallResult ?? computeOverallResultFromSteps(existing.stepActuals);
      return transition(
        ctx,
        id,
        "completed",
        { completedAt: rt.now(), overallResult: computed },
        "manual_execution.completed",
      );
    },
    async cancel(ctx, id, reason) {
      const current = await this.get(ctx, id);
      const next = nextStatusAfterCancel(current.status);
      return transition(
        ctx,
        id,
        next,
        { completedAt: rt.now(), blockReason: reason },
        "manual_execution.cancelled",
        reason ?? "Execution cancelled",
      );
    },
    async restart(ctx, id) {
      const source = await this.get(ctx, id);
      const created = await this.create(ctx, {
        tenantId: source.tenantId,
        sessionId: source.sessionId,
        caseId: source.caseId,
        assigneeId: source.assigneeId,
        testerId: source.testerId,
        reviewerId: source.reviewerId,
        approvalState: "none",
        restartOfId: source.id,
        parameterOverrides: source.parameterOverrides,
        stepActuals: source.stepActuals.map((s) => ({
          stepId: s.stepId,
          status: "not_executed" as const,
          expectedSnapshot: s.expectedSnapshot,
          expectedResult: s.expectedResult,
          parentStepId: s.parentStepId,
          nestLevel: s.nestLevel,
          ordinal: s.ordinal,
          parameters: s.parameters,
        })),
      });
      const started = await this.start(ctx, created.id);
      rt.events.record({
        eventType: "manual_execution.restarted",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          manualExecutionId: started.id,
          sourceId: source.id,
        },
      });
      return started;
    },
    async submitForReview(ctx, id) {
      return transition(
        ctx,
        id,
        "under_review",
        { approvalState: "pending_review" },
        "manual_execution.submitted_for_review",
      );
    },
    async approve(ctx, id, comments) {
      if (comments) await this.addComment(ctx, id, comments);
      return transition(
        ctx,
        id,
        "approved",
        { approvalState: "approved" },
        "manual_execution.approved",
      );
    },
    async reject(ctx, id, comments: string) {
      assertNonEmpty(comments, "comments");
      await this.addComment(ctx, id, comments);
      return transition(
        ctx,
        id,
        "rejected",
        { approvalState: "rejected" },
        "manual_execution.rejected",
      );
    },
    async reopen(ctx, id) {
      const current = await this.get(ctx, id);
      const canon = canonicalizeExecutionStatus(current.status);
      let target: ExecutionStatus;
      if (canon === "cancelled") target = "draft";
      else if (canon === "approved") target = "under_review";
      else if (
        canon === "rejected" ||
        canon === "completed" ||
        canon === "under_review"
      ) {
        target = "in_progress";
      } else {
        throw new DomainRuleError(
          "invalid_execution_transition",
          `Cannot reopen execution in status ${current.status}`,
        );
      }
      return transition(
        ctx,
        id,
        target,
        {
          approvalState: "none",
          completedAt: undefined,
        },
        "manual_execution.reopened",
      );
    },
    async archive(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.manualExecutions.get(rctx, id),
        "manual_execution",
        id,
      );
      const canon = canonicalizeExecutionStatus(existing.status);
      if (canon !== "archived") {
        assertExecutionStatusTransition(existing.status, "archived");
        await rt.persistence.manualExecutions.update(rctx, id, existing.revision, {
          status: "archived",
        });
      }
      const refreshed = requireFound(
        await rt.persistence.manualExecutions.get(rctx, id),
        "manual_execution",
        id,
      );
      const archived = await rt.persistence.manualExecutions.archive(
        rctx,
        id,
        refreshed.revision,
      );
      await appendHistory(
        ctx,
        archived,
        "manual_execution.archived",
        "Execution archived",
      );
      rt.events.record({
        eventType: "manual_execution.archived",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { manualExecutionId: id, status: "archived" },
      });
      return toDomain(archived);
    },
    async restore(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.manualExecutions.get(rctx, id),
        "manual_execution",
        id,
      );
      let row = existing;
      if (existing.archivedAt) {
        row = await rt.persistence.manualExecutions.restore(
          rctx,
          id,
          existing.revision,
        );
      }
      if (canonicalizeExecutionStatus(row.status) === "archived") {
        // Restore is the only escape from terminal archived status.
        row = await rt.persistence.manualExecutions.update(rctx, id, row.revision, {
          status: "draft",
        });
      }
      await appendHistory(ctx, row, "manual_execution.restored", "Execution restored");
      rt.events.record({
        eventType: "manual_execution.restored",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { manualExecutionId: id, status: row.status },
      });
      return toDomain(row);
    },
    async block(ctx, id, reason) {
      return transition(
        ctx,
        id,
        "blocked",
        { blockReason: reason },
        "manual_execution.blocked",
        reason ?? "Execution blocked",
      );
    },
    async unblock(ctx, id) {
      return transition(
        ctx,
        id,
        "in_progress",
        { blockReason: undefined },
        "manual_execution.unblocked",
      );
    },
    async setApprovalState(ctx, id, approvalState: ExecutionApprovalState) {
      assertValidExecutionApprovalState(approvalState);
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.manualExecutions.get(rctx, id),
        "manual_execution",
        id,
      );
      const row = await rt.persistence.manualExecutions.update(
        rctx,
        id,
        existing.revision,
        { approvalState },
      );
      return toDomain(row);
    },
    async recordStepActual(ctx, id, stepId: TestStepId, actual) {
      if (actual.status) assertValidTestResultStatus(actual.status);
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.manualExecutions.get(rctx, id),
        "manual_execution",
        id,
      );
      const canon = canonicalizeExecutionStatus(existing.status);
      if (canon !== "in_progress" && canon !== "paused") {
        throw new DomainRuleError(
          "invalid_execution_transition",
          "Step results can only be recorded while in_progress or paused",
        );
      }
      const now = rt.now();
      const params = {
        ...(existing.parameterOverrides ?? {}),
        ...(actual.parameters ?? {}),
      };
      const others = existing.stepActuals.filter((s) => s.stepId !== stepId);
      const prev = existing.stepActuals.find((s) => s.stepId === stepId);
      const next: ManualStepActual = {
        stepId,
        actualResult: substituteTemplate(
          actual.actualResult ?? prev?.actualResult,
          params,
        ),
        status: actual.status ?? prev?.status,
        evidenceIds: actual.evidenceIds ?? (prev?.evidenceIds as never),
        notes: actual.notes ?? prev?.notes,
        comment: actual.comment ?? prev?.comment,
        comments: actual.comments ?? prev?.comments,
        expectedResult: substituteTemplate(
          actual.expectedResult ?? prev?.expectedResult,
          params,
        ),
        expectedSnapshot: substituteTemplate(
          actual.expectedSnapshot ?? prev?.expectedSnapshot,
          params,
        ),
        recordedAt: actual.recordedAt ?? now,
        recordedByUserId: actual.recordedByUserId ?? ctx.userId,
        parentStepId:
          actual.parentStepId ??
          (prev?.parentStepId ? asTestStepId(prev.parentStepId) : undefined),
        nestLevel: actual.nestLevel ?? prev?.nestLevel,
        repeatIndex: actual.repeatIndex ?? prev?.repeatIndex,
        parameters: Object.keys(params).length > 0 ? params : actual.parameters,
        attachmentIds: actual.attachmentIds ?? prev?.attachmentIds,
        ordinal: actual.ordinal ?? prev?.ordinal,
      };
      const stepActuals = [...others, toStepRecord(next)].sort(
        (a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0),
      );
      const row = await rt.persistence.manualExecutions.update(
        rctx,
        id,
        existing.revision,
        {
          stepActuals,
          overallResult: computeOverallResultFromSteps(stepActuals),
        },
      );
      await appendHistory(ctx, row, "manual_execution.step_recorded", "Step recorded", {
        stepId,
      });
      rt.events.record({
        eventType: "manual_execution.step_recorded",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { manualExecutionId: id, stepId },
      });
      return toDomain(row);
    },
    async setStepStatus(ctx, id, stepId, status: TestResultStatus) {
      return this.recordStepActual(ctx, id, stepId, { status });
    },
    async reorderSteps(ctx, id, orderedStepIds) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.manualExecutions.get(rctx, id),
        "manual_execution",
        id,
      );
      const byId = new Map(existing.stepActuals.map((s) => [s.stepId, s]));
      const reordered: ManualStepActualRecord[] = [];
      orderedStepIds.forEach((stepId, index) => {
        const step = byId.get(stepId);
        if (step) {
          reordered.push({ ...step, ordinal: index });
          byId.delete(stepId);
        }
      });
      for (const leftover of byId.values()) {
        reordered.push({ ...leftover, ordinal: reordered.length });
      }
      const row = await rt.persistence.manualExecutions.update(
        rctx,
        id,
        existing.revision,
        { stepActuals: reordered },
      );
      return toDomain(row);
    },
    async substituteParameters(ctx, id, parameters) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.manualExecutions.get(rctx, id),
        "manual_execution",
        id,
      );
      const merged = { ...(existing.parameterOverrides ?? {}), ...parameters };
      const stepActuals = existing.stepActuals.map((s) => ({
        ...s,
        expectedResult: substituteTemplate(s.expectedResult, merged),
        expectedSnapshot: substituteTemplate(s.expectedSnapshot, merged),
        actualResult: substituteTemplate(s.actualResult, merged),
        parameters: { ...(s.parameters ?? {}), ...merged },
      }));
      const row = await rt.persistence.manualExecutions.update(
        rctx,
        id,
        existing.revision,
        { parameterOverrides: merged, stepActuals },
      );
      return toDomain(row);
    },
    async attachStepEvidence(ctx, id, stepId, evidenceId: EvidenceId) {
      const current = await this.get(ctx, id);
      const existing = current.stepActuals.find((s) => s.stepId === stepId);
      const evidenceIds = [...new Set([...(existing?.evidenceIds ?? []), evidenceId])];
      return this.recordStepActual(ctx, id, stepId, {
        ...existing,
        evidenceIds,
      });
    },
    async validateSteps(ctx, id) {
      const exec = await this.get(ctx, id);
      const issues: string[] = [];
      for (const step of exec.stepActuals) {
        if (!step.status || step.status === "not_executed") {
          issues.push(`step:${step.stepId}:not_executed`);
        }
        if (step.status === "fail" && !step.actualResult && !step.comment) {
          issues.push(`step:${step.stepId}:missing_actual`);
        }
      }
      const overallResult = computeOverallResultFromSteps(
        exec.stepActuals.map(toStepRecord),
      );
      return { valid: issues.length === 0, issues, overallResult };
    },
    async addComment(ctx, id, body: string) {
      assertNonEmpty(body, "body");
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.manualExecutions.get(rctx, id),
        "manual_execution",
        id,
      );
      const comment: ExecutionComment = {
        id: rt.id(),
        authorUserId: ctx.userId,
        body,
        createdAt: rt.now(),
      };
      const row = await rt.persistence.manualExecutions.update(
        rctx,
        id,
        existing.revision,
        { comments: [...existing.comments, comment] },
      );
      return toDomain(row);
    },
    async listComments(ctx, id) {
      const exec = await this.get(ctx, id);
      return exec.comments ?? [];
    },
    async getStatus(ctx, id): Promise<ExecutionStatus> {
      return (await this.get(ctx, id)).status;
    },
  };

  return service;
}
