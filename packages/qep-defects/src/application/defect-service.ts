/**
 * Defect Application Service — APZQEP-140-D.
 * Investigation records referencing Cap C / Evidence — never mutate execution.
 */

import { assertTransition } from "../domain/lifecycle";
import type {
  DefectAggregate,
  DefectEvidenceRef,
  DefectHistoryEntry,
  DefectLifecycleState,
  DefectNode,
  DefectPriority,
  DefectRelationship,
  DefectRelationshipKind,
  DefectSeverity,
  ExecutionOrigin,
} from "../domain/types";
import {
  buildDefectDomainEvent,
  QEP_DEFECT_EVENTS,
  type DefectDomainEvent,
  type QepDefectEventId,
} from "./events";
import { originFromSession, type ExecutionSessionPort } from "./execution-port";
import type { DefectListFilter, DefectRepository } from "./repository";

export type DefectActor = {
  readonly userId: string;
  readonly tenantId: string;
  readonly permissions: readonly string[];
};

export type DefectEventPublisher = {
  publish(event: DefectDomainEvent): Promise<void>;
};

export type CreateDefectInput = {
  readonly defectId?: string;
  readonly title: string;
  readonly description?: string;
  readonly projectId?: string;
  readonly severity?: DefectSeverity;
  readonly priority?: DefectPriority;
  readonly category?: string;
  readonly environment?: string;
  readonly component?: string;
  readonly applicationVersion?: string;
  readonly releaseReference?: string;
  readonly assigneeId?: string;
  readonly reviewerId?: string;
  readonly tags?: readonly string[];
  readonly sessionId?: string;
  readonly stepId?: string;
  readonly evidenceIds?: readonly string[];
  readonly suiteId?: string;
  readonly planId?: string;
  readonly testExecutionId?: string;
  readonly qualityOrigin?: ExecutionOrigin;
  readonly customMetadata?: Readonly<Record<string, unknown>>;
};

function requirePermission(actor: DefectActor, permission: string): void {
  if (
    !actor.permissions.includes(permission) &&
    !actor.permissions.includes("qep.defects.admin")
  ) {
    throw new Error(`defect.permission.denied:${permission}`);
  }
}

function history(
  actorId: string,
  at: string,
  action: string,
  from?: DefectLifecycleState,
  to?: DefectLifecycleState,
  detail?: string,
): DefectHistoryEntry {
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

export type DefectApplicationService = {
  create(
    actor: DefectActor,
    input: CreateDefectInput,
    now: string,
  ): Promise<DefectNode>;
  createFromExecution(
    actor: DefectActor,
    input: {
      readonly sessionId: string;
      readonly stepId?: string;
      readonly title?: string;
      readonly description?: string;
      readonly severity?: DefectSeverity;
      readonly priority?: DefectPriority;
    },
    now: string,
  ): Promise<DefectNode>;
  update(
    actor: DefectActor,
    defectId: string,
    patch: Partial<CreateDefectInput> & {
      readonly resolution?: string;
      readonly rootCause?: string;
      readonly verificationNotes?: string;
      readonly duplicateOfDefectId?: string;
      readonly expectedRevision?: number;
    },
    now: string,
  ): Promise<DefectNode>;
  transition(
    actor: DefectActor,
    defectId: string,
    to: DefectLifecycleState,
    now: string,
    options?: { readonly reason?: string },
  ): Promise<DefectNode>;
  assign(
    actor: DefectActor,
    defectId: string,
    assigneeId: string,
    now: string,
  ): Promise<DefectNode>;
  attachEvidence(
    actor: DefectActor,
    defectId: string,
    evidenceId: string,
    now: string,
    note?: string,
  ): Promise<DefectNode>;
  linkRelationship(
    actor: DefectActor,
    defectId: string,
    input: {
      readonly kind: DefectRelationshipKind;
      readonly targetId: string;
      readonly label?: string;
    },
    now: string,
  ): Promise<DefectNode>;
  get(actor: DefectActor, defectId: string): Promise<DefectAggregate>;
  list(
    actor: DefectActor,
    filter: Omit<DefectListFilter, "tenantId">,
  ): Promise<readonly DefectNode[]>;
  history(actor: DefectActor, defectId: string): Promise<readonly DefectHistoryEntry[]>;
  drainEvents(): readonly DefectDomainEvent[];
};

export function createDefectApplicationService(deps: {
  readonly repository: DefectRepository;
  readonly executions?: ExecutionSessionPort;
  readonly publisher?: DefectEventPublisher;
  /** When set (postgres), mutators run inside one DB transaction with outbox. */
  readonly runInTransaction?: <T>(fn: () => Promise<T>) => Promise<T>;
}): DefectApplicationService {
  const pending: DefectDomainEvent[] = [];
  const run =
    deps.runInTransaction ?? (async <T>(fn: () => Promise<T>): Promise<T> => fn());

  async function emit(
    eventId: QepDefectEventId,
    defect: DefectNode,
    actorId: string,
    now: string,
    extra?: Readonly<Record<string, unknown>>,
  ): Promise<void> {
    const event = buildDefectDomainEvent({
      eventId,
      defect,
      actorId,
      correlationId: `corr-${defect.defectId}-${defect.revision}`,
      timestamp: now,
      ...(extra ? { extra } : {}),
    });
    pending.push(event);
    await deps.publisher?.publish(event);
  }

  async function load(tenantId: string, defectId: string): Promise<DefectAggregate> {
    const agg = await deps.repository.get(tenantId, defectId);
    if (!agg) throw new Error(`defect.not_found:${defectId}`);
    return agg;
  }

  const service: DefectApplicationService = {
    drainEvents() {
      return [...pending];
    },

    async create(actor, input, now) {
      requirePermission(actor, "qep.defects.create");
      if (!input.title.trim()) {
        throw new Error("defect.validation.title_required");
      }

      let executionOrigin = undefined as DefectNode["executionOrigin"];
      const relationships: DefectRelationship[] = [];
      const evidenceRefs: DefectEvidenceRef[] = [];

      if (input.sessionId) {
        if (!deps.executions) {
          throw new Error("defect.execution.port_unavailable");
        }
        const session = await deps.executions.get(actor.tenantId, input.sessionId);
        if (!session) {
          throw new Error(`defect.execution.not_found:${input.sessionId}`);
        }
        if (session.tenantId !== actor.tenantId) {
          throw new Error("defect.execution.cross_tenant");
        }
        executionOrigin = originFromSession(session, input.stepId);
        relationships.push({
          relationshipId: nextId("rel"),
          kind: "execution_session",
          targetId: session.sessionId,
          label: session.name,
          createdAt: now,
          createdBy: actor.userId,
        });
        if (input.stepId) {
          relationships.push({
            relationshipId: nextId("rel"),
            kind: "execution_step",
            targetId: input.stepId,
            createdAt: now,
            createdBy: actor.userId,
          });
        }
        if (session.suiteId) {
          relationships.push({
            relationshipId: nextId("rel"),
            kind: "suite",
            targetId: session.suiteId,
            ...(session.suiteName ? { label: session.suiteName } : {}),
            createdAt: now,
            createdBy: actor.userId,
          });
        }
        if (session.planId) {
          relationships.push({
            relationshipId: nextId("rel"),
            kind: "execution_plan",
            targetId: session.planId,
            createdAt: now,
            createdBy: actor.userId,
          });
        }
        const stepEvidence = input.stepId
          ? (session.steps.find((s) => s.stepId === input.stepId)?.evidenceIds ?? [])
          : [];
        for (const evidenceId of [
          ...new Set([...(input.evidenceIds ?? []), ...stepEvidence]),
        ]) {
          evidenceRefs.push({
            evidenceId,
            attachedAt: now,
            attachedBy: actor.userId,
          });
          relationships.push({
            relationshipId: nextId("rel"),
            kind: "evidence",
            targetId: evidenceId,
            createdAt: now,
            createdBy: actor.userId,
          });
        }
      } else if (input.evidenceIds?.length) {
        for (const evidenceId of input.evidenceIds) {
          evidenceRefs.push({
            evidenceId,
            attachedAt: now,
            attachedBy: actor.userId,
          });
          relationships.push({
            relationshipId: nextId("rel"),
            kind: "evidence",
            targetId: evidenceId,
            createdAt: now,
            createdBy: actor.userId,
          });
        }
      }

      if (input.suiteId && !relationships.some((r) => r.kind === "suite")) {
        relationships.push({
          relationshipId: nextId("rel"),
          kind: "suite",
          targetId: input.suiteId,
          createdAt: now,
          createdBy: actor.userId,
        });
      }
      if (input.testExecutionId) {
        executionOrigin = {
          ...(executionOrigin ?? {}),
          testExecutionId: input.testExecutionId,
        };
        relationships.push({
          relationshipId: nextId("rel"),
          kind: "test_execution",
          targetId: input.testExecutionId,
          createdAt: now,
          createdBy: actor.userId,
        });
      }
      if (input.planId && !relationships.some((r) => r.kind === "execution_plan")) {
        relationships.push({
          relationshipId: nextId("rel"),
          kind: "execution_plan",
          targetId: input.planId,
          createdAt: now,
          createdBy: actor.userId,
        });
      }
      if (input.qualityOrigin) {
        executionOrigin = {
          ...(executionOrigin ?? {}),
          ...input.qualityOrigin,
        };
        const origin = input.qualityOrigin;
        const pushRel = (
          kind: DefectRelationshipKind,
          targetId: string | undefined,
        ) => {
          if (!targetId) return;
          relationships.push({
            relationshipId: nextId("rel"),
            kind,
            targetId,
            createdAt: now,
            createdBy: actor.userId,
          });
        };
        pushRel("exploratory_session", origin.exploratorySessionId);
        pushRel("experience_verification", origin.experienceActivityId);
        pushRel("quality_observation", origin.observationId);
        pushRel("quality_issue", origin.issueId);
        pushRel("experience_criterion", origin.criterionId);
        pushRel("experience_context", origin.experienceContextId);
      }

      const defectId = input.defectId ?? nextId("def");
      const defect: DefectNode = {
        defectId,
        tenantId: actor.tenantId,
        ...(input.projectId ? { projectId: input.projectId } : {}),
        title: input.title.trim(),
        description: input.description?.trim() ?? "",
        status: "new",
        severity: input.severity ?? "major",
        priority: input.priority ?? "p2",
        ...(input.category ? { category: input.category } : {}),
        ...(input.environment ? { environment: input.environment } : {}),
        ...(input.component ? { component: input.component } : {}),
        ...(input.applicationVersion
          ? { applicationVersion: input.applicationVersion }
          : {}),
        ...(input.releaseReference ? { releaseReference: input.releaseReference } : {}),
        reporterId: actor.userId,
        ...(input.assigneeId ? { assigneeId: input.assigneeId } : {}),
        ...(input.reviewerId ? { reviewerId: input.reviewerId } : {}),
        ...(executionOrigin ? { executionOrigin } : {}),
        evidenceRefs,
        relationships,
        tags: input.tags ?? [],
        createdAt: now,
        createdBy: actor.userId,
        updatedAt: now,
        updatedBy: actor.userId,
        revision: 1,
        customMetadata: input.customMetadata ?? {},
      };

      await deps.repository.save({
        defect,
        history: [history(actor.userId, now, "created", undefined, "new")],
      });
      await emit(QEP_DEFECT_EVENTS.created, defect, actor.userId, now);
      if (defect.assigneeId) {
        await emit(QEP_DEFECT_EVENTS.assigned, defect, actor.userId, now);
      }
      return defect;
    },

    async createFromExecution(actor, input, now) {
      if (!deps.executions) {
        throw new Error("defect.execution.port_unavailable");
      }
      const session = await deps.executions.get(actor.tenantId, input.sessionId);
      if (!session) {
        throw new Error(`defect.execution.not_found:${input.sessionId}`);
      }
      const step = input.stepId
        ? session.steps.find((s) => s.stepId === input.stepId)
        : session.steps.find((s) => s.outcome === "fail" || s.outcome === "block");

      const title =
        input.title?.trim() ||
        (step ? `Defect: ${step.title}` : `Defect from ${session.name}`);
      const description =
        input.description?.trim() ||
        step?.failureNotes ||
        `Raised from execution session ${session.sessionId}`;

      return this.create(
        actor,
        {
          title,
          description,
          ...(session.projectId ? { projectId: session.projectId } : {}),
          severity: input.severity ?? "major",
          priority: input.priority ?? "p1",
          sessionId: session.sessionId,
          ...(step ? { stepId: step.stepId } : {}),
          evidenceIds: step?.evidenceIds ?? session.evidenceIds,
        },
        now,
      );
    },

    async update(actor, defectId, patch, now) {
      requirePermission(actor, "qep.defects.update");
      const agg = await load(actor.tenantId, defectId);
      const d = agg.defect;
      if (d.status === "archived") {
        throw new Error("defect.validation.archived");
      }
      if (patch.expectedRevision != null && patch.expectedRevision !== d.revision) {
        throw new Error("defect.concurrency.stale_revision");
      }

      const next: DefectNode = {
        ...d,
        ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
        ...(patch.description !== undefined
          ? { description: patch.description.trim() }
          : {}),
        ...(patch.severity !== undefined ? { severity: patch.severity } : {}),
        ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
        ...(patch.category !== undefined ? { category: patch.category } : {}),
        ...(patch.environment !== undefined ? { environment: patch.environment } : {}),
        ...(patch.component !== undefined ? { component: patch.component } : {}),
        ...(patch.applicationVersion !== undefined
          ? { applicationVersion: patch.applicationVersion }
          : {}),
        ...(patch.releaseReference !== undefined
          ? { releaseReference: patch.releaseReference }
          : {}),
        ...(patch.assigneeId !== undefined ? { assigneeId: patch.assigneeId } : {}),
        ...(patch.reviewerId !== undefined ? { reviewerId: patch.reviewerId } : {}),
        ...(patch.resolution !== undefined ? { resolution: patch.resolution } : {}),
        ...(patch.rootCause !== undefined ? { rootCause: patch.rootCause } : {}),
        ...(patch.verificationNotes !== undefined
          ? { verificationNotes: patch.verificationNotes }
          : {}),
        ...(patch.duplicateOfDefectId !== undefined
          ? { duplicateOfDefectId: patch.duplicateOfDefectId }
          : {}),
        ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
        ...(patch.customMetadata !== undefined
          ? { customMetadata: patch.customMetadata }
          : {}),
        updatedAt: now,
        updatedBy: actor.userId,
        revision: d.revision + 1,
      };

      await deps.repository.save({
        defect: next,
        history: [
          ...agg.history,
          history(actor.userId, now, "updated", d.status, d.status),
        ],
      });
      await emit(QEP_DEFECT_EVENTS.updated, next, actor.userId, now);
      if (patch.assigneeId && patch.assigneeId !== d.assigneeId) {
        await emit(QEP_DEFECT_EVENTS.assigned, next, actor.userId, now);
      }
      return next;
    },

    async transition(actor, defectId, to, now, options = {}) {
      requirePermission(actor, "qep.defects.lifecycle");
      const agg = await load(actor.tenantId, defectId);
      const from = agg.defect.status;
      assertTransition(from, to);

      const next: DefectNode = {
        ...agg.defect,
        status: to,
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.defect.revision + 1,
        ...(to === "closed" || to === "verified"
          ? { closedAt: to === "closed" ? now : agg.defect.closedAt }
          : {}),
        ...(to === "archived" ? { archivedAt: now } : {}),
        ...(to === "new" && from === "closed" ? { closedAt: undefined } : {}),
      };

      await deps.repository.save({
        defect: next,
        history: [
          ...agg.history,
          history(actor.userId, now, "lifecycle", from, to, options.reason),
        ],
      });

      let eventId: QepDefectEventId = QEP_DEFECT_EVENTS.statusChanged;
      if (to === "fixed" || to === "ready_for_retest") {
        eventId = QEP_DEFECT_EVENTS.fixed;
      } else if (to === "verified") {
        eventId = QEP_DEFECT_EVENTS.verified;
      } else if (to === "closed") {
        eventId = QEP_DEFECT_EVENTS.closed;
      } else if (to === "new" && from === "closed") {
        eventId = QEP_DEFECT_EVENTS.reopened;
      }

      await emit(eventId, next, actor.userId, now, {
        fromStatus: from,
        toStatus: to,
      });
      return next;
    },

    async assign(actor, defectId, assigneeId, now) {
      requirePermission(actor, "qep.defects.update");
      const agg = await load(actor.tenantId, defectId);
      let status = agg.defect.status;
      if (status === "new" || status === "triaged") {
        status = "assigned";
      }
      if (status !== agg.defect.status) {
        assertTransition(agg.defect.status, status);
      }
      const next: DefectNode = {
        ...agg.defect,
        assigneeId,
        status,
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.defect.revision + 1,
      };
      await deps.repository.save({
        defect: next,
        history: [
          ...agg.history,
          history(actor.userId, now, "assigned", agg.defect.status, status, assigneeId),
        ],
      });
      await emit(QEP_DEFECT_EVENTS.assigned, next, actor.userId, now);
      return next;
    },

    async attachEvidence(actor, defectId, evidenceId, now, note) {
      requirePermission(actor, "qep.defects.update");
      const agg = await load(actor.tenantId, defectId);
      if (!evidenceId.trim()) {
        throw new Error("defect.evidence.id_required");
      }
      const ref: DefectEvidenceRef = {
        evidenceId: evidenceId.trim(),
        attachedAt: now,
        attachedBy: actor.userId,
        ...(note ? { note } : {}),
      };
      const rel: DefectRelationship = {
        relationshipId: nextId("rel"),
        kind: "evidence",
        targetId: ref.evidenceId,
        createdAt: now,
        createdBy: actor.userId,
      };
      const next: DefectNode = {
        ...agg.defect,
        evidenceRefs: [...agg.defect.evidenceRefs, ref],
        relationships: [...agg.defect.relationships, rel],
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.defect.revision + 1,
      };
      await deps.repository.save({
        defect: next,
        history: [
          ...agg.history,
          history(
            actor.userId,
            now,
            "evidence_attached",
            next.status,
            next.status,
            ref.evidenceId,
          ),
        ],
      });
      await emit(QEP_DEFECT_EVENTS.updated, next, actor.userId, now);
      return next;
    },

    async linkRelationship(actor, defectId, input, now) {
      requirePermission(actor, "qep.defects.update");
      const agg = await load(actor.tenantId, defectId);
      const rel: DefectRelationship = {
        relationshipId: nextId("rel"),
        kind: input.kind,
        targetId: input.targetId,
        ...(input.label ? { label: input.label } : {}),
        createdAt: now,
        createdBy: actor.userId,
      };
      const next: DefectNode = {
        ...agg.defect,
        relationships: [...agg.defect.relationships, rel],
        ...(input.kind === "defect" ? { duplicateOfDefectId: input.targetId } : {}),
        updatedAt: now,
        updatedBy: actor.userId,
        revision: agg.defect.revision + 1,
      };
      await deps.repository.save({
        defect: next,
        history: [
          ...agg.history,
          history(
            actor.userId,
            now,
            "relationship_linked",
            next.status,
            next.status,
            `${input.kind}:${input.targetId}`,
          ),
        ],
      });
      await emit(QEP_DEFECT_EVENTS.updated, next, actor.userId, now);
      return next;
    },

    async get(actor, defectId) {
      requirePermission(actor, "qep.defects.read");
      return load(actor.tenantId, defectId);
    },

    async list(actor, filter) {
      requirePermission(actor, "qep.defects.read");
      return deps.repository.list({ ...filter, tenantId: actor.tenantId });
    },

    async history(actor, defectId) {
      requirePermission(actor, "qep.defects.read");
      const agg = await load(actor.tenantId, defectId);
      return agg.history;
    },
  };

  const mutating = new Set([
    "create",
    "createFromExecution",
    "update",
    "transition",
    "assign",
    "attachEvidence",
    "linkRelationship",
  ]);

  return new Proxy(service, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (
        typeof prop === "string" &&
        mutating.has(prop) &&
        typeof value === "function"
      ) {
        return (...args: unknown[]) =>
          run(() =>
            (value as (...a: unknown[]) => Promise<unknown>).apply(target, args),
          );
      }
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
