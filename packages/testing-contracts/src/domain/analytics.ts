import type { AuditFields } from "./audit";
import type {
  AISuggestionId,
  AutomationJobId,
  CoverageMetricId,
  DashboardSnapshotId,
  RequirementId,
  RiskId,
  TestCaseId,
  TestPlanId,
  TestSuiteId,
  TraceabilityLinkId,
} from "../identifiers";
import type {
  AISuggestionKind,
  AISuggestionStatus,
  AutomationJobStatus,
  AutomationType,
  CoverageMetricKind,
  TraceabilityLinkType,
} from "../enums";

export interface TraceabilityLink extends AuditFields {
  readonly id: TraceabilityLinkId;
  readonly type: TraceabilityLinkType;
  readonly sourceKind: string;
  readonly sourceId: string;
  readonly targetKind: string;
  readonly targetId: string;
  readonly notes?: string;
}

export interface CoverageMetric extends AuditFields {
  readonly id: CoverageMetricId;
  readonly kind: CoverageMetricKind;
  readonly subjectId: string;
  readonly coveredCount: number;
  readonly totalCount: number;
  readonly percentage: number;
  readonly computedAt: string;
  readonly planId?: TestPlanId;
  readonly suiteId?: TestSuiteId;
  readonly requirementId?: RequirementId;
  readonly riskId?: RiskId;
}

export interface AutomationJob extends AuditFields {
  readonly id: AutomationJobId;
  readonly automationType: AutomationType;
  readonly status: AutomationJobStatus;
  readonly adapterSourceId?: string;
  readonly externalJobRef?: string;
  readonly queuedAt: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly errorSummary?: string;
}

export interface DashboardSnapshot extends AuditFields {
  readonly id: DashboardSnapshotId;
  readonly capturedAt: string;
  readonly planCount: number;
  readonly caseCount: number;
  readonly openRunCount: number;
  readonly failedResultCount: number;
  readonly certificationInProgressCount: number;
  readonly coveragePercentage?: number;
}

/** Advisory AI output stub — never authoritative; human acceptance required. */
export interface AISuggestion extends AuditFields {
  readonly id: AISuggestionId;
  readonly kind: AISuggestionKind;
  readonly status: AISuggestionStatus;
  readonly targetKind: string;
  readonly targetId: string;
  readonly title: string;
  readonly summary: string;
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly expiresAt?: string;
  readonly acceptedByUserId?: string;
  readonly acceptedAt?: string;
}

export interface TraceabilityMatrixRow {
  readonly requirementId: RequirementId;
  readonly requirementKey: string;
  readonly caseIds: readonly TestCaseId[];
  readonly covered: boolean;
}
