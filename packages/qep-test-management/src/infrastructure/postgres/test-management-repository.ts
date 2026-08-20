import {
  getDatabaseExecutor,
  qepAcceptanceCriterion,
  qepAcceptanceCriterionVerification,
  qepApplicationEnvironment,
  qepApplicationExecutionTarget,
  qepDefinitionKeyCounter,
  qepExecutionDefinitionSnapshot,
  qepExecutionPlan,
  qepExecutionScopeSnapshot,
  qepExecutionSession,
  qepExecutionStrategySnapshot,
  qepSuite,
  qepSuiteItem,
  qepTestCaseAutomationMapping,
  qepTestExecution,
  qepTestExecutionAutomationLink,
  qepTestExecutionDefect,
  qepTestExecutionRelation,
  qepTestPlan,
  qepTestPlanItem,
  qepTestPlanStrategyGroup,
  qepTestPlanSuiteItem,
  qepTestSpecification,
  qepTestSpecificationHistory,
  qepTestSpecificationStep,
  qepTestSpecificationVersion,
  type DatabaseExecutor,
} from "@apzhub/config";
import { and, desc, eq, inArray } from "drizzle-orm";
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
} from "../../domain/types";
import {
  deriveExecutionType,
  deriveWorkspaceSessionResult,
  mapEngineStatusToProductStatus,
  mapOutcomeToProductResult,
  normalizePresentedExecution,
} from "../../domain/progress";
import type {
  CriterionRow,
  EnvironmentRow,
  ExecutionTargetRow,
  PlanListFilter,
  SuiteListFilter,
  TestCaseListFilter,
  TestManagementRepository,
} from "../../application/repository";
import type {
  ExecutionKind,
  ExecutionMode,
  ExecutionSurface,
  InfrastructureTargetType,
  VerificationCapability,
} from "../../domain/types";

function sessionProgress(json: Record<string, unknown> | null | undefined): {
  passed?: number;
  failed?: number;
  blocked?: number;
  executedSteps?: number;
  percent?: number;
  name?: string;
  ownerId?: string;
  startedAt?: string;
} {
  const root = json ?? {};
  const progress =
    typeof root.progress === "object" && root.progress
      ? (root.progress as Record<string, unknown>)
      : {};
  return {
    ...(typeof progress.passed === "number" ? { passed: progress.passed } : {}),
    ...(typeof progress.failed === "number" ? { failed: progress.failed } : {}),
    ...(typeof progress.blocked === "number" ? { blocked: progress.blocked } : {}),
    ...(typeof progress.executedSteps === "number"
      ? { executedSteps: progress.executedSteps }
      : {}),
    ...(typeof progress.percentComplete === "number"
      ? { percent: progress.percentComplete }
      : {}),
    ...(typeof root.name === "string" ? { name: root.name } : {}),
    ...(typeof root.ownerId === "string" ? { ownerId: root.ownerId } : {}),
    ...(typeof root.startedAt === "string" ? { startedAt: root.startedAt } : {}),
  };
}

function presentFormal(
  row: typeof qepTestExecution.$inferSelect,
  planId?: string,
): PresentedExecution {
  const context = (row.contextJson ?? {}) as Record<string, string>;
  const applicationId = row.applicationId ?? context.applicationId;
  const mode = (
    row.mode === "automated" || row.mode === "imported" ? "automated" : "manual"
  ) as ExecutionMode;
  return normalizePresentedExecution({
    id: row.id,
    tenantId: row.tenantId,
    ...(applicationId ? { applicationId } : {}),
    ...((planId ?? row.planRefId)
      ? { planId: planId ?? row.planRefId ?? undefined }
      : {}),
    ...(row.specRefId ? { specificationId: row.specRefId } : {}),
    name: row.executionNumber,
    mode,
    engine: "test_execution",
    status: mapEngineStatusToProductStatus(row.status),
    result: mapOutcomeToProductResult(row.outcome ?? undefined),
    executedAt: row.updatedAt.toISOString(),
    executedBy: row.updatedBy,
    ownerId: row.ownerId,
    updatedAt: row.updatedAt.toISOString(),
    ...(context.environmentId ? { environmentId: context.environmentId } : {}),
    method: deriveExecutionType({ mode: row.mode }),
  });
}

function presentSession(
  row: typeof qepExecutionSession.$inferSelect,
  planId?: string,
): PresentedExecution {
  const extras = sessionProgress(row.sessionJson);
  return normalizePresentedExecution({
    id: row.id,
    tenantId: row.tenantId,
    ...(row.applicationId ? { applicationId: row.applicationId } : {}),
    ...((planId ?? row.planId) ? { planId: planId ?? row.planId ?? undefined } : {}),
    ...(row.suiteId ? { suiteId: row.suiteId } : {}),
    name: extras.name ?? row.name,
    mode: "suite_session",
    type: "manual",
    engine: "workspace_session",
    status: mapEngineStatusToProductStatus(row.status),
    result: deriveWorkspaceSessionResult({
      status: row.status,
      passed: extras.passed,
      failed: extras.failed,
      blocked: extras.blocked,
      executedSteps: extras.executedSteps,
    }),
    ...(extras.percent !== undefined ? { progressPercent: extras.percent } : {}),
    executedAt: row.updatedAt.toISOString(),
    executedBy: row.updatedBy,
    ...(extras.ownerId || row.ownerId
      ? { ownerId: extras.ownerId ?? row.ownerId }
      : {}),
    ...(extras.startedAt ? { startedAt: extras.startedAt } : {}),
    updatedAt: row.updatedAt.toISOString(),
  });
}

async function enrichPresented(
  db: DatabaseExecutor,
  tenantId: string,
  rows: readonly PresentedExecution[],
): Promise<PresentedExecution[]> {
  if (rows.length === 0) return [];
  const query = getDatabaseExecutor(db);
  const ids = rows.map((row) => row.id);
  const [strategies, relations] = await Promise.all([
    query
      .select()
      .from(qepExecutionStrategySnapshot)
      .where(
        and(
          eq(qepExecutionStrategySnapshot.tenantId, tenantId),
          inArray(qepExecutionStrategySnapshot.executionId, ids),
        ),
      ),
    query
      .select()
      .from(qepTestExecutionRelation)
      .where(
        and(
          eq(qepTestExecutionRelation.tenantId, tenantId),
          inArray(qepTestExecutionRelation.executionId, ids),
        ),
      ),
  ]);
  const strategyById = new Map(strategies.map((row) => [row.executionId, row]));
  const relationById = new Map(relations.map((row) => [row.executionId, row]));
  return rows.map((row) => {
    const strategy = strategyById.get(row.id);
    const relation = relationById.get(row.id);
    return {
      ...row,
      ...(strategy?.environmentId && !row.environmentId
        ? { environmentId: strategy.environmentId }
        : {}),
      ...(strategy?.environmentName
        ? { environmentName: strategy.environmentName }
        : {}),
      ...(strategy?.verificationCapability
        ? { method: strategy.verificationCapability }
        : {}),
      ...(strategy?.strategyGroupId ? { strategyId: strategy.strategyGroupId } : {}),
      ...(relation?.relationKind
        ? { relationKind: relation.relationKind as PresentedExecution["relationKind"] }
        : {}),
      ...(relation?.previousExecutionId
        ? { previousExecutionId: relation.previousExecutionId }
        : {}),
      ...(relation?.triggeringDefectId
        ? { triggeringDefectId: relation.triggeringDefectId }
        : {}),
    };
  });
}

function toTestCase(row: typeof qepTestSpecification.$inferSelect): TestCaseRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    ...(row.applicationId ? { applicationId: row.applicationId } : {}),
    number: row.number,
    title: row.title,
    description: row.description,
    objective: row.objective,
    status: row.status,
    type: row.type,
    priority: row.priority,
    owner: row.owner,
    author: row.author,
    tags: row.tagsJson ?? [],
    preconditions: row.preconditionsJson ?? [],
    definitionVersion: row.definitionVersion ?? 1,
    manualCapable: row.manualCapable ?? true,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

function toSuite(row: typeof qepSuite.$inferSelect): SuiteRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    ...(row.applicationId ? { applicationId: row.applicationId } : {}),
    ...(row.suiteKey ? { suiteKey: row.suiteKey } : {}),
    name: row.name,
    description: row.description,
    kind: row.kind,
    status: row.status,
    ownerId: row.ownerId,
    tags: row.tagsJson ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toPlan(row: typeof qepTestPlan.$inferSelect): PlanRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    ...(row.applicationId ? { applicationId: row.applicationId } : {}),
    number: row.number,
    title: row.title,
    ...(row.description ? { description: row.description } : {}),
    objective: row.objective,
    status: row.status,
    ownerId: row.ownerId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toStep(row: typeof qepTestSpecificationStep.$inferSelect): DefinitionStep {
  return {
    id: row.id,
    order: row.stepOrder,
    action: row.action,
    ...(row.testDataRef ? { testDataRef: row.testDataRef } : {}),
    expectedResult: row.expectedResult,
  };
}

export function createPostgresTestManagementRepository(
  db: DatabaseExecutor,
): TestManagementRepository {
  const exec = () => getDatabaseExecutor(db);

  return {
    async nextKeyNumber(tenantId, applicationId, kind) {
      const existing = await exec()
        .select()
        .from(qepDefinitionKeyCounter)
        .where(
          and(
            eq(qepDefinitionKeyCounter.tenantId, tenantId),
            eq(qepDefinitionKeyCounter.applicationId, applicationId),
            eq(qepDefinitionKeyCounter.kind, kind),
          ),
        )
        .limit(1);
      if (!existing[0]) {
        await exec().insert(qepDefinitionKeyCounter).values({
          tenantId,
          applicationId,
          kind,
          nextValue: 1,
        });
        return 1;
      }
      const next = existing[0].nextValue + 1;
      await exec()
        .update(qepDefinitionKeyCounter)
        .set({ nextValue: next })
        .where(
          and(
            eq(qepDefinitionKeyCounter.tenantId, tenantId),
            eq(qepDefinitionKeyCounter.applicationId, applicationId),
            eq(qepDefinitionKeyCounter.kind, kind),
          ),
        );
      return next;
    },

    async listExistingTsNumbers(tenantId) {
      const rows = await exec()
        .select({ number: qepTestSpecification.number })
        .from(qepTestSpecification)
        .where(eq(qepTestSpecification.tenantId, tenantId));
      return rows.map((row) => row.number);
    },

    async getTestCase(tenantId, id) {
      const rows = await exec()
        .select()
        .from(qepTestSpecification)
        .where(
          and(
            eq(qepTestSpecification.tenantId, tenantId),
            eq(qepTestSpecification.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? toTestCase(rows[0]) : undefined;
    },

    async listTestCases(filter: TestCaseListFilter) {
      const rows = await exec()
        .select()
        .from(qepTestSpecification)
        .where(eq(qepTestSpecification.tenantId, filter.tenantId))
        .orderBy(desc(qepTestSpecification.updatedAt));
      return rows.map(toTestCase).filter((row) => {
        if (!filter.applicationId) return true;
        if (row.applicationId === filter.applicationId) return true;
        return Boolean(filter.includeUnbound && !row.applicationId);
      });
    },

    async saveTestCase(row) {
      const now = new Date(row.updatedAt);
      const values = {
        id: row.id,
        tenantId: row.tenantId,
        number: row.number,
        title: row.title,
        description: row.description,
        objective: row.objective,
        scope: row.applicationId ?? "unbound",
        status: row.status,
        type: row.type,
        priority: row.priority,
        complexity: "moderate",
        classification: "internal",
        owner: row.owner,
        author: row.author,
        majorVersion: 0,
        minorVersion: 1,
        versionLabel: "0.1",
        preconditionsJson: [...row.preconditions],
        tagsJson: [...row.tags],
        createdAt: new Date(row.createdAt),
        createdBy: row.createdBy,
        updatedAt: now,
        updatedBy: row.updatedBy,
        correlationId: row.id,
        applicationId: row.applicationId ?? null,
        definitionVersion: row.definitionVersion,
        manualCapable: row.manualCapable,
      };
      const existing = await exec()
        .select({ id: qepTestSpecification.id })
        .from(qepTestSpecification)
        .where(eq(qepTestSpecification.id, row.id))
        .limit(1);
      if (existing[0]) {
        await exec()
          .update(qepTestSpecification)
          .set({
            title: values.title,
            description: values.description,
            objective: values.objective,
            status: values.status,
            type: values.type,
            priority: values.priority,
            owner: values.owner,
            preconditionsJson: values.preconditionsJson,
            tagsJson: values.tagsJson,
            updatedAt: values.updatedAt,
            updatedBy: values.updatedBy,
            applicationId: values.applicationId,
            definitionVersion: values.definitionVersion,
            manualCapable: values.manualCapable,
          })
          .where(
            and(
              eq(qepTestSpecification.tenantId, row.tenantId),
              eq(qepTestSpecification.id, row.id),
            ),
          );
        return;
      }
      await exec().insert(qepTestSpecification).values(values);
      await exec()
        .insert(qepTestSpecificationVersion)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          specificationId: row.id,
          specificationNumber: row.number,
          majorVersion: 0,
          minorVersion: 1,
          versionLabel: "0.1",
          status: row.status,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
          updatedAt: now,
          updatedBy: row.updatedBy,
        });
      await exec()
        .insert(qepTestSpecificationHistory)
        .values({
          id: randomUUID(),
          tenantId: row.tenantId,
          specificationId: row.id,
          occurredAt: new Date(row.createdAt),
          actorUserId: row.createdBy,
          kind: "created",
          summary: "Test Case created",
          sequence: 1,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
          updatedAt: now,
          updatedBy: row.updatedBy,
        });
    },

    async listSteps(tenantId, specificationId) {
      const rows = await exec()
        .select()
        .from(qepTestSpecificationStep)
        .where(
          and(
            eq(qepTestSpecificationStep.tenantId, tenantId),
            eq(qepTestSpecificationStep.specificationId, specificationId),
          ),
        );
      return rows.map(toStep).sort((a, b) => a.order - b.order);
    },

    async replaceSteps(tenantId, specificationId, actorId, steps) {
      await exec()
        .delete(qepTestSpecificationStep)
        .where(
          and(
            eq(qepTestSpecificationStep.tenantId, tenantId),
            eq(qepTestSpecificationStep.specificationId, specificationId),
          ),
        );
      if (steps.length === 0) return [];
      const now = new Date();
      const stored = steps.map((step, index) => ({
        id: `qts-${randomUUID()}`,
        tenantId,
        specificationId,
        stepOrder: step.order || index + 1,
        action: step.action,
        testDataRef: step.testDataRef ?? null,
        expectedResult: step.expectedResult,
        createdAt: now,
        createdBy: actorId,
        updatedAt: now,
        updatedBy: actorId,
      }));
      await exec().insert(qepTestSpecificationStep).values(stored);
      return stored.map((row) => ({
        id: row.id,
        order: row.stepOrder,
        action: row.action,
        ...(row.testDataRef ? { testDataRef: row.testDataRef } : {}),
        expectedResult: row.expectedResult,
      }));
    },

    async getSuite(tenantId, id) {
      const rows = await exec()
        .select()
        .from(qepSuite)
        .where(and(eq(qepSuite.tenantId, tenantId), eq(qepSuite.id, id)))
        .limit(1);
      return rows[0] ? toSuite(rows[0]) : undefined;
    },

    async listSuites(filter: SuiteListFilter) {
      const rows = await exec()
        .select()
        .from(qepSuite)
        .where(eq(qepSuite.tenantId, filter.tenantId))
        .orderBy(desc(qepSuite.updatedAt));
      return rows.map(toSuite).filter((row) => {
        if (!filter.applicationId) return true;
        if (row.applicationId === filter.applicationId) return true;
        return Boolean(filter.includeUnbound && !row.applicationId);
      });
    },

    async saveSuite(row) {
      const now = new Date(row.updatedAt);
      const values = {
        id: row.id,
        tenantId: row.tenantId,
        folderPath: "/",
        name: row.name,
        description: row.description,
        ownerId: row.ownerId,
        kind: row.kind,
        status: row.status,
        version: 1,
        priority: "normal",
        tagsJson: [...row.tags],
        favouriteUserIdsJson: [],
        pinnedUserIdsJson: [],
        customMetadataJson: {},
        historyJson: [],
        revision: 1,
        createdAt: new Date(row.createdAt),
        updatedAt: now,
        createdBy: row.ownerId,
        updatedBy: row.ownerId,
        applicationId: row.applicationId ?? null,
        suiteKey: row.suiteKey ?? null,
      };
      const existing = await exec()
        .select({ id: qepSuite.id })
        .from(qepSuite)
        .where(eq(qepSuite.id, row.id))
        .limit(1);
      if (existing[0]) {
        await exec()
          .update(qepSuite)
          .set({
            name: values.name,
            description: values.description,
            status: values.status,
            updatedAt: values.updatedAt,
            applicationId: values.applicationId,
            suiteKey: values.suiteKey,
          })
          .where(and(eq(qepSuite.tenantId, row.tenantId), eq(qepSuite.id, row.id)));
        return;
      }
      await exec().insert(qepSuite).values(values);
    },

    async listSuiteMembership(tenantId, suiteId) {
      const rows = await exec()
        .select()
        .from(qepSuiteItem)
        .where(
          and(eq(qepSuiteItem.tenantId, tenantId), eq(qepSuiteItem.suiteId, suiteId)),
        );
      return rows
        .map((row) => ({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          suiteId: row.suiteId,
          specificationId: row.specificationId,
          sequence: row.sequence,
          createdAt: row.createdAt.toISOString(),
          createdBy: row.createdBy,
        }))
        .sort((a, b) => a.sequence - b.sequence);
    },

    async listMembershipForSpecification(tenantId, specificationId) {
      const rows = await exec()
        .select()
        .from(qepSuiteItem)
        .where(
          and(
            eq(qepSuiteItem.tenantId, tenantId),
            eq(qepSuiteItem.specificationId, specificationId),
          ),
        );
      return rows.map((row) => ({
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        suiteId: row.suiteId,
        specificationId: row.specificationId,
        sequence: row.sequence,
        createdAt: row.createdAt.toISOString(),
        createdBy: row.createdBy,
      }));
    },

    async saveSuiteMembership(row: SuiteMembership) {
      await exec()
        .insert(qepSuiteItem)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          suiteId: row.suiteId,
          specificationId: row.specificationId,
          sequence: row.sequence,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
        });
    },

    async deleteSuiteMembership(tenantId, id) {
      await exec()
        .delete(qepSuiteItem)
        .where(and(eq(qepSuiteItem.tenantId, tenantId), eq(qepSuiteItem.id, id)));
    },

    async getPlan(tenantId, id) {
      const rows = await exec()
        .select()
        .from(qepTestPlan)
        .where(and(eq(qepTestPlan.tenantId, tenantId), eq(qepTestPlan.id, id)))
        .limit(1);
      return rows[0] ? toPlan(rows[0]) : undefined;
    },

    async listPlans(filter: PlanListFilter) {
      const rows = await exec()
        .select()
        .from(qepTestPlan)
        .where(eq(qepTestPlan.tenantId, filter.tenantId))
        .orderBy(desc(qepTestPlan.updatedAt));
      return rows.map(toPlan).filter((row) => {
        if (!filter.applicationId) return true;
        if (row.applicationId === filter.applicationId) return true;
        return Boolean(filter.includeUnbound && !row.applicationId);
      });
    },

    async savePlan(row) {
      const now = new Date(row.updatedAt);
      const values = {
        id: row.id,
        tenantId: row.tenantId,
        number: row.number,
        title: row.title,
        description: row.description ?? null,
        objective: row.objective,
        scopeClass: "product",
        status: row.status,
        priority: "medium",
        planType: "regression",
        ownerId: row.ownerId,
        versionLabel: "0.1",
        assigneeIdsJson: [],
        assignmentUpdatedAt: now,
        assignmentUpdatedBy: row.ownerId,
        createdAt: new Date(row.createdAt),
        createdBy: row.ownerId,
        updatedAt: now,
        updatedBy: row.ownerId,
        applicationId: row.applicationId ?? null,
      };
      const existing = await exec()
        .select({ id: qepTestPlan.id })
        .from(qepTestPlan)
        .where(eq(qepTestPlan.id, row.id))
        .limit(1);
      if (existing[0]) {
        await exec()
          .update(qepTestPlan)
          .set({
            title: values.title,
            description: values.description,
            objective: values.objective,
            status: values.status,
            updatedAt: values.updatedAt,
            applicationId: values.applicationId,
          })
          .where(
            and(eq(qepTestPlan.tenantId, row.tenantId), eq(qepTestPlan.id, row.id)),
          );
        return;
      }
      await exec().insert(qepTestPlan).values(values);
    },

    async listPlanSpecificationIds(tenantId, planId) {
      const rows = await exec()
        .select({ specificationId: qepTestPlanItem.specificationId })
        .from(qepTestPlanItem)
        .where(
          and(
            eq(qepTestPlanItem.tenantId, tenantId),
            eq(qepTestPlanItem.planId, planId),
          ),
        );
      return rows.map((row) => row.specificationId);
    },

    async addPlanSpecification(tenantId, planId, specificationId, actorId) {
      const existing = await exec()
        .select({ id: qepTestPlanItem.id })
        .from(qepTestPlanItem)
        .where(
          and(
            eq(qepTestPlanItem.tenantId, tenantId),
            eq(qepTestPlanItem.planId, planId),
            eq(qepTestPlanItem.specificationId, specificationId),
          ),
        )
        .limit(1);
      if (existing[0]) return;
      const count = await exec()
        .select({ id: qepTestPlanItem.id })
        .from(qepTestPlanItem)
        .where(
          and(
            eq(qepTestPlanItem.tenantId, tenantId),
            eq(qepTestPlanItem.planId, planId),
          ),
        );
      const now = new Date();
      await exec()
        .insert(qepTestPlanItem)
        .values({
          id: `tpi_${randomUUID().replaceAll("-", "").slice(0, 16)}`,
          tenantId,
          planId,
          specificationId,
          sequence: count.length + 1,
          createdAt: now,
          createdBy: actorId,
          updatedAt: now,
          updatedBy: actorId,
        });
    },

    async listPlanSuiteMembership(tenantId, planId) {
      const rows = await exec()
        .select()
        .from(qepTestPlanSuiteItem)
        .where(
          and(
            eq(qepTestPlanSuiteItem.tenantId, tenantId),
            eq(qepTestPlanSuiteItem.planId, planId),
          ),
        );
      return rows.map((row) => ({
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        planId: row.planId,
        suiteId: row.suiteId,
        sequence: row.sequence,
        createdAt: row.createdAt.toISOString(),
        createdBy: row.createdBy,
      })) as PlanSuiteMembership[];
    },

    async listPlanMembershipForSpecification(tenantId, specificationId) {
      const rows = await exec()
        .select({ planId: qepTestPlanItem.planId })
        .from(qepTestPlanItem)
        .where(
          and(
            eq(qepTestPlanItem.tenantId, tenantId),
            eq(qepTestPlanItem.specificationId, specificationId),
          ),
        );
      return [...new Set(rows.map((row) => row.planId))];
    },

    async savePlanSuiteMembership(row) {
      await exec()
        .insert(qepTestPlanSuiteItem)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          planId: row.planId,
          suiteId: row.suiteId,
          sequence: row.sequence,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
        });
    },

    async deletePlanSuiteMembership(tenantId, id) {
      await exec()
        .delete(qepTestPlanSuiteItem)
        .where(
          and(
            eq(qepTestPlanSuiteItem.tenantId, tenantId),
            eq(qepTestPlanSuiteItem.id, id),
          ),
        );
    },

    async listStrategy(tenantId, planId) {
      const rows = await exec()
        .select()
        .from(qepTestPlanStrategyGroup)
        .where(
          and(
            eq(qepTestPlanStrategyGroup.tenantId, tenantId),
            eq(qepTestPlanStrategyGroup.planId, planId),
          ),
        );
      return rows.map((row) => ({
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        planId: row.planId,
        name: row.name,
        verificationCapability: row.verificationCapability as VerificationCapability,
        ...(row.executionSurface
          ? { executionSurface: row.executionSurface as ExecutionSurface }
          : {}),
        ...(row.environmentId ? { environmentId: row.environmentId } : {}),
        ...(row.infrastructureTargetType
          ? {
              infrastructureTargetType:
                row.infrastructureTargetType as InfrastructureTargetType,
            }
          : {}),
        ...(row.infrastructureTargetId
          ? { infrastructureTargetId: row.infrastructureTargetId }
          : {}),
        ...(row.automationMappingId
          ? { automationMappingId: row.automationMappingId }
          : {}),
        ...(row.testDataRef ? { testDataRef: row.testDataRef } : {}),
        ...(row.scheduleNote ? { scheduleNote: row.scheduleNote } : {}),
        sequence: row.sequence,
        createdAt: row.createdAt.toISOString(),
        createdBy: row.createdBy,
        updatedAt: row.updatedAt.toISOString(),
        updatedBy: row.updatedBy,
      })) as StrategyGroup[];
    },

    async saveStrategy(row) {
      await exec()
        .insert(qepTestPlanStrategyGroup)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          planId: row.planId,
          name: row.name,
          verificationCapability: row.verificationCapability,
          executionSurface: row.executionSurface ?? null,
          environmentId: row.environmentId ?? null,
          infrastructureTargetType: row.infrastructureTargetType ?? null,
          infrastructureTargetId: row.infrastructureTargetId ?? null,
          automationMappingId: row.automationMappingId ?? null,
          testDataRef: row.testDataRef ?? null,
          scheduleNote: row.scheduleNote ?? null,
          sequence: row.sequence,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
          updatedAt: new Date(row.updatedAt),
          updatedBy: row.updatedBy,
        });
    },

    async listInternalExecutionPlanIds(tenantId, planId) {
      const rows = await exec()
        .select({ id: qepExecutionPlan.id, planJson: qepExecutionPlan.planJson })
        .from(qepExecutionPlan)
        .where(eq(qepExecutionPlan.tenantId, tenantId));
      return rows
        .filter((row) => row.planJson?.internalForTestPlanId === planId)
        .map((row) => row.id);
    },

    async saveInternalExecutionPlan(row) {
      const now = new Date(row.createdAt);
      await exec()
        .insert(qepExecutionPlan)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          name: row.name,
          description: "Internal orchestration for a customer-facing Test Plan",
          ownerId: row.ownerId,
          status: "draft",
          suiteId: row.suiteId,
          planJson: {
            internal: true,
            internalForTestPlanId: row.planId,
          },
          historyJson: [],
          createdAt: now,
          updatedAt: now,
          createdBy: row.ownerId,
          updatedBy: row.ownerId,
          applicationId: row.applicationId,
        });
    },

    async listMappings(tenantId, specificationId) {
      const rows = await exec()
        .select()
        .from(qepTestCaseAutomationMapping)
        .where(
          and(
            eq(qepTestCaseAutomationMapping.tenantId, tenantId),
            eq(qepTestCaseAutomationMapping.specificationId, specificationId),
          ),
        );
      return rows.map((row) => ({
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        specificationId: row.specificationId,
        verificationCapability: row.verificationCapability as VerificationCapability,
        ...(row.providerId ? { providerId: row.providerId } : {}),
        ...(row.assetRef ? { assetRef: row.assetRef } : {}),
        createdAt: row.createdAt.toISOString(),
        createdBy: row.createdBy,
        updatedAt: row.updatedAt.toISOString(),
        updatedBy: row.updatedBy,
      })) as AutomationMapping[];
    },

    async saveMapping(row) {
      await exec()
        .insert(qepTestCaseAutomationMapping)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          specificationId: row.specificationId,
          verificationCapability: row.verificationCapability,
          providerId: row.providerId ?? null,
          assetRef: row.assetRef ?? null,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
          updatedAt: new Date(row.updatedAt),
          updatedBy: row.updatedBy,
        });
    },

    async getCriterion(tenantId, criterionId) {
      const rows = await exec()
        .select()
        .from(qepAcceptanceCriterion)
        .where(
          and(
            eq(qepAcceptanceCriterion.tenantId, tenantId),
            eq(qepAcceptanceCriterion.id, criterionId),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row) return undefined;
      return {
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        requirementId: row.requirementId,
        criterionKey: row.criterionKey,
        text: row.text,
      } satisfies CriterionRow;
    },

    async listCriterionIdsForSpecification(tenantId, specificationId) {
      const rows = await exec()
        .select({ criterionId: qepAcceptanceCriterionVerification.criterionId })
        .from(qepAcceptanceCriterionVerification)
        .where(
          and(
            eq(qepAcceptanceCriterionVerification.tenantId, tenantId),
            eq(qepAcceptanceCriterionVerification.assetKind, "test_specification"),
            eq(qepAcceptanceCriterionVerification.assetId, specificationId),
          ),
        );
      return rows.map((row) => row.criterionId);
    },

    async saveCriterionLink(row) {
      await exec()
        .insert(qepAcceptanceCriterionVerification)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          requirementId: row.requirementId,
          criterionId: row.criterionId,
          assetKind: "test_specification",
          assetId: row.specificationId,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
        });
    },

    async getEnvironment(tenantId, environmentId) {
      const rows = await exec()
        .select()
        .from(qepApplicationEnvironment)
        .where(
          and(
            eq(qepApplicationEnvironment.tenantId, tenantId),
            eq(qepApplicationEnvironment.id, environmentId),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row) return undefined;
      return {
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        name: row.name,
      } satisfies EnvironmentRow;
    },

    async getExecutionTarget(tenantId, targetId) {
      const rows = await exec()
        .select()
        .from(qepApplicationExecutionTarget)
        .where(
          and(
            eq(qepApplicationExecutionTarget.tenantId, tenantId),
            eq(qepApplicationExecutionTarget.id, targetId),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row) return undefined;
      return {
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        targetType: row.targetType,
      } satisfies ExecutionTargetRow;
    },

    async saveDefinitionSnapshot(row: DefinitionSnapshot) {
      await exec()
        .insert(qepExecutionDefinitionSnapshot)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          executionId: row.executionId,
          executionKind: row.executionKind,
          specificationId: row.specificationId,
          specificationNumber: row.specificationNumber,
          definitionVersion: row.definitionVersion,
          stepsJson: row.steps.map((step) => ({
            order: step.order,
            action: step.action,
            expectedResult: step.expectedResult,
            ...(step.testDataRef ? { testDataRef: step.testDataRef } : {}),
          })),
          createdAt: new Date(row.createdAt),
        });
    },

    async getDefinitionSnapshot(tenantId, executionId, specificationId) {
      const rows = await exec()
        .select()
        .from(qepExecutionDefinitionSnapshot)
        .where(
          and(
            eq(qepExecutionDefinitionSnapshot.tenantId, tenantId),
            eq(qepExecutionDefinitionSnapshot.executionId, executionId),
            eq(qepExecutionDefinitionSnapshot.specificationId, specificationId),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row) return undefined;
      return {
        id: row.id,
        tenantId: row.tenantId,
        executionId: row.executionId,
        executionKind: row.executionKind as ExecutionKind,
        specificationId: row.specificationId,
        specificationNumber: row.specificationNumber,
        definitionVersion: row.definitionVersion,
        steps: row.stepsJson,
        createdAt: row.createdAt.toISOString(),
      };
    },

    async saveScopeSnapshot(row: ScopeSnapshot) {
      await exec()
        .insert(qepExecutionScopeSnapshot)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          executionId: row.executionId,
          executionKind: row.executionKind,
          planId: row.planId ?? null,
          suiteId: row.suiteId ?? null,
          memberSpecificationIdsJson: [...row.memberSpecificationIds],
          createdAt: new Date(row.createdAt),
        });
    },

    async getScopeSnapshot(tenantId, executionId) {
      const rows = await exec()
        .select()
        .from(qepExecutionScopeSnapshot)
        .where(
          and(
            eq(qepExecutionScopeSnapshot.tenantId, tenantId),
            eq(qepExecutionScopeSnapshot.executionId, executionId),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row) return undefined;
      return {
        id: row.id,
        tenantId: row.tenantId,
        executionId: row.executionId,
        executionKind: row.executionKind as ExecutionKind,
        ...(row.planId ? { planId: row.planId } : {}),
        ...(row.suiteId ? { suiteId: row.suiteId } : {}),
        memberSpecificationIds: row.memberSpecificationIdsJson,
        createdAt: row.createdAt.toISOString(),
      };
    },

    async savePresentedExecution() {
      /* Formal TE / workspace sessions remain the execution stores. */
    },

    async listPlanExecutions(tenantId, planId) {
      const [formal, sessions] = await Promise.all([
        exec()
          .select()
          .from(qepTestExecution)
          .where(
            and(
              eq(qepTestExecution.tenantId, tenantId),
              eq(qepTestExecution.planRefId, planId),
            ),
          ),
        exec()
          .select()
          .from(qepExecutionSession)
          .where(
            and(
              eq(qepExecutionSession.tenantId, tenantId),
              eq(qepExecutionSession.planId, planId),
            ),
          ),
      ]);
      return (
        await enrichPresented(db, tenantId, [
          ...formal.map((row) => presentFormal(row, planId)),
          ...sessions.map((row) => presentSession(row, planId)),
        ])
      ).sort((a, b) => b.executedAt.localeCompare(a.executedAt));
    },

    async listPresentedExecutions(filter) {
      const [formal, sessions] = await Promise.all([
        exec()
          .select()
          .from(qepTestExecution)
          .where(eq(qepTestExecution.tenantId, filter.tenantId)),
        exec()
          .select()
          .from(qepExecutionSession)
          .where(eq(qepExecutionSession.tenantId, filter.tenantId)),
      ]);
      const presented = await enrichPresented(
        db,
        filter.tenantId,
        [
          ...formal.map((row) => presentFormal(row)),
          ...sessions.map((row) => presentSession(row)),
        ].filter((row) => {
          if (!filter.applicationId) return true;
          if (row.applicationId === filter.applicationId) return true;
          return Boolean(filter.includeUnbound && row.unbound);
        }),
      );
      return presented.sort((a, b) => b.executedAt.localeCompare(a.executedAt));
    },

    async getPresentedExecution(tenantId, executionId) {
      const [formal, sessions] = await Promise.all([
        exec()
          .select()
          .from(qepTestExecution)
          .where(
            and(
              eq(qepTestExecution.tenantId, tenantId),
              eq(qepTestExecution.id, executionId),
            ),
          )
          .limit(1),
        exec()
          .select()
          .from(qepExecutionSession)
          .where(
            and(
              eq(qepExecutionSession.tenantId, tenantId),
              eq(qepExecutionSession.id, executionId),
            ),
          )
          .limit(1),
      ]);
      const rows = [
        ...formal.map((row) => presentFormal(row)),
        ...sessions.map((row) => presentSession(row)),
      ];
      const enriched = await enrichPresented(db, tenantId, rows);
      return enriched[0];
    },

    async latestResultsForSpecifications(tenantId, specificationIds) {
      if (specificationIds.length === 0) return {};
      const rows = await exec()
        .select()
        .from(qepTestExecution)
        .where(
          and(
            eq(qepTestExecution.tenantId, tenantId),
            inArray(qepTestExecution.specRefId, [...specificationIds]),
          ),
        )
        .orderBy(desc(qepTestExecution.updatedAt));
      const results: Record<string, ProductResultState> = {};
      for (const row of rows) {
        if (row.specRefId && results[row.specRefId] === undefined) {
          results[row.specRefId] = mapOutcomeToProductResult(row.outcome ?? undefined);
        }
      }
      return results;
    },

    async saveTestExecutionDefect(row) {
      await exec()
        .insert(qepTestExecutionDefect)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          testExecutionId: row.testExecutionId,
          defectId: row.defectId,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
        });
    },

    async listTestExecutionDefects(tenantId, testExecutionId) {
      const rows = await exec()
        .select({ defectId: qepTestExecutionDefect.defectId })
        .from(qepTestExecutionDefect)
        .where(
          and(
            eq(qepTestExecutionDefect.tenantId, tenantId),
            eq(qepTestExecutionDefect.testExecutionId, testExecutionId),
          ),
        );
      return rows.map((row) => row.defectId);
    },

    async saveStrategySnapshot(row) {
      const existing = await exec()
        .select({ id: qepExecutionStrategySnapshot.id })
        .from(qepExecutionStrategySnapshot)
        .where(
          and(
            eq(qepExecutionStrategySnapshot.tenantId, row.tenantId),
            eq(qepExecutionStrategySnapshot.executionId, row.executionId),
          ),
        )
        .limit(1);
      if (existing[0]) return;
      await exec()
        .insert(qepExecutionStrategySnapshot)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          executionId: row.executionId,
          executionKind: row.executionKind,
          planId: row.planId ?? null,
          strategyGroupId: row.strategyGroupId ?? null,
          verificationCapability: row.verificationCapability ?? null,
          executionSurface: row.executionSurface ?? null,
          environmentId: row.environmentId ?? null,
          environmentName: row.environmentName ?? null,
          infrastructureTargetType: row.infrastructureTargetType ?? null,
          infrastructureTargetId: row.infrastructureTargetId ?? null,
          infrastructureTargetName: row.infrastructureTargetName ?? null,
          automationMappingId: row.automationMappingId ?? null,
          providerId: row.providerId ?? null,
          assetRef: row.assetRef ?? null,
          testDataRef: row.testDataRef ?? null,
          createdAt: new Date(row.createdAt),
        });
    },

    async getStrategySnapshot(tenantId, executionId) {
      const [row] = await exec()
        .select()
        .from(qepExecutionStrategySnapshot)
        .where(
          and(
            eq(qepExecutionStrategySnapshot.tenantId, tenantId),
            eq(qepExecutionStrategySnapshot.executionId, executionId),
          ),
        )
        .limit(1);
      if (!row) return undefined;
      return {
        id: row.id,
        tenantId: row.tenantId,
        executionId: row.executionId,
        executionKind: row.executionKind as ExecutionKind,
        ...(row.planId ? { planId: row.planId } : {}),
        ...(row.strategyGroupId ? { strategyGroupId: row.strategyGroupId } : {}),
        ...(row.verificationCapability
          ? { verificationCapability: row.verificationCapability }
          : {}),
        ...(row.executionSurface ? { executionSurface: row.executionSurface } : {}),
        ...(row.environmentId ? { environmentId: row.environmentId } : {}),
        ...(row.environmentName ? { environmentName: row.environmentName } : {}),
        ...(row.infrastructureTargetType
          ? { infrastructureTargetType: row.infrastructureTargetType }
          : {}),
        ...(row.infrastructureTargetId
          ? { infrastructureTargetId: row.infrastructureTargetId }
          : {}),
        ...(row.infrastructureTargetName
          ? { infrastructureTargetName: row.infrastructureTargetName }
          : {}),
        ...(row.automationMappingId
          ? { automationMappingId: row.automationMappingId }
          : {}),
        ...(row.providerId ? { providerId: row.providerId } : {}),
        ...(row.assetRef ? { assetRef: row.assetRef } : {}),
        ...(row.testDataRef ? { testDataRef: row.testDataRef } : {}),
        createdAt: row.createdAt.toISOString(),
      };
    },

    async saveExecutionRelation(row) {
      await exec()
        .insert(qepTestExecutionRelation)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          executionId: row.executionId,
          relationKind: row.relationKind,
          previousExecutionId: row.previousExecutionId,
          triggeringDefectId: row.triggeringDefectId ?? null,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
        });
    },

    async getExecutionRelation(tenantId, executionId) {
      const [row] = await exec()
        .select()
        .from(qepTestExecutionRelation)
        .where(
          and(
            eq(qepTestExecutionRelation.tenantId, tenantId),
            eq(qepTestExecutionRelation.executionId, executionId),
          ),
        )
        .limit(1);
      if (!row) return undefined;
      return {
        id: row.id,
        tenantId: row.tenantId,
        executionId: row.executionId,
        relationKind: row.relationKind as "rerun" | "retest",
        previousExecutionId: row.previousExecutionId,
        ...(row.triggeringDefectId
          ? { triggeringDefectId: row.triggeringDefectId }
          : {}),
        createdAt: row.createdAt.toISOString(),
        createdBy: row.createdBy,
      };
    },

    async saveAutomationLink(row) {
      await exec()
        .insert(qepTestExecutionAutomationLink)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          testExecutionId: row.testExecutionId,
          automationExecutionId: row.automationExecutionId,
          correlationId: row.correlationId ?? null,
          createdAt: new Date(row.createdAt),
        });
    },

    async listAutomationLinks(tenantId, testExecutionId) {
      const rows = await exec()
        .select()
        .from(qepTestExecutionAutomationLink)
        .where(
          and(
            eq(qepTestExecutionAutomationLink.tenantId, tenantId),
            eq(qepTestExecutionAutomationLink.testExecutionId, testExecutionId),
          ),
        );
      return rows.map((row) => ({
        automationExecutionId: row.automationExecutionId,
        ...(row.correlationId ? { correlationId: row.correlationId } : {}),
      }));
    },

    async bindTestExecutionApplication(tenantId, executionId, applicationId) {
      await exec()
        .update(qepTestExecution)
        .set({ applicationId })
        .where(
          and(
            eq(qepTestExecution.tenantId, tenantId),
            eq(qepTestExecution.id, executionId),
          ),
        );
    },
  };
}
