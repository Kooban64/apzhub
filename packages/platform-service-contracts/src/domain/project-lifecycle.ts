/**
 * APZ Projects Release 3.0 — Project Lifecycle (W003).
 * Platform-owned lifecycle metadata. Plane remains project shell SoR for tasks.
 */

export const PROJECT_LIFECYCLE_STAGES = [
  "draft",
  "initiating",
  "active",
  "on_hold",
  "closing",
  "closed",
  "archived",
] as const;
export type ProjectLifecycleStage = (typeof PROJECT_LIFECYCLE_STAGES)[number];

/** @deprecated Use ProjectLifecycleStage. Mapped: completed → closed. */
export type LegacyProjectStatus =
  "draft" | "active" | "on_hold" | "completed" | "archived";

export const PROJECT_CLASSIFICATIONS = [
  "strategic",
  "operational",
  "regulatory",
  "customer",
  "internal",
  "innovation",
] as const;
export type ProjectClassification = (typeof PROJECT_CLASSIFICATIONS)[number];

export const PROJECT_DELIVERY_MODELS = [
  "product_delivery",
  "project_delivery",
  "programme_delivery",
  "operational_initiative",
  "governance_initiative",
] as const;
export type ProjectDeliveryModel = (typeof PROJECT_DELIVERY_MODELS)[number];

export const PROJECT_EXECUTION_CHARACTERISTICS = [
  "agile",
  "scrum",
  "kanban",
  "waterfall",
  "hybrid",
  "unspecified",
] as const;
export type ProjectExecutionCharacteristic =
  (typeof PROJECT_EXECUTION_CHARACTERISTICS)[number];

export const PROJECT_CLOSURE_OUTCOMES = [
  "delivered",
  "delivered_with_variance",
  "stopped",
  "superseded",
] as const;
export type ProjectClosureOutcome = (typeof PROJECT_CLOSURE_OUTCOMES)[number];

export interface GovernanceProfile {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly version: number;
  readonly scope: "system" | "organisation";
  readonly requiresHoldDecision: boolean;
  readonly requiresClosureApproval: boolean;
  readonly requiresEvidenceOnClose: boolean;
  readonly initiationRequiresMilestone: boolean;
  /** Calendar-day slip vs baseline before a date_exception is mandatory. */
  readonly milestoneDateToleranceDays: number;
  /** Calendar-day Waiting age beyond SLA before wait_breach Exception. */
  readonly waitingBreachEscalationDays: number;
  readonly allowedDeliveryModels: readonly ProjectDeliveryModel[];
  readonly allowedClassifications: readonly ProjectClassification[];
}

export interface ProjectTemplateSummary {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly version: number;
  readonly deliveryModel: ProjectDeliveryModel;
  readonly governanceProfileId: string;
  readonly description: string;
  readonly milestoneSeeds: readonly {
    readonly name: string;
    readonly offsetDays: number;
  }[];
  readonly riskSeeds: readonly { readonly title: string; readonly impact: string }[];
}

export interface ProjectBaseline {
  readonly id: string;
  readonly projectId: string;
  readonly version: number;
  readonly kind: "initial" | "rebaseline";
  readonly targetEndAt?: string;
  readonly successCriteria?: string;
  readonly milestoneSnapshot: readonly {
    readonly name: string;
    readonly targetDate?: string;
  }[];
  readonly reason?: string;
  readonly approvedBy?: string;
  readonly createdAt: string;
  readonly createdBy: string;
}

export interface LifecycleWaiver {
  readonly id: string;
  readonly projectId: string;
  readonly policyKey: string;
  readonly reason: string;
  readonly authorisedBy: string;
  readonly at: string;
}

export interface LifecycleTransitionRecord {
  readonly id: string;
  readonly projectId: string;
  readonly from: ProjectLifecycleStage;
  readonly to: ProjectLifecycleStage;
  readonly reason?: string;
  readonly outcome?: ProjectClosureOutcome;
  readonly actorUserId: string;
  readonly at: string;
  readonly auditNote: string;
}

export interface ProjectLifecycleRecord {
  readonly projectId: string;
  readonly tenantId: string;
  readonly stage: ProjectLifecycleStage;
  readonly classification?: ProjectClassification;
  readonly deliveryModel?: ProjectDeliveryModel;
  readonly executionCharacteristic: ProjectExecutionCharacteristic;
  readonly governanceProfileId?: string;
  readonly governanceProfileVersion?: number;
  readonly templateId?: string;
  readonly templateVersion?: number;
  readonly ownerUserId?: string;
  readonly programmeId?: string;
  readonly customerLabel?: string;
  readonly targetEndAt?: string;
  readonly successCriteria?: string;
  readonly nextMilestoneIntent?: string;
  readonly continuousDeliveryWaiver: boolean;
  readonly milestoneFreeWaiver: boolean;
  readonly coreTeamUserIds: readonly string[];
  readonly closureOutcome?: ProjectClosureOutcome;
  readonly closureSummary?: string;
  readonly holdReason?: string;
  readonly activeBaselineId?: string;
  readonly wizardStep?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface InitiateProjectInput {
  readonly workspaceId: string;
  readonly name: string;
  readonly identifier: string;
  readonly description?: string;
  readonly ownerUserId?: string;
  readonly classification?: ProjectClassification;
  readonly deliveryModel?: ProjectDeliveryModel;
  readonly executionCharacteristic?: ProjectExecutionCharacteristic;
  readonly governanceProfileId?: string;
  readonly templateId?: string;
  readonly programmeId?: string;
  readonly customerLabel?: string;
  readonly targetEndAt?: string;
  readonly successCriteria?: string;
  readonly nextMilestoneIntent?: string;
  readonly continuousDeliveryWaiver?: boolean;
  readonly milestoneFreeWaiver?: boolean;
  readonly coreTeamUserIds?: readonly string[];
  readonly initialRiskTitles?: readonly string[];
  /** draft = save Draft; initiating = create and start Initiating */
  readonly startMode: "draft" | "initiating";
}

export interface LifecycleTransitionInput {
  readonly to: ProjectLifecycleStage;
  readonly reason?: string;
  readonly outcome?: ProjectClosureOutcome;
  readonly closureSummary?: string;
  readonly waivers?: readonly { readonly policyKey: string; readonly reason: string }[];
  readonly decisionId?: string;
  readonly rebaseline?: {
    readonly targetEndAt?: string;
    readonly successCriteria?: string;
    readonly reason: string;
  };
}

export interface ClosureReadiness {
  readonly ready: boolean;
  readonly gaps: readonly {
    readonly code: string;
    readonly message: string;
    readonly waivable: boolean;
  }[];
}

export interface InitiationReadiness {
  readonly ready: boolean;
  readonly gaps: readonly {
    readonly code: string;
    readonly message: string;
    readonly waivable: boolean;
  }[];
}
