/**
 * W008 / PX-05 — Operational reporting & reviews.
 * Projects = operational delivery reporting. Analytics boundary permanent.
 */

export const OPERATIONAL_REVIEW_TYPES = [
  "project",
  "programme",
  "portfolio",
  "delivery",
  "governance",
] as const;
export type OperationalReviewType = (typeof OPERATIONAL_REVIEW_TYPES)[number];

export const REVIEW_SCOPE_TYPES = [
  "project",
  "programme",
  "portfolio",
  "initiative",
  "governance",
] as const;
export type ReviewScopeType = (typeof REVIEW_SCOPE_TYPES)[number];

export const REVIEW_STATUSES = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const REVIEW_CADENCES = [
  "weekly",
  "fortnightly",
  "monthly",
  "quarterly",
] as const;
export type ReviewCadence = (typeof REVIEW_CADENCES)[number];

export const REPORT_CATALOGUE_KEYS = [
  "exceptions",
  "decision_latency",
  "baseline_variance",
  "forecast",
  "trend",
  "waiting_ageing",
  "governance_checkpoints",
  "delivery_capacity",
  "strategic_objective_progress",
  "accountability_gaps",
] as const;
export type ReportCatalogueKey = (typeof REPORT_CATALOGUE_KEYS)[number];

export type MetricDrillTarget = {
  readonly label: string;
  readonly objectType: string;
  readonly objectId?: string;
  readonly href: string;
  readonly count?: number;
};

export type ReviewPackMetric = {
  readonly key: string;
  readonly label: string;
  readonly value: string | number;
  readonly howCalculated: string;
  readonly drill: MetricDrillTarget;
};

export type ReviewPackSnapshot = {
  readonly id: string;
  readonly reviewId: string;
  readonly asOf: string;
  readonly correlationId: string;
  readonly metrics: readonly ReviewPackMetric[];
  readonly exceptionSummary: {
    readonly openCritical: number;
    readonly openMajor: number;
    readonly openMinor: number;
    readonly closedInPeriod: number;
  };
  readonly decisionSummary: {
    readonly pending: number;
    readonly avgAgeDays: number;
  };
  readonly waitingSummary: {
    readonly active: number;
    readonly aged: number;
  };
  readonly forecast?: {
    readonly windowDays: number;
    readonly predictedOutcome: string;
    readonly confidenceLevel: string;
    readonly contributingFactors: readonly string[];
    readonly recommendedActions: readonly string[];
  };
  readonly accountabilityGapCount: number;
  readonly recommendedActions: readonly string[];
};

export type ExecutiveSummary = {
  readonly id: string;
  readonly reviewId: string;
  readonly currentPosition: string;
  readonly keyChanges: string;
  readonly principalRisks: string;
  readonly decisionsRequired: string;
  readonly recommendedActions: string;
  readonly editable: boolean;
  readonly updatedAt: string;
};

export type ReviewOutcomes = {
  readonly decisions: readonly string[];
  readonly newCommitments: readonly string[];
  readonly risksRaised: readonly string[];
  readonly risksClosed: readonly string[];
  readonly exceptionsRaised: readonly string[];
  readonly exceptionsClosed: readonly string[];
  readonly governanceActions: readonly string[];
  readonly followUpReviewAt: string;
  readonly emptyCategoriesAttested: boolean;
};

export type OperationalReview = {
  readonly id: string;
  readonly type: OperationalReviewType;
  readonly scopeType: ReviewScopeType;
  readonly scopeId: string;
  readonly periodFrom: string;
  readonly periodTo: string;
  readonly status: ReviewStatus;
  readonly chairPrincipalId: string;
  readonly attendeePrincipalIds: readonly string[];
  readonly agenda: readonly string[];
  readonly packSnapshotId?: string;
  readonly executiveSummaryId?: string;
  readonly outcomes?: ReviewOutcomes;
  readonly meetingOutcomeId?: string;
  readonly followUpReviewAt?: string;
  readonly completedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ReviewSchedule = {
  readonly id: string;
  readonly type: OperationalReviewType;
  readonly scopeType: ReviewScopeType;
  readonly scopeId: string;
  readonly cadence: ReviewCadence;
  readonly nextRunAt: string;
  readonly previousReviewIds: readonly string[];
  readonly chairRoleKey: string;
  readonly audience: string;
  readonly autoOpenPack: boolean;
  readonly digestOnComplete: boolean;
  readonly status: "active" | "paused" | "ended";
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ReportDefinition = {
  readonly key: ReportCatalogueKey;
  readonly question: string;
  readonly audience: string;
  readonly inputs: string;
  readonly visual: string;
  readonly drillHint: string;
};

export type ReportRow = {
  readonly id: string;
  readonly label: string;
  readonly values: Record<string, string | number>;
  readonly drill: MetricDrillTarget;
};

export type OperationalReportResult = {
  readonly key: ReportCatalogueKey;
  readonly definition: ReportDefinition;
  readonly asOf: string;
  readonly scopeType: ReviewScopeType;
  readonly scopeId: string;
  readonly rows: readonly ReportRow[];
  readonly summary: string;
};

export type CreateOperationalReviewInput = {
  readonly type: OperationalReviewType;
  readonly scopeType: ReviewScopeType;
  readonly scopeId: string;
  readonly periodFrom: string;
  readonly periodTo: string;
  readonly chairPrincipalId: string;
  readonly attendeePrincipalIds?: readonly string[];
  readonly agenda?: readonly string[];
  readonly meetingOutcomeId?: string;
};

export type CompleteOperationalReviewInput = {
  readonly outcomes: ReviewOutcomes;
  readonly executiveSummaryEdits?: Partial<
    Pick<
      ExecutiveSummary,
      | "currentPosition"
      | "keyChanges"
      | "principalRisks"
      | "decisionsRequired"
      | "recommendedActions"
    >
  >;
};

export type CreateReviewScheduleInput = {
  readonly type: OperationalReviewType;
  readonly scopeType: ReviewScopeType;
  readonly scopeId: string;
  readonly cadence: ReviewCadence;
  readonly nextRunAt: string;
  readonly chairRoleKey?: string;
  readonly audience?: string;
  readonly autoOpenPack?: boolean;
  readonly digestOnComplete?: boolean;
};

export type UpdateExecutiveSummaryInput = {
  readonly currentPosition?: string;
  readonly keyChanges?: string;
  readonly principalRisks?: string;
  readonly decisionsRequired?: string;
  readonly recommendedActions?: string;
};
