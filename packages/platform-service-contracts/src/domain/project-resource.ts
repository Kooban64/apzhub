/**
 * APZ Projects Resource & Team — W006 / PX-03.
 * Assignments · Responsibility · Continuity · Stakeholders · Team Health.
 */

export const TEAM_HEALTH_BANDS = ["healthy", "attention", "critical"] as const;
export type TeamHealthBand = (typeof TEAM_HEALTH_BANDS)[number];

export const DELIVERY_CAPACITY_BANDS = [
  "available",
  "constrained",
  "overloaded",
] as const;
export type DeliveryCapacityBand = (typeof DELIVERY_CAPACITY_BANDS)[number];

export const ASSIGNMENT_TYPES = [
  "core",
  "contributing",
  "advisory",
  "external",
] as const;
export type AssignmentType = (typeof ASSIGNMENT_TYPES)[number];

export const ASSIGNMENT_SCOPE_TYPES = ["project", "programme", "initiative"] as const;
export type AssignmentScopeType = (typeof ASSIGNMENT_SCOPE_TYPES)[number];

export const ASSIGNMENT_PRINCIPAL_TYPES = ["user", "team"] as const;
export type AssignmentPrincipalType = (typeof ASSIGNMENT_PRINCIPAL_TYPES)[number];

export const ASSIGNMENT_EVENT_KINDS = [
  "created",
  "updated",
  "reassigned",
  "ended",
  "accountability_transferred",
] as const;
export type AssignmentEventKind = (typeof ASSIGNMENT_EVENT_KINDS)[number];

export const RACI_DIMENSIONS = [
  "accountable",
  "responsible",
  "consulted",
  "informed",
] as const;
export type RaciDimension = (typeof RACI_DIMENSIONS)[number];

export const RESPONSIBILITY_OBJECT_TYPES = [
  "commitment",
  "milestone",
  "decision",
  "risk",
  "exception",
  "review",
  "checkpoint",
] as const;
export type ResponsibilityObjectType = (typeof RESPONSIBILITY_OBJECT_TYPES)[number];

export const CONTINUITY_STATUSES = ["open", "mitigated", "closed"] as const;
export type ContinuityStatus = (typeof CONTINUITY_STATUSES)[number];

export const STAKEHOLDER_INTERESTS = [
  "sponsor",
  "customer",
  "vendor",
  "regulator",
  "partner",
  "other",
] as const;
export type StakeholderInterest = (typeof STAKEHOLDER_INTERESTS)[number];

export const STAKEHOLDER_INFLUENCE = ["low", "medium", "high"] as const;
export type StakeholderInfluence = (typeof STAKEHOLDER_INFLUENCE)[number];

export const EXTERNAL_PARTICIPANT_STATUSES = ["invited", "active", "revoked"] as const;
export type ExternalParticipantStatus = (typeof EXTERNAL_PARTICIPANT_STATUSES)[number];

export type TeamHealthFactor = {
  readonly code: string;
  readonly label: string;
  readonly impact: number;
};

export type TeamHealth = {
  readonly teamId: string;
  readonly score: number;
  readonly band: TeamHealthBand;
  readonly factors: readonly TeamHealthFactor[];
  readonly computedAt: string;
  readonly indicative: true;
};

export type DeliveryCapacity = {
  readonly scopeType: "team" | "project";
  readonly scopeId: string;
  readonly band: DeliveryCapacityBand;
  readonly memberCount: number;
  readonly openCommitmentLoad: number;
  readonly factors: readonly TeamHealthFactor[];
  readonly computedAt: string;
  readonly indicative: true;
};

export type ResourceForecastBucket = {
  readonly windowDays: number;
  readonly dueCommitments: number;
  readonly pressureBand: DeliveryCapacityBand;
};

export type ResourceForecast = {
  readonly teamId: string;
  readonly buckets: readonly ResourceForecastBucket[];
  readonly computedAt: string;
  readonly indicative: true;
};

export type DeliveryAssignment = {
  readonly id: string;
  readonly scopeType: AssignmentScopeType;
  readonly scopeId: string;
  readonly principalType: AssignmentPrincipalType;
  readonly principalId: string;
  readonly assignmentType: AssignmentType;
  readonly from: string;
  readonly to?: string;
  readonly allocationPercent?: number;
  readonly primaryRoleKey?: string;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateDeliveryAssignmentInput = {
  readonly scopeType: AssignmentScopeType;
  readonly scopeId: string;
  readonly principalType: AssignmentPrincipalType;
  readonly principalId: string;
  readonly assignmentType?: AssignmentType;
  readonly from?: string;
  readonly to?: string;
  readonly allocationPercent?: number;
  readonly primaryRoleKey?: string;
  readonly notes?: string;
};

export type UpdateDeliveryAssignmentInput = {
  readonly assignmentType?: AssignmentType;
  readonly to?: string | null;
  readonly allocationPercent?: number | null;
  readonly primaryRoleKey?: string | null;
  readonly notes?: string | null;
};

export type ReassignDeliveryAssignmentInput = {
  readonly toPrincipalType: AssignmentPrincipalType;
  readonly toPrincipalId: string;
  readonly transferAccountability?: boolean;
  readonly notes?: string;
};

export type DeliveryAssignmentEvent = {
  readonly id: string;
  readonly assignmentId: string;
  readonly kind: AssignmentEventKind;
  readonly actorUserId: string;
  readonly fromPrincipalId?: string;
  readonly toPrincipalId?: string;
  readonly note?: string;
  readonly at: string;
};

export type Responsibility = {
  readonly id: string;
  readonly scopeType: AssignmentScopeType;
  readonly scopeId: string;
  readonly objectType: ResponsibilityObjectType;
  readonly objectId: string;
  readonly objectLabel: string;
  readonly dimension: RaciDimension;
  readonly principalType: "user" | "team" | "external";
  readonly principalId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ResponsibilityMatrixRow = {
  readonly objectType: ResponsibilityObjectType;
  readonly objectId: string;
  readonly objectLabel: string;
  readonly accountable?: string;
  readonly responsible?: string;
  readonly consulted: readonly string[];
  readonly informed: readonly string[];
  readonly gap: boolean;
  readonly continuityFlag: boolean;
};

export type ResponsibilityMatrix = {
  readonly scopeType: AssignmentScopeType;
  readonly scopeId: string;
  readonly rows: readonly ResponsibilityMatrixRow[];
  readonly gapCount: number;
  readonly computedAt: string;
};

export type ContinuityCase = {
  readonly id: string;
  readonly principalId: string;
  readonly scopeType: AssignmentScopeType;
  readonly scopeId: string;
  readonly actingOwnerUserId?: string;
  readonly affectedCommitments: readonly string[];
  readonly affectedMilestones: readonly string[];
  readonly pendingDecisions: readonly string[];
  readonly openExceptions: readonly string[];
  readonly agedWaitsChasing: readonly string[];
  readonly recommendedReplacementRoles: readonly string[];
  readonly status: ContinuityStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateContinuityCaseInput = {
  readonly principalId: string;
  readonly scopeType: AssignmentScopeType;
  readonly scopeId: string;
  readonly actingOwnerUserId?: string;
  readonly affectedCommitments?: readonly string[];
  readonly affectedMilestones?: readonly string[];
  readonly pendingDecisions?: readonly string[];
  readonly openExceptions?: readonly string[];
  readonly agedWaitsChasing?: readonly string[];
  readonly recommendedReplacementRoles?: readonly string[];
};

export type UpdateContinuityCaseInput = {
  readonly actingOwnerUserId?: string | null;
  readonly status?: ContinuityStatus;
  readonly recommendedReplacementRoles?: readonly string[];
};

export type Stakeholder = {
  readonly id: string;
  readonly scopeType: AssignmentScopeType;
  readonly scopeId: string;
  readonly principalType: "user" | "external";
  readonly principalId: string;
  readonly interest: StakeholderInterest;
  readonly influence: StakeholderInfluence;
  readonly engagementCadence?: string;
  readonly communicationPreference?: string;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateStakeholderInput = {
  readonly scopeType: AssignmentScopeType;
  readonly scopeId: string;
  readonly principalType: "user" | "external";
  readonly principalId: string;
  readonly interest: StakeholderInterest;
  readonly influence?: StakeholderInfluence;
  readonly engagementCadence?: string;
  readonly communicationPreference?: string;
  readonly notes?: string;
};

export type ExternalParticipant = {
  readonly id: string;
  readonly displayName: string;
  readonly organisation?: string;
  readonly email?: string;
  readonly linkedUserId?: string;
  readonly status: ExternalParticipantStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateExternalParticipantInput = {
  readonly displayName: string;
  readonly organisation?: string;
  readonly email?: string;
  readonly linkedUserId?: string;
};
