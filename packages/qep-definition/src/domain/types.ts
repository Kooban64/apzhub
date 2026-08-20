export const STORY_TYPES = ["feature", "technical", "spike"] as const;
export type StoryType = (typeof STORY_TYPES)[number];

/** Reconciled with existing QEP requirement vocabulary (in_review, not REVIEW). */
export const STORY_STATUSES = [
  "draft",
  "active",
  "in_review",
  "approved",
  "archived",
] as const;
export type StoryStatus = (typeof STORY_STATUSES)[number];

export const STORY_PRIORITIES = ["critical", "high", "medium", "low"] as const;
export type StoryPriority = (typeof STORY_PRIORITIES)[number];

export const CRITERION_STATUSES = ["active", "archived"] as const;
export type CriterionStatus = (typeof CRITERION_STATUSES)[number];

export const ORIGIN_TYPES = [
  "human",
  "import",
  "migration",
  "api",
  "ai_accepted",
] as const;
export type OriginType = (typeof ORIGIN_TYPES)[number];

export const VERIFICATION_ASSET_KINDS = ["test_specification"] as const;
export type VerificationAssetKind = (typeof VERIFICATION_ASSET_KINDS)[number];

export const VERIFICATION_RESULTS = ["pass", "fail", "blocked"] as const;
export type VerificationResult = (typeof VERIFICATION_RESULTS)[number];

export const COVERAGE_STATES = ["none", "gap", "partial", "covered"] as const;
export type CoverageState = (typeof COVERAGE_STATES)[number];

export const RESULT_STATES = [
  "unverified",
  "unavailable",
  "pass",
  "fail",
  "blocked",
] as const;
export type ResultState = (typeof RESULT_STATES)[number];

export const LEGACY_AC_SOURCE_KIND = "acceptance_criteria_json" as const;

export type QepUserStory = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly requirementId: string;
  readonly storyKey: string;
  readonly title: string;
  readonly description?: string;
  readonly storyType: StoryType;
  readonly status: StoryStatus;
  readonly priority: StoryPriority;
  readonly estimatePoints?: number;
  readonly ownerUserId?: string;
  readonly originType: OriginType;
  readonly originReference?: string;
  readonly acceptedBy?: string;
  readonly acceptedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly archivedAt?: string;
  readonly archivedBy?: string;
};

export type QepAcceptanceCriterion = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly requirementId: string;
  readonly userStoryId?: string;
  readonly criterionKey: string;
  readonly text: string;
  readonly required: boolean;
  readonly status: CriterionStatus;
  readonly sortOrder: number;
  readonly originType: OriginType;
  readonly originReference?: string;
  readonly acceptedBy?: string;
  readonly acceptedAt?: string;
  readonly legacySourceKind?: string;
  readonly legacySourceIndex?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly archivedAt?: string;
  readonly archivedBy?: string;
};

export type QepCriterionVerificationLink = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly requirementId: string;
  readonly criterionId: string;
  readonly assetKind: VerificationAssetKind;
  readonly assetId: string;
  readonly latestResult?: VerificationResult;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type DefinitionAuditEntry = {
  readonly id: string;
  readonly tenantId: string;
  readonly requirementId: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly correlationId: string;
  readonly detailsJson: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
};

export type CreateStoryInput = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly requirementId: string;
  readonly title: string;
  readonly actorId: string;
  readonly description?: string;
  readonly storyType?: StoryType;
  readonly status?: Exclude<StoryStatus, "archived">;
  readonly priority?: StoryPriority;
  readonly estimatePoints?: number;
  readonly ownerUserId?: string;
  readonly originType?: OriginType;
  readonly originReference?: string;
  readonly acceptedBy?: string;
  readonly correlationId?: string;
};

export type UpdateStoryInput = {
  readonly title?: string;
  readonly description?: string | null;
  readonly storyType?: StoryType;
  readonly status?: Exclude<StoryStatus, "archived">;
  readonly priority?: StoryPriority;
  readonly estimatePoints?: number | null;
  readonly ownerUserId?: string | null;
};

export type CreateCriterionInput = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly requirementId: string;
  readonly text: string;
  readonly actorId: string;
  readonly userStoryId?: string;
  readonly required?: boolean;
  readonly originType?: OriginType;
  readonly originReference?: string;
  readonly acceptedBy?: string;
  readonly correlationId?: string;
};

export type UpdateCriterionInput = {
  readonly text?: string;
  readonly required?: boolean;
};

export type PromoteLegacyCriteriaInput = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly requirementId: string;
  readonly items: readonly string[];
  readonly actorId: string;
  readonly correlationId?: string;
};

export type PromoteLegacyCriteriaReport = {
  readonly requirementId: string;
  readonly created: number;
  readonly skipped: number;
  readonly inventedStoryParents: 0;
  readonly preservedTexts: readonly string[];
};

export type CoverageFacts = {
  readonly coverage: CoverageState;
  readonly result: ResultState;
  readonly criterionCount: number;
  readonly coveredCount: number;
  readonly gapCount: number;
};

export type PresentedCriterion = QepAcceptanceCriterion & {
  readonly coverage: CoverageState;
  readonly result: ResultState;
  readonly verificationCount: number;
};

export type PresentedStory = QepUserStory & {
  readonly coverage: CoverageState;
  readonly criterionCount: number;
  readonly coveredCount: number;
  readonly gapCount: number;
};
