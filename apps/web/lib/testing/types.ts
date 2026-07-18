/**
 * Presentation view models for APZ TCMS Testing workbench (APZTCMS-010).
 * Strongly typed UI contracts only — no repository / persistence / domain calc types.
 */

export type TestingCollectionResult<T> = {
  readonly items: readonly T[];
  readonly total: number;
};

export type TestingListParams = {
  readonly search?: string;
  readonly sort?: string;
  readonly order?: "asc" | "desc";
  readonly status?: string;
};

export type RequirementViewModel = {
  readonly id: string;
  readonly key: string;
  readonly title: string;
  readonly status: string;
  readonly priority: string;
  readonly updatedAt: string;
};

export type PlanViewModel = {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly version: string;
  readonly suiteCount: number;
  readonly updatedAt: string;
};

export type SuiteViewModel = {
  readonly id: string;
  readonly name: string;
  readonly planId: string;
  readonly planName: string;
  readonly caseCount: number;
  readonly status: string;
  readonly updatedAt: string;
};

export type CaseViewModel = {
  readonly id: string;
  readonly key: string;
  readonly title: string;
  readonly suiteId: string;
  readonly suiteName: string;
  readonly priority: string;
  readonly status: string;
  readonly automationEligible: boolean;
  readonly updatedAt: string;
};

export type ExecutionViewModel = {
  readonly id: string;
  readonly caseKey: string;
  readonly caseTitle: string;
  readonly status: string;
  readonly assignee: string;
  readonly progressLabel: string;
  readonly updatedAt: string;
};

export type EvidenceViewModel = {
  readonly id: string;
  readonly title: string;
  readonly kind: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly status: string;
  readonly linkedExecutionId: string | null;
  readonly createdAt: string;
};

export type AutomationRunViewModel = {
  readonly id: string;
  readonly adapter: string;
  readonly status: string;
  readonly passed: number;
  readonly failed: number;
  readonly skipped: number;
  readonly importedAt: string;
};

export type CoverageSummaryViewModel = {
  readonly id: string;
  readonly dimension: string;
  readonly covered: number;
  readonly total: number;
  readonly percentLabel: string;
  readonly status: string;
};

export type DefectLinkViewModel = {
  readonly id: string;
  readonly title: string;
  readonly severity: string;
  readonly status: string;
  readonly linkedCaseKey: string | null;
  readonly sourceLabel: string;
  readonly updatedAt: string;
};

export type QualitySummaryViewModel = {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly summary: string;
  readonly updatedAt: string;
};

export type CertificationGateViewModel = {
  readonly id: string;
  readonly name: string;
  readonly status: "pass" | "fail" | "warning" | "not_applicable" | "unknown";
  readonly reason: string;
  readonly evaluatedAt: string;
  readonly evaluator: string;
};

export type CertificationApprovalViewModel = {
  readonly id: string;
  readonly stage: string;
  readonly decision: string;
  readonly actor: string;
  readonly decidedAt: string;
  readonly comment: string | null;
};

export type CertificationAuditViewModel = {
  readonly id: string;
  readonly action: string;
  readonly actor: string;
  readonly at: string;
  readonly detail: string;
};

export type CertificationViewModel = {
  readonly id: string;
  readonly name: string;
  readonly state: string;
  readonly recommendation: string;
  readonly recommendationAdvisoryOnly: true;
  readonly gates: readonly CertificationGateViewModel[];
  readonly approvals: readonly CertificationApprovalViewModel[];
  readonly audit: readonly CertificationAuditViewModel[];
  readonly updatedAt: string;
};

export type ReleaseReadinessViewModel = {
  readonly id: string;
  readonly releaseLabel: string;
  readonly overallStatus: string;
  readonly dimensions: readonly {
    readonly name: string;
    readonly status: string;
    readonly detail: string;
  }[];
  readonly updatedAt: string;
};

export type DashboardViewModel = {
  readonly headline: string;
  readonly cards: readonly {
    readonly id: string;
    readonly label: string;
    readonly value: string;
    readonly tone: "neutral" | "success" | "warning" | "danger";
  }[];
  readonly recentCertifications: readonly CertificationViewModel[];
  readonly recentExecutions: readonly ExecutionViewModel[];
};

export type ReportPlaceholderViewModel = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: "placeholder";
};

export type AdminSettingViewModel = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly editable: false;
};

export type CreatePlanInput = { readonly name: string };
export type CreateSuiteInput = { readonly name: string; readonly planId: string };
export type CreateCaseInput = { readonly title: string; readonly suiteId: string };
export type StartExecutionInput = { readonly caseId: string };
export type EvidenceSubmitInput = {
  readonly executionId: string;
  readonly title: string;
};
export type ApprovalDecisionInput = {
  readonly certificationId: string;
  readonly decision: "approve" | "reject" | "review";
  readonly comment?: string;
};
