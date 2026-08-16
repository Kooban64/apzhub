/**
 * APZPEN domain types — Security Assurance SoR (SPR-APZPEN-001).
 * Providers supply evidence; APZPEN owns the model.
 */

export type EngagementStatus =
  | "draft"
  | "scoped"
  | "approved"
  | "in_progress"
  | "reporting"
  | "remediating"
  | "certified"
  | "closed";

export type RoeStatus = "draft" | "approved" | "superseded";

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

export type FindingStatus =
  | "open"
  | "remediating"
  | "retest_requested"
  | "retest_passed"
  | "retest_failed"
  | "closed"
  | "risk_accepted"
  | "false_positive";

export type AssessmentPosition =
  "not_started" | "in_progress" | "blocked" | "conditional" | "complete";

export type AssetKind =
  | "web_application"
  | "api"
  | "mobile"
  | "repository"
  | "host"
  | "domain"
  | "container"
  | "cloud_account"
  | "other";

export type ScopeTarget = {
  readonly targetId: string;
  readonly kind: AssetKind;
  readonly label: string;
  readonly identifier: string;
  readonly environment: string;
  readonly notes?: string;
};

export type RulesOfEngagement = {
  readonly roeId: string;
  readonly status: RoeStatus;
  readonly allowedTechniques: readonly string[];
  readonly restrictedTechniques: readonly string[];
  readonly testingWindowStart?: string;
  readonly testingWindowEnd?: string;
  readonly emergencyContact?: string;
  readonly approvedAt?: string;
  readonly approvedBy?: string;
  readonly notes?: string;
};

export type Engagement = {
  readonly engagementId: string;
  readonly tenantId: string;
  readonly customerName: string;
  readonly applicationName: string;
  readonly title: string;
  readonly status: EngagementStatus;
  readonly environment: string;
  readonly methodology: readonly string[];
  readonly scope: readonly ScopeTarget[];
  readonly roe: RulesOfEngagement;
  readonly assessmentPosition: AssessmentPosition;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly scheduleMode: "once" | "frequent" | "on_demand";
  readonly nextRunAt?: string;
};

export type FindingEvidence = {
  readonly evidenceId: string;
  readonly kind: string;
  readonly label: string;
  readonly ref: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type Finding = {
  readonly findingId: string;
  readonly engagementId: string;
  readonly tenantId: string;
  readonly title: string;
  readonly description: string;
  readonly severity: FindingSeverity;
  readonly status: FindingStatus;
  readonly cwe?: string;
  readonly cvss?: number;
  readonly owaspCategory?: string;
  readonly assetLabel?: string;
  readonly component?: string;
  readonly location?: string;
  readonly remediation?: string;
  readonly providerTool?: string;
  readonly evidence: readonly FindingEvidence[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly assignedTo?: string;
  /** Formal risk acceptance record — required when status is risk_accepted. */
  readonly riskAcceptance?: {
    readonly reason: string;
    readonly acceptedBy: string;
    readonly acceptedAt: string;
  };
  /** Provider-neutral remediation change / PR reference (Source change id or URL). */
  readonly remediationChangeRef?: string;
};

export type SecurityPosture = {
  readonly engagementId: string;
  readonly status: EngagementStatus;
  readonly assessmentPosition: AssessmentPosition;
  readonly critical: number;
  readonly high: number;
  readonly medium: number;
  readonly low: number;
  readonly info: number;
  readonly openCount: number;
  readonly remediatingCount: number;
  readonly retestCount: number;
  readonly closedCount: number;
  readonly roeApproved: boolean;
  readonly scopeCount: number;
};

export type CreateEngagementInput = {
  readonly tenantId: string;
  readonly customerName: string;
  readonly applicationName: string;
  readonly title: string;
  readonly environment: string;
  readonly createdBy: string;
  readonly methodology?: readonly string[];
  readonly scheduleMode?: Engagement["scheduleMode"];
  readonly allowedTechniques?: readonly string[];
  readonly restrictedTechniques?: readonly string[];
};

export type CreateFindingInput = {
  readonly engagementId: string;
  readonly tenantId: string;
  readonly title: string;
  readonly description: string;
  readonly severity: FindingSeverity;
  readonly createdBy: string;
  readonly cwe?: string;
  readonly cvss?: number;
  readonly owaspCategory?: string;
  readonly assetLabel?: string;
  readonly component?: string;
  readonly location?: string;
  readonly remediation?: string;
  readonly providerTool?: string;
};

export type ImportFindingSeed = {
  readonly title: string;
  readonly description: string;
  readonly severity: FindingSeverity | string;
  readonly providerTool?: string;
  readonly location?: string;
  readonly remediation?: string;
  readonly cwe?: string;
  readonly owaspCategory?: string;
};
