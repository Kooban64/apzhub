export const TEST_CASE_STATUSES = [
  "draft",
  "ready",
  "approved",
  "deprecated",
  "retired",
] as const;
export type TestCaseStatus = (typeof TEST_CASE_STATUSES)[number];

export const TEST_CASE_TYPES = [
  "functional",
  "regression",
  "integration",
  "security",
  "performance",
  "accessibility",
  "manual",
] as const;
export type TestCaseType = (typeof TEST_CASE_TYPES)[number];

export const TEST_CASE_PRIORITIES = ["critical", "high", "medium", "low"] as const;
export type TestCasePriority = (typeof TEST_CASE_PRIORITIES)[number];

export const VERIFICATION_CAPABILITIES = [
  "browser_automation",
  "api_verification",
  "accessibility",
  "sast",
  "dast",
  "performance",
  "manual_verification",
] as const;
export type VerificationCapability = (typeof VERIFICATION_CAPABILITIES)[number];

export const EXECUTION_SURFACES = ["web", "api", "repository", "manual"] as const;
export type ExecutionSurface = (typeof EXECUTION_SURFACES)[number];

export const INFRASTRUCTURE_TARGET_TYPES = [
  "ci_pipeline",
  "managed_runner",
  "remote_host",
] as const;
export type InfrastructureTargetType = (typeof INFRASTRUCTURE_TARGET_TYPES)[number];

export const FORBIDDEN_INFRASTRUCTURE_ALIASES = ["web", "api", "repository"] as const;

export const EXECUTION_KINDS = ["test_execution", "workspace_session"] as const;
export type ExecutionKind = (typeof EXECUTION_KINDS)[number];

export const EXECUTION_MODES = ["manual", "automated", "suite_session"] as const;
export type ExecutionMode = (typeof EXECUTION_MODES)[number];

export const PRODUCT_RESULT_STATES = [
  "not_run",
  "pass",
  "fail",
  "blocked",
  "skipped",
] as const;
export type ProductResultState = (typeof PRODUCT_RESULT_STATES)[number];

export const PRODUCT_EXECUTION_STATUSES = [
  "draft",
  "not_started",
  "ready",
  "assigned",
  "in_progress",
  "paused",
  "blocked",
  "completed",
  "cancelled",
  "superseded",
] as const;
export type ProductExecutionStatus = (typeof PRODUCT_EXECUTION_STATUSES)[number];

export const PRODUCT_EXECUTION_TYPES = ["manual", "automated", "mixed"] as const;
export type ProductExecutionType = (typeof PRODUCT_EXECUTION_TYPES)[number];

export const EXECUTION_RELATION_KINDS = ["rerun", "retest"] as const;
export type ExecutionRelationKind = (typeof EXECUTION_RELATION_KINDS)[number];

export type DefinitionStep = {
  readonly id: string;
  readonly order: number;
  readonly action: string;
  readonly testDataRef?: string;
  readonly expectedResult: string;
};

export type AutomationMapping = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly specificationId: string;
  readonly verificationCapability: VerificationCapability;
  readonly providerId?: string;
  readonly assetRef?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type TestCaseRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId?: string;
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly objective: string;
  readonly status: string;
  readonly type: string;
  readonly priority: string;
  readonly owner: string;
  readonly author: string;
  readonly tags: readonly string[];
  readonly preconditions: readonly string[];
  readonly definitionVersion: number;
  readonly manualCapable: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

export type PresentedTestCase = TestCaseRecord & {
  readonly steps: readonly DefinitionStep[];
  readonly automationMappings: readonly AutomationMapping[];
  readonly criterionIds: readonly string[];
  readonly suiteIds: readonly string[];
  readonly planIds: readonly string[];
  readonly lastResult: ProductResultState;
  readonly unbound: boolean;
};

export type SuiteRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId?: string;
  readonly suiteKey?: string;
  readonly name: string;
  readonly description: string;
  readonly kind: string;
  readonly status: string;
  readonly ownerId: string;
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SuiteMembership = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly suiteId: string;
  readonly specificationId: string;
  readonly sequence: number;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type PresentedSuite = SuiteRecord & {
  readonly memberIds: readonly string[];
  readonly memberCount: number;
  readonly unbound: boolean;
};

export type PlanRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId?: string;
  readonly number: string;
  readonly title: string;
  readonly description?: string;
  readonly objective: string;
  readonly status: string;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type PlanSuiteMembership = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly planId: string;
  readonly suiteId: string;
  readonly sequence: number;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type StrategyGroup = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly planId: string;
  readonly name: string;
  readonly verificationCapability: VerificationCapability;
  readonly executionSurface?: ExecutionSurface;
  readonly environmentId?: string;
  readonly environmentName?: string;
  readonly infrastructureTargetType?: InfrastructureTargetType;
  readonly infrastructureTargetId?: string;
  readonly automationMappingId?: string;
  readonly testDataRef?: string;
  readonly scheduleNote?: string;
  readonly sequence: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type PresentedPlan = PlanRecord & {
  readonly suiteIds: readonly string[];
  readonly specificationIds: readonly string[];
  readonly strategy: readonly StrategyGroup[];
  readonly internalExecutionPlanIds: readonly string[];
  readonly progress: PlanProgress;
  readonly unbound: boolean;
};

export type PlanProgress = {
  readonly planned: number;
  readonly executed: number;
  readonly passed: number;
  readonly failed: number;
  readonly blocked: number;
  readonly remaining: number;
  readonly percent?: number;
};

export type DefinitionSnapshot = {
  readonly id: string;
  readonly tenantId: string;
  readonly executionId: string;
  readonly executionKind: ExecutionKind;
  readonly specificationId: string;
  readonly specificationNumber: string;
  readonly definitionVersion: number;
  readonly steps: readonly Omit<DefinitionStep, "id">[];
  readonly createdAt: string;
};

export type ScopeSnapshot = {
  readonly id: string;
  readonly tenantId: string;
  readonly executionId: string;
  readonly executionKind: ExecutionKind;
  readonly planId?: string;
  readonly suiteId?: string;
  readonly memberSpecificationIds: readonly string[];
  readonly createdAt: string;
};

export type StrategySnapshot = {
  readonly id: string;
  readonly tenantId: string;
  readonly executionId: string;
  readonly executionKind: ExecutionKind;
  readonly planId?: string;
  readonly strategyGroupId?: string;
  readonly verificationCapability?: string;
  readonly executionSurface?: string;
  readonly environmentId?: string;
  readonly environmentName?: string;
  readonly infrastructureTargetType?: string;
  readonly infrastructureTargetId?: string;
  readonly infrastructureTargetName?: string;
  readonly automationMappingId?: string;
  readonly providerId?: string;
  readonly assetRef?: string;
  readonly testDataRef?: string;
  readonly createdAt: string;
};

export type ExecutionRelation = {
  readonly id: string;
  readonly tenantId: string;
  readonly executionId: string;
  readonly relationKind: ExecutionRelationKind;
  readonly previousExecutionId: string;
  readonly triggeringDefectId?: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type PresentedExecution = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId?: string;
  readonly planId?: string;
  readonly suiteId?: string;
  readonly specificationId?: string;
  readonly name?: string;
  readonly mode: ExecutionMode;
  readonly type: ProductExecutionType;
  readonly engine: ExecutionKind;
  readonly status: ProductExecutionStatus;
  readonly result: ProductResultState;
  readonly progressPercent?: number;
  readonly environmentId?: string;
  readonly environmentName?: string;
  readonly method?: string;
  readonly strategyId?: string;
  readonly ownerId?: string;
  readonly startedAt?: string;
  readonly executedAt: string;
  readonly executedBy: string;
  readonly updatedAt?: string;
  readonly relationKind?: ExecutionRelationKind;
  readonly previousExecutionId?: string;
  readonly triggeringDefectId?: string;
  readonly unbound: boolean;
};

export type CreateTestCaseInput = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly actorId: string;
  readonly title: string;
  readonly description?: string;
  readonly type?: string;
  readonly priority?: string;
  readonly owner?: string;
  readonly tags?: readonly string[];
  readonly preconditions?: readonly string[];
  readonly steps?: readonly Omit<DefinitionStep, "id">[];
  readonly manualCapable?: boolean;
  readonly correlationId?: string;
  readonly number?: string;
};

export type UpdateTestCaseInput = {
  readonly title?: string;
  readonly description?: string;
  readonly type?: string;
  readonly priority?: string;
  readonly status?: string;
  readonly owner?: string;
  readonly tags?: readonly string[];
  readonly preconditions?: readonly string[];
  readonly steps?: readonly Omit<DefinitionStep, "id">[];
  readonly manualCapable?: boolean;
};

export type CreateSuiteInput = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly actorId: string;
  readonly name: string;
  readonly description?: string;
  readonly kind?: string;
  readonly tags?: readonly string[];
};

export type CreatePlanInput = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly actorId: string;
  readonly title: string;
  readonly objective: string;
  readonly description?: string;
};

export type CreateStrategyInput = {
  readonly name: string;
  readonly verificationCapability: VerificationCapability;
  readonly executionSurface?: ExecutionSurface;
  readonly environmentId?: string;
  readonly infrastructureTargetType?: string;
  readonly infrastructureTargetId?: string;
  readonly automationMappingId?: string;
  readonly testDataRef?: string;
  readonly scheduleNote?: string;
};
