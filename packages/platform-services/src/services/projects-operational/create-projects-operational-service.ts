import { randomUUID } from "node:crypto";

import type {
  CommitmentTransitionInput,
  ConcludeExceptionInput,
  CreateCheckpointInput,
  CreateCommitmentInput,
  CreateDependencyInput,
  CreateExceptionInput,
  CreateOpsDecisionInput,
  CreateWaitingInput,
  DeliveryConfidenceResult,
  DeliveryForecastResult,
  DeliveryHealthResult,
  OperationalHistoryEntry,
  OpsDecisionTransitionInput,
  ProjectCheckpoint,
  ProjectCommitment,
  ProjectDependency,
  ProjectException,
  ProjectMilestone,
  ProjectOpsDecision,
  ProjectPulseResult,
  ProjectRisk,
  ProjectWaiting,
  ServiceRequestContext,
  WaitingCategory,
} from "@apzhub/platform-service-contracts";

import {
  computeDeliveryConfidence,
  computeDeliveryHealth,
  computeForecast,
  computePulse,
  isWaitingAged,
  type OpsSnapshot,
} from "./compute-engines";
import {
  applyAutomatedExceptions,
  detectAutomatedExceptions,
} from "./exception-automation";
import type { ProjectsWorkflowBridge } from "../projects-workflow-bridge";

import {
  getMemoryProjectsOperationalStore,
  resolveProjectsOperationalStore,
  setProjectsOperationalStoreForTests,
  type ProjectsOperationalStore,
} from "./memory-store";

function id(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

function tenant(ctx: ServiceRequestContext) {
  return ctx.tenantId ?? "default";
}

function actor(ctx: ServiceRequestContext) {
  return ctx.impersonation?.actorUserId || ctx.userId || "system";
}

function requireText(value: string | undefined, field: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) throw new Error(`ops_${field}_required`);
  return trimmed;
}

const WAITING_CATS = new Set<WaitingCategory>([
  "customer",
  "internal",
  "vendor",
  "governance",
  "external_dependency",
]);

const COMMITMENT_TRANSITIONS: Record<string, readonly string[]> = {
  proposed: ["accepted", "cancelled"],
  accepted: ["in_progress", "waiting", "cancelled"],
  in_progress: ["waiting", "done", "cancelled"],
  waiting: ["in_progress", "done", "cancelled"],
  done: [],
  cancelled: [],
};

export type DeliveryRegistersProvider = {
  listRisks(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly ProjectRisk[]>;
  listMilestones(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly ProjectMilestone[]>;
};

export type ProjectsOperationalService = {
  // Commitments
  listCommitments(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly ProjectCommitment[]>;
  createCommitment(
    ctx: ServiceRequestContext,
    projectId: string,
    input: CreateCommitmentInput,
  ): Promise<ProjectCommitment>;
  transitionCommitment(
    ctx: ServiceRequestContext,
    projectId: string,
    commitmentId: string,
    input: CommitmentTransitionInput,
  ): Promise<ProjectCommitment>;

  // Waiting
  listWaiting(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly ProjectWaiting[]>;
  createWaiting(
    ctx: ServiceRequestContext,
    projectId: string,
    input: CreateWaitingInput,
  ): Promise<ProjectWaiting>;
  resolveWaiting(
    ctx: ServiceRequestContext,
    projectId: string,
    waitingId: string,
    note: string,
  ): Promise<ProjectWaiting>;

  // Dependencies
  listDependencies(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly ProjectDependency[]>;
  createDependency(
    ctx: ServiceRequestContext,
    projectId: string,
    input: CreateDependencyInput,
  ): Promise<ProjectDependency>;
  updateDependencyStatus(
    ctx: ServiceRequestContext,
    projectId: string,
    dependencyId: string,
    status: ProjectDependency["status"],
  ): Promise<ProjectDependency>;

  // Decisions
  listOpsDecisions(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly ProjectOpsDecision[]>;
  createOpsDecision(
    ctx: ServiceRequestContext,
    projectId: string,
    input: CreateOpsDecisionInput,
  ): Promise<ProjectOpsDecision>;
  transitionOpsDecision(
    ctx: ServiceRequestContext,
    projectId: string,
    decisionId: string,
    input: OpsDecisionTransitionInput,
  ): Promise<ProjectOpsDecision>;

  // Checkpoints
  listCheckpoints(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly ProjectCheckpoint[]>;
  createCheckpoint(
    ctx: ServiceRequestContext,
    projectId: string,
    input: CreateCheckpointInput,
  ): Promise<ProjectCheckpoint>;
  submitCheckpoint(
    ctx: ServiceRequestContext,
    projectId: string,
    checkpointId: string,
    workflowBinding?: string,
  ): Promise<ProjectCheckpoint>;
  waiveCheckpoint(
    ctx: ServiceRequestContext,
    projectId: string,
    checkpointId: string,
    reason: string,
  ): Promise<ProjectCheckpoint>;
  applyCheckpointOutcome(
    ctx: ServiceRequestContext,
    projectId: string,
    checkpointId: string,
    outcome: "approved" | "rejected",
  ): Promise<ProjectCheckpoint>;

  // Exceptions
  listExceptions(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly ProjectException[]>;
  openException(
    ctx: ServiceRequestContext,
    projectId: string,
    input: CreateExceptionInput,
  ): Promise<ProjectException>;
  acknowledgeException(
    ctx: ServiceRequestContext,
    projectId: string,
    exceptionId: string,
  ): Promise<ProjectException>;
  concludeException(
    ctx: ServiceRequestContext,
    projectId: string,
    exceptionId: string,
    input: ConcludeExceptionInput,
  ): Promise<ProjectException>;

  // Computed
  getHealth(
    ctx: ServiceRequestContext,
    projectId: string,
    registers: DeliveryRegistersProvider,
  ): Promise<DeliveryHealthResult>;
  getConfidence(
    ctx: ServiceRequestContext,
    projectId: string,
    registers: DeliveryRegistersProvider,
  ): Promise<DeliveryConfidenceResult>;
  getPulse(
    ctx: ServiceRequestContext,
    projectId: string,
    registers: DeliveryRegistersProvider,
  ): Promise<ProjectPulseResult>;
  getForecast(
    ctx: ServiceRequestContext,
    projectId: string,
    windowDays: 7 | 14 | 30,
    registers: DeliveryRegistersProvider,
  ): Promise<DeliveryForecastResult>;

  // History + closure helpers
  listHistory(
    ctx: ServiceRequestContext,
    projectId: string,
    objectType: string,
    objectId: string,
  ): Promise<readonly OperationalHistoryEntry[]>;
  recordHistory(
    ctx: ServiceRequestContext,
    projectId: string,
    objectType: string,
    objectId: string,
    kind: string,
    summary: string,
    detail?: string,
  ): Promise<void>;
  scanAndRaiseExceptions(
    ctx: ServiceRequestContext,
    projectId: string,
    registers: DeliveryRegistersProvider,
    governance?: {
      milestoneDateToleranceDays: number;
      waitingBreachEscalationDays: number;
    },
  ): Promise<readonly ProjectException[]>;
  countPendingOpsDecisions(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<number>;
  countOpenMajorExceptions(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<number>;
  countOpenCommitments(ctx: ServiceRequestContext, projectId: string): Promise<number>;
};

async function history(
  store: ProjectsOperationalStore,
  ctx: ServiceRequestContext,
  projectId: string,
  objectType: string,
  objectId: string,
  kind: string,
  summary: string,
  detail?: string,
) {
  await store.addHistory(tenant(ctx), {
    id: id("ohist"),
    projectId,
    objectType,
    objectId,
    kind,
    summary,
    detail,
    actorUserId: actor(ctx),
    at: new Date().toISOString(),
  });
}

async function snapshot(
  store: ProjectsOperationalStore,
  ctx: ServiceRequestContext,
  projectId: string,
  registers: DeliveryRegistersProvider,
): Promise<OpsSnapshot> {
  const t = tenant(ctx);
  const [
    commitments,
    waiting,
    dependencies,
    decisions,
    checkpoints,
    exceptions,
    risks,
    milestones,
  ] = await Promise.all([
    store.listCommitments(t, projectId),
    store.listWaiting(t, projectId),
    store.listDependencies(t, projectId),
    store.listDecisions(t, projectId),
    store.listCheckpoints(t, projectId),
    store.listExceptions(t, projectId),
    registers.listRisks(ctx, projectId),
    registers.listMilestones(ctx, projectId),
  ]);
  return {
    commitments,
    waiting,
    dependencies,
    decisions,
    checkpoints,
    exceptions,
    risks,
    milestones,
  };
}

function detectCycle(
  edges: readonly ProjectDependency[],
  fromId: string,
  toId: string,
): boolean {
  const graph = new Map<string, string[]>();
  for (const e of edges) {
    if (e.kind !== "finish_to_start" || e.status === "resolved") continue;
    const a = e.fromRef.id;
    const b = e.toRef.id;
    if (!a || !b) continue;
    const list = graph.get(a) ?? [];
    list.push(b);
    graph.set(a, list);
  }
  const startList = graph.get(fromId) ?? [];
  startList.push(toId);
  graph.set(fromId, startList);

  const seen = new Set<string>();
  const stack = [toId];
  while (stack.length) {
    const n = stack.pop()!;
    if (n === fromId) return true;
    if (seen.has(n)) continue;
    seen.add(n);
    for (const next of graph.get(n) ?? []) stack.push(next);
  }
  return false;
}

export type CreateProjectsOperationalServiceOptions = {
  /** Gate P1 — APZ Workflow Bridge for checkpoint / exception approvals. */
  readonly workflowBridge?: ProjectsWorkflowBridge;
};

export function createProjectsOperationalService(
  store: ProjectsOperationalStore = resolveProjectsOperationalStore(),
  options: CreateProjectsOperationalServiceOptions = {},
): ProjectsOperationalService {
  const bridge = options.workflowBridge;
  const openExceptionFn = async (
    ctx: ServiceRequestContext,
    projectId: string,
    input: CreateExceptionInput,
  ): Promise<ProjectException> => {
    const now = new Date().toISOString();
    const escalation =
      input.severity === "critical"
        ? "escalated"
        : input.severity === "major"
          ? "notified"
          : "none";
    const item: ProjectException = Object.freeze({
      id: id("ex"),
      projectId,
      type: input.type,
      severity: input.severity,
      status: "open",
      subjectRef: Object.freeze({ ...input.subjectRef }),
      detectedAt: now,
      reason: requireText(input.reason, "reason"),
      impactSummary: requireText(input.impactSummary, "impactSummary"),
      failureConsequence: input.failureConsequence?.trim() || undefined,
      requiredDecisionId: input.requiredDecisionId,
      escalationState: escalation,
      createdAt: now,
      updatedAt: now,
    });
    await store.upsertException(tenant(ctx), item);
    await history(
      store,
      ctx,
      projectId,
      "exception",
      item.id,
      "opened",
      `${item.severity} ${item.type}: ${item.reason}`,
    );
    return item;
  };

  const service: ProjectsOperationalService = {
    async listCommitments(ctx, projectId) {
      return store.listCommitments(tenant(ctx), projectId);
    },

    async createCommitment(ctx, projectId, input) {
      const now = new Date().toISOString();
      const item: ProjectCommitment = Object.freeze({
        id: id("cmt"),
        projectId,
        statement: requireText(input.statement, "statement"),
        ownerUserId: requireText(input.ownerUserId, "ownerUserId"),
        dueAt: input.dueAt,
        status: "proposed",
        waiters: Object.freeze([...(input.waiters ?? [])]),
        failureConsequence: input.failureConsequence?.trim() || undefined,
        milestoneId: input.milestoneId,
        blockedByDependencyIds: Object.freeze([]),
        priority: input.priority ?? "normal",
        completionEvidence: Object.freeze([]),
        blocksGoLive: Boolean(input.blocksGoLive),
        createdAt: now,
        updatedAt: now,
        createdBy: actor(ctx),
      });
      await store.upsertCommitment(tenant(ctx), item);
      await history(
        store,
        ctx,
        projectId,
        "commitment",
        item.id,
        "created",
        `Commitment proposed: ${item.statement}`,
      );
      return item;
    },

    async transitionCommitment(ctx, projectId, commitmentId, input) {
      const current = await store.getCommitment(tenant(ctx), projectId, commitmentId);
      if (!current) throw new Error("ops_commitment_not_found");
      const allowed = COMMITMENT_TRANSITIONS[current.status] ?? [];
      if (!allowed.includes(input.to)) {
        throw new Error(`ops_commitment_illegal:${current.status}->${input.to}`);
      }

      let next: ProjectCommitment = { ...current };
      const now = new Date().toISOString();

      if (input.to === "accepted") {
        if (!current.ownerUserId) throw new Error("ops_owner_required");
        if (!current.dueAt && !input) throw new Error("ops_due_required");
        // dueAt must exist on accept
        if (!current.dueAt) throw new Error("ops_due_required");
      }

      if (input.to === "waiting") {
        if (!input.waiting) throw new Error("ops_waiting_payload_required");
        if (!WAITING_CATS.has(input.waiting.category)) {
          throw new Error("ops_waiting_category_invalid");
        }
        const wait: ProjectWaiting = Object.freeze({
          id: id("wait"),
          projectId,
          subject: requireText(input.waiting.subject, "waiting.subject"),
          category: input.waiting.category,
          since: now,
          chaseOwnerUserId: requireText(
            input.waiting.chaseOwnerUserId,
            "waiting.chaseOwnerUserId",
          ),
          status: "active",
          partyLabel: input.waiting.partyLabel?.trim() || undefined,
          slaDays: input.waiting.slaDays ?? 7,
          failureConsequence: input.waiting.failureConsequence?.trim() || undefined,
          linkedCommitmentId: current.id,
          createdAt: now,
          updatedAt: now,
          createdBy: actor(ctx),
        });
        await store.upsertWaiting(tenant(ctx), wait);
        await history(
          store,
          ctx,
          projectId,
          "waiting",
          wait.id,
          "created",
          `Waiting logged: ${wait.subject}`,
        );
        next = { ...next, waitingId: wait.id, status: "waiting" };
      }

      if (
        input.to === "in_progress" &&
        current.status === "waiting" &&
        current.waitingId
      ) {
        const w = await store.getWaiting(tenant(ctx), projectId, current.waitingId);
        if (w && w.status === "active") {
          throw new Error("ops_waiting_still_active");
        }
        next = { ...next, status: "in_progress", waitingId: undefined };
      } else if (input.to === "in_progress") {
        next = { ...next, status: "in_progress" };
      }

      if (input.to === "done") {
        const evidenceOptional = Boolean(input.evidenceOptional);
        const evidence = (input.evidence ?? []).map((e) => ({
          type: e.type,
          label: requireText(e.label, "evidence.label"),
          uri: e.uri,
          documentId: e.documentId,
          recordedBy: actor(ctx),
          recordedAt: now,
        }));
        if (!evidenceOptional && evidence.length === 0) {
          throw new Error("ops_completion_evidence_required");
        }
        next = {
          ...next,
          status: "done",
          completionEvidence: Object.freeze(evidence),
          waitingId: undefined,
          waiters: Object.freeze([]),
        };
      }

      if (input.to === "cancelled") {
        if (!input.cancelReason?.trim()) throw new Error("ops_cancel_reason_required");
        next = {
          ...next,
          status: "cancelled",
          cancelReason: input.cancelReason.trim(),
        };
        await openExceptionFn(ctx, projectId, {
          type: "scope_exception",
          severity: "minor",
          subjectRef: { type: "commitment", id: current.id },
          reason: input.cancelReason.trim(),
          impactSummary: `Commitment cancelled: ${current.statement}`,
          failureConsequence: current.failureConsequence,
        });
      }

      if (input.to === "accepted") {
        next = { ...next, status: "accepted" };
      }

      next = Object.freeze({ ...next, updatedAt: now });
      await store.upsertCommitment(tenant(ctx), next);
      await history(
        store,
        ctx,
        projectId,
        "commitment",
        next.id,
        "transition",
        `Commitment ${current.status} → ${next.status}`,
      );
      return next;
    },

    async listWaiting(ctx, projectId) {
      return store.listWaiting(tenant(ctx), projectId);
    },

    async createWaiting(ctx, projectId, input) {
      if (!WAITING_CATS.has(input.category))
        throw new Error("ops_waiting_category_invalid");
      const now = new Date().toISOString();
      const item: ProjectWaiting = Object.freeze({
        id: id("wait"),
        projectId,
        subject: requireText(input.subject, "subject"),
        category: input.category,
        since: input.since ?? now,
        chaseOwnerUserId: requireText(input.chaseOwnerUserId, "chaseOwnerUserId"),
        status: "active",
        partyLabel: input.partyLabel?.trim() || undefined,
        slaDays: input.slaDays ?? 7,
        failureConsequence: input.failureConsequence?.trim() || undefined,
        linkedCommitmentId: input.linkedCommitmentId,
        linkedDecisionId: input.linkedDecisionId,
        linkedMilestoneId: input.linkedMilestoneId,
        createdAt: now,
        updatedAt: now,
        createdBy: actor(ctx),
      });
      await store.upsertWaiting(tenant(ctx), item);
      await history(
        store,
        ctx,
        projectId,
        "waiting",
        item.id,
        "created",
        `Waiting: ${item.subject}`,
      );
      return item;
    },

    async resolveWaiting(ctx, projectId, waitingId, note) {
      const current = await store.getWaiting(tenant(ctx), projectId, waitingId);
      if (!current) throw new Error("ops_waiting_not_found");
      if (current.status !== "active") throw new Error("ops_waiting_not_active");
      const now = new Date().toISOString();
      const next: ProjectWaiting = Object.freeze({
        ...current,
        status: "resolved",
        resolvedAt: now,
        resolveNote: requireText(note, "resolveNote"),
        updatedAt: now,
      });
      await store.upsertWaiting(tenant(ctx), next);
      if (current.linkedCommitmentId) {
        const c = await store.getCommitment(
          tenant(ctx),
          projectId,
          current.linkedCommitmentId,
        );
        if (c && c.status === "waiting") {
          await store.upsertCommitment(
            tenant(ctx),
            Object.freeze({
              ...c,
              status: "in_progress",
              waitingId: undefined,
              updatedAt: now,
            }),
          );
        }
      }
      if (isWaitingAged(current)) {
        // breach may already exist; optional advisory close path left to Exception Engine callers
      }
      await history(
        store,
        ctx,
        projectId,
        "waiting",
        next.id,
        "resolved",
        `Waiting resolved: ${next.subject}`,
        note,
      );
      return next;
    },

    async listDependencies(ctx, projectId) {
      return store.listDependencies(tenant(ctx), projectId);
    },

    async createDependency(ctx, projectId, input) {
      const existing = await store.listDependencies(tenant(ctx), projectId);
      if (
        input.kind === "finish_to_start" &&
        input.fromRef.id &&
        input.toRef.id &&
        detectCycle(existing, input.fromRef.id, input.toRef.id)
      ) {
        throw new Error("ops_dependency_cycle");
      }
      const now = new Date().toISOString();
      const item: ProjectDependency = Object.freeze({
        id: id("dep"),
        projectId,
        fromRef: Object.freeze({ ...input.fromRef }),
        toRef: Object.freeze({ ...input.toRef }),
        kind: input.kind,
        status: "active",
        failureConsequence: input.failureConsequence?.trim() || undefined,
        ownerUserId: input.ownerUserId?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
        createdBy: actor(ctx),
      });
      await store.upsertDependency(tenant(ctx), item);
      await history(
        store,
        ctx,
        projectId,
        "dependency",
        item.id,
        "created",
        `Dependency ${item.kind} created`,
      );
      return item;
    },

    async updateDependencyStatus(ctx, projectId, dependencyId, status) {
      const items = await store.listDependencies(tenant(ctx), projectId);
      const current = items.find((d) => d.id === dependencyId);
      if (!current) throw new Error("ops_dependency_not_found");
      const now = new Date().toISOString();
      const next: ProjectDependency = Object.freeze({
        ...current,
        status,
        updatedAt: now,
      });
      await store.upsertDependency(tenant(ctx), next);
      if (status === "broken") {
        await openExceptionFn(ctx, projectId, {
          type: "dependency_break",
          severity: "major",
          subjectRef: { type: "dependency", id: dependencyId },
          reason: "Dependency marked broken",
          impactSummary: "Structural dependency broken — recovery required",
          failureConsequence: current.failureConsequence,
        });
      }
      await history(
        store,
        ctx,
        projectId,
        "dependency",
        dependencyId,
        "status",
        `Dependency → ${status}`,
      );
      return next;
    },

    async listOpsDecisions(ctx, projectId) {
      return store.listDecisions(tenant(ctx), projectId);
    },

    async createOpsDecision(ctx, projectId, input) {
      const now = new Date().toISOString();
      const item: ProjectOpsDecision = Object.freeze({
        id: id("opdec"),
        projectId,
        title: requireText(input.title, "title"),
        status: "pending",
        decisionMakerUserId: requireText(
          input.decisionMakerUserId,
          "decisionMakerUserId",
        ),
        dueAt: input.dueAt,
        context: input.context?.trim() || undefined,
        failureConsequence: input.failureConsequence?.trim() || undefined,
        links: Object.freeze([...(input.links ?? [])]),
        createdAt: now,
        updatedAt: now,
        createdBy: actor(ctx),
      });
      if (item.status === "pending" && !item.dueAt) {
        throw new Error("ops_decision_due_required");
      }
      await store.upsertDecision(tenant(ctx), item);
      await history(
        store,
        ctx,
        projectId,
        "decision",
        item.id,
        "created",
        `Decision pending: ${item.title}`,
      );
      return item;
    },

    async transitionOpsDecision(ctx, projectId, decisionId, input) {
      const current = await store.getDecision(tenant(ctx), projectId, decisionId);
      if (!current) throw new Error("ops_decision_not_found");
      const now = new Date().toISOString();
      let next: ProjectOpsDecision = { ...current };

      if (input.to === "decided") {
        if (!input.outcome?.trim()) throw new Error("ops_decision_outcome_required");
        next = {
          ...next,
          status: "decided",
          outcome: input.outcome.trim(),
        };
      } else if (input.to === "deferred") {
        if (!input.dueAt) throw new Error("ops_decision_due_required");
        if (!input.deferReason?.trim()) throw new Error("ops_defer_reason_required");
        next = {
          ...next,
          status: "deferred",
          dueAt: input.dueAt,
          deferReason: input.deferReason.trim(),
        };
      } else if (input.to === "cancelled") {
        next = { ...next, status: "cancelled" };
      } else if (input.to === "pending") {
        next = { ...next, status: "pending", dueAt: input.dueAt ?? current.dueAt };
      } else {
        throw new Error("ops_decision_transition_illegal");
      }

      next = Object.freeze({ ...next, updatedAt: now });
      await store.upsertDecision(tenant(ctx), next);
      await history(
        store,
        ctx,
        projectId,
        "decision",
        decisionId,
        "transition",
        `Decision → ${next.status}`,
        next.outcome,
      );
      return next;
    },

    async listCheckpoints(ctx, projectId) {
      return store.listCheckpoints(tenant(ctx), projectId);
    },

    async createCheckpoint(ctx, projectId, input) {
      const now = new Date().toISOString();
      const item: ProjectCheckpoint = Object.freeze({
        id: id("chk"),
        projectId,
        key: requireText(input.key, "key"),
        name: requireText(input.name, "name"),
        status: "not_started",
        requiredByProfile: input.requiredByProfile ?? true,
        releaseClass: Boolean(input.releaseClass),
        dueAt: input.dueAt,
        anchorMilestoneId: input.anchorMilestoneId,
        createdAt: now,
        updatedAt: now,
      });
      await store.upsertCheckpoint(tenant(ctx), item);
      await history(
        store,
        ctx,
        projectId,
        "checkpoint",
        item.id,
        "created",
        `Checkpoint: ${item.name}`,
      );
      return item;
    },

    async submitCheckpoint(ctx, projectId, checkpointId, workflowBinding) {
      const current = await store.getCheckpoint(tenant(ctx), projectId, checkpointId);
      if (!current) throw new Error("ops_checkpoint_not_found");
      const now = new Date().toISOString();
      let bindingRef = workflowBinding?.trim() || current.workflowBinding || undefined;
      if (bridge && !bindingRef) {
        const binding = await bridge.requestApproval(ctx, {
          kind: "checkpoint_approval",
          projectId,
          subjectType: "checkpoint",
          subjectId: checkpointId,
          title: `Checkpoint approval: ${current.name}`,
        });
        bindingRef = binding.id;
        if (binding.status === "unavailable") {
          bindingRef = `approvalsUnavailable:${binding.id}`;
        }
      }
      if (!bindingRef) {
        bindingRef = `approvalsUnavailable:${checkpointId}`;
      }
      const next: ProjectCheckpoint = Object.freeze({
        ...current,
        status: "pending",
        workflowBinding: bindingRef,
        updatedAt: now,
      });
      await store.upsertCheckpoint(tenant(ctx), next);
      await history(
        store,
        ctx,
        projectId,
        "checkpoint",
        checkpointId,
        "submitted",
        bridge
          ? "Checkpoint submitted to APZ Workflow"
          : "Checkpoint submitted (Workflow bridge not configured)",
      );
      return next;
    },

    async waiveCheckpoint(ctx, projectId, checkpointId, reason) {
      const current = await store.getCheckpoint(tenant(ctx), projectId, checkpointId);
      if (!current) throw new Error("ops_checkpoint_not_found");
      // Required checkpoints must execute via Workflow — no waiver / fallback path.
      if (current.requiredByProfile) {
        throw new Error("checkpoint_waiver_forbidden_use_workflow");
      }
      const now = new Date().toISOString();
      const next: ProjectCheckpoint = Object.freeze({
        ...current,
        status: "waived",
        waiverActor: actor(ctx),
        waiverReason: requireText(reason, "reason"),
        waivedAt: now,
        updatedAt: now,
      });
      await store.upsertCheckpoint(tenant(ctx), next);
      await history(
        store,
        ctx,
        projectId,
        "checkpoint",
        checkpointId,
        "waived",
        "Checkpoint waived",
        reason,
      );
      return next;
    },

    async applyCheckpointOutcome(ctx, projectId, checkpointId, outcome) {
      const current = await store.getCheckpoint(tenant(ctx), projectId, checkpointId);
      if (!current) throw new Error("ops_checkpoint_not_found");
      if (
        bridge &&
        current.workflowBinding &&
        !current.workflowBinding.startsWith("approvalsUnavailable:")
      ) {
        await bridge.applyOutcome(ctx, current.workflowBinding, {
          outcome: outcome === "approved" ? "approved" : "rejected",
        });
      }
      const now = new Date().toISOString();
      const next: ProjectCheckpoint = Object.freeze({
        ...current,
        status: outcome,
        updatedAt: now,
      });
      await store.upsertCheckpoint(tenant(ctx), next);
      if (outcome === "rejected") {
        const decision = await service.createOpsDecision(ctx, projectId, {
          title: `Respond to rejected checkpoint: ${current.name}`,
          decisionMakerUserId: actor(ctx),
          dueAt: new Date(Date.now() + 3 * 86400000).toISOString(),
          context: "Checkpoint rejection requires a Decision",
          links: [{ type: "checkpoint", id: checkpointId }],
        });
        await openExceptionFn(ctx, projectId, {
          type: "checkpoint_rejected",
          severity: current.releaseClass ? "critical" : "major",
          subjectRef: { type: "checkpoint", id: checkpointId },
          reason: `Checkpoint rejected: ${current.name}`,
          impactSummary: "Rejected checkpoint blocks quiet proceed",
          requiredDecisionId: decision.id,
        });
      }
      await history(
        store,
        ctx,
        projectId,
        "checkpoint",
        checkpointId,
        "outcome",
        `Checkpoint ${outcome}`,
      );
      return next;
    },

    async listExceptions(ctx, projectId) {
      return store.listExceptions(tenant(ctx), projectId);
    },

    async openException(ctx, projectId, input) {
      return openExceptionFn(ctx, projectId, input);
    },

    async acknowledgeException(ctx, projectId, exceptionId) {
      const current = await store.getException(tenant(ctx), projectId, exceptionId);
      if (!current) throw new Error("ops_exception_not_found");
      if (current.status === "concluded") throw new Error("ops_exception_concluded");
      const next: ProjectException = Object.freeze({
        ...current,
        status: "acknowledged",
        updatedAt: new Date().toISOString(),
      });
      await store.upsertException(tenant(ctx), next);
      await history(
        store,
        ctx,
        projectId,
        "exception",
        exceptionId,
        "acknowledged",
        "Exception acknowledged",
      );
      return next;
    },

    async concludeException(ctx, projectId, exceptionId, input) {
      const current = await store.getException(tenant(ctx), projectId, exceptionId);
      if (!current) throw new Error("ops_exception_not_found");
      if (current.status === "concluded") throw new Error("ops_exception_concluded");
      if (bridge && (current.severity === "major" || current.severity === "critical")) {
        let approved = await bridge.hasApproved(
          ctx,
          projectId,
          "exception_approval",
          "exception",
          exceptionId,
        );
        if (!approved) {
          await bridge.requestApproval(ctx, {
            kind: "exception_approval",
            projectId,
            subjectType: "exception",
            subjectId: exceptionId,
            title: `Exception approval: ${current.type}`,
            reason: current.reason,
          });
          approved = await bridge.hasApproved(
            ctx,
            projectId,
            "exception_approval",
            "exception",
            exceptionId,
          );
        }
        if (!approved) {
          throw new Error("exception_approval_required");
        }
      }
      const now = new Date().toISOString();
      const next: ProjectException = Object.freeze({
        ...current,
        status: "concluded",
        outcome: input.outcome,
        resolutionNote: requireText(input.resolutionNote, "resolutionNote"),
        concludedAt: now,
        concludedBy: actor(ctx),
        updatedAt: now,
      });
      await store.upsertException(tenant(ctx), next);
      await history(
        store,
        ctx,
        projectId,
        "exception",
        exceptionId,
        "concluded",
        `Exception ${input.outcome}`,
        input.resolutionNote,
      );
      return next;
    },

    async getHealth(ctx, projectId, registers) {
      return computeDeliveryHealth(
        projectId,
        await snapshot(store, ctx, projectId, registers),
      );
    },

    async getConfidence(ctx, projectId, registers) {
      return computeDeliveryConfidence(
        projectId,
        await snapshot(store, ctx, projectId, registers),
      );
    },

    async getPulse(ctx, projectId, registers) {
      return computePulse(projectId, await snapshot(store, ctx, projectId, registers));
    },

    async getForecast(ctx, projectId, windowDays, registers) {
      return computeForecast(
        projectId,
        await snapshot(store, ctx, projectId, registers),
        windowDays,
      );
    },

    async listHistory(ctx, projectId, objectType, objectId) {
      return store.listHistory(tenant(ctx), projectId, objectType, objectId);
    },

    async recordHistory(ctx, projectId, objectType, objectId, kind, summary, detail) {
      await history(store, ctx, projectId, objectType, objectId, kind, summary, detail);
    },

    async scanAndRaiseExceptions(ctx, projectId, registers, governance) {
      const snap = await snapshot(store, ctx, projectId, registers);
      const drafts = detectAutomatedExceptions({
        milestones: snap.milestones,
        waiting: snap.waiting,
        commitments: snap.commitments,
        dependencies: snap.dependencies,
        checkpoints: snap.checkpoints,
        exceptions: snap.exceptions,
        waitingBreachEscalationDays: governance?.waitingBreachEscalationDays ?? 3,
        milestoneDateToleranceDays: governance?.milestoneDateToleranceDays ?? 7,
      });
      return applyAutomatedExceptions(ctx, projectId, drafts, (c, p, input) =>
        openExceptionFn(c, p, input),
      );
    },

    async countPendingOpsDecisions(ctx, projectId) {
      const items = await store.listDecisions(tenant(ctx), projectId);
      return items.filter((d) => d.status === "pending" || d.status === "deferred")
        .length;
    },

    async countOpenMajorExceptions(ctx, projectId) {
      const items = await store.listExceptions(tenant(ctx), projectId);
      return items.filter(
        (e) =>
          e.status !== "concluded" &&
          (e.severity === "major" || e.severity === "critical"),
      ).length;
    },

    async countOpenCommitments(ctx, projectId) {
      const items = await store.listCommitments(tenant(ctx), projectId);
      return items.filter((c) => c.status !== "done" && c.status !== "cancelled")
        .length;
    },
  };
  return service;
}

export {
  getMemoryProjectsOperationalStore,
  setProjectsOperationalStoreForTests,
  resolveProjectsOperationalStore,
};
