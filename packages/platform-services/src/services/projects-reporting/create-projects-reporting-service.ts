/**
 * W008 / PX-05 — Operational Reporting Platform Service.
 */

import { randomUUID } from "node:crypto";

import type {
  CompleteOperationalReviewInput,
  CreateOperationalReviewInput,
  CreateReviewScheduleInput,
  ExecutiveSummary,
  MetricDrillTarget,
  OperationalReportResult,
  OperationalReview,
  ReportCatalogueKey,
  ReportDefinition,
  ReportRow,
  ReviewPackSnapshot,
  ReviewSchedule,
  ReviewScopeType,
  ServiceRequestContext,
  UpdateExecutiveSummaryInput,
} from "@apzhub/platform-service-contracts";

import { listReportDefinitions, REPORT_DEFINITIONS } from "./report-catalogue";
import {
  resolveProjectsReportingStore,
  type ProjectsReportingStore,
} from "./memory-store";

function id(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

function tenant(ctx: ServiceRequestContext) {
  return ctx.tenantId ?? "default";
}

function now() {
  return new Date().toISOString();
}

function requireText(value: string | undefined, field: string): string {
  const t = value?.trim() ?? "";
  if (!t) throw new Error(`${field}_required`);
  return t;
}

export type ReportingEvidence = {
  readonly openCriticalExceptions?: number;
  readonly openMajorExceptions?: number;
  readonly openMinorExceptions?: number;
  readonly closedExceptionsInPeriod?: number;
  readonly pendingDecisions?: number;
  readonly avgDecisionAgeDays?: number;
  readonly activeWaits?: number;
  readonly agedWaits?: number;
  readonly healthStatus?: string;
  readonly confidenceScore?: number;
  readonly confidenceBand?: string;
  readonly accountabilityGapCount?: number;
  readonly forecast?: ReviewPackSnapshot["forecast"];
  readonly exceptionRows?: readonly ReportRow[];
  readonly decisionRows?: readonly ReportRow[];
  readonly waitingRows?: readonly ReportRow[];
  readonly varianceRows?: readonly ReportRow[];
  readonly checkpointRows?: readonly ReportRow[];
  readonly capacityRows?: readonly ReportRow[];
  readonly objectiveRows?: readonly ReportRow[];
  readonly accountabilityRows?: readonly ReportRow[];
  readonly trendRows?: readonly ReportRow[];
};

export type ReportingEvidenceLoader = (
  ctx: ServiceRequestContext,
  scopeType: ReviewScopeType,
  scopeId: string,
) => Promise<ReportingEvidence>;

export type ProjectsReportingService = {
  readonly listReportCatalogue: () => readonly ReportDefinition[];
  readonly runReport: (
    ctx: ServiceRequestContext,
    key: ReportCatalogueKey,
    scopeType: ReviewScopeType,
    scopeId: string,
  ) => Promise<OperationalReportResult>;
  readonly listReviews: (
    ctx: ServiceRequestContext,
    filter?: { scopeType?: string; scopeId?: string; status?: string },
  ) => Promise<readonly OperationalReview[]>;
  readonly getReview: (
    ctx: ServiceRequestContext,
    reviewId: string,
  ) => Promise<OperationalReview | null>;
  readonly createReview: (
    ctx: ServiceRequestContext,
    input: CreateOperationalReviewInput,
  ) => Promise<OperationalReview>;
  readonly startReview: (
    ctx: ServiceRequestContext,
    reviewId: string,
  ) => Promise<{
    readonly review: OperationalReview;
    readonly snapshot: ReviewPackSnapshot;
    readonly summary: ExecutiveSummary;
  }>;
  readonly updateExecutiveSummary: (
    ctx: ServiceRequestContext,
    reviewId: string,
    input: UpdateExecutiveSummaryInput,
  ) => Promise<ExecutiveSummary>;
  readonly getExecutiveSummary: (
    ctx: ServiceRequestContext,
    reviewId: string,
  ) => Promise<ExecutiveSummary | null>;
  readonly getSnapshot: (
    ctx: ServiceRequestContext,
    reviewId: string,
  ) => Promise<ReviewPackSnapshot | null>;
  readonly completeReview: (
    ctx: ServiceRequestContext,
    reviewId: string,
    input: CompleteOperationalReviewInput,
  ) => Promise<OperationalReview>;
  readonly listSchedules: (
    ctx: ServiceRequestContext,
    filter?: { scopeType?: string; scopeId?: string },
  ) => Promise<readonly ReviewSchedule[]>;
  readonly createSchedule: (
    ctx: ServiceRequestContext,
    input: CreateReviewScheduleInput,
  ) => Promise<ReviewSchedule>;
};

function defaultDrill(
  scopeType: ReviewScopeType,
  scopeId: string,
  objectType: string,
): MetricDrillTarget {
  if (scopeType === "project") {
    return {
      label: `Open ${objectType}`,
      objectType,
      href: `/workspace/projects/${scopeId}/control`,
    };
  }
  if (scopeType === "programme") {
    return {
      label: `Open ${objectType}`,
      objectType,
      href: `/workspace/projects/portfolio/programmes/${scopeId}`,
    };
  }
  return {
    label: `Open ${objectType}`,
    objectType,
    href: `/workspace/projects/portfolio`,
  };
}

function composeExecutiveSummary(
  reviewId: string,
  snapshot: ReviewPackSnapshot,
  editable: boolean,
): ExecutiveSummary {
  const ts = now();
  return Object.freeze({
    id: id("esum"),
    reviewId,
    currentPosition: `Health ${snapshot.metrics.find((m) => m.key === "health")?.value ?? "—"} · Confidence ${snapshot.metrics.find((m) => m.key === "confidence")?.value ?? "—"}. Open critical exceptions: ${snapshot.exceptionSummary.openCritical}.`,
    keyChanges: `Pending decisions: ${snapshot.decisionSummary.pending}. Aged waits: ${snapshot.waitingSummary.aged}. Accountability gaps: ${snapshot.accountabilityGapCount}.`,
    principalRisks:
      snapshot.exceptionSummary.openCritical + snapshot.exceptionSummary.openMajor > 0
        ? `Open major/critical exceptions require attention (${snapshot.exceptionSummary.openCritical} critical · ${snapshot.exceptionSummary.openMajor} major).`
        : "No open major or critical exceptions in pack.",
    decisionsRequired:
      snapshot.decisionSummary.pending > 0
        ? `${snapshot.decisionSummary.pending} decision(s) pending (avg age ${snapshot.decisionSummary.avgAgeDays}d).`
        : "No pending decisions requiring resolution.",
    recommendedActions:
      snapshot.recommendedActions.length > 0
        ? snapshot.recommendedActions.join("; ")
        : "Continue cadence; maintain accountability coverage.",
    editable,
    updatedAt: ts,
  });
}

export function createProjectsReportingService(
  store: ProjectsReportingStore = resolveProjectsReportingStore(),
  options: { readonly loadEvidence?: ReportingEvidenceLoader } = {},
): ProjectsReportingService {
  async function evidence(
    ctx: ServiceRequestContext,
    scopeType: ReviewScopeType,
    scopeId: string,
  ): Promise<ReportingEvidence> {
    if (options.loadEvidence) return options.loadEvidence(ctx, scopeType, scopeId);
    return {
      openCriticalExceptions: 0,
      openMajorExceptions: 0,
      openMinorExceptions: 0,
      closedExceptionsInPeriod: 0,
      pendingDecisions: 0,
      avgDecisionAgeDays: 0,
      activeWaits: 0,
      agedWaits: 0,
      healthStatus: "green",
      confidenceScore: 70,
      confidenceBand: "Medium",
      accountabilityGapCount: 0,
      forecast: {
        windowDays: 14,
        predictedOutcome: "on_track",
        confidenceLevel: "medium",
        contributingFactors: Object.freeze(["Stable commitments"]),
        recommendedActions: Object.freeze(["Maintain weekly review cadence"]),
      },
    };
  }

  async function buildSnapshot(
    ctx: ServiceRequestContext,
    review: OperationalReview,
  ): Promise<ReviewPackSnapshot> {
    const e = await evidence(ctx, review.scopeType, review.scopeId);
    const drill = (objectType: string, objectId?: string) => {
      const base = defaultDrill(review.scopeType, review.scopeId, objectType);
      return objectId
        ? {
            ...base,
            objectId,
            href:
              review.scopeType === "project"
                ? `/workspace/projects/${review.scopeId}/delivery?obj=${objectType}:${objectId}`
                : base.href,
          }
        : base;
    };
    const recommended = [
      ...(e.forecast?.recommendedActions ?? []),
      ...(e.openCriticalExceptions ? ["Conclude or escalate critical exceptions"] : []),
      ...(e.accountabilityGapCount
        ? ["Close accountability gaps before next cadence"]
        : []),
    ];
    return Object.freeze({
      id: id("rpack"),
      reviewId: review.id,
      asOf: now(),
      correlationId: ctx.correlationId ?? id("corr"),
      metrics: Object.freeze([
        {
          key: "health",
          label: "Health",
          value: e.healthStatus ?? "—",
          howCalculated: "Operational health band from delivery engines (W004)",
          drill: drill("exception"),
        },
        {
          key: "confidence",
          label: "Confidence",
          value: `${e.confidenceScore ?? 0} · ${e.confidenceBand ?? "—"}`,
          howCalculated: "Weighted delivery confidence factors (W004/W005)",
          drill: drill("commitment"),
        },
        {
          key: "exceptions_open",
          label: "Open exceptions",
          value:
            (e.openCriticalExceptions ?? 0) +
            (e.openMajorExceptions ?? 0) +
            (e.openMinorExceptions ?? 0),
          howCalculated: "Count of non-concluded exceptions by severity",
          drill: drill("exception"),
        },
        {
          key: "decisions_pending",
          label: "Pending decisions",
          value: e.pendingDecisions ?? 0,
          howCalculated: "Pending operational decisions in scope",
          drill: drill("decision"),
        },
        {
          key: "waits_aged",
          label: "Aged waits",
          value: e.agedWaits ?? 0,
          howCalculated: "Active waits beyond SLA days",
          drill: drill("waiting"),
        },
      ]),
      exceptionSummary: {
        openCritical: e.openCriticalExceptions ?? 0,
        openMajor: e.openMajorExceptions ?? 0,
        openMinor: e.openMinorExceptions ?? 0,
        closedInPeriod: e.closedExceptionsInPeriod ?? 0,
      },
      decisionSummary: {
        pending: e.pendingDecisions ?? 0,
        avgAgeDays: e.avgDecisionAgeDays ?? 0,
      },
      waitingSummary: {
        active: e.activeWaits ?? 0,
        aged: e.agedWaits ?? 0,
      },
      forecast: e.forecast,
      accountabilityGapCount: e.accountabilityGapCount ?? 0,
      recommendedActions: Object.freeze(recommended),
    });
  }

  return {
    listReportCatalogue() {
      return listReportDefinitions();
    },

    async runReport(ctx, key, scopeType, scopeId) {
      const definition = REPORT_DEFINITIONS[key];
      if (!definition) throw new Error("report_not_found");
      const e = await evidence(ctx, scopeType, scopeId);
      const drillBase = defaultDrill(scopeType, scopeId, "project");
      let rows: ReportRow[] = [];
      switch (key) {
        case "exceptions":
          rows = [...(e.exceptionRows ?? [])];
          if (rows.length === 0) {
            rows = [
              {
                id: "ex_summary",
                label: "Open exceptions",
                values: {
                  critical: e.openCriticalExceptions ?? 0,
                  major: e.openMajorExceptions ?? 0,
                  minor: e.openMinorExceptions ?? 0,
                },
                drill: { ...drillBase, objectType: "exception", label: "Exceptions" },
              },
            ];
          }
          break;
        case "decision_latency":
          rows = [...(e.decisionRows ?? [])];
          if (rows.length === 0) {
            rows = [
              {
                id: "dec_summary",
                label: "Pending decisions",
                values: {
                  pending: e.pendingDecisions ?? 0,
                  avgAgeDays: e.avgDecisionAgeDays ?? 0,
                },
                drill: { ...drillBase, objectType: "decision", label: "Decisions" },
              },
            ];
          }
          break;
        case "baseline_variance":
          rows = [...(e.varianceRows ?? [])];
          break;
        case "forecast":
          rows = [
            {
              id: "fc_1",
              label: "Forecast outlook",
              values: {
                windowDays: e.forecast?.windowDays ?? 14,
                outcome: e.forecast?.predictedOutcome ?? "unknown",
                confidence: e.forecast?.confidenceLevel ?? "unknown",
                factors: (e.forecast?.contributingFactors ?? []).join("; "),
                actions: (e.forecast?.recommendedActions ?? []).join("; "),
              },
              drill: {
                ...drillBase,
                objectType: "forecast",
                label: "Forecast factors",
              },
            },
          ];
          break;
        case "trend":
          rows = [...(e.trendRows ?? [])];
          if (rows.length === 0) {
            rows = [
              {
                id: "trend_1",
                label: "Period deltas",
                values: {
                  health: e.healthStatus ?? "—",
                  confidence: e.confidenceScore ?? 0,
                  exceptions:
                    (e.openCriticalExceptions ?? 0) + (e.openMajorExceptions ?? 0),
                  agedWaits: e.agedWaits ?? 0,
                },
                drill: { ...drillBase, objectType: "scorecard", label: "Scorecard" },
              },
            ];
          }
          break;
        case "waiting_ageing":
          rows = [...(e.waitingRows ?? [])];
          if (rows.length === 0) {
            rows = [
              {
                id: "wait_summary",
                label: "Waiting ageing",
                values: {
                  active: e.activeWaits ?? 0,
                  aged: e.agedWaits ?? 0,
                },
                drill: { ...drillBase, objectType: "waiting", label: "Waiting" },
              },
            ];
          }
          break;
        case "governance_checkpoints":
          rows = [...(e.checkpointRows ?? [])];
          break;
        case "delivery_capacity":
          rows = [...(e.capacityRows ?? [])];
          break;
        case "strategic_objective_progress":
          rows = [...(e.objectiveRows ?? [])];
          break;
        case "accountability_gaps":
          rows = [...(e.accountabilityRows ?? [])];
          if (rows.length === 0) {
            rows = [
              {
                id: "gap_summary",
                label: "Accountability gaps",
                values: { gaps: e.accountabilityGapCount ?? 0 },
                drill: {
                  ...drillBase,
                  objectType: "responsibility",
                  label: "Responsibility Matrix",
                  href:
                    scopeType === "project"
                      ? `/workspace/projects/${scopeId}/control`
                      : drillBase.href,
                },
              },
            ];
          }
          break;
      }
      return {
        key,
        definition,
        asOf: now(),
        scopeType,
        scopeId,
        rows: Object.freeze(rows),
        summary: definition.question,
      };
    },

    listReviews(ctx, filter) {
      return store.listReviews(tenant(ctx), filter);
    },

    getReview(ctx, reviewId) {
      return store.getReview(tenant(ctx), reviewId);
    },

    async createReview(ctx, input) {
      const ts = now();
      const row: OperationalReview = Object.freeze({
        id: id("orev"),
        type: input.type,
        scopeType: input.scopeType,
        scopeId: requireText(input.scopeId, "scopeId"),
        periodFrom: requireText(input.periodFrom, "periodFrom"),
        periodTo: requireText(input.periodTo, "periodTo"),
        status: "scheduled",
        chairPrincipalId: requireText(input.chairPrincipalId, "chairPrincipalId"),
        attendeePrincipalIds: Object.freeze([...(input.attendeePrincipalIds ?? [])]),
        agenda: Object.freeze([
          ...(input.agenda ?? [
            "Health & Confidence",
            "Exceptions",
            "Decisions",
            "Forecast",
            "Outcomes",
          ]),
        ]),
        meetingOutcomeId: input.meetingOutcomeId,
        createdAt: ts,
        updatedAt: ts,
      });
      const saved = await store.upsertReview(tenant(ctx), row);
      await store.publishEvent(tenant(ctx), "projects.review_scheduled", {
        reviewId: saved.id,
        scopeType: saved.scopeType,
        scopeId: saved.scopeId,
      });
      return saved;
    },

    async startReview(ctx, reviewId) {
      const review = await store.getReview(tenant(ctx), reviewId);
      if (!review) throw new Error("review_not_found");
      if (review.status === "completed") throw new Error("review_immutable");
      const snapshot = await buildSnapshot(ctx, review);
      await store.upsertSnapshot(tenant(ctx), snapshot);
      const summary = composeExecutiveSummary(review.id, snapshot, true);
      await store.upsertSummary(tenant(ctx), summary);
      const next = await store.upsertReview(tenant(ctx), {
        ...review,
        status: "in_progress",
        packSnapshotId: snapshot.id,
        executiveSummaryId: summary.id,
        updatedAt: now(),
      });
      await store.publishEvent(tenant(ctx), "projects.review_pack_ready", {
        reviewId,
        packSnapshotId: snapshot.id,
      });
      return { review: next, snapshot, summary };
    },

    async updateExecutiveSummary(ctx, reviewId, input) {
      const review = await store.getReview(tenant(ctx), reviewId);
      if (!review) throw new Error("review_not_found");
      if (review.status === "completed") throw new Error("review_immutable");
      if (!review.executiveSummaryId) throw new Error("summary_not_found");
      const current = await store.getSummary(tenant(ctx), review.executiveSummaryId);
      if (!current) throw new Error("summary_not_found");
      if (!current.editable) throw new Error("summary_frozen");
      return store.upsertSummary(tenant(ctx), {
        ...current,
        currentPosition: input.currentPosition ?? current.currentPosition,
        keyChanges: input.keyChanges ?? current.keyChanges,
        principalRisks: input.principalRisks ?? current.principalRisks,
        decisionsRequired: input.decisionsRequired ?? current.decisionsRequired,
        recommendedActions: input.recommendedActions ?? current.recommendedActions,
        updatedAt: now(),
      });
    },

    async getExecutiveSummary(ctx, reviewId) {
      const review = await store.getReview(tenant(ctx), reviewId);
      if (!review?.executiveSummaryId) return null;
      return store.getSummary(tenant(ctx), review.executiveSummaryId);
    },

    async getSnapshot(ctx, reviewId) {
      const review = await store.getReview(tenant(ctx), reviewId);
      if (!review?.packSnapshotId) return null;
      return store.getSnapshot(tenant(ctx), review.packSnapshotId);
    },

    async completeReview(ctx, reviewId, input) {
      const review = await store.getReview(tenant(ctx), reviewId);
      if (!review) throw new Error("review_not_found");
      if (review.status === "completed") throw new Error("review_immutable");
      if (!input.outcomes?.followUpReviewAt) {
        throw new Error("follow_up_review_required");
      }
      if (!input.outcomes.emptyCategoriesAttested) {
        throw new Error("outcomes_attestation_required");
      }
      const ts = now();
      if (review.executiveSummaryId) {
        const summary = await store.getSummary(tenant(ctx), review.executiveSummaryId);
        if (summary) {
          await store.upsertSummary(tenant(ctx), {
            ...summary,
            ...input.executiveSummaryEdits,
            editable: false,
            updatedAt: ts,
          });
        }
      }
      const next = await store.upsertReview(tenant(ctx), {
        ...review,
        status: "completed",
        outcomes: Object.freeze({
          ...input.outcomes,
          decisions: Object.freeze([...input.outcomes.decisions]),
          newCommitments: Object.freeze([...input.outcomes.newCommitments]),
          risksRaised: Object.freeze([...input.outcomes.risksRaised]),
          risksClosed: Object.freeze([...input.outcomes.risksClosed]),
          exceptionsRaised: Object.freeze([...input.outcomes.exceptionsRaised]),
          exceptionsClosed: Object.freeze([...input.outcomes.exceptionsClosed]),
          governanceActions: Object.freeze([...input.outcomes.governanceActions]),
        }),
        followUpReviewAt: input.outcomes.followUpReviewAt,
        completedAt: ts,
        updatedAt: ts,
      });
      await store.publishEvent(tenant(ctx), "projects.review_completed", {
        reviewId,
        followUpReviewAt: next.followUpReviewAt,
      });
      return next;
    },

    listSchedules(ctx, filter) {
      return store.listSchedules(tenant(ctx), filter);
    },

    async createSchedule(ctx, input) {
      const ts = now();
      const row: ReviewSchedule = Object.freeze({
        id: id("rsch"),
        type: input.type,
        scopeType: input.scopeType,
        scopeId: requireText(input.scopeId, "scopeId"),
        cadence: input.cadence,
        nextRunAt: requireText(input.nextRunAt, "nextRunAt"),
        previousReviewIds: Object.freeze([]),
        chairRoleKey: input.chairRoleKey ?? "delivery_lead",
        audience: input.audience ?? "core",
        autoOpenPack: input.autoOpenPack ?? true,
        digestOnComplete: input.digestOnComplete ?? true,
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      });
      return store.upsertSchedule(tenant(ctx), row);
    },
  };
}

export {
  getMemoryProjectsReportingStore,
  resetProjectsReportingStoreForTests,
  setProjectsReportingStoreForTests,
  resolveProjectsReportingStore,
} from "./memory-store";
