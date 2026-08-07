import { randomUUID } from "node:crypto";

import type {
  ClosureReadiness,
  GovernanceProfile,
  InitiateProjectInput,
  InitiationReadiness,
  LifecycleTransitionInput,
  LifecycleTransitionRecord,
  ProjectBaseline,
  ProjectLifecycleRecord,
  ProjectLifecycleStage,
  ProjectTemplateSummary,
  ServiceRequestContext,
} from "@apzhub/platform-service-contracts";

import type { ProjectsWorkflowBridge } from "../projects-workflow-bridge";

import {
  getGovernanceProfile,
  getProjectTemplate,
  SYSTEM_GOVERNANCE_PROFILES,
  SYSTEM_PROJECT_TEMPLATES,
  suggestProfileFor,
} from "./catalogue";
import {
  getMemoryProjectsLifecycleStore,
  resolveProjectsLifecycleStore,
  setProjectsLifecycleStoreForTests,
  type ProjectsLifecycleStore,
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

const ALLOWED: Record<ProjectLifecycleStage, readonly ProjectLifecycleStage[]> = {
  draft: ["initiating"],
  initiating: ["active"],
  active: ["on_hold", "closing"],
  on_hold: ["active", "closing"],
  closing: ["closed"],
  closed: ["archived", "active"],
  archived: ["closed"],
};

export type MilestoneCountProvider = {
  countOpenMilestones(ctx: ServiceRequestContext, projectId: string): Promise<number>;
  countOpenRisks(ctx: ServiceRequestContext, projectId: string): Promise<number>;
  countOpenActions(ctx: ServiceRequestContext, projectId: string): Promise<number>;
  countPendingOpsDecisions?(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<number>;
  countOpenCommitments?(ctx: ServiceRequestContext, projectId: string): Promise<number>;
  countOpenMajorExceptions?(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<number>;
  seedFromTemplate?(
    ctx: ServiceRequestContext,
    projectId: string,
    template: ProjectTemplateSummary,
  ): Promise<void>;
};

export type ProjectsLifecycleService = {
  listGovernanceProfiles(): readonly GovernanceProfile[];
  listTemplates(): readonly ProjectTemplateSummary[];
  suggestProfile(classification?: string, deliveryModel?: string): string;
  getLifecycle(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<ProjectLifecycleRecord | null>;
  ensureLifecycle(
    ctx: ServiceRequestContext,
    projectId: string,
    input: InitiateProjectInput,
  ): Promise<ProjectLifecycleRecord>;
  patchLifecycleDraft(
    ctx: ServiceRequestContext,
    projectId: string,
    patch: Partial<InitiateProjectInput> & { wizardStep?: number },
  ): Promise<ProjectLifecycleRecord>;
  evaluateInitiation(
    ctx: ServiceRequestContext,
    projectId: string,
    counts?: { openMilestones: number },
  ): Promise<InitiationReadiness>;
  evaluateClosure(
    ctx: ServiceRequestContext,
    projectId: string,
    counts: {
      openRisks: number;
      openActions: number;
      openMilestones: number;
      pendingOpsDecisions?: number;
      openCommitments?: number;
      openMajorExceptions?: number;
    },
  ): Promise<ClosureReadiness>;
  transition(
    ctx: ServiceRequestContext,
    projectId: string,
    input: LifecycleTransitionInput,
    deps: MilestoneCountProvider,
  ): Promise<ProjectLifecycleRecord>;
  listBaselines(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly ProjectBaseline[]>;
  rebaseline(
    ctx: ServiceRequestContext,
    projectId: string,
    input: {
      targetEndAt?: string;
      successCriteria?: string;
      reason: string;
      milestoneSnapshot?: ProjectBaseline["milestoneSnapshot"];
    },
  ): Promise<ProjectBaseline>;
  listTransitions(
    ctx: ServiceRequestContext,
    projectId: string,
  ): Promise<readonly LifecycleTransitionRecord[]>;
  normalizeLegacyStage(status: string): ProjectLifecycleStage;
};

function requireGap(
  gaps: { code: string; message: string; waivable: boolean }[],
  code: string,
  message: string,
  waivable = false,
) {
  gaps.push({ code, message, waivable });
}

export type CreateProjectsLifecycleServiceOptions = {
  /** Gate P1 — APZ Workflow Bridge. When set, approval gates use Workflow outcomes. */
  readonly workflowBridge?: ProjectsWorkflowBridge;
};

export function createProjectsLifecycleService(
  store: ProjectsLifecycleStore = resolveProjectsLifecycleStore(),
  options: CreateProjectsLifecycleServiceOptions = {},
): ProjectsLifecycleService {
  const bridge = options.workflowBridge;
  return {
    listGovernanceProfiles() {
      return SYSTEM_GOVERNANCE_PROFILES;
    },
    listTemplates() {
      return SYSTEM_PROJECT_TEMPLATES;
    },
    suggestProfile(classification, deliveryModel) {
      return suggestProfileFor(classification, deliveryModel);
    },

    normalizeLegacyStage(status) {
      if (status === "completed") return "closed";
      if (
        status === "draft" ||
        status === "initiating" ||
        status === "active" ||
        status === "on_hold" ||
        status === "closing" ||
        status === "closed" ||
        status === "archived"
      ) {
        return status;
      }
      return "active";
    },

    async getLifecycle(ctx, projectId) {
      return store.getLifecycle(tenant(ctx), projectId);
    },

    async ensureLifecycle(ctx, projectId, input) {
      const existing = await store.getLifecycle(tenant(ctx), projectId);
      if (existing) return existing;
      const now = new Date().toISOString();
      const template = input.templateId
        ? getProjectTemplate(input.templateId)
        : undefined;
      const profileId =
        input.governanceProfileId ??
        template?.governanceProfileId ??
        suggestProfileFor(input.classification, input.deliveryModel);
      const profile = getGovernanceProfile(profileId);
      const stage: ProjectLifecycleStage =
        input.startMode === "initiating" ? "initiating" : "draft";
      const record: ProjectLifecycleRecord = Object.freeze({
        projectId,
        tenantId: tenant(ctx),
        stage,
        classification: input.classification,
        deliveryModel: input.deliveryModel ?? template?.deliveryModel,
        executionCharacteristic: input.executionCharacteristic ?? "unspecified",
        governanceProfileId: profileId,
        governanceProfileVersion: profile?.version,
        templateId: template?.id,
        templateVersion: template?.version,
        ownerUserId: input.ownerUserId,
        programmeId: input.programmeId,
        customerLabel: input.customerLabel,
        targetEndAt: input.targetEndAt,
        successCriteria: input.successCriteria,
        nextMilestoneIntent: input.nextMilestoneIntent,
        continuousDeliveryWaiver: Boolean(input.continuousDeliveryWaiver),
        milestoneFreeWaiver: Boolean(input.milestoneFreeWaiver),
        coreTeamUserIds: Object.freeze([...(input.coreTeamUserIds ?? [])]),
        wizardStep: input.startMode === "draft" ? 1 : 8,
        createdAt: now,
        updatedAt: now,
      });
      return store.upsertLifecycle(tenant(ctx), record);
    },

    async patchLifecycleDraft(ctx, projectId, patch) {
      const current = await store.getLifecycle(tenant(ctx), projectId);
      if (!current) throw new Error("lifecycle_not_found");
      if (current.stage !== "draft" && current.stage !== "initiating") {
        throw new Error("lifecycle_patch_only_before_active");
      }
      const template = patch.templateId
        ? getProjectTemplate(patch.templateId)
        : current.templateId
          ? getProjectTemplate(current.templateId)
          : undefined;
      const profileId =
        patch.governanceProfileId ??
        current.governanceProfileId ??
        template?.governanceProfileId;
      const profile = profileId ? getGovernanceProfile(profileId) : undefined;
      const next: ProjectLifecycleRecord = Object.freeze({
        ...current,
        classification: patch.classification ?? current.classification,
        deliveryModel:
          patch.deliveryModel ?? current.deliveryModel ?? template?.deliveryModel,
        executionCharacteristic:
          patch.executionCharacteristic ?? current.executionCharacteristic,
        governanceProfileId: profileId,
        governanceProfileVersion: profile?.version ?? current.governanceProfileVersion,
        templateId: patch.templateId ?? current.templateId,
        templateVersion: template?.version ?? current.templateVersion,
        ownerUserId: patch.ownerUserId ?? current.ownerUserId,
        programmeId: patch.programmeId ?? current.programmeId,
        customerLabel: patch.customerLabel ?? current.customerLabel,
        targetEndAt: patch.targetEndAt ?? current.targetEndAt,
        successCriteria: patch.successCriteria ?? current.successCriteria,
        nextMilestoneIntent: patch.nextMilestoneIntent ?? current.nextMilestoneIntent,
        continuousDeliveryWaiver:
          patch.continuousDeliveryWaiver ?? current.continuousDeliveryWaiver,
        milestoneFreeWaiver: patch.milestoneFreeWaiver ?? current.milestoneFreeWaiver,
        coreTeamUserIds: Object.freeze([
          ...(patch.coreTeamUserIds ?? current.coreTeamUserIds),
        ]),
        wizardStep: patch.wizardStep ?? current.wizardStep,
        updatedAt: new Date().toISOString(),
      });
      return store.upsertLifecycle(tenant(ctx), next);
    },

    async evaluateInitiation(ctx, projectId, counts) {
      const life = await store.getLifecycle(tenant(ctx), projectId);
      const gaps: InitiationReadiness["gaps"][number][] = [];
      if (!life) {
        requireGap(gaps, "lifecycle_missing", "Lifecycle record missing.");
        return { ready: false, gaps };
      }
      if (!life.ownerUserId) {
        requireGap(gaps, "owner_required", "Project owner is required.");
      }
      if (!life.classification) {
        requireGap(gaps, "classification_required", "Classification is mandatory.");
      }
      if (!life.deliveryModel) {
        requireGap(gaps, "delivery_model_required", "Delivery model is required.");
      }
      if (!life.governanceProfileId) {
        requireGap(
          gaps,
          "governance_profile_required",
          "Governance profile is required.",
        );
      }
      const profile = life.governanceProfileId
        ? getGovernanceProfile(life.governanceProfileId)
        : undefined;
      const needsMilestone =
        profile?.initiationRequiresMilestone !== false && !life.milestoneFreeWaiver;
      if (
        needsMilestone &&
        (counts?.openMilestones ?? 0) < 1 &&
        !life.nextMilestoneIntent
      ) {
        requireGap(
          gaps,
          "milestone_required",
          "At least one milestone (or milestone-free waiver) is required.",
          true,
        );
      }
      const continuous =
        life.deliveryModel === "product_delivery" || life.continuousDeliveryWaiver;
      if (!life.targetEndAt && !continuous) {
        requireGap(
          gaps,
          "target_end_required",
          "Target end date is required unless continuous delivery waiver applies.",
          true,
        );
      }
      if (!life.activeBaselineId) {
        // Baseline created during transition — flag as pending capture
        requireGap(
          gaps,
          "baseline_pending",
          "Initial baseline will be captured on transition to Active.",
          false,
        );
      }
      // baseline_pending is informational for UI; transition creates it — filter for ready check
      const blocking = gaps.filter((g) => g.code !== "baseline_pending");
      return { ready: blocking.length === 0, gaps };
    },

    async evaluateClosure(ctx, projectId, counts) {
      const life = await store.getLifecycle(tenant(ctx), projectId);
      const gaps: ClosureReadiness["gaps"][number][] = [];
      if (!life) {
        requireGap(gaps, "lifecycle_missing", "Lifecycle record missing.");
        return { ready: false, gaps };
      }
      if (!life.closureOutcome) {
        requireGap(gaps, "outcome_required", "Closure outcome type is required.");
      }
      if (!life.closureSummary?.trim()) {
        requireGap(gaps, "summary_required", "Closure summary is required.");
      }
      const waivers = await store.listWaivers(tenant(ctx), projectId);
      const waived = (key: string) => waivers.some((w) => w.policyKey === key);
      if (counts.openActions > 0 && !waived("open_actions")) {
        requireGap(
          gaps,
          "open_actions",
          `${counts.openActions} open action(s) must be resolved or waived.`,
          true,
        );
      }
      if (counts.openRisks > 0 && !waived("open_risks")) {
        requireGap(
          gaps,
          "open_risks",
          `${counts.openRisks} open risk(s) must be closed, accepted, or waived.`,
          true,
        );
      }
      if (counts.openMilestones > 0 && !waived("open_milestones")) {
        requireGap(
          gaps,
          "open_milestones",
          `${counts.openMilestones} open milestone(s) must be achieved, cancelled, or waived.`,
          true,
        );
      }
      if ((counts.pendingOpsDecisions ?? 0) > 0 && !waived("open_decisions")) {
        requireGap(
          gaps,
          "open_decisions",
          `${counts.pendingOpsDecisions} outstanding operational Decision(s) must be decided, cancelled, or waived.`,
          true,
        );
      }
      if ((counts.openCommitments ?? 0) > 0 && !waived("open_commitments")) {
        requireGap(
          gaps,
          "open_commitments",
          `${counts.openCommitments} open Commitment(s) must be done, cancelled, or waived.`,
          true,
        );
      }
      if ((counts.openMajorExceptions ?? 0) > 0 && !waived("open_exceptions")) {
        requireGap(
          gaps,
          "open_exceptions",
          `${counts.openMajorExceptions} open Major/Critical Exception(s) must be concluded or waived.`,
          true,
        );
      }
      const profile = life.governanceProfileId
        ? getGovernanceProfile(life.governanceProfileId)
        : undefined;
      if (profile?.requiresEvidenceOnClose && !waived("closure_evidence")) {
        requireGap(
          gaps,
          "closure_evidence",
          "Closure evidence is required by governance profile (or waive).",
          true,
        );
      }
      if (profile?.requiresClosureApproval) {
        const approved = bridge
          ? await bridge.hasApproved(
              ctx,
              projectId,
              "closure_approval",
              "project",
              projectId,
            )
          : false;
        if (!approved && !waived("closure_approval")) {
          if (bridge) {
            await bridge.requestApproval(ctx, {
              kind: "closure_approval",
              projectId,
              subjectType: "project",
              subjectId: projectId,
              title: "Approve project closure",
            });
          }
          requireGap(
            gaps,
            "closure_approval",
            bridge
              ? "Closure approval required via APZ Workflow (Projects consumes Workflow outcome)."
              : "Closure approval required — APZ Workflow Bridge not configured.",
            // Temporary waiver retained only as emergency escape; not the production path.
            !bridge,
          );
        }
      }
      return { ready: gaps.length === 0, gaps };
    },

    async transition(ctx, projectId, input, deps) {
      const life = await store.getLifecycle(tenant(ctx), projectId);
      if (!life) throw new Error("lifecycle_not_found");
      const from = life.stage;
      const to = input.to;
      if (!ALLOWED[from]?.includes(to)) {
        throw new Error(`lifecycle_transition_illegal:${from}->${to}`);
      }

      // Apply waivers first
      for (const w of input.waivers ?? []) {
        if (!w.reason?.trim()) throw new Error("waiver_reason_required");
        await store.addWaiver(tenant(ctx), {
          id: id("waiver"),
          projectId,
          policyKey: w.policyKey,
          reason: w.reason.trim(),
          authorisedBy: actor(ctx),
          at: new Date().toISOString(),
        });
      }

      let next: ProjectLifecycleRecord = { ...life };

      if (from === "draft" && to === "initiating") {
        if (!life.governanceProfileId) throw new Error("governance_profile_required");
        if (!life.templateId && life.templateId !== undefined) {
          /* blank template id allowed if explicitly blank template */
        }
        const template = life.templateId
          ? getProjectTemplate(life.templateId)
          : getProjectTemplate("ptpl_blank");
        if (template && deps.seedFromTemplate) {
          await deps.seedFromTemplate(ctx, projectId, template);
        }
      }

      if (
        to === "active" &&
        (from === "initiating" || from === "on_hold" || from === "closed")
      ) {
        if (from === "initiating") {
          const openMilestones = await deps.countOpenMilestones(ctx, projectId);
          const readiness = await this.evaluateInitiation(ctx, projectId, {
            openMilestones,
          });
          const blocking = readiness.gaps.filter((g) => g.code !== "baseline_pending");
          if (blocking.length > 0) {
            throw new Error(
              `initiation_gate_failed:${blocking.map((g) => g.code).join(",")}`,
            );
          }
          // Capture Initial Baseline (immutable)
          const baselines = await store.listBaselines(tenant(ctx), projectId);
          if (!baselines.some((b) => b.kind === "initial")) {
            const baseline: ProjectBaseline = Object.freeze({
              id: id("base"),
              projectId,
              version: 1,
              kind: "initial" as const,
              targetEndAt: life.targetEndAt,
              successCriteria: life.successCriteria,
              milestoneSnapshot: Object.freeze([
                ...(life.nextMilestoneIntent
                  ? [{ name: life.nextMilestoneIntent, targetDate: life.targetEndAt }]
                  : []),
              ]),
              createdAt: new Date().toISOString(),
              createdBy: actor(ctx),
            });
            await store.addBaseline(tenant(ctx), baseline);
            next = { ...next, activeBaselineId: baseline.id };
          }
        }
        if (from === "on_hold" && !input.reason?.trim()) {
          throw new Error("hold_clearance_reason_required");
        }
        if (from === "closed" && !input.reason?.trim()) {
          throw new Error("reopen_reason_required");
        }
        next = { ...next, holdReason: undefined };
      }

      if (to === "on_hold") {
        if (!input.reason?.trim()) throw new Error("hold_reason_required");
        const profile = life.governanceProfileId
          ? getGovernanceProfile(life.governanceProfileId)
          : undefined;
        if (profile?.requiresHoldDecision) {
          const subjectId = `${from}->on_hold`;
          const holdApproved = bridge
            ? await bridge.hasApproved(
                ctx,
                projectId,
                "hold_approval",
                "lifecycle_transition",
                subjectId,
              )
            : false;
          if (!holdApproved && !input.decisionId) {
            if (bridge) {
              await bridge.requestApproval(ctx, {
                kind: "hold_approval",
                projectId,
                subjectType: "lifecycle_transition",
                subjectId,
                title: "Approve project hold",
                reason: input.reason?.trim(),
              });
              throw new Error("hold_approval_required");
            }
            throw new Error("hold_decision_required");
          }
        }
        next = { ...next, holdReason: input.reason.trim() };
      }

      if (to === "closing") {
        if (!input.outcome) throw new Error("closure_outcome_required");
        if (!input.closureSummary?.trim()) throw new Error("closure_summary_required");
        next = {
          ...next,
          closureOutcome: input.outcome,
          closureSummary: input.closureSummary.trim(),
        };
      }

      if (to === "closed") {
        const counts = {
          openRisks: await deps.countOpenRisks(ctx, projectId),
          openActions: await deps.countOpenActions(ctx, projectId),
          openMilestones: await deps.countOpenMilestones(ctx, projectId),
          pendingOpsDecisions: deps.countPendingOpsDecisions
            ? await deps.countPendingOpsDecisions(ctx, projectId)
            : 0,
          openCommitments: deps.countOpenCommitments
            ? await deps.countOpenCommitments(ctx, projectId)
            : 0,
          openMajorExceptions: deps.countOpenMajorExceptions
            ? await deps.countOpenMajorExceptions(ctx, projectId)
            : 0,
        };
        // Refresh closure fields if provided
        if (input.outcome) next = { ...next, closureOutcome: input.outcome };
        if (input.closureSummary) {
          next = { ...next, closureSummary: input.closureSummary.trim() };
        }
        await store.upsertLifecycle(tenant(ctx), {
          ...next,
          updatedAt: new Date().toISOString(),
        });
        const readiness = await this.evaluateClosure(ctx, projectId, counts);
        if (!readiness.ready) {
          throw new Error(
            `closure_gate_failed:${readiness.gaps.map((g) => g.code).join(",")}`,
          );
        }
      }

      if (to === "archived" && from !== "closed") {
        throw new Error("archive_only_from_closed");
      }

      if (from === "archived" && to !== "closed") {
        throw new Error("restore_only_to_closed");
      }

      if (input.rebaseline) {
        await this.rebaseline(ctx, projectId, {
          ...input.rebaseline,
          milestoneSnapshot: input.rebaseline
            ? [{ name: "Re-baseline marker" }]
            : undefined,
        });
      }

      const now = new Date().toISOString();
      next = Object.freeze({
        ...next,
        stage: to,
        updatedAt: now,
      });
      await store.upsertLifecycle(tenant(ctx), next);

      const transition: LifecycleTransitionRecord = Object.freeze({
        id: id("ltrx"),
        projectId,
        from,
        to,
        reason: input.reason,
        outcome: input.outcome,
        actorUserId: actor(ctx),
        at: now,
        auditNote: `Lifecycle ${from} → ${to}`,
      });
      await store.addTransition(tenant(ctx), transition);
      return next;
    },

    async listBaselines(ctx, projectId) {
      return store.listBaselines(tenant(ctx), projectId);
    },

    async rebaseline(ctx, projectId, input) {
      if (!input.reason?.trim()) throw new Error("rebaseline_reason_required");
      const life = await store.getLifecycle(tenant(ctx), projectId);
      if (!life) throw new Error("lifecycle_not_found");
      if (life.stage === "draft" || life.stage === "archived") {
        throw new Error("rebaseline_stage_illegal");
      }
      const existing = await store.listBaselines(tenant(ctx), projectId);
      const version = existing.length + 1;
      const profile = life.governanceProfileId
        ? getGovernanceProfile(life.governanceProfileId)
        : undefined;
      // Governance approval via Workflow when profile is control-heavy (closure approval flag).
      if (profile?.requiresClosureApproval && bridge && version > 1) {
        const subjectId = `pending_v${version}`;
        const approved = await bridge.hasApproved(
          ctx,
          projectId,
          "governance_approval",
          "baseline",
          subjectId,
        );
        if (!approved) {
          await bridge.requestApproval(ctx, {
            kind: "governance_approval",
            projectId,
            subjectType: "baseline",
            subjectId,
            title: `Approve re-baseline v${version}`,
            reason: input.reason.trim(),
          });
          throw new Error("governance_approval_required");
        }
      }
      const baseline: ProjectBaseline = Object.freeze({
        id: id("base"),
        projectId,
        version,
        kind: version === 1 ? ("initial" as const) : ("rebaseline" as const),
        targetEndAt: input.targetEndAt ?? life.targetEndAt,
        successCriteria: input.successCriteria ?? life.successCriteria,
        milestoneSnapshot: Object.freeze([...(input.milestoneSnapshot ?? [])]),
        reason: input.reason.trim(),
        approvedBy: actor(ctx),
        createdAt: new Date().toISOString(),
        createdBy: actor(ctx),
      });
      await store.addBaseline(tenant(ctx), baseline);
      await store.upsertLifecycle(tenant(ctx), {
        ...life,
        activeBaselineId: baseline.id,
        targetEndAt: baseline.targetEndAt,
        successCriteria: baseline.successCriteria,
        updatedAt: new Date().toISOString(),
      });
      return baseline;
    },

    async listTransitions(ctx, projectId) {
      return store.listTransitions(tenant(ctx), projectId);
    },
  };
}

export {
  getMemoryProjectsLifecycleStore,
  setProjectsLifecycleStoreForTests,
  resolveProjectsLifecycleStore,
};
