import { randomUUID } from "node:crypto";

import { derivePlanProgress, normalizePresentedExecution } from "../domain/progress";
import type { PresentedExecutionSeed } from "../domain/progress";
import {
  assertApplicationBound,
  assertInfrastructureTargetType,
  assertNoRawSecrets,
  assertNoTcAlias,
  assertSameApplication,
  isExecutionSurface,
  isInfrastructureTargetType,
  isVerificationCapability,
  normalizePriority,
  normalizeTestCaseType,
  parseTsNumber,
} from "../domain/guards";
import type {
  AutomationMapping,
  CreatePlanInput,
  CreateStrategyInput,
  CreateSuiteInput,
  CreateTestCaseInput,
  DefinitionStep,
  PresentedExecution,
  PresentedPlan,
  PresentedSuite,
  PresentedTestCase,
  StrategyGroup,
  UpdateTestCaseInput,
  VerificationCapability,
} from "../domain/types";
import type { TestManagementRepository } from "./repository";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

function specId(): string {
  return `tsp_${randomUUID().replaceAll("-", "")}`;
}

export type TestManagementService = {
  createTestCase(input: CreateTestCaseInput): Promise<PresentedTestCase>;
  updateTestCase(
    tenantId: string,
    id: string,
    actorId: string,
    patch: UpdateTestCaseInput,
  ): Promise<PresentedTestCase>;
  getTestCase(tenantId: string, id: string): Promise<PresentedTestCase>;
  listTestCases(filter: {
    readonly tenantId: string;
    readonly applicationId: string;
    readonly includeUnbound?: boolean;
  }): Promise<readonly PresentedTestCase[]>;
  linkAcceptanceCriterion(input: {
    readonly tenantId: string;
    readonly specificationId: string;
    readonly criterionId: string;
    readonly actorId: string;
  }): Promise<void>;
  saveAutomationMapping(input: {
    readonly tenantId: string;
    readonly specificationId: string;
    readonly actorId: string;
    readonly verificationCapability: VerificationCapability;
    readonly providerId?: string;
    readonly assetRef?: string;
  }): Promise<AutomationMapping>;

  createSuite(input: CreateSuiteInput): Promise<PresentedSuite>;
  getSuite(tenantId: string, id: string): Promise<PresentedSuite>;
  listSuites(filter: {
    readonly tenantId: string;
    readonly applicationId: string;
    readonly includeUnbound?: boolean;
  }): Promise<readonly PresentedSuite[]>;
  addSuiteMember(input: {
    readonly tenantId: string;
    readonly suiteId: string;
    readonly specificationId: string;
    readonly actorId: string;
  }): Promise<PresentedSuite>;

  createPlan(input: CreatePlanInput): Promise<PresentedPlan>;
  getPlan(tenantId: string, id: string): Promise<PresentedPlan>;
  listPlans(filter: {
    readonly tenantId: string;
    readonly applicationId: string;
    readonly includeUnbound?: boolean;
  }): Promise<readonly PresentedPlan[]>;
  addPlanSuite(input: {
    readonly tenantId: string;
    readonly planId: string;
    readonly suiteId: string;
    readonly actorId: string;
  }): Promise<PresentedPlan>;
  addPlanTestCase(input: {
    readonly tenantId: string;
    readonly planId: string;
    readonly specificationId: string;
    readonly actorId: string;
  }): Promise<PresentedPlan>;
  addStrategyGroup(input: {
    readonly tenantId: string;
    readonly planId: string;
    readonly actorId: string;
    readonly strategy: CreateStrategyInput;
  }): Promise<PresentedPlan>;
  listPlanExecutions(
    tenantId: string,
    planId: string,
  ): Promise<readonly PresentedExecution[]>;
  listPresentedExecutions(filter: {
    readonly tenantId: string;
    readonly applicationId: string;
    readonly includeUnbound?: boolean;
  }): Promise<readonly PresentedExecution[]>;
  getPresentedExecution(
    tenantId: string,
    executionId: string,
  ): Promise<PresentedExecution | undefined>;
  listTestExecutionDefects(
    tenantId: string,
    testExecutionId: string,
  ): Promise<readonly string[]>;
  resolvePlanExecutionScope(input: {
    readonly tenantId: string;
    readonly planId: string;
  }): Promise<{
    readonly applicationId: string;
    readonly memberSpecificationIds: readonly string[];
    readonly strategy?: StrategyGroup;
  }>;
  freezeExecutionStart(input: {
    readonly tenantId: string;
    readonly executionId: string;
    readonly executionKind: "test_execution" | "workspace_session";
    readonly specificationId?: string;
    readonly planId?: string;
    readonly suiteId?: string;
  }): Promise<void>;

  snapshotTestCaseExecution(input: {
    readonly tenantId: string;
    readonly specificationId: string;
    readonly executionId: string;
    readonly executionKind: "test_execution" | "workspace_session";
  }): Promise<void>;
  snapshotScope(input: {
    readonly tenantId: string;
    readonly executionId: string;
    readonly executionKind: "test_execution" | "workspace_session";
    readonly planId?: string;
    readonly suiteId?: string;
  }): Promise<void>;
  recordExecution(row: PresentedExecutionSeed): Promise<void>;
  relateDefectToTestExecution(input: {
    readonly tenantId: string;
    readonly testExecutionId: string;
    readonly defectId: string;
    readonly actorId: string;
  }): Promise<void>;
  getDefinitionSnapshot(
    tenantId: string,
    executionId: string,
    specificationId: string,
  ): ReturnType<TestManagementRepository["getDefinitionSnapshot"]>;
  getScopeSnapshot(
    tenantId: string,
    executionId: string,
  ): ReturnType<TestManagementRepository["getScopeSnapshot"]>;
  getStrategySnapshot(
    tenantId: string,
    executionId: string,
  ): ReturnType<TestManagementRepository["getStrategySnapshot"]>;
  recordRelation(input: {
    readonly tenantId: string;
    readonly executionId: string;
    readonly relationKind: "rerun" | "retest";
    readonly previousExecutionId: string;
    readonly triggeringDefectId?: string;
    readonly actorId: string;
  }): Promise<void>;
  correlateAutomation(input: {
    readonly tenantId: string;
    readonly testExecutionId: string;
    readonly automationExecutionId: string;
    readonly correlationId?: string;
  }): Promise<void>;
  getExecutionRelation(
    tenantId: string,
    executionId: string,
  ): ReturnType<TestManagementRepository["getExecutionRelation"]>;
  listAutomationLinks(
    tenantId: string,
    testExecutionId: string,
  ): ReturnType<TestManagementRepository["listAutomationLinks"]>;
  bindTestExecutionApplication(
    tenantId: string,
    executionId: string,
    applicationId: string,
  ): Promise<void>;
};

async function presentTestCase(
  repository: TestManagementRepository,
  row: Awaited<ReturnType<TestManagementRepository["getTestCase"]>> & object,
): Promise<PresentedTestCase> {
  if (!row) throw new Error("test_case.not_found");
  const [stepRows, mappings, criterionIds, suiteMembership, planIds, results] =
    await Promise.all([
      repository.listSteps(row.tenantId, row.id),
      repository.listMappings(row.tenantId, row.id),
      repository.listCriterionIdsForSpecification(row.tenantId, row.id),
      repository.listMembershipForSpecification(row.tenantId, row.id),
      repository.listPlanMembershipForSpecification(row.tenantId, row.id),
      repository.latestResultsForSpecifications(row.tenantId, [row.id]),
    ]);
  return {
    ...row,
    steps: stepRows,
    automationMappings: mappings,
    criterionIds,
    suiteIds: suiteMembership.map((item) => item.suiteId),
    planIds,
    lastResult: results[row.id] ?? "not_run",
    unbound: !row.applicationId,
  };
}

async function presentSuite(
  repository: TestManagementRepository,
  row: Awaited<ReturnType<TestManagementRepository["getSuite"]>> & object,
): Promise<PresentedSuite> {
  if (!row) throw new Error("suite.not_found");
  const members = await repository.listSuiteMembership(row.tenantId, row.id);
  return {
    ...row,
    memberIds: members.map((item) => item.specificationId),
    memberCount: members.length,
    unbound: !row.applicationId,
  };
}

async function expandPlanSpecificationIds(
  repository: TestManagementRepository,
  tenantId: string,
  planId: string,
): Promise<string[]> {
  const [direct, suiteMembership] = await Promise.all([
    repository.listPlanSpecificationIds(tenantId, planId),
    repository.listPlanSuiteMembership(tenantId, planId),
  ]);
  const ids = [...direct];
  for (const membership of suiteMembership) {
    const members = await repository.listSuiteMembership(tenantId, membership.suiteId);
    for (const member of members) ids.push(member.specificationId);
  }
  return [...new Set(ids)];
}

async function presentPlan(
  repository: TestManagementRepository,
  row: Awaited<ReturnType<TestManagementRepository["getPlan"]>> & object,
): Promise<PresentedPlan> {
  if (!row) throw new Error("test_plan.not_found");
  const [suiteMembership, specificationIds, strategy, internalIds] = await Promise.all([
    repository.listPlanSuiteMembership(row.tenantId, row.id),
    repository.listPlanSpecificationIds(row.tenantId, row.id),
    repository.listStrategy(row.tenantId, row.id),
    repository.listInternalExecutionPlanIds(row.tenantId, row.id),
  ]);
  const strategyWithNames = await Promise.all(
    strategy.map(async (group) => {
      if (!group.environmentId || group.environmentName) return group;
      const environment = await repository.getEnvironment(
        row.tenantId,
        group.environmentId,
      );
      return environment?.name
        ? { ...group, environmentName: environment.name }
        : group;
    }),
  );
  const plannedIds = await expandPlanSpecificationIds(repository, row.tenantId, row.id);
  const results = await repository.latestResultsForSpecifications(
    row.tenantId,
    plannedIds,
  );
  return {
    ...row,
    suiteIds: suiteMembership.map((item) => item.suiteId),
    specificationIds,
    strategy: strategyWithNames,
    internalExecutionPlanIds: internalIds,
    progress: derivePlanProgress({ plannedIds, results }),
    unbound: !row.applicationId,
  };
}

async function allocateTsNumber(
  repository: TestManagementRepository,
  tenantId: string,
  applicationId: string,
): Promise<string> {
  const existing = await repository.listExistingTsNumbers(tenantId);
  const maxExisting = existing.reduce((max, number) => {
    const parsed = parseTsNumber(number);
    return parsed && parsed > max ? parsed : max;
  }, 0);
  let next = await repository.nextKeyNumber(tenantId, applicationId, "test_case");
  next = Math.max(next, maxExisting + 1);
  const used = new Set(existing);
  while (used.has(`TS-${next}`)) next += 1;
  return `TS-${next}`;
}

function validateSteps(steps: readonly Omit<DefinitionStep, "id">[] | undefined): void {
  if (!steps) return;
  const orders = new Set<number>();
  for (const step of steps) {
    if ("actualResult" in step || "outcome" in step || "evidence" in step) {
      throw new Error("test_case.step.execution_state_forbidden");
    }
    if (!step.action?.trim() || !step.expectedResult?.trim()) {
      throw new Error("test_case.step.incomplete");
    }
    assertNoRawSecrets(step.action, "test_case.step");
    assertNoRawSecrets(step.testDataRef, "test_case.step");
    assertNoRawSecrets(step.expectedResult, "test_case.step");
    if (orders.has(step.order)) throw new Error("test_case.step.duplicate_order");
    orders.add(step.order);
  }
}

export function createTestManagementService(
  repository: TestManagementRepository,
): TestManagementService {
  return {
    async createTestCase(input) {
      assertApplicationBound(input.applicationId, "test_case");
      if (input.number) assertNoTcAlias(input.number);
      validateSteps(input.steps);
      for (const item of input.preconditions ?? []) {
        assertNoRawSecrets(item, "test_case.precondition");
      }
      const now = nowIso();
      const number =
        input.number?.trim() ||
        (await allocateTsNumber(repository, input.tenantId, input.applicationId));
      assertNoTcAlias(number);
      const id = specId();
      const row = {
        id,
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        number,
        title: input.title.trim(),
        description: (input.description ?? input.title).trim(),
        objective: (input.description ?? input.title).trim(),
        status: "draft",
        type: normalizeTestCaseType(input.type),
        priority: normalizePriority(input.priority),
        owner: input.owner ?? input.actorId,
        author: input.actorId,
        tags: input.tags ?? [],
        preconditions: input.preconditions ?? [],
        definitionVersion: 1,
        manualCapable: input.manualCapable ?? true,
        createdAt: now,
        updatedAt: now,
        createdBy: input.actorId,
        updatedBy: input.actorId,
      };
      await repository.saveTestCase(row);
      if (input.steps?.length) {
        await repository.replaceSteps(input.tenantId, id, input.actorId, input.steps);
      }
      return presentTestCase(repository, row);
    },

    async updateTestCase(tenantId, id, actorId, patch) {
      const existing = await repository.getTestCase(tenantId, id);
      if (!existing) throw new Error("test_case.not_found");
      validateSteps(patch.steps);
      for (const item of patch.preconditions ?? []) {
        assertNoRawSecrets(item, "test_case.precondition");
      }
      const now = nowIso();
      const next = {
        ...existing,
        ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
        ...(patch.description !== undefined
          ? { description: patch.description.trim() }
          : {}),
        ...(patch.type !== undefined
          ? { type: normalizeTestCaseType(patch.type) }
          : {}),
        ...(patch.priority !== undefined
          ? { priority: normalizePriority(patch.priority) }
          : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.owner !== undefined ? { owner: patch.owner } : {}),
        ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
        ...(patch.preconditions !== undefined
          ? { preconditions: patch.preconditions }
          : {}),
        ...(patch.manualCapable !== undefined
          ? { manualCapable: patch.manualCapable }
          : {}),
        definitionVersion:
          patch.steps !== undefined
            ? existing.definitionVersion + 1
            : existing.definitionVersion,
        updatedAt: now,
        updatedBy: actorId,
      };
      await repository.saveTestCase(next);
      if (patch.steps) {
        await repository.replaceSteps(tenantId, id, actorId, patch.steps);
      }
      return presentTestCase(repository, next);
    },

    async getTestCase(tenantId, id) {
      const row = await repository.getTestCase(tenantId, id);
      if (!row) throw new Error("test_case.not_found");
      return presentTestCase(repository, row);
    },

    async listTestCases(filter) {
      const rows = await repository.listTestCases(filter);
      const presented: PresentedTestCase[] = [];
      for (const row of rows) presented.push(await presentTestCase(repository, row));
      return presented;
    },

    async linkAcceptanceCriterion(input) {
      const testCase = await repository.getTestCase(
        input.tenantId,
        input.specificationId,
      );
      if (!testCase) throw new Error("test_case.not_found");
      if (!testCase.applicationId) throw new Error("test_case.application_required");
      const criterion = await repository.getCriterion(
        input.tenantId,
        input.criterionId,
      );
      if (!criterion) throw new Error("criterion.not_found");
      assertSameApplication(testCase.applicationId, criterion.applicationId);
      await repository.saveCriterionLink({
        id: newId("qacv"),
        tenantId: input.tenantId,
        applicationId: testCase.applicationId,
        requirementId: criterion.requirementId,
        criterionId: criterion.id,
        specificationId: testCase.id,
        createdAt: nowIso(),
        createdBy: input.actorId,
      });
    },

    async saveAutomationMapping(input) {
      const testCase = await repository.getTestCase(
        input.tenantId,
        input.specificationId,
      );
      if (!testCase?.applicationId) throw new Error("test_case.not_found");
      if (!isVerificationCapability(input.verificationCapability)) {
        throw new Error("automation.capability_invalid");
      }
      const now = nowIso();
      const row: AutomationMapping = {
        id: newId("qtam"),
        tenantId: input.tenantId,
        applicationId: testCase.applicationId,
        specificationId: testCase.id,
        verificationCapability: input.verificationCapability,
        ...(input.providerId ? { providerId: input.providerId } : {}),
        ...(input.assetRef ? { assetRef: input.assetRef } : {}),
        createdAt: now,
        createdBy: input.actorId,
        updatedAt: now,
        updatedBy: input.actorId,
      };
      await repository.saveMapping(row);
      return row;
    },

    async createSuite(input) {
      assertApplicationBound(input.applicationId, "suite");
      const n = await repository.nextKeyNumber(
        input.tenantId,
        input.applicationId,
        "suite",
      );
      const now = nowIso();
      const row = {
        id: `suite-${randomUUID()}`,
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        suiteKey: `SUITE-${String(n).padStart(3, "0")}`,
        name: input.name.trim(),
        description: input.description?.trim() ?? "",
        kind: input.kind ?? "standard",
        status: "draft",
        ownerId: input.actorId,
        tags: input.tags ?? [],
        createdAt: now,
        updatedAt: now,
      };
      await repository.saveSuite(row);
      return presentSuite(repository, row);
    },

    async getSuite(tenantId, id) {
      const row = await repository.getSuite(tenantId, id);
      if (!row) throw new Error("suite.not_found");
      return presentSuite(repository, row);
    },

    async listSuites(filter) {
      const rows = await repository.listSuites(filter);
      const presented: PresentedSuite[] = [];
      for (const row of rows) presented.push(await presentSuite(repository, row));
      return presented;
    },

    async addSuiteMember(input) {
      const suite = await repository.getSuite(input.tenantId, input.suiteId);
      if (!suite) throw new Error("suite.not_found");
      if (!suite.applicationId) throw new Error("suite.application_required");
      const testCase = await repository.getTestCase(
        input.tenantId,
        input.specificationId,
      );
      if (!testCase) throw new Error("test_case.not_found");
      if (!testCase.applicationId) throw new Error("test_case.application_required");
      assertSameApplication(suite.applicationId, testCase.applicationId);
      const existing = await repository.listSuiteMembership(input.tenantId, suite.id);
      if (existing.some((row) => row.specificationId === testCase.id)) {
        return presentSuite(repository, suite);
      }
      await repository.saveSuiteMembership({
        id: newId("qsi"),
        tenantId: input.tenantId,
        applicationId: suite.applicationId,
        suiteId: suite.id,
        specificationId: testCase.id,
        sequence: existing.length + 1,
        createdAt: nowIso(),
        createdBy: input.actorId,
      });
      return presentSuite(repository, suite);
    },

    async createPlan(input) {
      assertApplicationBound(input.applicationId, "test_plan");
      const now = nowIso();
      const row = {
        id: `tpl_${randomUUID().replaceAll("-", "").slice(0, 16)}`,
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        number: `TP-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`,
        title: input.title.trim(),
        ...(input.description ? { description: input.description.trim() } : {}),
        objective: input.objective.trim(),
        status: "draft",
        ownerId: input.actorId,
        createdAt: now,
        updatedAt: now,
      };
      await repository.savePlan(row);
      return presentPlan(repository, row);
    },

    async getPlan(tenantId, id) {
      const row = await repository.getPlan(tenantId, id);
      if (!row) throw new Error("test_plan.not_found");
      return presentPlan(repository, row);
    },

    async listPlans(filter) {
      const rows = await repository.listPlans(filter);
      const presented: PresentedPlan[] = [];
      for (const row of rows) presented.push(await presentPlan(repository, row));
      return presented;
    },

    async addPlanSuite(input) {
      const plan = await repository.getPlan(input.tenantId, input.planId);
      if (!plan?.applicationId) throw new Error("test_plan.not_found");
      const suite = await repository.getSuite(input.tenantId, input.suiteId);
      if (!suite?.applicationId) throw new Error("suite.not_found");
      assertSameApplication(plan.applicationId, suite.applicationId);
      const existing = await repository.listPlanSuiteMembership(
        input.tenantId,
        plan.id,
      );
      if (!existing.some((row) => row.suiteId === suite.id)) {
        await repository.savePlanSuiteMembership({
          id: newId("qpsi"),
          tenantId: input.tenantId,
          applicationId: plan.applicationId,
          planId: plan.id,
          suiteId: suite.id,
          sequence: existing.length + 1,
          createdAt: nowIso(),
          createdBy: input.actorId,
        });
        await repository.saveInternalExecutionPlan({
          id: newId("qep"),
          tenantId: input.tenantId,
          applicationId: plan.applicationId,
          planId: plan.id,
          suiteId: suite.id,
          name: `Internal orchestration for ${plan.title}`,
          ownerId: input.actorId,
          createdAt: nowIso(),
        });
      }
      return presentPlan(repository, plan);
    },

    async addPlanTestCase(input) {
      const plan = await repository.getPlan(input.tenantId, input.planId);
      if (!plan?.applicationId) throw new Error("test_plan.not_found");
      const testCase = await repository.getTestCase(
        input.tenantId,
        input.specificationId,
      );
      if (!testCase?.applicationId) throw new Error("test_case.not_found");
      assertSameApplication(plan.applicationId, testCase.applicationId);
      await repository.addPlanSpecification(
        input.tenantId,
        plan.id,
        testCase.id,
        input.actorId,
      );
      return presentPlan(repository, plan);
    },

    async addStrategyGroup(input) {
      const plan = await repository.getPlan(input.tenantId, input.planId);
      if (!plan?.applicationId) throw new Error("test_plan.not_found");
      const strategy = input.strategy;
      if (!isVerificationCapability(strategy.verificationCapability)) {
        throw new Error("strategy.capability_invalid");
      }
      if (strategy.executionSurface && !isExecutionSurface(strategy.executionSurface)) {
        throw new Error("strategy.surface_invalid");
      }
      assertInfrastructureTargetType(strategy.infrastructureTargetType);
      assertNoRawSecrets(strategy.testDataRef, "strategy");
      if (strategy.environmentId) {
        const environment = await repository.getEnvironment(
          input.tenantId,
          strategy.environmentId,
        );
        if (!environment) throw new Error("strategy.environment_not_found");
        assertSameApplication(plan.applicationId, environment.applicationId);
      }
      if (strategy.infrastructureTargetId) {
        const target = await repository.getExecutionTarget(
          input.tenantId,
          strategy.infrastructureTargetId,
        );
        if (!target) throw new Error("strategy.target_not_found");
        assertSameApplication(plan.applicationId, target.applicationId);
        assertInfrastructureTargetType(target.targetType);
      }
      const existing = await repository.listStrategy(input.tenantId, plan.id);
      const now = nowIso();
      const row: StrategyGroup = {
        id: newId("qpsg"),
        tenantId: input.tenantId,
        applicationId: plan.applicationId,
        planId: plan.id,
        name: strategy.name.trim(),
        verificationCapability: strategy.verificationCapability,
        ...(strategy.executionSurface
          ? { executionSurface: strategy.executionSurface }
          : {}),
        ...(strategy.environmentId ? { environmentId: strategy.environmentId } : {}),
        ...(strategy.infrastructureTargetType &&
        isInfrastructureTargetType(strategy.infrastructureTargetType)
          ? { infrastructureTargetType: strategy.infrastructureTargetType }
          : {}),
        ...(strategy.infrastructureTargetId
          ? { infrastructureTargetId: strategy.infrastructureTargetId }
          : {}),
        ...(strategy.automationMappingId
          ? { automationMappingId: strategy.automationMappingId }
          : {}),
        ...(strategy.testDataRef ? { testDataRef: strategy.testDataRef } : {}),
        ...(strategy.scheduleNote ? { scheduleNote: strategy.scheduleNote } : {}),
        sequence: existing.length + 1,
        createdAt: now,
        createdBy: input.actorId,
        updatedAt: now,
        updatedBy: input.actorId,
      };
      await repository.saveStrategy(row);
      return presentPlan(repository, plan);
    },

    async listPlanExecutions(tenantId, planId) {
      return repository.listPlanExecutions(tenantId, planId);
    },

    async snapshotTestCaseExecution(input) {
      const testCase = await repository.getTestCase(
        input.tenantId,
        input.specificationId,
      );
      if (!testCase) throw new Error("test_case.not_found");
      const existing = await repository.getDefinitionSnapshot(
        input.tenantId,
        input.executionId,
        input.specificationId,
      );
      if (existing) return;
      const steps = await repository.listSteps(input.tenantId, testCase.id);
      await repository.saveDefinitionSnapshot({
        id: newId("qeds"),
        tenantId: input.tenantId,
        executionId: input.executionId,
        executionKind: input.executionKind,
        specificationId: testCase.id,
        specificationNumber: testCase.number,
        definitionVersion: testCase.definitionVersion,
        steps: steps.map((step) => ({
          order: step.order,
          action: step.action,
          ...(step.testDataRef ? { testDataRef: step.testDataRef } : {}),
          expectedResult: step.expectedResult,
        })),
        createdAt: nowIso(),
      });
    },

    async snapshotScope(input) {
      const existing = await repository.getScopeSnapshot(
        input.tenantId,
        input.executionId,
      );
      if (existing) return;
      let memberSpecificationIds: string[] = [];
      if (input.suiteId) {
        const members = await repository.listSuiteMembership(
          input.tenantId,
          input.suiteId,
        );
        memberSpecificationIds = members.map((row) => row.specificationId);
      } else if (input.planId) {
        memberSpecificationIds = await expandPlanSpecificationIds(
          repository,
          input.tenantId,
          input.planId,
        );
      }
      await repository.saveScopeSnapshot({
        id: newId("qess"),
        tenantId: input.tenantId,
        executionId: input.executionId,
        executionKind: input.executionKind,
        ...(input.planId ? { planId: input.planId } : {}),
        ...(input.suiteId ? { suiteId: input.suiteId } : {}),
        memberSpecificationIds,
        createdAt: nowIso(),
      });
    },

    async recordExecution(row) {
      await repository.savePresentedExecution(normalizePresentedExecution(row));
    },

    async relateDefectToTestExecution(input) {
      await repository.saveTestExecutionDefect({
        id: newId("qted"),
        tenantId: input.tenantId,
        testExecutionId: input.testExecutionId,
        defectId: input.defectId,
        createdAt: nowIso(),
        createdBy: input.actorId,
      });
    },

    getDefinitionSnapshot(tenantId, executionId, specificationId) {
      return repository.getDefinitionSnapshot(tenantId, executionId, specificationId);
    },

    getScopeSnapshot(tenantId, executionId) {
      return repository.getScopeSnapshot(tenantId, executionId);
    },
    getStrategySnapshot(tenantId, executionId) {
      return repository.getStrategySnapshot(tenantId, executionId);
    },
    async listPresentedExecutions(filter) {
      return repository.listPresentedExecutions(filter);
    },
    async getPresentedExecution(tenantId, executionId) {
      return repository.getPresentedExecution(tenantId, executionId);
    },
    async listTestExecutionDefects(tenantId, testExecutionId) {
      return repository.listTestExecutionDefects(tenantId, testExecutionId);
    },
    async resolvePlanExecutionScope(input) {
      const plan = await repository.getPlan(input.tenantId, input.planId);
      if (!plan?.applicationId) throw new Error("plan.application_required");
      const members = await expandPlanSpecificationIds(
        repository,
        input.tenantId,
        plan.id,
      );
      if (members.length === 0) throw new Error("plan.scope.empty");
      for (const specificationId of members) {
        const testCase = await repository.getTestCase(input.tenantId, specificationId);
        if (!testCase) throw new Error("test_case.not_found");
        if (!testCase.applicationId) throw new Error("test_case.unbound");
        assertSameApplication(plan.applicationId, testCase.applicationId);
        const steps = await repository.listSteps(input.tenantId, specificationId);
        if (steps.length === 0) throw new Error("test_case.steps_required");
        for (const step of steps) {
          assertNoRawSecrets(step.action, "step.action");
          assertNoRawSecrets(step.testDataRef, "step.testData");
          assertNoRawSecrets(step.expectedResult, "step.expected");
        }
      }
      const strategy = (await repository.listStrategy(input.tenantId, plan.id))[0];
      if (strategy?.environmentId) {
        const environment = await repository.getEnvironment(
          input.tenantId,
          strategy.environmentId,
        );
        if (!environment) throw new Error("environment.not_found");
        assertSameApplication(plan.applicationId, environment.applicationId);
      }
      if (strategy?.infrastructureTargetId) {
        const target = await repository.getExecutionTarget(
          input.tenantId,
          strategy.infrastructureTargetId,
        );
        if (!target) throw new Error("execution_target.not_found");
        assertSameApplication(plan.applicationId, target.applicationId);
        if (
          strategy.infrastructureTargetType &&
          !isInfrastructureTargetType(strategy.infrastructureTargetType)
        ) {
          throw new Error("strategy.infrastructure_target.type_invalid");
        }
      }
      return {
        applicationId: plan.applicationId,
        memberSpecificationIds: members,
        ...(strategy ? { strategy } : {}),
      };
    },
    async freezeExecutionStart(input) {
      if (input.specificationId) {
        await this.snapshotTestCaseExecution({
          tenantId: input.tenantId,
          specificationId: input.specificationId,
          executionId: input.executionId,
          executionKind: input.executionKind,
        });
      }
      if (input.planId || input.suiteId) {
        await this.snapshotScope({
          tenantId: input.tenantId,
          executionId: input.executionId,
          executionKind: input.executionKind,
          ...(input.planId ? { planId: input.planId } : {}),
          ...(input.suiteId ? { suiteId: input.suiteId } : {}),
        });
      }
      if (input.planId) {
        const existing = await repository.getStrategySnapshot(
          input.tenantId,
          input.executionId,
        );
        if (!existing) {
          const plan = await repository.getPlan(input.tenantId, input.planId);
          const strategy = (
            await repository.listStrategy(input.tenantId, input.planId)
          )[0];
          let environmentName: string | undefined;
          let targetName: string | undefined;
          if (strategy?.environmentId) {
            const environment = await repository.getEnvironment(
              input.tenantId,
              strategy.environmentId,
            );
            environmentName = environment?.name;
          }
          if (strategy?.infrastructureTargetId) {
            const target = await repository.getExecutionTarget(
              input.tenantId,
              strategy.infrastructureTargetId,
            );
            targetName = target ? `${target.targetType}` : undefined;
          }
          await repository.saveStrategySnapshot({
            id: newId("qest"),
            tenantId: input.tenantId,
            executionId: input.executionId,
            executionKind: input.executionKind,
            ...(input.planId ? { planId: input.planId } : {}),
            ...(strategy?.id ? { strategyGroupId: strategy.id } : {}),
            ...(strategy?.verificationCapability
              ? { verificationCapability: strategy.verificationCapability }
              : {}),
            ...(strategy?.executionSurface
              ? { executionSurface: strategy.executionSurface }
              : {}),
            ...(strategy?.environmentId
              ? { environmentId: strategy.environmentId }
              : {}),
            ...(environmentName ? { environmentName } : {}),
            ...(strategy?.infrastructureTargetType
              ? { infrastructureTargetType: strategy.infrastructureTargetType }
              : {}),
            ...(strategy?.infrastructureTargetId
              ? { infrastructureTargetId: strategy.infrastructureTargetId }
              : {}),
            ...(targetName ? { infrastructureTargetName: targetName } : {}),
            ...(strategy?.automationMappingId
              ? { automationMappingId: strategy.automationMappingId }
              : {}),
            ...(strategy?.testDataRef ? { testDataRef: strategy.testDataRef } : {}),
            createdAt: nowIso(),
          });
          void plan;
        }
      }
    },
    async recordRelation(input: {
      readonly tenantId: string;
      readonly executionId: string;
      readonly relationKind: "rerun" | "retest";
      readonly previousExecutionId: string;
      readonly triggeringDefectId?: string;
      readonly actorId: string;
    }) {
      if (input.relationKind === "retest" && !input.triggeringDefectId) {
        throw new Error("retest.defect_required");
      }
      if (input.relationKind === "rerun" && input.triggeringDefectId) {
        throw new Error("rerun.defect_not_allowed");
      }
      await repository.saveExecutionRelation({
        id: newId("qter"),
        tenantId: input.tenantId,
        executionId: input.executionId,
        relationKind: input.relationKind,
        previousExecutionId: input.previousExecutionId,
        ...(input.triggeringDefectId
          ? { triggeringDefectId: input.triggeringDefectId }
          : {}),
        createdAt: nowIso(),
        createdBy: input.actorId,
      });
    },
    async correlateAutomation(input: {
      readonly tenantId: string;
      readonly testExecutionId: string;
      readonly automationExecutionId: string;
      readonly correlationId?: string;
    }) {
      await repository.saveAutomationLink({
        id: newId("qtal"),
        tenantId: input.tenantId,
        testExecutionId: input.testExecutionId,
        automationExecutionId: input.automationExecutionId,
        ...(input.correlationId ? { correlationId: input.correlationId } : {}),
        createdAt: nowIso(),
      });
    },
    getExecutionRelation(tenantId, executionId) {
      return repository.getExecutionRelation(tenantId, executionId);
    },
    listAutomationLinks(tenantId, testExecutionId) {
      return repository.listAutomationLinks(tenantId, testExecutionId);
    },
    bindTestExecutionApplication(tenantId, executionId, applicationId) {
      return repository.bindTestExecutionApplication(
        tenantId,
        executionId,
        applicationId,
      );
    },
  };
}
