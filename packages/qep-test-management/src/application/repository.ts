import type {
  AutomationMapping,
  CreatePlanInput,
  CreateStrategyInput,
  CreateSuiteInput,
  CreateTestCaseInput,
  DefinitionSnapshot,
  DefinitionStep,
  PlanRecord,
  PlanSuiteMembership,
  PresentedExecution,
  PresentedPlan,
  PresentedSuite,
  PresentedTestCase,
  ProductResultState,
  ScopeSnapshot,
  StrategyGroup,
  SuiteMembership,
  SuiteRecord,
  TestCaseRecord,
  UpdateTestCaseInput,
} from "../domain/types";

export type TestCaseListFilter = {
  readonly tenantId: string;
  readonly applicationId?: string;
  readonly includeUnbound?: boolean;
};

export type SuiteListFilter = {
  readonly tenantId: string;
  readonly applicationId?: string;
  readonly includeUnbound?: boolean;
};

export type PlanListFilter = {
  readonly tenantId: string;
  readonly applicationId?: string;
  readonly includeUnbound?: boolean;
};

export type CriterionRow = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly requirementId: string;
  readonly criterionKey: string;
  readonly text: string;
};

export type EnvironmentRow = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly name?: string;
};

export type ExecutionTargetRow = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly targetType: string;
};

export type TestManagementRepository = {
  nextKeyNumber(
    tenantId: string,
    applicationId: string,
    kind: "test_case" | "suite",
  ): Promise<number>;
  listExistingTsNumbers(tenantId: string): Promise<readonly string[]>;

  getTestCase(tenantId: string, id: string): Promise<TestCaseRecord | undefined>;
  listTestCases(filter: TestCaseListFilter): Promise<readonly TestCaseRecord[]>;
  saveTestCase(row: TestCaseRecord): Promise<void>;
  listSteps(
    tenantId: string,
    specificationId: string,
  ): Promise<readonly DefinitionStep[]>;
  replaceSteps(
    tenantId: string,
    specificationId: string,
    actorId: string,
    steps: readonly Omit<DefinitionStep, "id">[],
  ): Promise<readonly DefinitionStep[]>;

  getSuite(tenantId: string, id: string): Promise<SuiteRecord | undefined>;
  listSuites(filter: SuiteListFilter): Promise<readonly SuiteRecord[]>;
  saveSuite(row: SuiteRecord): Promise<void>;
  listSuiteMembership(
    tenantId: string,
    suiteId: string,
  ): Promise<readonly SuiteMembership[]>;
  listMembershipForSpecification(
    tenantId: string,
    specificationId: string,
  ): Promise<readonly SuiteMembership[]>;
  saveSuiteMembership(row: SuiteMembership): Promise<void>;
  deleteSuiteMembership(tenantId: string, id: string): Promise<void>;

  getPlan(tenantId: string, id: string): Promise<PlanRecord | undefined>;
  listPlans(filter: PlanListFilter): Promise<readonly PlanRecord[]>;
  savePlan(row: PlanRecord): Promise<void>;
  listPlanSpecificationIds(
    tenantId: string,
    planId: string,
  ): Promise<readonly string[]>;
  addPlanSpecification(
    tenantId: string,
    planId: string,
    specificationId: string,
    actorId: string,
  ): Promise<void>;
  listPlanSuiteMembership(
    tenantId: string,
    planId: string,
  ): Promise<readonly PlanSuiteMembership[]>;
  listPlanMembershipForSpecification(
    tenantId: string,
    specificationId: string,
  ): Promise<readonly string[]>;
  savePlanSuiteMembership(row: PlanSuiteMembership): Promise<void>;
  deletePlanSuiteMembership(tenantId: string, id: string): Promise<void>;
  listStrategy(tenantId: string, planId: string): Promise<readonly StrategyGroup[]>;
  saveStrategy(row: StrategyGroup): Promise<void>;
  listInternalExecutionPlanIds(
    tenantId: string,
    planId: string,
  ): Promise<readonly string[]>;
  saveInternalExecutionPlan(row: {
    readonly id: string;
    readonly tenantId: string;
    readonly applicationId: string;
    readonly planId: string;
    readonly suiteId: string;
    readonly name: string;
    readonly ownerId: string;
    readonly createdAt: string;
  }): Promise<void>;

  listMappings(
    tenantId: string,
    specificationId: string,
  ): Promise<readonly AutomationMapping[]>;
  saveMapping(row: AutomationMapping): Promise<void>;

  getCriterion(
    tenantId: string,
    criterionId: string,
  ): Promise<CriterionRow | undefined>;
  listCriterionIdsForSpecification(
    tenantId: string,
    specificationId: string,
  ): Promise<readonly string[]>;
  saveCriterionLink(row: {
    readonly id: string;
    readonly tenantId: string;
    readonly applicationId: string;
    readonly requirementId: string;
    readonly criterionId: string;
    readonly specificationId: string;
    readonly createdAt: string;
    readonly createdBy: string;
  }): Promise<void>;

  getEnvironment(
    tenantId: string,
    environmentId: string,
  ): Promise<EnvironmentRow | undefined>;
  getExecutionTarget(
    tenantId: string,
    targetId: string,
  ): Promise<ExecutionTargetRow | undefined>;

  saveDefinitionSnapshot(row: DefinitionSnapshot): Promise<void>;
  getDefinitionSnapshot(
    tenantId: string,
    executionId: string,
    specificationId: string,
  ): Promise<DefinitionSnapshot | undefined>;
  saveScopeSnapshot(row: ScopeSnapshot): Promise<void>;
  getScopeSnapshot(
    tenantId: string,
    executionId: string,
  ): Promise<ScopeSnapshot | undefined>;

  savePresentedExecution(row: PresentedExecution): Promise<void>;
  listPlanExecutions(
    tenantId: string,
    planId: string,
  ): Promise<readonly PresentedExecution[]>;
  listPresentedExecutions(filter: {
    readonly tenantId: string;
    readonly applicationId?: string;
    readonly includeUnbound?: boolean;
  }): Promise<readonly PresentedExecution[]>;
  getPresentedExecution(
    tenantId: string,
    executionId: string,
  ): Promise<PresentedExecution | undefined>;
  latestResultsForSpecifications(
    tenantId: string,
    specificationIds: readonly string[],
  ): Promise<Readonly<Record<string, ProductResultState>>>;

  saveTestExecutionDefect(row: {
    readonly id: string;
    readonly tenantId: string;
    readonly testExecutionId: string;
    readonly defectId: string;
    readonly createdAt: string;
    readonly createdBy: string;
  }): Promise<void>;
  listTestExecutionDefects(
    tenantId: string,
    testExecutionId: string,
  ): Promise<readonly string[]>;

  saveStrategySnapshot(row: import("../domain/types").StrategySnapshot): Promise<void>;
  getStrategySnapshot(
    tenantId: string,
    executionId: string,
  ): Promise<import("../domain/types").StrategySnapshot | undefined>;
  saveExecutionRelation(
    row: import("../domain/types").ExecutionRelation,
  ): Promise<void>;
  getExecutionRelation(
    tenantId: string,
    executionId: string,
  ): Promise<import("../domain/types").ExecutionRelation | undefined>;
  saveAutomationLink(row: {
    readonly id: string;
    readonly tenantId: string;
    readonly testExecutionId: string;
    readonly automationExecutionId: string;
    readonly correlationId?: string;
    readonly createdAt: string;
  }): Promise<void>;
  listAutomationLinks(
    tenantId: string,
    testExecutionId: string,
  ): Promise<
    readonly {
      readonly automationExecutionId: string;
      readonly correlationId?: string;
    }[]
  >;
  bindTestExecutionApplication(
    tenantId: string,
    executionId: string,
    applicationId: string,
  ): Promise<void>;
};

export type {
  CreatePlanInput,
  CreateStrategyInput,
  CreateSuiteInput,
  CreateTestCaseInput,
  PresentedPlan,
  PresentedSuite,
  PresentedTestCase,
  UpdateTestCaseInput,
};
