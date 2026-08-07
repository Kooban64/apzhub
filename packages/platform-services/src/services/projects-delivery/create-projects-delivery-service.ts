import { randomUUID } from "node:crypto";

import type {
  CreateMilestoneInput,
  CreateProjectActionInput,
  CreateProjectDecisionInput,
  CreateProjectRiskInput,
  ProjectActionItem,
  ProjectDecision,
  ProjectDeliveryDashboard,
  ProjectDeliveryHealth,
  ProjectMilestone,
  ProjectRisk,
  ServiceRequestContext,
  UpdateMilestoneInput,
  UpdateProjectActionInput,
  UpdateProjectDecisionInput,
  UpdateProjectRiskInput,
} from "@apzhub/platform-service-contracts";
import type { MilestoneId, ProjectId } from "@apzhub/platform-service-contracts";
import {
  isAchievedMilestoneStatus,
  isOpenMilestoneStatus,
  normalizeMilestoneStatus,
} from "@apzhub/platform-service-contracts";

import { getGovernanceProfile } from "../projects-lifecycle/catalogue";
import { createProjectsLifecycleService } from "../projects-lifecycle/create-projects-lifecycle-service";
import { createProjectsOperationalService } from "../projects-operational/create-projects-operational-service";
import { computeProjectDeliveryHealth } from "./compute-health";
import {
  getMemoryProjectsDeliveryStore,
  type ProjectsDeliveryStore,
} from "./memory-store";
import { createPostgresProjectsDeliveryStore } from "./postgres-store";

function varianceDays(baselineDueAt?: string, targetDate?: string): number | undefined {
  if (!baselineDueAt || !targetDate) return undefined;
  return Math.round(
    (Date.parse(targetDate) - Date.parse(baselineDueAt)) / (24 * 60 * 60 * 1000),
  );
}

function dayDelta(from?: string, to?: string): number {
  if (!from || !to) return 0;
  return Math.abs(
    Math.round((Date.parse(to) - Date.parse(from)) / (24 * 60 * 60 * 1000)),
  );
}

async function recordMilestoneHistory(
  ctx: ServiceRequestContext,
  projectId: string,
  milestoneId: string,
  kind: string,
  summary: string,
  detail?: string,
) {
  try {
    await createProjectsOperationalService().recordHistory(
      ctx,
      projectId,
      "milestone",
      milestoneId,
      kind,
      summary,
      detail,
    );
  } catch {
    /* history is best-effort when ops store unavailable */
  }
}

function requireText(value: string | undefined, field: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) throw new Error(`delivery_${field}_required`);
  return trimmed;
}

function id(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

export type ProjectsDeliveryService = {
  listMilestones(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly ProjectMilestone[]>;
  createMilestone(
    ctx: ServiceRequestContext,
    projectId: string,
    input: CreateMilestoneInput,
  ): Promise<ProjectMilestone>;
  updateMilestone(
    ctx: ServiceRequestContext,
    projectId: string,
    milestoneId: string,
    input: UpdateMilestoneInput,
  ): Promise<ProjectMilestone>;
  listRisks(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly ProjectRisk[]>;
  createRisk(
    ctx: ServiceRequestContext,
    projectId: string,
    input: CreateProjectRiskInput,
  ): Promise<ProjectRisk>;
  updateRisk(
    ctx: ServiceRequestContext,
    projectId: string,
    riskId: string,
    input: UpdateProjectRiskInput,
  ): Promise<ProjectRisk>;
  listDecisions(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly ProjectDecision[]>;
  createDecision(
    ctx: ServiceRequestContext,
    projectId: string,
    input: CreateProjectDecisionInput,
  ): Promise<ProjectDecision>;
  updateDecision(
    ctx: ServiceRequestContext,
    projectId: string,
    decisionId: string,
    input: UpdateProjectDecisionInput,
  ): Promise<ProjectDecision>;
  listActions(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly ProjectActionItem[]>;
  createAction(
    ctx: ServiceRequestContext,
    projectId: string,
    input: CreateProjectActionInput,
  ): Promise<ProjectActionItem>;
  updateAction(
    ctx: ServiceRequestContext,
    projectId: string,
    actionId: string,
    input: UpdateProjectActionInput,
  ): Promise<ProjectActionItem>;
  getHealth(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<ProjectDeliveryHealth>;
  getDashboard(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<ProjectDeliveryDashboard>;
};

let preferred: ProjectsDeliveryStore | undefined;

export function setProjectsDeliveryStoreForTests(store: ProjectsDeliveryStore) {
  preferred = store;
}

export function resolveProjectsDeliveryStore(): ProjectsDeliveryStore {
  if (preferred) return preferred;
  if (process.env.APZHUB_PROJECTS_DELIVERY_STORE === "memory") {
    return getMemoryProjectsDeliveryStore();
  }
  try {
    return createPostgresProjectsDeliveryStore();
  } catch {
    return getMemoryProjectsDeliveryStore();
  }
}

export function createProjectsDeliveryService(
  store: ProjectsDeliveryStore = resolveProjectsDeliveryStore(),
): ProjectsDeliveryService {
  const tenant = (ctx: ServiceRequestContext) => ctx.tenantId ?? "default";

  return {
    async listMilestones(ctx, projectId) {
      return store.listMilestones(tenant(ctx), projectId);
    },

    async createMilestone(ctx, projectId, input) {
      const now = new Date().toISOString();
      const status = normalizeMilestoneStatus(input.status ?? "planned");
      const ownerUserId = input.ownerUserId?.trim() || input.owner?.trim() || undefined;
      let baselineDueAt = input.baselineDueAt ?? input.targetDate;
      try {
        const life = await createProjectsLifecycleService().getLifecycle(
          ctx,
          projectId,
        );
        if (life?.activeBaselineId && life.targetEndAt && !input.baselineDueAt) {
          // Initial bind: use provided target as baseline working plan unless overridden
          baselineDueAt = input.baselineDueAt ?? input.targetDate;
        }
      } catch {
        /* lifecycle optional */
      }
      const item: ProjectMilestone = Object.freeze({
        id: id("ms") as MilestoneId,
        projectId: projectId as ProjectId,
        name: requireText(input.name, "name"),
        description: input.description?.trim() || undefined,
        targetDate: input.targetDate,
        owner: ownerUserId,
        ownerUserId,
        status,
        confidence: input.confidence ?? "medium",
        failureConsequence: input.failureConsequence?.trim() || undefined,
        exitCriteria: input.exitCriteria?.trim() || undefined,
        baselineDueAt,
        sortKey: input.sortKey ?? 0,
        dependencyIds: Object.freeze([...(input.dependencyIds ?? [])]),
        progressPercent: Math.min(100, Math.max(0, input.progressPercent ?? 0)),
        achievementEvidence: Object.freeze([]),
        varianceDays: varianceDays(baselineDueAt, input.targetDate),
        createdAt: now,
        updatedAt: now,
      });
      const saved = await store.upsertMilestone(tenant(ctx), item);
      await recordMilestoneHistory(
        ctx,
        projectId,
        saved.id,
        "created",
        `Milestone created: ${saved.name}`,
      );
      return saved;
    },

    async updateMilestone(ctx, projectId, milestoneId, input) {
      const existing = (await store.listMilestones(tenant(ctx), projectId)).find(
        (m) => m.id === milestoneId,
      );
      if (!existing) throw new Error("delivery_milestone_not_found");
      const now = new Date().toISOString();
      const actor = ctx.impersonation?.actorUserId || ctx.userId || "system";

      let tolerance = 7;
      try {
        const life = await createProjectsLifecycleService().getLifecycle(
          ctx,
          projectId,
        );
        const profile = life?.governanceProfileId
          ? getGovernanceProfile(life.governanceProfileId)
          : undefined;
        if (profile) tolerance = profile.milestoneDateToleranceDays;
      } catch {
        /* default tolerance */
      }

      const nextTarget =
        input.targetDate !== undefined ? input.targetDate : existing.targetDate;
      const dateMoved =
        input.targetDate !== undefined &&
        input.targetDate !== existing.targetDate &&
        Boolean(existing.targetDate || input.targetDate);
      const movedDays = dayDelta(existing.targetDate, nextTarget);
      const baselineSlip =
        existing.baselineDueAt && nextTarget
          ? Math.round(
              (Date.parse(nextTarget) - Date.parse(existing.baselineDueAt)) / 86400000,
            )
          : 0;
      const beyondTolerance =
        dateMoved && (movedDays > tolerance || baselineSlip > tolerance);

      if (beyondTolerance && !input.dateChangeReason?.trim()) {
        throw new Error(
          "delivery_milestone_date_reason_required:Date move beyond governance tolerance requires dateChangeReason (silent reschedule prohibited).",
        );
      }

      let nextStatus = input.status
        ? normalizeMilestoneStatus(input.status)
        : normalizeMilestoneStatus(existing.status);

      if (
        beyondTolerance &&
        baselineSlip > tolerance &&
        isOpenMilestoneStatus(nextStatus) &&
        nextStatus !== "slipped"
      ) {
        nextStatus = "slipped";
      }

      if (nextStatus === "achieved" || input.status === "completed") {
        const evidenceOptional = Boolean(input.evidenceOptional);
        const evidence = (input.achievementEvidence ?? []).map((e) => ({
          type: e.type,
          label: requireText(e.label, "evidence.label"),
          uri: e.uri,
          documentId: e.documentId,
          recordedBy: actor,
          recordedAt: now,
        }));
        if (
          !evidenceOptional &&
          evidence.length === 0 &&
          existing.achievementEvidence.length === 0
        ) {
          throw new Error("delivery_milestone_evidence_required");
        }
        nextStatus = "achieved";
        const ownerUserId =
          input.ownerUserId !== undefined
            ? input.ownerUserId.trim() || undefined
            : (existing.ownerUserId ?? existing.owner);
        const item: ProjectMilestone = Object.freeze({
          ...existing,
          name:
            input.name !== undefined ? requireText(input.name, "name") : existing.name,
          description:
            input.description !== undefined
              ? input.description.trim() || undefined
              : existing.description,
          targetDate: nextTarget,
          owner: ownerUserId,
          ownerUserId,
          status: "achieved",
          confidence: input.confidence ?? existing.confidence,
          failureConsequence:
            input.failureConsequence !== undefined
              ? input.failureConsequence.trim() || undefined
              : existing.failureConsequence,
          exitCriteria:
            input.exitCriteria !== undefined
              ? input.exitCriteria.trim() || undefined
              : existing.exitCriteria,
          baselineDueAt: input.baselineDueAt ?? existing.baselineDueAt,
          sortKey: input.sortKey ?? existing.sortKey,
          dependencyIds: Object.freeze([
            ...(input.dependencyIds ?? existing.dependencyIds),
          ]),
          progressPercent: 100,
          achievementEvidence: Object.freeze(
            evidence.length ? evidence : [...existing.achievementEvidence],
          ),
          varianceDays: varianceDays(
            input.baselineDueAt ?? existing.baselineDueAt,
            nextTarget,
          ),
          updatedAt: now,
        });
        const saved = await store.upsertMilestone(tenant(ctx), item);
        await recordMilestoneHistory(
          ctx,
          projectId,
          saved.id,
          "achieved",
          `Milestone achieved: ${saved.name}`,
        );
        return saved;
      }

      const ownerUserId =
        input.ownerUserId !== undefined
          ? input.ownerUserId.trim() || undefined
          : input.owner !== undefined
            ? input.owner.trim() || undefined
            : (existing.ownerUserId ?? existing.owner);

      const item: ProjectMilestone = Object.freeze({
        ...existing,
        name:
          input.name !== undefined ? requireText(input.name, "name") : existing.name,
        description:
          input.description !== undefined
            ? input.description.trim() || undefined
            : existing.description,
        targetDate: nextTarget,
        owner: ownerUserId,
        ownerUserId,
        status: nextStatus,
        confidence: input.confidence ?? existing.confidence,
        failureConsequence:
          input.failureConsequence !== undefined
            ? input.failureConsequence.trim() || undefined
            : existing.failureConsequence,
        exitCriteria:
          input.exitCriteria !== undefined
            ? input.exitCriteria.trim() || undefined
            : existing.exitCriteria,
        baselineDueAt: input.baselineDueAt ?? existing.baselineDueAt,
        sortKey: input.sortKey ?? existing.sortKey,
        dependencyIds: Object.freeze([
          ...(input.dependencyIds ?? existing.dependencyIds),
        ]),
        progressPercent:
          input.progressPercent !== undefined
            ? Math.min(100, Math.max(0, input.progressPercent))
            : existing.progressPercent,
        achievementEvidence: existing.achievementEvidence,
        varianceDays: varianceDays(
          input.baselineDueAt ?? existing.baselineDueAt,
          nextTarget,
        ),
        updatedAt: now,
      });

      const saved = await store.upsertMilestone(tenant(ctx), item);

      if (beyondTolerance) {
        try {
          await createProjectsOperationalService().openException(ctx, projectId, {
            type: "date_exception",
            severity:
              baselineSlip > tolerance * 2 || movedDays > tolerance * 2
                ? "critical"
                : "major",
            subjectRef: { type: "milestone", id: milestoneId },
            reason:
              input.dateChangeReason?.trim() ||
              `Milestone date moved beyond ${tolerance}d tolerance`,
            impactSummary: `${existing.name}: date ${existing.targetDate?.slice(0, 10) ?? "unset"} → ${nextTarget?.slice(0, 10) ?? "unset"} (baseline variance ${item.varianceDays ?? 0}d).`,
            failureConsequence: saved.failureConsequence,
          });
        } catch {
          /* do not block plan update if exception store unavailable after validation */
        }
      }

      await recordMilestoneHistory(
        ctx,
        projectId,
        saved.id,
        dateMoved ? "date_change" : "updated",
        dateMoved
          ? `Milestone date changed: ${saved.name}`
          : `Milestone updated: ${saved.name}`,
        input.dateChangeReason,
      );

      return saved;
    },

    async listRisks(ctx, projectId) {
      return store.listRisks(tenant(ctx), projectId);
    },

    async createRisk(ctx, projectId, input) {
      const now = new Date().toISOString();
      const item: ProjectRisk = Object.freeze({
        id: id("risk"),
        projectId: projectId as ProjectId,
        title: requireText(input.title, "title"),
        description: requireText(input.description, "description"),
        probability: input.probability,
        impact: input.impact,
        mitigation: requireText(input.mitigation, "mitigation"),
        owner: requireText(input.owner, "owner"),
        reviewDate: input.reviewDate,
        status: input.status ?? "open",
        createdAt: now,
        updatedAt: now,
      });
      return store.upsertRisk(tenant(ctx), item);
    },

    async updateRisk(ctx, projectId, riskId, input) {
      const existing = (await store.listRisks(tenant(ctx), projectId)).find(
        (r) => r.id === riskId,
      );
      if (!existing) throw new Error("delivery_risk_not_found");
      const item: ProjectRisk = Object.freeze({
        ...existing,
        title:
          input.title !== undefined
            ? requireText(input.title, "title")
            : existing.title,
        description:
          input.description !== undefined
            ? requireText(input.description, "description")
            : existing.description,
        probability: input.probability ?? existing.probability,
        impact: input.impact ?? existing.impact,
        mitigation:
          input.mitigation !== undefined
            ? requireText(input.mitigation, "mitigation")
            : existing.mitigation,
        owner:
          input.owner !== undefined
            ? requireText(input.owner, "owner")
            : existing.owner,
        reviewDate: input.reviewDate ?? existing.reviewDate,
        status: input.status ?? existing.status,
        updatedAt: new Date().toISOString(),
      });
      return store.upsertRisk(tenant(ctx), item);
    },

    async listDecisions(ctx, projectId) {
      return store.listDecisions(tenant(ctx), projectId);
    },

    async createDecision(ctx, projectId, input) {
      const now = new Date().toISOString();
      const item: ProjectDecision = Object.freeze({
        id: id("dec"),
        projectId: projectId as ProjectId,
        decision: requireText(input.decision, "decision"),
        rationale: requireText(input.rationale, "rationale"),
        owner: requireText(input.owner, "owner"),
        decidedAt: input.decidedAt ?? now,
        outcome: requireText(input.outcome, "outcome"),
        relatedWork: input.relatedWork?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      });
      return store.upsertDecision(tenant(ctx), item);
    },

    async updateDecision(ctx, projectId, decisionId, input) {
      const existing = (await store.listDecisions(tenant(ctx), projectId)).find(
        (d) => d.id === decisionId,
      );
      if (!existing) throw new Error("delivery_decision_not_found");
      const item: ProjectDecision = Object.freeze({
        ...existing,
        decision:
          input.decision !== undefined
            ? requireText(input.decision, "decision")
            : existing.decision,
        rationale:
          input.rationale !== undefined
            ? requireText(input.rationale, "rationale")
            : existing.rationale,
        owner:
          input.owner !== undefined
            ? requireText(input.owner, "owner")
            : existing.owner,
        decidedAt: input.decidedAt ?? existing.decidedAt,
        outcome:
          input.outcome !== undefined
            ? requireText(input.outcome, "outcome")
            : existing.outcome,
        relatedWork:
          input.relatedWork !== undefined
            ? input.relatedWork.trim() || undefined
            : existing.relatedWork,
        updatedAt: new Date().toISOString(),
      });
      return store.upsertDecision(tenant(ctx), item);
    },

    async listActions(ctx, projectId) {
      return store.listActions(tenant(ctx), projectId);
    },

    async createAction(ctx, projectId, input) {
      const now = new Date().toISOString();
      const item: ProjectActionItem = Object.freeze({
        id: id("act"),
        projectId: projectId as ProjectId,
        title: requireText(input.title, "title"),
        owner: requireText(input.owner, "owner"),
        dueDate: input.dueDate,
        status: input.status ?? "open",
        createdAt: now,
        updatedAt: now,
      });
      return store.upsertAction(tenant(ctx), item);
    },

    async updateAction(ctx, projectId, actionId, input) {
      const existing = (await store.listActions(tenant(ctx), projectId)).find(
        (a) => a.id === actionId,
      );
      if (!existing) throw new Error("delivery_action_not_found");
      const item: ProjectActionItem = Object.freeze({
        ...existing,
        title:
          input.title !== undefined
            ? requireText(input.title, "title")
            : existing.title,
        owner:
          input.owner !== undefined
            ? requireText(input.owner, "owner")
            : existing.owner,
        dueDate: input.dueDate ?? existing.dueDate,
        status: input.status ?? existing.status,
        updatedAt: new Date().toISOString(),
      });
      return store.upsertAction(tenant(ctx), item);
    },

    async getHealth(ctx, projectId) {
      const [milestones, risks, actions] = await Promise.all([
        store.listMilestones(tenant(ctx), projectId),
        store.listRisks(tenant(ctx), projectId),
        store.listActions(tenant(ctx), projectId),
      ]);
      return computeProjectDeliveryHealth({ projectId, milestones, risks, actions });
    },

    async getDashboard(ctx, projectId) {
      const [milestones, risks, decisions, actions] = await Promise.all([
        store.listMilestones(tenant(ctx), projectId),
        store.listRisks(tenant(ctx), projectId),
        store.listDecisions(tenant(ctx), projectId),
        store.listActions(tenant(ctx), projectId),
      ]);
      const health = computeProjectDeliveryHealth({
        projectId,
        milestones,
        risks,
        actions,
      });
      const now = Date.now();
      const openRisks = risks.filter(
        (r) => r.status === "open" || r.status === "mitigating",
      );
      const openActions = actions.filter((a) => a.status === "open");
      const overdueActions = openActions.filter(
        (a) => a.dueDate && Date.parse(a.dueDate) < now,
      );
      const blockers = [
        ...milestones
          .filter(
            (m) =>
              isOpenMilestoneStatus(m.status) &&
              m.targetDate &&
              Date.parse(m.targetDate) < now,
          )
          .map((m) => `Overdue milestone: ${m.name}`),
        ...openRisks
          .filter((r) => r.impact === "critical" || r.probability === "critical")
          .map((r) => `Critical risk: ${r.title}`),
        ...overdueActions.map((a) => `Overdue action: ${a.title}`),
      ];

      return Object.freeze({
        projectId: projectId as ProjectId,
        health,
        milestoneTotal: milestones.length,
        milestoneCompleted: milestones.filter((m) =>
          isAchievedMilestoneStatus(m.status),
        ).length,
        openRisks: openRisks.length,
        criticalRisks: openRisks.filter(
          (r) => r.impact === "critical" || r.probability === "critical",
        ).length,
        openActions: openActions.length,
        overdueActions: overdueActions.length,
        upcomingMilestones: Object.freeze(
          milestones.filter((m) => isOpenMilestoneStatus(m.status)).slice(0, 5),
        ),
        topRisks: Object.freeze(openRisks.slice(0, 5)),
        recentDecisions: Object.freeze(decisions.slice(0, 5)),
        blockers: Object.freeze(blockers.slice(0, 10)),
      });
    },
  };
}
