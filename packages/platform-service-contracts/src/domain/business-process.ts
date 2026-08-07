/**
 * APZ Workflow Business Process Excellence (APZ-WORKFLOW-CAPABILITY-001).
 * Workflow remains SoR for business intent. No automation execution here.
 */

export type BusinessProcessPublicationStatus =
  "draft" | "review" | "approved" | "retired";

export type BusinessProcessInstanceStatus = "active" | "completed" | "cancelled";

export interface BusinessJourneyStage {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly order: number;
  readonly responsibility?: string;
  readonly entryCondition?: string;
  readonly exitCondition?: string;
}

export interface BusinessJourneyTransition {
  readonly id: string;
  readonly fromStageId: string;
  readonly toStageId: string;
  readonly name: string;
  readonly outcome?: string;
}

export interface BusinessJourney {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly summary: string;
  readonly outcomes: readonly string[];
  readonly stages: readonly BusinessJourneyStage[];
  readonly transitions: readonly BusinessJourneyTransition[];
  readonly processOwner: string;
  readonly businessSteward: string;
  readonly version: number;
  readonly publicationStatus: BusinessProcessPublicationStatus;
  readonly reviewCycleDays?: number;
  readonly nextReviewAt?: string;
  readonly templateKey?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface BusinessProcessTemplate {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly summary: string;
  readonly defaultOutcomes: readonly string[];
  readonly defaultStages: readonly Omit<BusinessJourneyStage, "id">[];
  readonly defaultTransitions: readonly Omit<
    BusinessJourneyTransition,
    "id" | "fromStageId" | "toStageId"
  >[];
  readonly version: number;
  readonly editable: boolean;
}

export interface BusinessProcessInstance {
  readonly id: string;
  readonly tenantId: string;
  readonly journeyId: string;
  readonly title: string;
  readonly currentStageId: string;
  readonly status: BusinessProcessInstanceStatus;
  readonly enteredStageAt: string;
  readonly dueAt?: string;
  readonly completedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface BusinessProcessAuditEntry {
  readonly id: string;
  readonly journeyId: string;
  readonly action: string;
  readonly fromStatus?: BusinessProcessPublicationStatus;
  readonly toStatus?: BusinessProcessPublicationStatus;
  readonly actor: string;
  readonly notes?: string;
  readonly at: string;
}

export interface BusinessProcessStageCount {
  readonly stageId: string;
  readonly stageName: string;
  readonly activeCount: number;
  readonly stalledCount: number;
}

export interface BusinessProcessMonitoring {
  readonly journeyId?: string;
  readonly activeInstances: number;
  readonly stalledStages: number;
  readonly overdueTransitions: number;
  readonly completedCount: number;
  readonly completionRatePercent: number;
  readonly byStage: readonly BusinessProcessStageCount[];
  readonly computedAt: string;
}
