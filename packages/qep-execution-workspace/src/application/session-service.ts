/**
 * Execution Session Application Service — APZQEP-140-C.
 * Performs execution; does not redesign Cap B planning.
 * Completed results are immutable except via governed amendment.
 */

import { assertTransition, isImmutable } from "../domain/lifecycle";
import type {
  EvidenceReference,
  ExecutionSessionAggregate,
  ExecutionSessionHistoryEntry,
  ExecutionSessionNode,
  ExecutionSessionState,
  ResultAmendment,
  StepOutcome,
  StepResult,
} from "../domain/types";
import { computeProgress, defaultStepsFromPlan } from "../domain/types";
import {
  buildExecutionSessionDomainEvent,
  QEP_EXECUTION_SESSION_EVENTS,
  type ExecutionSessionDomainEvent,
  type QepExecutionSessionEventId,
} from "./events";
import { toPlanningSnapshot, type PlanHandoffPort } from "./plan-port";
import type {
  ExecutionSessionListFilter,
  ExecutionSessionRepository,
} from "./repository";

export type SessionActor = {
  readonly userId: string;
  readonly tenantId: string;
  readonly permissions: readonly string[];
};

export type SessionEventPublisher = {
  publish(event: ExecutionSessionDomainEvent): Promise<void>;
};

function requirePermission(actor: SessionActor, permission: string): void {
  if (
    !actor.permissions.includes(permission) &&
    !actor.permissions.includes("qep.execution_workspace.admin")
  ) {
    throw new Error(`execution_session.permission.denied:${permission}`);
  }
}

function history(
  actorId: string,
  at: string,
  action: string,
  from?: ExecutionSessionState,
  to?: ExecutionSessionState,
  detail?: string,
): ExecutionSessionHistoryEntry {
  return {
    at,
    actorId,
    action,
    ...(from ? { fromStatus: from } : {}),
    ...(to ? { toStatus: to } : {}),
    ...(detail ? { detail } : {}),
  };
}

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

export type ExecutionSessionApplicationService = {
  createFromHandoff(
    actor: SessionActor,
    handoffId: string,
    now: string,
  ): Promise<ExecutionSessionNode>;
  open(
    actor: SessionActor,
    sessionId: string,
    now: string,
  ): Promise<ExecutionSessionNode>;
  pause(
    actor: SessionActor,
    sessionId: string,
    now: string,
  ): Promise<ExecutionSessionNode>;
  resume(
    actor: SessionActor,
    sessionId: string,
    now: string,
  ): Promise<ExecutionSessionNode>;
  block(
    actor: SessionActor,
    sessionId: string,
    now: string,
    reason?: string,
  ): Promise<ExecutionSessionNode>;
  complete(
    actor: SessionActor,
    sessionId: string,
    now: string,
  ): Promise<ExecutionSessionNode>;
  cancel(
    actor: SessionActor,
    sessionId: string,
    now: string,
    reason?: string,
  ): Promise<ExecutionSessionNode>;
  archive(
    actor: SessionActor,
    sessionId: string,
    now: string,
  ): Promise<ExecutionSessionNode>;
  recordStepResult(
    actor: SessionActor,
    sessionId: string,
    input: {
      readonly stepId: string;
      readonly outcome: StepOutcome;
      readonly comment?: string;
      readonly failureNotes?: string;
      readonly durationMs?: number;
    },
    now: string,
  ): Promise<ExecutionSessionNode>;
  amendStepResult(
    actor: SessionActor,
    sessionId: string,
    input: {
      readonly stepId: string;
      readonly outcome: StepOutcome;
      readonly reason: string;
      readonly comment?: string;
    },
    now: string,
  ): Promise<ExecutionSessionNode>;
  attachEvidence(
    actor: SessionActor,
    sessionId: string,
    input: {
      readonly evidenceId: string;
      readonly stepId?: string;
      readonly note?: string;
    },
    now: string,
  ): Promise<ExecutionSessionNode>;
  get(actor: SessionActor, sessionId: string): Promise<ExecutionSessionAggregate>;
  list(
    actor: SessionActor,
    filter: Omit<ExecutionSessionListFilter, "tenantId">,
  ): Promise<readonly ExecutionSessionNode[]>;
  history(
    actor: SessionActor,
    sessionId: string,
  ): Promise<readonly ExecutionSessionHistoryEntry[]>;
  drainEvents(): readonly ExecutionSessionDomainEvent[];
};

export function createExecutionSessionApplicationService(deps: {
  readonly repository: ExecutionSessionRepository;
  readonly plans: PlanHandoffPort;
  readonly publisher?: SessionEventPublisher;
}): ExecutionSessionApplicationService {
  const pending: ExecutionSessionDomainEvent[] = [];

  async function emit(
    eventId: QepExecutionSessionEventId,
    session: ExecutionSessionNode,
    actorId: string,
    now: string,
    extra?: Readonly<Record<string, unknown>>,
  ): Promise<void> {
    const event = buildExecutionSessionDomainEvent({
      eventId,
      session,
      actorId,
      correlationId:
        session.planning.correlationId ||
        `corr-${session.sessionId}-${session.revision}`,
      timestamp: now,
      ...(extra ? { extra } : {}),
    });
    pending.push(event);
    await deps.publisher?.publish(event);
  }

  async function load(
    tenantId: string,
    sessionId: string,
  ): Promise<ExecutionSessionAggregate> {
    const agg = await deps.repository.get(tenantId, sessionId);
    if (!agg) throw new Error(`execution_session.not_found:${sessionId}`);
    return agg;
  }

  async function transitionTo(
    actor: SessionActor,
    sessionId: string,
    to: ExecutionSessionState,
    now: string,
    detail?: string,
  ): Promise<ExecutionSessionNode> {
    requirePermission(actor, "qep.execution_workspace.lifecycle");
    const agg = await load(actor.tenantId, sessionId);
    const from = agg.session.status;
    assertTransition(from, to);

    const next: ExecutionSessionNode = {
      ...agg.session,
      status: to,
      updatedAt: now,
      updatedBy: actor.userId,
      revision: agg.session.revision + 1,
      ...(to === "in_progress" && !agg.session.startedAt ? { startedAt: now } : {}),
      ...(to === "paused" ? { pausedAt: now } : {}),
      ...(to === "completed" ? { completedAt: now } : {}),
      ...(to === "cancelled" ? { cancelledAt: now } : {}),
      ...(to === "archived" ? { archivedAt: now } : {}),
    };

    await deps.repository.save({
      session: next,
      history: [
        ...agg.history,
        history(actor.userId, now, "lifecycle", from, to, detail),
      ],
    });

    let eventId: QepExecutionSessionEventId =
      QEP_EXECUTION_SESSION_EVENTS.progressUpdated;
    if (to === "in_progress" && from === "not_started") {
      eventId = QEP_EXECUTION_SESSION_EVENTS.started;
    } else if (to === "in_progress") {
      eventId = QEP_EXECUTION_SESSION_EVENTS.resumed;
    } else if (to === "paused") {
      eventId = QEP_EXECUTION_SESSION_EVENTS.paused;
    } else if (to === "blocked") {
      eventId = QEP_EXECUTION_SESSION_EVENTS.blocked;
    } else if (to === "completed") {
      eventId = QEP_EXECUTION_SESSION_EVENTS.completed;
    } else if (to === "cancelled") {
      eventId = QEP_EXECUTION_SESSION_EVENTS.cancelled;
    } else if (to === "archived") {
      eventId = QEP_EXECUTION_SESSION_EVENTS.archived;
    }

    await emit(eventId, next, actor.userId, now, {
      fromStatus: from,
      toStatus: to,
    });
    return next;
  }

  return {
    drainEvents() {
      return [...pending];
    },

    async createFromHandoff(actor, handoffId, now) {
      requirePermission(actor, "qep.execution_workspace.create");
      const existing = await deps.repository.findByHandoff(actor.tenantId, handoffId);
      if (existing) {
        // Idempotent — one session per handoff
        return existing.session;
      }

      const lookup = await deps.plans.getByHandoff(actor.tenantId, handoffId);
      if (!lookup) {
        throw new Error(`execution_session.handoff.not_found:${handoffId}`);
      }
      if (lookup.tenantId !== actor.tenantId) {
        throw new Error("execution_session.handoff.cross_tenant");
      }
      if (lookup.status !== "handed_off") {
        throw new Error(`execution_session.handoff.not_ready:${lookup.status}`);
      }

      const planning = toPlanningSnapshot(lookup);
      const steps = defaultStepsFromPlan(planning.planName);
      const sessionId = nextId("exs");
      const session: ExecutionSessionNode = {
        sessionId,
        tenantId: actor.tenantId,
        ...(planning.projectId ? { projectId: planning.projectId } : {}),
        name: `${planning.planName} — Execution`,
        ownerId: actor.userId,
        assigneeIds: [...planning.assigneeIds],
        status: "not_started",
        planning,
        steps,
        evidenceRefs: [],
        amendments: [],
        progress: computeProgress(steps),
        createdAt: now,
        createdBy: actor.userId,
        updatedAt: now,
        updatedBy: actor.userId,
        revision: 1,
        customMetadata: {},
      };

      await deps.repository.save({
        session,
        history: [
          history(
            actor.userId,
            now,
            "created_from_handoff",
            undefined,
            "not_started",
            handoffId,
          ),
        ],
      });
      await emit(QEP_EXECUTION_SESSION_EVENTS.created, session, actor.userId, now);
      return session;
    },

    async open(actor, sessionId, now) {
      return transitionTo(actor, sessionId, "in_progress", now);
    },

    async pause(actor, sessionId, now) {
      return transitionTo(actor, sessionId, "paused", now);
    },

    async resume(actor, sessionId, now) {
      return transitionTo(actor, sessionId, "in_progress", now);
    },

    async block(actor, sessionId, now, reason) {
      return transitionTo(actor, sessionId, "blocked", now, reason);
    },

    async complete(actor, sessionId, now) {
      return transitionTo(actor, sessionId, "completed", now);
    },

    async cancel(actor, sessionId, now, reason) {
      return transitionTo(actor, sessionId, "cancelled", now, reason);
    },

    async archive(actor, sessionId, now) {
      return transitionTo(actor, sessionId, "archived", now);
    },

    async recordStepResult(actor, sessionId, input, now) {
      requirePermission(actor, "qep.execution_workspace.execute");
      const agg = await load(actor.tenantId, sessionId);
      if (isImmutable(agg.session.status)) {
        throw new Error("execution_session.result.immutable_use_amendment");
      }
      if (agg.session.status !== "in_progress" && agg.session.status !== "blocked") {
        throw new Error(
          `execution_session.result.requires_active:${agg.session.status}`,
        );
      }

      const idx = agg.session.steps.findIndex((s) => s.stepId === input.stepId);
      if (idx < 0) {
        throw new Error(`execution_session.step.not_found:${input.stepId}`);
      }

      const prev = agg.session.steps[idx]!;
      const updated: StepResult = {
        ...prev,
        outcome: input.outcome,
        ...(input.comment !== undefined ? { comment: input.comment } : {}),
        ...(input.failureNotes !== undefined
          ? { failureNotes: input.failureNotes }
          : {}),
        ...(input.durationMs !== undefined ? { durationMs: input.durationMs } : {}),
        executedBy: actor.userId,
        executedAt: now,
        resultRevision: prev.resultRevision + 1,
      };
      const steps = [...agg.session.steps];
      steps[idx] = updated;
      const progress = computeProgress(steps);

      let status = agg.session.status;
      if (input.outcome === "block" && status === "in_progress") {
        status = "blocked";
      } else if (input.outcome !== "block" && status === "blocked") {
        status = "in_progress";
      }

      const next: ExecutionSessionNode = {
        ...agg.session,
        steps,
        progress,
        status,
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.session.revision + 1,
      };

      await deps.repository.save({
        session: next,
        history: [
          ...agg.history,
          history(
            actor.userId,
            now,
            "result_recorded",
            agg.session.status,
            status,
            `${input.stepId}:${input.outcome}`,
          ),
        ],
      });
      await emit(QEP_EXECUTION_SESSION_EVENTS.resultRecorded, next, actor.userId, now, {
        stepId: input.stepId,
        outcome: input.outcome,
      });
      await emit(QEP_EXECUTION_SESSION_EVENTS.progressUpdated, next, actor.userId, now);
      return next;
    },

    async amendStepResult(actor, sessionId, input, now) {
      requirePermission(actor, "qep.execution_workspace.amend");
      const agg = await load(actor.tenantId, sessionId);
      if (agg.session.status !== "completed") {
        throw new Error("execution_session.amend.requires_completed");
      }
      if (!input.reason.trim()) {
        throw new Error("execution_session.amend.reason_required");
      }

      const idx = agg.session.steps.findIndex((s) => s.stepId === input.stepId);
      if (idx < 0) {
        throw new Error(`execution_session.step.not_found:${input.stepId}`);
      }
      const prev = agg.session.steps[idx]!;
      const amendment: ResultAmendment = {
        amendmentId: nextId("amd"),
        at: now,
        actorId: actor.userId,
        stepId: input.stepId,
        previousOutcome: prev.outcome,
        newOutcome: input.outcome,
        reason: input.reason.trim(),
      };
      const updated: StepResult = {
        ...prev,
        outcome: input.outcome,
        ...(input.comment !== undefined ? { comment: input.comment } : {}),
        resultRevision: prev.resultRevision + 1,
        executedBy: actor.userId,
        executedAt: now,
      };
      const steps = [...agg.session.steps];
      steps[idx] = updated;
      const next: ExecutionSessionNode = {
        ...agg.session,
        steps,
        progress: computeProgress(steps),
        amendments: [...agg.session.amendments, amendment],
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.session.revision + 1,
      };
      await deps.repository.save({
        session: next,
        history: [
          ...agg.history,
          history(
            actor.userId,
            now,
            "amended",
            "completed",
            "completed",
            amendment.amendmentId,
          ),
        ],
      });
      await emit(QEP_EXECUTION_SESSION_EVENTS.amended, next, actor.userId, now, {
        amendmentId: amendment.amendmentId,
        stepId: input.stepId,
      });
      return next;
    },

    async attachEvidence(actor, sessionId, input, now) {
      requirePermission(actor, "qep.execution_workspace.execute");
      const agg = await load(actor.tenantId, sessionId);
      if (agg.session.status === "archived" || agg.session.status === "cancelled") {
        throw new Error(`execution_session.evidence.locked:${agg.session.status}`);
      }
      if (!input.evidenceId.trim()) {
        throw new Error("execution_session.evidence.id_required");
      }

      const ref: EvidenceReference = {
        evidenceId: input.evidenceId.trim(),
        attachedAt: now,
        attachedBy: actor.userId,
        ...(input.stepId ? { stepId: input.stepId } : {}),
        ...(input.note ? { note: input.note } : {}),
      };

      let steps = agg.session.steps;
      if (input.stepId) {
        const idx = steps.findIndex((s) => s.stepId === input.stepId);
        if (idx < 0) {
          throw new Error(`execution_session.step.not_found:${input.stepId}`);
        }
        if (isImmutable(agg.session.status)) {
          // Allow evidence attach on completed as reference-only (does not mutate outcomes)
        } else {
          const step = steps[idx]!;
          const nextStep: StepResult = {
            ...step,
            evidenceIds: [...new Set([...step.evidenceIds, ref.evidenceId])],
          };
          steps = [...steps];
          steps[idx] = nextStep;
        }
      }

      const next: ExecutionSessionNode = {
        ...agg.session,
        steps,
        evidenceRefs: [...agg.session.evidenceRefs, ref],
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.session.revision + 1,
      };
      await deps.repository.save({
        session: next,
        history: [
          ...agg.history,
          history(
            actor.userId,
            now,
            "evidence_attached",
            agg.session.status,
            agg.session.status,
            ref.evidenceId,
          ),
        ],
      });
      await emit(
        QEP_EXECUTION_SESSION_EVENTS.evidenceAttached,
        next,
        actor.userId,
        now,
        { evidenceId: ref.evidenceId },
      );
      return next;
    },

    async get(actor, sessionId) {
      requirePermission(actor, "qep.execution_workspace.read");
      return load(actor.tenantId, sessionId);
    },

    async list(actor, filter) {
      requirePermission(actor, "qep.execution_workspace.read");
      return deps.repository.list({ ...filter, tenantId: actor.tenantId });
    },

    async history(actor, sessionId) {
      requirePermission(actor, "qep.execution_workspace.read");
      const agg = await load(actor.tenantId, sessionId);
      return agg.history;
    },
  };
}
