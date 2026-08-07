/**
 * APZ Projects Portfolio hierarchy — W005 (PX-02).
 * Enterprise Portfolio → Strategic Initiative → Programme → Project.
 * Strategic Objectives are first-class reporting entities.
 */

export const PORTFOLIO_NODE_STATUSES = [
  "draft",
  "active",
  "on_hold",
  "closing",
  "closed",
  "archived",
] as const;

export type PortfolioNodeStatus = (typeof PORTFOLIO_NODE_STATUSES)[number];

export const STRATEGIC_OBJECTIVE_STATUSES = [
  "on_track",
  "at_risk",
  "off_track",
  "achieved",
  "abandoned",
] as const;

export type StrategicObjectiveStatus = (typeof STRATEGIC_OBJECTIVE_STATUSES)[number];

export const STRATEGIC_IMPORTANCE = ["low", "normal", "high", "critical"] as const;

export type StrategicImportance = (typeof STRATEGIC_IMPORTANCE)[number];

export type StrategicInitiative = {
  readonly id: string;
  readonly name: string;
  readonly sponsorUserId: string;
  readonly status: PortfolioNodeStatus;
  readonly governanceProfileId?: string;
  readonly strategicObjectiveIds: readonly string[];
  readonly programmeIds: readonly string[];
  readonly projectIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string;
};

export type Programme = {
  readonly id: string;
  readonly name: string;
  readonly ownerUserId: string;
  readonly strategicInitiativeId?: string;
  readonly classification?: string;
  readonly governanceProfileId?: string;
  readonly status: PortfolioNodeStatus;
  readonly strategicImportance: StrategicImportance;
  readonly strategicObjectiveIds: readonly string[];
  readonly memberProjectIds: readonly string[];
  readonly targetEndAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string;
};

export type StrategicObjective = {
  readonly id: string;
  readonly name: string;
  readonly statement: string;
  readonly ownerUserId: string;
  readonly status: StrategicObjectiveStatus;
  /** 0–100 evidence-derived progress (milestones + commitments); never manually edited. */
  readonly progress: number;
  readonly initiativeIds: readonly string[];
  readonly programmeIds: readonly string[];
  readonly contributingProjectIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string;
};

export type EnterprisePortfolio = {
  readonly id: string;
  readonly name: string;
  readonly status: PortfolioNodeStatus;
  readonly initiativeIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateStrategicInitiativeInput = {
  readonly name: string;
  readonly sponsorUserId: string;
  readonly governanceProfileId?: string;
  readonly status?: PortfolioNodeStatus;
  readonly strategicObjectiveIds?: readonly string[];
};

export type UpdateStrategicInitiativeInput = {
  readonly name?: string;
  readonly sponsorUserId?: string;
  readonly governanceProfileId?: string;
  readonly status?: PortfolioNodeStatus;
  readonly strategicObjectiveIds?: readonly string[];
  readonly programmeIds?: readonly string[];
  readonly projectIds?: readonly string[];
};

export type CreateProgrammeInput = {
  readonly name: string;
  readonly ownerUserId: string;
  readonly strategicInitiativeId?: string;
  readonly classification?: string;
  readonly governanceProfileId?: string;
  readonly status?: PortfolioNodeStatus;
  readonly strategicImportance?: StrategicImportance;
  readonly strategicObjectiveIds?: readonly string[];
  readonly memberProjectIds?: readonly string[];
  readonly targetEndAt?: string;
};

export type UpdateProgrammeInput = {
  readonly name?: string;
  readonly ownerUserId?: string;
  readonly strategicInitiativeId?: string | null;
  readonly classification?: string;
  readonly governanceProfileId?: string;
  readonly status?: PortfolioNodeStatus;
  readonly strategicImportance?: StrategicImportance;
  readonly strategicObjectiveIds?: readonly string[];
  readonly memberProjectIds?: readonly string[];
  readonly targetEndAt?: string | null;
};

export type CreateStrategicObjectiveInput = {
  readonly name: string;
  readonly statement: string;
  readonly ownerUserId: string;
  readonly status?: StrategicObjectiveStatus;
  readonly initiativeIds?: readonly string[];
  readonly programmeIds?: readonly string[];
  readonly contributingProjectIds?: readonly string[];
};

export type UpdateStrategicObjectiveInput = {
  readonly name?: string;
  readonly statement?: string;
  readonly ownerUserId?: string;
  /** Only `abandoned` may be set manually; progress/status otherwise evidence-derived. */
  readonly status?: StrategicObjectiveStatus;
  readonly initiativeIds?: readonly string[];
  readonly programmeIds?: readonly string[];
  readonly contributingProjectIds?: readonly string[];
};

export type MoveProjectMembershipInput = {
  readonly projectId: string;
  readonly toProgrammeId: string | null;
  readonly toInitiativeId?: string | null;
};

export type PortfolioConfidenceContributor = {
  readonly code: string;
  readonly label: string;
  readonly impact: number;
};

export type PortfolioWeightedConfidence = {
  readonly score: number;
  readonly band: "High" | "Medium" | "Low";
  readonly contributors: readonly PortfolioConfidenceContributor[];
};
