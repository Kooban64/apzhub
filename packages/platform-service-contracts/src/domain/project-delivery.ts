/**
 * APZ Projects Delivery Excellence + W004 Operational Delivery milestones.
 * Projects remains SoR. Platform Postgres stores delivery registers.
 */

import type { MilestoneId, ProjectId } from "./identifiers";
import type { CompletionEvidence } from "./project-operational-delivery";

/** W004 canonical statuses. Legacy aliases retained for migration. */
export const PROJECT_MILESTONE_STATUSES = [
  "planned",
  "at_risk",
  "slipped",
  "achieved",
  "cancelled",
  /** @deprecated map to planned */
  "open",
  /** @deprecated map to achieved */
  "completed",
  /** @deprecated map to slipped */
  "missed",
] as const;
export type ProjectMilestoneStatus = (typeof PROJECT_MILESTONE_STATUSES)[number];

export const MILESTONE_CONFIDENCE = ["high", "medium", "low"] as const;
export type MilestoneConfidence = (typeof MILESTONE_CONFIDENCE)[number];

export interface ProjectMilestone {
  readonly id: MilestoneId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly description?: string;
  /** Working-plan due date (W004 dueAt). */
  readonly targetDate?: string;
  /** @deprecated Prefer ownerUserId */
  readonly owner?: string;
  readonly ownerUserId?: string;
  readonly status: ProjectMilestoneStatus;
  readonly confidence: MilestoneConfidence;
  readonly failureConsequence?: string;
  readonly exitCriteria?: string;
  /** Denormalised from active baseline for variance. */
  readonly baselineDueAt?: string;
  readonly sortKey: number;
  readonly dependencyIds: readonly string[];
  readonly progressPercent: number;
  readonly achievementEvidence: readonly CompletionEvidence[];
  readonly varianceDays?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type ProjectRiskStatus = "open" | "mitigating" | "closed" | "accepted";
export type ProjectRiskLevel = "low" | "medium" | "high" | "critical";

export interface ProjectRisk {
  readonly id: string;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly description: string;
  readonly probability: ProjectRiskLevel;
  readonly impact: ProjectRiskLevel;
  readonly mitigation: string;
  readonly owner: string;
  readonly reviewDate?: string;
  readonly status: ProjectRiskStatus;
  readonly failureConsequence?: string;
  readonly watchBand?: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProjectDecision {
  readonly id: string;
  readonly projectId: ProjectId;
  readonly decision: string;
  readonly rationale: string;
  readonly owner: string;
  readonly decidedAt: string;
  readonly outcome: string;
  readonly relatedWork?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type ProjectActionStatus = "open" | "done" | "cancelled";

export interface ProjectActionItem {
  readonly id: string;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly owner: string;
  readonly dueDate?: string;
  readonly status: ProjectActionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type ProjectDeliveryHealthStatus = "green" | "amber" | "red";

export interface ProjectDeliveryHealth {
  readonly projectId: ProjectId;
  readonly status: ProjectDeliveryHealthStatus;
  readonly scheduleScore: ProjectDeliveryHealthStatus;
  readonly riskScore: ProjectDeliveryHealthStatus;
  readonly milestoneScore: ProjectDeliveryHealthStatus;
  readonly actionScore: ProjectDeliveryHealthStatus;
  readonly reasons: readonly string[];
  readonly computedAt: string;
}

export interface ProjectDeliveryDashboard {
  readonly projectId: ProjectId;
  readonly health: ProjectDeliveryHealth;
  readonly milestoneTotal: number;
  readonly milestoneCompleted: number;
  readonly openRisks: number;
  readonly criticalRisks: number;
  readonly openActions: number;
  readonly overdueActions: number;
  readonly upcomingMilestones: readonly ProjectMilestone[];
  readonly topRisks: readonly ProjectRisk[];
  readonly recentDecisions: readonly ProjectDecision[];
  readonly blockers: readonly string[];
}

export function normalizeMilestoneStatus(
  status: string,
): "planned" | "at_risk" | "slipped" | "achieved" | "cancelled" {
  if (status === "open") return "planned";
  if (status === "completed") return "achieved";
  if (status === "missed") return "slipped";
  if (
    status === "planned" ||
    status === "at_risk" ||
    status === "slipped" ||
    status === "achieved" ||
    status === "cancelled"
  ) {
    return status;
  }
  return "planned";
}

export function isOpenMilestoneStatus(status: string): boolean {
  const n = normalizeMilestoneStatus(status);
  return n === "planned" || n === "at_risk" || n === "slipped";
}

export function isAchievedMilestoneStatus(status: string): boolean {
  return normalizeMilestoneStatus(status) === "achieved";
}
