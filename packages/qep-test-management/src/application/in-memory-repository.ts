import { randomUUID } from "node:crypto";

import type {
  AutomationMapping,
  DefinitionSnapshot,
  DefinitionStep,
  PlanRecord,
  PlanSuiteMembership,
  PresentedExecution,
  ProductResultState,
  ScopeSnapshot,
  StrategyGroup,
  SuiteMembership,
  SuiteRecord,
  TestCaseRecord,
} from "../domain/types";
import { normalizePresentedExecution } from "../domain/progress";
import type {
  CriterionRow,
  EnvironmentRow,
  ExecutionTargetRow,
  PlanListFilter,
  SuiteListFilter,
  TestCaseListFilter,
  TestManagementRepository,
} from "./repository";

function scoped<T extends { tenantId: string; id: string }>(
  tenantId: string,
  id: string,
  store: Map<string, T>,
): T | undefined {
  const row = store.get(id);
  return row?.tenantId === tenantId ? row : undefined;
}

export type InMemoryTestManagementRepository = TestManagementRepository & {
  seedCriterion(row: CriterionRow): void;
  seedEnvironment(row: EnvironmentRow): void;
  seedTarget(row: ExecutionTargetRow): void;
};

export function createInMemoryTestManagementRepository(): InMemoryTestManagementRepository {
  const cases = new Map<string, TestCaseRecord>();
  const steps = new Map<string, DefinitionStep[]>();
  const suites = new Map<string, SuiteRecord>();
  const suiteItems = new Map<string, SuiteMembership>();
  const plans = new Map<string, PlanRecord>();
  const planSpecs = new Map<string, string[]>();
  const planSuites = new Map<string, PlanSuiteMembership>();
  const strategies = new Map<string, StrategyGroup>();
  const mappings = new Map<string, AutomationMapping>();
  const criteria = new Map<string, CriterionRow>();
  const criterionLinks = new Map<string, string[]>();
  const environments = new Map<string, EnvironmentRow>();
  const targets = new Map<string, ExecutionTargetRow>();
  const definitionSnapshots = new Map<string, DefinitionSnapshot>();
  const scopeSnapshots = new Map<string, ScopeSnapshot>();
  const strategySnapshots = new Map<
    string,
    import("../domain/types").StrategySnapshot
  >();
  const relations = new Map<string, import("../domain/types").ExecutionRelation>();
  const automationLinks = new Map<
    string,
    { readonly automationExecutionId: string; readonly correlationId?: string }[]
  >();
  const executions = new Map<string, PresentedExecution>();
  const teDefects = new Map<string, string[]>();
  const internalPlans = new Map<string, string[]>();
  const counters = new Map<string, number>();

  return {
    async nextKeyNumber(tenantId, applicationId, kind) {
      const key = `${tenantId}:${applicationId}:${kind}`;
      const next = (counters.get(key) ?? 0) + 1;
      counters.set(key, next);
      return next;
    },
    async listExistingTsNumbers(tenantId) {
      return [...cases.values()]
        .filter((row) => row.tenantId === tenantId)
        .map((row) => row.number);
    },
    async getTestCase(tenantId, id) {
      return scoped(tenantId, id, cases);
    },
    async listTestCases(filter: TestCaseListFilter) {
      return [...cases.values()]
        .filter((row) => row.tenantId === filter.tenantId)
        .filter((row) => {
          if (!filter.applicationId) return true;
          if (row.applicationId === filter.applicationId) return true;
          return Boolean(filter.includeUnbound && !row.applicationId);
        })
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async saveTestCase(row) {
      cases.set(row.id, row);
    },
    async listSteps(tenantId, specificationId) {
      const row = cases.get(specificationId);
      if (!row || row.tenantId !== tenantId) return [];
      return [...(steps.get(specificationId) ?? [])].sort((a, b) => a.order - b.order);
    },
    async replaceSteps(tenantId, specificationId, actorId, nextSteps) {
      const row = cases.get(specificationId);
      if (!row || row.tenantId !== tenantId) {
        throw new Error("test_case.not_found");
      }
      const stored = nextSteps.map((step, index) => ({
        id: `qts-${randomUUID()}`,
        order: step.order || index + 1,
        action: step.action,
        ...(step.testDataRef ? { testDataRef: step.testDataRef } : {}),
        expectedResult: step.expectedResult,
      }));
      steps.set(specificationId, stored);
      void actorId;
      return stored;
    },
    async getSuite(tenantId, id) {
      return scoped(tenantId, id, suites);
    },
    async listSuites(filter: SuiteListFilter) {
      return [...suites.values()]
        .filter((row) => row.tenantId === filter.tenantId)
        .filter((row) => {
          if (!filter.applicationId) return true;
          if (row.applicationId === filter.applicationId) return true;
          return Boolean(filter.includeUnbound && !row.applicationId);
        })
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async saveSuite(row) {
      suites.set(row.id, row);
    },
    async listSuiteMembership(tenantId, suiteId) {
      return [...suiteItems.values()]
        .filter((row) => row.tenantId === tenantId && row.suiteId === suiteId)
        .sort((a, b) => a.sequence - b.sequence);
    },
    async listMembershipForSpecification(tenantId, specificationId) {
      return [...suiteItems.values()].filter(
        (row) => row.tenantId === tenantId && row.specificationId === specificationId,
      );
    },
    async saveSuiteMembership(row) {
      suiteItems.set(row.id, row);
    },
    async deleteSuiteMembership(tenantId, id) {
      const row = suiteItems.get(id);
      if (row?.tenantId === tenantId) suiteItems.delete(id);
    },
    async getPlan(tenantId, id) {
      return scoped(tenantId, id, plans);
    },
    async listPlans(filter: PlanListFilter) {
      return [...plans.values()]
        .filter((row) => row.tenantId === filter.tenantId)
        .filter((row) => {
          if (!filter.applicationId) return true;
          if (row.applicationId === filter.applicationId) return true;
          return Boolean(filter.includeUnbound && !row.applicationId);
        })
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async savePlan(row) {
      plans.set(row.id, row);
    },
    async listPlanSpecificationIds(tenantId, planId) {
      const plan = plans.get(planId);
      if (!plan || plan.tenantId !== tenantId) return [];
      return [...(planSpecs.get(planId) ?? [])];
    },
    async addPlanSpecification(tenantId, planId, specificationId) {
      const plan = plans.get(planId);
      if (!plan || plan.tenantId !== tenantId) throw new Error("test_plan.not_found");
      const current = planSpecs.get(planId) ?? [];
      if (!current.includes(specificationId)) {
        planSpecs.set(planId, [...current, specificationId]);
      }
    },
    async listPlanSuiteMembership(tenantId, planId) {
      return [...planSuites.values()]
        .filter((row) => row.tenantId === tenantId && row.planId === planId)
        .sort((a, b) => a.sequence - b.sequence);
    },
    async listPlanMembershipForSpecification(tenantId, specificationId) {
      const ids = new Set<string>();
      for (const [planId, specs] of planSpecs.entries()) {
        const plan = plans.get(planId);
        if (plan?.tenantId === tenantId && specs.includes(specificationId))
          ids.add(planId);
      }
      return [...ids];
    },
    async savePlanSuiteMembership(row) {
      planSuites.set(row.id, row);
    },
    async deletePlanSuiteMembership(tenantId, id) {
      const row = planSuites.get(id);
      if (row?.tenantId === tenantId) planSuites.delete(id);
    },
    async listStrategy(tenantId, planId) {
      return [...strategies.values()]
        .filter((row) => row.tenantId === tenantId && row.planId === planId)
        .sort((a, b) => a.sequence - b.sequence);
    },
    async saveStrategy(row) {
      strategies.set(row.id, row);
    },
    async listInternalExecutionPlanIds(tenantId, planId) {
      return internalPlans.get(`${tenantId}:${planId}`) ?? [];
    },
    async saveInternalExecutionPlan(row) {
      const key = `${row.tenantId}:${row.planId}`;
      internalPlans.set(key, [...(internalPlans.get(key) ?? []), row.id]);
    },
    async listMappings(tenantId, specificationId) {
      return [...mappings.values()].filter(
        (row) => row.tenantId === tenantId && row.specificationId === specificationId,
      );
    },
    async saveMapping(row) {
      mappings.set(row.id, row);
    },
    async getCriterion(tenantId, criterionId) {
      const row = criteria.get(criterionId);
      return row?.tenantId === tenantId ? row : undefined;
    },
    async listCriterionIdsForSpecification(tenantId, specificationId) {
      return (criterionLinks.get(`${tenantId}:${specificationId}`) ?? []).slice();
    },
    async saveCriterionLink(row) {
      criteria.set(row.criterionId, {
        id: row.criterionId,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        requirementId: row.requirementId,
        criterionKey: row.criterionId,
        text: "",
      });
      const key = `${row.tenantId}:${row.specificationId}`;
      const current = criterionLinks.get(key) ?? [];
      if (!current.includes(row.criterionId))
        criterionLinks.set(key, [...current, row.criterionId]);
    },
    seedCriterion(row: CriterionRow) {
      criteria.set(row.id, row);
    },
    seedEnvironment(row: EnvironmentRow) {
      environments.set(row.id, row);
    },
    seedTarget(row: ExecutionTargetRow) {
      targets.set(row.id, row);
    },
    async getEnvironment(tenantId, environmentId) {
      const row = environments.get(environmentId);
      return row?.tenantId === tenantId ? row : undefined;
    },
    async getExecutionTarget(tenantId, targetId) {
      const row = targets.get(targetId);
      return row?.tenantId === tenantId ? row : undefined;
    },
    async saveDefinitionSnapshot(row) {
      definitionSnapshots.set(
        `${row.tenantId}:${row.executionId}:${row.specificationId}`,
        row,
      );
    },
    async getDefinitionSnapshot(tenantId, executionId, specificationId) {
      return definitionSnapshots.get(`${tenantId}:${executionId}:${specificationId}`);
    },
    async saveScopeSnapshot(row) {
      scopeSnapshots.set(`${row.tenantId}:${row.executionId}`, row);
    },
    async getScopeSnapshot(tenantId, executionId) {
      return scopeSnapshots.get(`${tenantId}:${executionId}`);
    },
    async savePresentedExecution(row) {
      executions.set(row.id, normalizePresentedExecution(row));
    },
    async listPlanExecutions(tenantId, planId) {
      return [...executions.values()]
        .filter((row) => row.tenantId === tenantId && row.planId === planId)
        .sort((a, b) => b.executedAt.localeCompare(a.executedAt));
    },
    async listPresentedExecutions(filter) {
      return [...executions.values()]
        .filter((row) => row.tenantId === filter.tenantId)
        .filter((row) => {
          if (!filter.applicationId) return true;
          if (row.applicationId === filter.applicationId) return true;
          return Boolean(filter.includeUnbound && row.unbound);
        })
        .sort((a, b) => b.executedAt.localeCompare(a.executedAt));
    },
    async getPresentedExecution(tenantId, executionId) {
      const row = executions.get(executionId);
      return row?.tenantId === tenantId ? row : undefined;
    },
    async latestResultsForSpecifications(tenantId, specificationIds) {
      const results: Record<string, ProductResultState> = {};
      const wanted = new Set(specificationIds);
      const rows = [...executions.values()]
        .filter(
          (row) =>
            row.tenantId === tenantId &&
            row.specificationId &&
            wanted.has(row.specificationId),
        )
        .sort((a, b) => b.executedAt.localeCompare(a.executedAt));
      for (const row of rows) {
        if (row.specificationId && results[row.specificationId] === undefined) {
          results[row.specificationId] = row.result;
        }
      }
      return results;
    },
    async saveTestExecutionDefect(row) {
      const key = `${row.tenantId}:${row.testExecutionId}`;
      const current = teDefects.get(key) ?? [];
      if (!current.includes(row.defectId))
        teDefects.set(key, [...current, row.defectId]);
    },
    async listTestExecutionDefects(tenantId, testExecutionId) {
      return teDefects.get(`${tenantId}:${testExecutionId}`) ?? [];
    },
    async saveStrategySnapshot(row) {
      strategySnapshots.set(`${row.tenantId}:${row.executionId}`, row);
    },
    async getStrategySnapshot(tenantId, executionId) {
      return strategySnapshots.get(`${tenantId}:${executionId}`);
    },
    async saveExecutionRelation(row) {
      relations.set(`${row.tenantId}:${row.executionId}`, row);
    },
    async getExecutionRelation(tenantId, executionId) {
      return relations.get(`${tenantId}:${executionId}`);
    },
    async saveAutomationLink(row) {
      const key = `${row.tenantId}:${row.testExecutionId}`;
      const current = automationLinks.get(key) ?? [];
      automationLinks.set(key, [
        ...current,
        {
          automationExecutionId: row.automationExecutionId,
          ...(row.correlationId ? { correlationId: row.correlationId } : {}),
        },
      ]);
    },
    async listAutomationLinks(tenantId, testExecutionId) {
      return automationLinks.get(`${tenantId}:${testExecutionId}`) ?? [];
    },
    async bindTestExecutionApplication() {
      /* In-memory composition rows already carry applicationId. */
    },
  } as InMemoryTestManagementRepository;
}
