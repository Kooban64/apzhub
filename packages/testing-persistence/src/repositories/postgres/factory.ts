import { randomUUID } from "node:crypto";

import {
  testingApproval,
  testingApprovalHistory,
  testingAuditRecord,
  testingAutomationDefinition,
  testingCertificationRecord,
  testingConfiguration,
  testingCoverageRecord,
  testingDefectLink,
  testingEvidence,
  testingExecutionHistory,
  testingExecutionSession,
  testingManualExecution,
  testingQualitySnapshot,
  testingRegistryEntry,
  testingRegressionAnalysis,
  testingRegressionSet,
  testingReleaseReadiness,
  testingRequirement,
  testingRisk,
  testingTestCase,
  testingTestCaseVersion,
  testingTestPlan,
  testingTestPlanVersion,
  testingTestStep,
  testingTestSuite,
  testingTestSuiteVersion,
  testingTraceabilityLink,
  testingWorkItem,
  type DatabaseExecutor,
} from "@apzhub/config";
import { and, eq } from "drizzle-orm";

import { createPostgresAutomationRepos } from "../automation/postgres";
import { createPostgresCertificationRepos } from "../certification/postgres";
import { createPostgresReleaseGovernanceRepos } from "../release-governance/postgres";
import { createPostgresPipelineRepos } from "../pipelines/postgres";
import { createPostgresEngineeringRepos } from "../engineering-intelligence/postgres";
import { createPostgresReportingRepos } from "../reporting/postgres";
import { assertPermission } from "../../authorization/testing-authorization";
import type { RepositoryContext } from "../../types";
import {
  assertRequiredString,
  validateApprovalStatus,
  validateAutomationType,
  validateCaseVersionReason,
  validateCertificationStatus,
  validateCoverageKind,
  validateDefectProviderKind,
  validateDefectStatus,
  validateEvidenceType,
  validateEvidenceLifecycleStatus,
  validateExecutionApprovalState,
  validateExecutionStatus,
  validateExecutionType,
  validatePriority,
  validateReleaseReadinessStatus,
  validateRiskLevel,
  validateTestResultStatus,
  validateTestStatus,
  validateTraceabilityType,
  validateWorkItemKind,
} from "../../validation/persistence-validation";
import type {
  ApprovalCreate,
  ApprovalHistoryRepository,
  ApprovalUpdate,
  AutomationDefinitionCreate,
  AutomationDefinitionUpdate,
  CertificationCreate,
  CertificationUpdate,
  ConfigurationCreate,
  ConfigurationUpdate,
  CoverageCreate,
  CoverageUpdate,
  DefectLinkCreate,
  DefectLinkUpdate,
  EvidenceCreate,
  EvidenceUpdate,
  ExecutionSessionCreate,
  ExecutionSessionUpdate,
  ManualExecutionCreate,
  ManualExecutionUpdate,
  QualitySnapshotCreate,
  QualitySnapshotUpdate,
  RegistryEntryCreate,
  RegistryEntryUpdate,
  RegressionAnalysisCreate,
  RegressionAnalysisUpdate,
  RegressionSetCreate,
  RegressionSetUpdate,
  ReleaseReadinessCreate,
  ReleaseReadinessUpdate,
  RequirementCreate,
  RequirementUpdate,
  RiskCreate,
  RiskUpdate,
  TestCaseCreate,
  TestCaseUpdate,
  TestCaseVersionRepository,
  TestPlanCreate,
  TestPlanUpdate,
  TestPlanVersionRepository,
  TestStepCreate,
  TestStepUpdate,
  TestSuiteCreate,
  TestSuiteUpdate,
  TestSuiteVersionRepository,
  TestingPersistence,
  TraceabilityLinkCreate,
  TraceabilityLinkUpdate,
  WorkItemCreate,
  WorkItemUpdate,
} from "../interfaces";
import type {
  ApprovalHistoryRecord,
  ApprovalRecord,
  AutomationDefinitionRecord,
  CertificationRecordRecord,
  ConfigurationRecord,
  CoverageRecord,
  DefectLinkRecord,
  EvidenceRecord,
  ExecutionSessionRecord,
  ManualExecutionRecord,
  QualitySnapshotRecord,
  RegistryEntryRecord,
  RegressionAnalysisRecord,
  RegressionSetRecord,
  ReleaseReadinessRecord,
  RequirementRecord,
  RiskRecord,
  TestCaseRecord,
  TestCaseVersionRecord,
  TestPlanRecord,
  TestPlanVersionRecord,
  TestStepRecord,
  TestSuiteRecord,
  TestSuiteVersionRecord,
  TraceabilityLinkRecord,
  WorkItemRecord,
} from "../records";
import { baseMeta } from "../in-memory/generic-crud";
import {
  approvalHistoryToRow,
  approvalToRow,
  auditToRow,
  automationDefinitionToRow,
  certificationToRow,
  configurationToRow,
  coverageToRow,
  defectLinkToRow,
  evidenceToRow,
  executionHistoryToRow,
  executionSessionToRow,
  manualExecutionToRow,
  qualitySnapshotToRow,
  registryEntryToRow,
  regressionAnalysisToRow,
  regressionSetToRow,
  releaseReadinessToRow,
  requirementToRow,
  riskToRow,
  rowToApproval,
  rowToApprovalHistory,
  rowToAudit,
  rowToAutomationDefinition,
  rowToCertification,
  rowToConfiguration,
  rowToCoverage,
  rowToDefectLink,
  rowToEvidence,
  rowToExecutionHistory,
  rowToExecutionSession,
  rowToManualExecution,
  rowToQualitySnapshot,
  rowToRegistryEntry,
  rowToRegressionAnalysis,
  rowToRegressionSet,
  rowToReleaseReadiness,
  rowToRequirement,
  rowToRisk,
  rowToTestCase,
  rowToTestCaseVersion,
  rowToTestPlan,
  rowToTestPlanVersion,
  rowToTestStep,
  rowToTestSuite,
  rowToTestSuiteVersion,
  rowToTraceabilityLink,
  rowToWorkItem,
  testCaseToRow,
  testCaseVersionToRow,
  testPlanToRow,
  testPlanVersionToRow,
  testStepToRow,
  testSuiteToRow,
  testSuiteVersionToRow,
  traceabilityLinkToRow,
  workItemToRow,
} from "../mappers/row-mappers";
import {
  compareValues,
  normalizeListQuery,
  paginateItems,
  type ListQuery,
} from "../types";
import {
  createPostgresCrudRepository,
  type PostgresCrudTable,
} from "./generic-crud";
import {
  loadCaseRequirementIds,
  loadCaseStepIds,
  loadCaseSuiteIds,
  loadPlanRequirementIds,
  loadPlanRiskIds,
  loadPlanSuiteIds,
  loadRequirementRiskIds,
  loadRiskRequirementIds,
  loadSuiteCaseIds,
  loadSuitePlanIds,
  replaceCaseRequirements,
  replacePlanRequirements,
  replacePlanRisks,
  replacePlanSuites,
  replaceRequirementRisks,
  replaceRiskRequirements,
  replaceSuiteCases,
  syncManualStepActuals,
} from "./junctions";

function asTable(table: unknown): PostgresCrudTable {
  return table as PostgresCrudTable;
}

function createVersionRepos(
  db: DatabaseExecutor,
): {
  testCaseVersions: TestCaseVersionRepository;
  testPlanVersions: TestPlanVersionRepository;
  testSuiteVersions: TestSuiteVersionRepository;
} {
  return {
    testCaseVersions: {
      async create(ctx, input) {
        assertPermission(ctx, "test_case_version", "create");
        assertRequiredString(input.caseId, "caseId");
        validateCaseVersionReason(String(input.reason));
        const meta = baseMeta(ctx, {
          id: input.id,
          organisationId: input.organisationId,
        });
        const record: TestCaseVersionRecord = {
          ...meta,
          caseId: String(input.caseId),
          versionNumber: Number(input.versionNumber ?? 1),
          reason: input.reason as TestCaseVersionRecord["reason"],
          snapshot: (input.snapshot as Readonly<Record<string, unknown>>) ?? {},
          changedByUserId:
            (input.changedByUserId as string | undefined) ?? ctx.actorUserId,
          changeSummary: input.changeSummary as string | undefined,
        };
        await db.insert(testingTestCaseVersion).values(testCaseVersionToRow(record));
        return record;
      },
      async get(ctx, id) {
        assertPermission(ctx, "test_case_version", "get");
        const rows = await db
          .select()
          .from(testingTestCaseVersion)
          .where(
            and(
              eq(testingTestCaseVersion.tenantId, ctx.tenantId),
              eq(testingTestCaseVersion.id, id),
            ),
          )
          .limit(1);
        const row = rows[0];
        return row ? rowToTestCaseVersion(row) : undefined;
      },
      async listByCase(ctx, caseId, query) {
        assertPermission(ctx, "test_case_version", "list");
        const q = normalizeListQuery(query);
        const rows = await db
          .select()
          .from(testingTestCaseVersion)
          .where(
            and(
              eq(testingTestCaseVersion.tenantId, ctx.tenantId),
              eq(testingTestCaseVersion.caseId, caseId),
            ),
          );
        const items = [...rows.map(rowToTestCaseVersion)].sort((a, b) =>
          compareValues(a.versionNumber, b.versionNumber, q.sort?.direction ?? "asc"),
        );
        return paginateItems(items, q.page, q.pageSize);
      },
    },
    testPlanVersions: {
      async create(ctx, input) {
        assertPermission(ctx, "test_plan_version", "create");
        assertRequiredString(input.planId, "planId");
        validateCaseVersionReason(String(input.reason));
        const meta = baseMeta(ctx, {
          id: input.id,
          organisationId: input.organisationId,
        });
        const record: TestPlanVersionRecord = {
          ...meta,
          planId: String(input.planId),
          versionNumber: Number(input.versionNumber ?? 1),
          reason: input.reason as TestPlanVersionRecord["reason"],
          snapshot: (input.snapshot as Readonly<Record<string, unknown>>) ?? {},
          changedByUserId:
            (input.changedByUserId as string | undefined) ?? ctx.actorUserId,
          changeSummary: input.changeSummary as string | undefined,
        };
        await db.insert(testingTestPlanVersion).values(testPlanVersionToRow(record));
        return record;
      },
      async get(ctx, id) {
        assertPermission(ctx, "test_plan_version", "get");
        const rows = await db
          .select()
          .from(testingTestPlanVersion)
          .where(
            and(
              eq(testingTestPlanVersion.tenantId, ctx.tenantId),
              eq(testingTestPlanVersion.id, id),
            ),
          )
          .limit(1);
        const row = rows[0];
        return row ? rowToTestPlanVersion(row) : undefined;
      },
      async listByPlan(ctx, planId, query) {
        assertPermission(ctx, "test_plan_version", "list");
        const q = normalizeListQuery(query);
        const rows = await db
          .select()
          .from(testingTestPlanVersion)
          .where(
            and(
              eq(testingTestPlanVersion.tenantId, ctx.tenantId),
              eq(testingTestPlanVersion.planId, planId),
            ),
          );
        const items = [...rows.map(rowToTestPlanVersion)].sort((a, b) =>
          compareValues(a.versionNumber, b.versionNumber, q.sort?.direction ?? "asc"),
        );
        return paginateItems(items, q.page, q.pageSize);
      },
    },
    testSuiteVersions: {
      async create(ctx, input) {
        assertPermission(ctx, "test_suite_version", "create");
        assertRequiredString(input.suiteId, "suiteId");
        validateCaseVersionReason(String(input.reason));
        const meta = baseMeta(ctx, {
          id: input.id,
          organisationId: input.organisationId,
        });
        const record: TestSuiteVersionRecord = {
          ...meta,
          suiteId: String(input.suiteId),
          versionNumber: Number(input.versionNumber ?? 1),
          reason: input.reason as TestSuiteVersionRecord["reason"],
          snapshot: (input.snapshot as Readonly<Record<string, unknown>>) ?? {},
          changedByUserId:
            (input.changedByUserId as string | undefined) ?? ctx.actorUserId,
          changeSummary: input.changeSummary as string | undefined,
        };
        await db.insert(testingTestSuiteVersion).values(testSuiteVersionToRow(record));
        return record;
      },
      async get(ctx, id) {
        assertPermission(ctx, "test_suite_version", "get");
        const rows = await db
          .select()
          .from(testingTestSuiteVersion)
          .where(
            and(
              eq(testingTestSuiteVersion.tenantId, ctx.tenantId),
              eq(testingTestSuiteVersion.id, id),
            ),
          )
          .limit(1);
        const row = rows[0];
        return row ? rowToTestSuiteVersion(row) : undefined;
      },
      async listBySuite(ctx, suiteId, query) {
        assertPermission(ctx, "test_suite_version", "list");
        const q = normalizeListQuery(query);
        const rows = await db
          .select()
          .from(testingTestSuiteVersion)
          .where(
            and(
              eq(testingTestSuiteVersion.tenantId, ctx.tenantId),
              eq(testingTestSuiteVersion.suiteId, suiteId),
            ),
          );
        const items = [...rows.map(rowToTestSuiteVersion)].sort((a, b) =>
          compareValues(a.versionNumber, b.versionNumber, q.sort?.direction ?? "asc"),
        );
        return paginateItems(items, q.page, q.pageSize);
      },
    },
  };
}

function createApprovalHistoryRepo(db: DatabaseExecutor): ApprovalHistoryRepository {
  return {
    async append(ctx, input) {
      assertPermission(ctx, "approval_history", "append");
      assertRequiredString(input.approvalId, "approvalId");
      assertRequiredString(input.eventType, "eventType");
      assertRequiredString(input.summary, "summary");
      const record: ApprovalHistoryRecord = {
        id: input.id || randomUUID(),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        approvalId: input.approvalId,
        eventType: input.eventType,
        occurredAt: input.occurredAt ?? new Date().toISOString(),
        actorUserId: input.actorUserId ?? ctx.actorUserId,
        correlationId: input.correlationId ?? ctx.correlationId,
        summary: input.summary,
        details: input.details ?? {},
        fromStatus: input.fromStatus,
        toStatus: input.toStatus,
      };
      await db.insert(testingApprovalHistory).values(approvalHistoryToRow(record));
      return record;
    },
    async listByApproval(ctx, approvalId, query) {
      assertPermission(ctx, "approval_history", "list");
      const q = normalizeListQuery(query);
      const rows = await db
        .select()
        .from(testingApprovalHistory)
        .where(
          and(
            eq(testingApprovalHistory.tenantId, ctx.tenantId),
            eq(testingApprovalHistory.approvalId, approvalId),
          ),
        );
      const items = [...rows.map(rowToApprovalHistory)].sort((a, b) =>
        compareValues(a.occurredAt, b.occurredAt, q.sort?.direction ?? "asc"),
      );
      return paginateItems(items, q.page, q.pageSize);
    },
    async get(ctx, id) {
      assertPermission(ctx, "approval_history", "get");
      const rows = await db
        .select()
        .from(testingApprovalHistory)
        .where(
          and(
            eq(testingApprovalHistory.tenantId, ctx.tenantId),
            eq(testingApprovalHistory.id, id),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? rowToApprovalHistory(row) : undefined;
    },
  };
}

/**
 * Full Postgres-backed TestingPersistence — all aggregates use SQL tables.
 * Use createInMemoryTestingPersistence for unit tests without a database.
 */
export function createPostgresTestingPersistence(
  db: DatabaseExecutor,
): TestingPersistence {
  const versions = createVersionRepos(db);

  const requirements = createPostgresCrudRepository<RequirementCreate, RequirementUpdate, RequirementRecord>({
    kind: "requirement",
    db,
    table: asTable(testingRequirement),
    searchFields: ["key", "title", "description"],
    validateCreate: (input) => {
      assertRequiredString(input.key, "key");
      assertRequiredString(input.title, "title");
      validatePriority(String(input.priority));
    },
    validateUpdate: (input) => {
      if (input.priority !== undefined) validatePriority(String(input.priority));
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<RequirementRecord>;
      return {
        ...meta,
        key: String(existing?.key ?? data.key),
        title: String(data.title ?? existing?.title ?? ""),
        description: data.description ?? existing?.description,
        priority: data.priority ?? existing?.priority ?? "medium",
        tags: data.tags ?? existing?.tags ?? [],
        workItemRefs: data.workItemRefs ?? existing?.workItemRefs ?? [],
        riskIds: data.riskIds ?? existing?.riskIds ?? [],
        ownerId: data.ownerId ?? existing?.ownerId,
      };
    },
    toRow: (record) => requirementToRow(record),
    rowToRecord: (row) => rowToRequirement(row as never),
    afterWrite: async (ctx, record) => {
      await replaceRequirementRisks(db, ctx.tenantId, record.id, record.riskIds);
    },
    enrichOnRead: async (ctx, record) => ({
      ...record,
      riskIds: await loadRequirementRiskIds(db, ctx.tenantId, record.id),
    }),
  });

  const workItems = createPostgresCrudRepository<WorkItemCreate, WorkItemUpdate, WorkItemRecord>({
    kind: "work_item",
    db,
    table: asTable(testingWorkItem),
    searchFields: ["key", "title", "description"],
    validateCreate: (input) => {
      assertRequiredString(input.key, "key");
      assertRequiredString(input.title, "title");
      validateWorkItemKind(String(input.kind));
    },
    validateUpdate: (input) => {
      if (input.kind !== undefined) validateWorkItemKind(String(input.kind));
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<WorkItemRecord>;
      return {
        ...meta,
        kind: data.kind ?? existing?.kind ?? "task",
        key: String(existing?.key ?? data.key),
        title: String(data.title ?? existing?.title ?? ""),
        description: data.description ?? existing?.description,
        projectRefId: data.projectRefId ?? existing?.projectRefId,
        externalWorkItemId: data.externalWorkItemId ?? existing?.externalWorkItemId,
        status: String(data.status ?? existing?.status ?? "active"),
      };
    },
    toRow: (record) => workItemToRow(record),
    rowToRecord: (row) => rowToWorkItem(row as never),
  });

  const risks = createPostgresCrudRepository<RiskCreate, RiskUpdate, RiskRecord>({
    kind: "risk",
    db,
    table: asTable(testingRisk),
    searchFields: ["key", "title", "description"],
    validateCreate: (input) => {
      assertRequiredString(input.key, "key");
      assertRequiredString(input.title, "title");
      validateRiskLevel(String(input.level));
    },
    validateUpdate: (input) => {
      if (input.level !== undefined) validateRiskLevel(String(input.level));
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<RiskRecord>;
      return {
        ...meta,
        key: String(existing?.key ?? data.key),
        title: String(data.title ?? existing?.title ?? ""),
        description: data.description ?? existing?.description,
        level: data.level ?? existing?.level ?? "medium",
        mitigationSummary: data.mitigationSummary ?? existing?.mitigationSummary,
        requirementIds: data.requirementIds ?? existing?.requirementIds ?? [],
        severity: data.severity ?? existing?.severity,
        likelihood: data.likelihood ?? existing?.likelihood,
        impact: data.impact ?? existing?.impact,
        businessCriticality: data.businessCriticality ?? existing?.businessCriticality,
        regressionImportance:
          data.regressionImportance ?? existing?.regressionImportance,
        ownerId: data.ownerId ?? existing?.ownerId,
      };
    },
    toRow: (record) => riskToRow(record),
    rowToRecord: (row) => rowToRisk(row as never),
    afterWrite: async (ctx, record) => {
      await replaceRiskRequirements(
        db,
        ctx.tenantId,
        record.id,
        record.requirementIds,
      );
    },
    enrichOnRead: async (ctx, record) => ({
      ...record,
      requirementIds: await loadRiskRequirementIds(db, ctx.tenantId, record.id),
    }),
  });

  const testPlans = createPostgresCrudRepository<TestPlanCreate, TestPlanUpdate, TestPlanRecord>({
    kind: "test_plan",
    db,
    table: asTable(testingTestPlan),
    searchFields: ["key", "name", "description"],
    validateCreate: (input) => {
      assertRequiredString(input.key, "key");
      assertRequiredString(input.name, "name");
      validateTestStatus(String(input.status));
    },
    validateUpdate: (input) => {
      if (input.status !== undefined) validateTestStatus(String(input.status));
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<TestPlanRecord>;
      return {
        ...meta,
        key: String(existing?.key ?? data.key),
        name: String(data.name ?? existing?.name ?? ""),
        description: data.description ?? existing?.description,
        status: data.status ?? existing?.status ?? "draft",
        releaseLabel: data.releaseLabel ?? existing?.releaseLabel,
        milestoneLabel: data.milestoneLabel ?? existing?.milestoneLabel,
        suiteIds: data.suiteIds ?? existing?.suiteIds ?? [],
        requirementIds: data.requirementIds ?? existing?.requirementIds ?? [],
        riskIds: data.riskIds ?? existing?.riskIds ?? [],
        ownerId: data.ownerId ?? existing?.ownerId,
        assigneeId: data.assigneeId ?? existing?.assigneeId,
        versionNumber: data.versionNumber ?? existing?.versionNumber ?? 1,
        parentPlanId: data.parentPlanId ?? existing?.parentPlanId,
      };
    },
    toRow: (record) => testPlanToRow(record),
    rowToRecord: (row) => rowToTestPlan(row as never),
    afterWrite: async (ctx, record) => {
      await replacePlanSuites(db, ctx.tenantId, record.id, record.suiteIds);
      await replacePlanRequirements(
        db,
        ctx.tenantId,
        record.id,
        record.requirementIds,
      );
      await replacePlanRisks(db, ctx.tenantId, record.id, record.riskIds);
    },
    enrichOnRead: async (ctx, record) => ({
      ...record,
      suiteIds: await loadPlanSuiteIds(db, ctx.tenantId, record.id),
      requirementIds: await loadPlanRequirementIds(db, ctx.tenantId, record.id),
      riskIds: await loadPlanRiskIds(db, ctx.tenantId, record.id),
    }),
  });

  const testSuites = createPostgresCrudRepository<TestSuiteCreate, TestSuiteUpdate, TestSuiteRecord>({
    kind: "test_suite",
    db,
    table: asTable(testingTestSuite),
    searchFields: ["key", "name", "description"],
    validateCreate: (input) => {
      assertRequiredString(input.key, "key");
      assertRequiredString(input.name, "name");
      validateTestStatus(String(input.status));
    },
    validateUpdate: (input) => {
      if (input.status !== undefined) validateTestStatus(String(input.status));
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<TestSuiteRecord>;
      return {
        ...meta,
        key: String(existing?.key ?? data.key),
        name: String(data.name ?? existing?.name ?? ""),
        description: data.description ?? existing?.description,
        status: data.status ?? existing?.status ?? "draft",
        isRegression: Boolean(data.isRegression ?? existing?.isRegression ?? false),
        planIds: data.planIds ?? existing?.planIds ?? [],
        caseIds: data.caseIds ?? existing?.caseIds ?? [],
        ownerId: data.ownerId ?? existing?.ownerId,
        parentSuiteId: data.parentSuiteId ?? existing?.parentSuiteId,
        sortOrder: data.sortOrder ?? existing?.sortOrder ?? 0,
        versionNumber: data.versionNumber ?? existing?.versionNumber ?? 1,
        groupKey: data.groupKey ?? existing?.groupKey,
      };
    },
    toRow: (record) => testSuiteToRow(record),
    rowToRecord: (row) => rowToTestSuite(row as never),
    afterWrite: async (ctx, record) => {
      await replaceSuiteCases(db, ctx.tenantId, record.id, record.caseIds);
    },
    enrichOnRead: async (ctx, record) => ({
      ...record,
      planIds: await loadSuitePlanIds(db, ctx.tenantId, record.id),
      caseIds: await loadSuiteCaseIds(db, ctx.tenantId, record.id),
    }),
  });

  const testCases = createPostgresCrudRepository<TestCaseCreate, TestCaseUpdate, TestCaseRecord>({
    kind: "test_case",
    db,
    table: asTable(testingTestCase),
    searchFields: ["key", "title", "description"],
    validateCreate: (input) => {
      assertRequiredString(input.key, "key");
      assertRequiredString(input.title, "title");
      validateTestStatus(String(input.status));
      validatePriority(String(input.priority));
    },
    validateUpdate: (input) => {
      if (input.status !== undefined) validateTestStatus(String(input.status));
      if (input.priority !== undefined) validatePriority(String(input.priority));
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<TestCaseRecord>;
      return {
        ...meta,
        key: String(existing?.key ?? data.key),
        title: String(data.title ?? existing?.title ?? ""),
        description: data.description ?? existing?.description,
        status: data.status ?? existing?.status ?? "draft",
        priority: data.priority ?? existing?.priority ?? "medium",
        tags: data.tags ?? existing?.tags ?? [],
        estimatedMinutes: data.estimatedMinutes ?? existing?.estimatedMinutes,
        suiteIds: data.suiteIds ?? existing?.suiteIds ?? [],
        requirementIds: data.requirementIds ?? existing?.requirementIds ?? [],
        stepIds: data.stepIds ?? existing?.stepIds ?? [],
        preconditions: data.preconditions ?? existing?.preconditions,
        postconditions: data.postconditions ?? existing?.postconditions,
        expectedResultsSummary:
          data.expectedResultsSummary ?? existing?.expectedResultsSummary,
        templateKey: data.templateKey ?? existing?.templateKey,
        parameters: data.parameters ?? existing?.parameters ?? [],
        components: data.components ?? existing?.components ?? [],
        ownerId: data.ownerId ?? existing?.ownerId,
        reviewerId: data.reviewerId ?? existing?.reviewerId,
        versionNumber: data.versionNumber ?? existing?.versionNumber ?? 1,
        parentCaseId: data.parentCaseId ?? existing?.parentCaseId,
        riskLevel: data.riskLevel ?? existing?.riskLevel,
      };
    },
    toRow: (record) => testCaseToRow(record),
    rowToRecord: (row) => rowToTestCase(row as never),
    afterWrite: async (ctx, record) => {
      await replaceCaseRequirements(
        db,
        ctx.tenantId,
        record.id,
        record.requirementIds,
      );
    },
    enrichOnRead: async (ctx, record) => ({
      ...record,
      suiteIds: await loadCaseSuiteIds(db, ctx.tenantId, record.id),
      requirementIds: await loadCaseRequirementIds(db, ctx.tenantId, record.id),
      stepIds: await loadCaseStepIds(db, ctx.tenantId, record.id),
    }),
  });

  const testSteps = createPostgresCrudRepository<TestStepCreate, TestStepUpdate, TestStepRecord>({
    kind: "test_step",
    db,
    table: asTable(testingTestStep),
    searchFields: ["action", "expectedResult"],
    validateCreate: (input) => {
      assertRequiredString(input.caseId, "caseId");
      assertRequiredString(input.action, "action");
      assertRequiredString(input.expectedResult, "expectedResult");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<TestStepRecord>;
      return {
        ...meta,
        caseId: String(existing?.caseId ?? data.caseId),
        ordinal: Number(data.ordinal ?? existing?.ordinal ?? 0),
        action: String(data.action ?? existing?.action ?? ""),
        expectedResult: String(data.expectedResult ?? existing?.expectedResult ?? ""),
        dataHint: data.dataHint ?? existing?.dataHint,
      };
    },
    toRow: (record) => testStepToRow(record),
    rowToRecord: (row) => rowToTestStep(row as never),
  });

  const regressionSets = createPostgresCrudRepository<RegressionSetCreate, RegressionSetUpdate, RegressionSetRecord>({
    kind: "regression_set",
    db,
    table: asTable(testingRegressionSet),
    searchFields: ["key", "name", "description"],
    validateCreate: (input) => {
      assertRequiredString(input.key, "key");
      assertRequiredString(input.name, "name");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<RegressionSetRecord>;
      return {
        ...meta,
        key: String(existing?.key ?? data.key),
        name: String(data.name ?? existing?.name ?? ""),
        description: data.description ?? existing?.description,
        planId: data.planId ?? existing?.planId,
        suiteIds: data.suiteIds ?? existing?.suiteIds ?? [],
        ownerId: data.ownerId ?? existing?.ownerId,
      };
    },
    toRow: (record) => regressionSetToRow(record),
    rowToRecord: (row) => rowToRegressionSet(row as never),
  });

  const executionSessions = createPostgresCrudRepository<ExecutionSessionCreate, ExecutionSessionUpdate, ExecutionSessionRecord>({
    kind: "execution_session",
    db,
    table: asTable(testingExecutionSession),
    searchFields: ["notes", "status"],
    validateCreate: (input) => {
      validateExecutionType(String(input.executionType));
      validateExecutionStatus(String(input.status));
    },
    validateUpdate: (input) => {
      if (input.executionType !== undefined) {
        validateExecutionType(String(input.executionType));
      }
      if (input.status !== undefined) validateExecutionStatus(String(input.status));
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ExecutionSessionRecord>;
      return {
        ...meta,
        planId: data.planId ?? existing?.planId,
        suiteId: data.suiteId ?? existing?.suiteId,
        executionType: data.executionType ?? existing?.executionType ?? "manual",
        status: data.status ?? existing?.status ?? "planned",
        startedAt: data.startedAt ?? existing?.startedAt,
        completedAt: data.completedAt ?? existing?.completedAt,
        assigneeId: data.assigneeId ?? existing?.assigneeId,
        notes: data.notes ?? existing?.notes,
      };
    },
    toRow: (record) => executionSessionToRow(record),
    rowToRecord: (row) => rowToExecutionSession(row as never),
  });

  const manualExecutions = createPostgresCrudRepository<ManualExecutionCreate, ManualExecutionUpdate, ManualExecutionRecord>({
    kind: "manual_execution",
    db,
    table: asTable(testingManualExecution),
    searchFields: ["status", "caseId", "sessionId"],
    validateCreate: (input) => {
      assertRequiredString(input.sessionId, "sessionId");
      assertRequiredString(input.caseId, "caseId");
      validateExecutionStatus(String(input.status));
      if (input.approvalState !== undefined) {
        validateExecutionApprovalState(String(input.approvalState));
      }
      if (input.overallResult !== undefined) {
        validateTestResultStatus(String(input.overallResult));
      }
    },
    validateUpdate: (input) => {
      if (input.status !== undefined) validateExecutionStatus(String(input.status));
      if (input.approvalState !== undefined) {
        validateExecutionApprovalState(String(input.approvalState));
      }
      if (input.overallResult !== undefined) {
        validateTestResultStatus(String(input.overallResult));
      }
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ManualExecutionRecord>;
      return {
        ...meta,
        sessionId: String(existing?.sessionId ?? data.sessionId),
        caseId: String(existing?.caseId ?? data.caseId),
        status: data.status ?? existing?.status ?? "draft",
        assigneeId: data.assigneeId ?? existing?.assigneeId,
        testerId: data.testerId ?? existing?.testerId,
        reviewerId: data.reviewerId ?? existing?.reviewerId,
        startedAt: data.startedAt ?? existing?.startedAt,
        pausedAt: data.pausedAt ?? existing?.pausedAt,
        resumedAt: data.resumedAt ?? existing?.resumedAt,
        completedAt: data.completedAt ?? existing?.completedAt,
        approvalState: data.approvalState ?? existing?.approvalState ?? "none",
        comments: data.comments ?? existing?.comments ?? [],
        stepActuals: data.stepActuals ?? existing?.stepActuals ?? [],
        overallResult: data.overallResult ?? existing?.overallResult,
        restartOfId: data.restartOfId ?? existing?.restartOfId,
        parameterOverrides: data.parameterOverrides ?? existing?.parameterOverrides,
        blockReason: data.blockReason ?? existing?.blockReason,
      };
    },
    toRow: (record) => manualExecutionToRow(record),
    rowToRecord: (row) => rowToManualExecution(row as never),
    afterWrite: async (ctx, record) => {
      await syncManualStepActuals(db, {
        tenantId: ctx.tenantId,
        organisationId: record.organisationId,
        executionId: record.id,
        stepActuals: record.stepActuals,
        actorUserId: ctx.actorUserId,
      });
    },
  });

  const evidence = createPostgresCrudRepository<EvidenceCreate, EvidenceUpdate, EvidenceRecord>({
    kind: "evidence",
    db,
    table: asTable(testingEvidence),
    searchFields: ["title", "description", "storageRef"],
    validateCreate: (input) => {
      assertRequiredString(input.title, "title");
      assertRequiredString(input.storageRef, "storageRef");
      validateEvidenceType(String(input.type));
      if (input.lifecycleStatus !== undefined) {
        validateEvidenceLifecycleStatus(String(input.lifecycleStatus));
      }
    },
    validateUpdate: (input) => {
      if (input.type !== undefined) validateEvidenceType(String(input.type));
      if (input.lifecycleStatus !== undefined) {
        validateEvidenceLifecycleStatus(String(input.lifecycleStatus));
      }
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<EvidenceRecord>;
      return {
        ...meta,
        type: data.type ?? existing?.type ?? "other",
        title: String(data.title ?? existing?.title ?? ""),
        description: data.description ?? existing?.description,
        storageRef: String(data.storageRef ?? existing?.storageRef ?? ""),
        contentType: data.contentType ?? existing?.contentType,
        contentHash: data.contentHash ?? existing?.contentHash,
        sizeBytes: data.sizeBytes ?? existing?.sizeBytes,
        sessionId: data.sessionId ?? existing?.sessionId,
        caseId: data.caseId ?? existing?.caseId,
        stepId: data.stepId ?? existing?.stepId,
        url: data.url ?? existing?.url,
        checksum: data.checksum ?? existing?.checksum,
        mimeType: data.mimeType ?? existing?.mimeType,
        relationships: data.relationships ?? existing?.relationships ?? [],
        executionId: data.executionId ?? existing?.executionId,
        lifecycleStatus: data.lifecycleStatus ?? existing?.lifecycleStatus ?? "pending",
        verificationState: data.verificationState ?? existing?.verificationState,
        evidenceApprovalState:
          data.evidenceApprovalState ?? existing?.evidenceApprovalState,
        captureTime: data.captureTime ?? existing?.captureTime,
        authorUserId: data.authorUserId ?? existing?.authorUserId,
      };
    },
    toRow: (record) => evidenceToRow(record),
    rowToRecord: (row) => rowToEvidence(row as never),
  });

  const approvals = createPostgresCrudRepository<ApprovalCreate, ApprovalUpdate, ApprovalRecord>({
    kind: "approval",
    db,
    table: asTable(testingApproval),
    searchFields: ["comments", "status"],
    validateCreate: (input) => {
      assertRequiredString(input.certificationRecordId, "certificationRecordId");
      validateApprovalStatus(String(input.status));
    },
    validateUpdate: (input) => {
      if (input.status !== undefined) validateApprovalStatus(String(input.status));
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ApprovalRecord>;
      return {
        ...meta,
        certificationRecordId: String(
          existing?.certificationRecordId ?? data.certificationRecordId,
        ),
        gateId: data.gateId ?? existing?.gateId,
        status: data.status ?? existing?.status ?? "pending",
        requestedFromUserId: data.requestedFromUserId ?? existing?.requestedFromUserId,
        decidedByUserId: data.decidedByUserId ?? existing?.decidedByUserId,
        decidedAt: data.decidedAt ?? existing?.decidedAt,
        comments: data.comments ?? existing?.comments,
        conditions: data.conditions ?? existing?.conditions,
        signatureJson: data.signatureJson ?? existing?.signatureJson,
        witnessesJson: data.witnessesJson ?? existing?.witnessesJson,
        authorUserId: data.authorUserId ?? existing?.authorUserId,
        reviewerUserId: data.reviewerUserId ?? existing?.reviewerUserId,
        approverUserId: data.approverUserId ?? existing?.approverUserId,
        historyJson: data.historyJson ?? existing?.historyJson ?? [],
        subjectKind: data.subjectKind ?? existing?.subjectKind,
        subjectId: data.subjectId ?? existing?.subjectId,
        stagesJson: data.stagesJson ?? existing?.stagesJson,
        currentStageOrdinal: data.currentStageOrdinal ?? existing?.currentStageOrdinal,
        stageDecisionsJson: data.stageDecisionsJson ?? existing?.stageDecisionsJson,
      };
    },
    toRow: (record) => approvalToRow(record),
    rowToRecord: (row) => rowToApproval(row as never),
  });

  const certificationRecords = createPostgresCrudRepository<CertificationCreate, CertificationUpdate, CertificationRecordRecord>({
    kind: "certification_record",
    db,
    table: asTable(testingCertificationRecord),
    searchFields: ["key", "name", "productLabel", "releaseLabel"],
    validateCreate: (input) => {
      assertRequiredString(input.key, "key");
      assertRequiredString(input.name, "name");
      validateCertificationStatus(String(input.status));
    },
    validateUpdate: (input) => {
      if (input.status !== undefined) {
        validateCertificationStatus(String(input.status));
      }
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<CertificationRecordRecord>;
      return {
        ...meta,
        key: String(existing?.key ?? data.key),
        name: String(data.name ?? existing?.name ?? ""),
        status: data.status ?? existing?.status ?? "draft",
        planId: data.planId ?? existing?.planId,
        productLabel: data.productLabel ?? existing?.productLabel,
        releaseLabel: data.releaseLabel ?? existing?.releaseLabel,
        gateIds: data.gateIds ?? existing?.gateIds ?? [],
        approvalIds: data.approvalIds ?? existing?.approvalIds ?? [],
        conditions: data.conditions ?? existing?.conditions,
        certifiedAt: data.certifiedAt ?? existing?.certifiedAt,
        expiresAt: data.expiresAt ?? existing?.expiresAt,
        gateEvaluationIds: data.gateEvaluationIds ?? existing?.gateEvaluationIds ?? [],
        currentRecommendation:
          data.currentRecommendation ?? existing?.currentRecommendation,
        recommendationJson: data.recommendationJson ?? existing?.recommendationJson,
        evidenceLinksJson: data.evidenceLinksJson ?? existing?.evidenceLinksJson,
        ruleId: data.ruleId ?? existing?.ruleId,
      };
    },
    toRow: (record) => certificationToRow(record),
    rowToRecord: (row) => rowToCertification(row as never),
  });

  const certificationEngine = createPostgresCertificationRepos(db);

  const releaseReadiness = createPostgresCrudRepository<ReleaseReadinessCreate, ReleaseReadinessUpdate, ReleaseReadinessRecord>({
    kind: "release_readiness",
    db,
    table: asTable(testingReleaseReadiness),
    searchFields: ["summary", "status"],
    validateCreate: (input) => {
      assertRequiredString(input.certificationRecordId, "certificationRecordId");
      assertRequiredString(input.summary, "summary");
      validateReleaseReadinessStatus(String(input.status));
    },
    validateUpdate: (input) => {
      if (input.status !== undefined) {
        validateReleaseReadinessStatus(String(input.status));
      }
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ReleaseReadinessRecord>;
      return {
        ...meta,
        certificationRecordId: String(
          existing?.certificationRecordId ?? data.certificationRecordId,
        ),
        status: data.status ?? existing?.status ?? "not_ready",
        summary: String(data.summary ?? existing?.summary ?? ""),
        blockingGateIds: data.blockingGateIds ?? existing?.blockingGateIds ?? [],
        assessedAt: String(
          data.assessedAt ?? existing?.assessedAt ?? new Date().toISOString(),
        ),
      };
    },
    toRow: (record) => releaseReadinessToRow(record),
    rowToRecord: (row) => rowToReleaseReadiness(row as never),
  });

  const coverageRecords = createPostgresCrudRepository<CoverageCreate, CoverageUpdate, CoverageRecord>({
    kind: "coverage_record",
    db,
    table: asTable(testingCoverageRecord),
    searchFields: ["subjectId", "kind"],
    validateCreate: (input) => {
      assertRequiredString(input.subjectId, "subjectId");
      validateCoverageKind(String(input.kind));
    },
    validateUpdate: (input) => {
      if (input.kind !== undefined) validateCoverageKind(String(input.kind));
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<CoverageRecord>;
      return {
        ...meta,
        kind: data.kind ?? existing?.kind ?? "requirement",
        subjectId: String(data.subjectId ?? existing?.subjectId ?? ""),
        coveredCount: Number(data.coveredCount ?? existing?.coveredCount ?? 0),
        totalCount: Number(data.totalCount ?? existing?.totalCount ?? 0),
        percentage: Number(data.percentage ?? existing?.percentage ?? 0),
        computedAt: String(
          data.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
        ),
        planId: data.planId ?? existing?.planId,
        suiteId: data.suiteId ?? existing?.suiteId,
        requirementId: data.requirementId ?? existing?.requirementId,
        riskId: data.riskId ?? existing?.riskId,
      };
    },
    toRow: (record) => coverageToRow(record),
    rowToRecord: (row) => rowToCoverage(row as never),
  });

  const defectLinks = createPostgresCrudRepository<
    DefectLinkCreate,
    DefectLinkUpdate,
    DefectLinkRecord
  >({
    kind: "defect_link",
    db,
    table: asTable(testingDefectLink),
    searchFields: ["summary", "status", "providerKind", "externalRef", "internalRef"],
    validateCreate: (input) => {
      validateDefectProviderKind(String(input.providerKind));
      validateDefectStatus(String(input.status));
    },
    validateUpdate: (input) => {
      if (input.providerKind !== undefined) {
        validateDefectProviderKind(String(input.providerKind));
      }
      if (input.status !== undefined) validateDefectStatus(String(input.status));
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<DefectLinkRecord>;
      return {
        ...meta,
        providerKind: String(data.providerKind ?? existing?.providerKind ?? "internal"),
        providerKey: data.providerKey ?? existing?.providerKey,
        status: String(data.status ?? existing?.status ?? "open"),
        internalRef: data.internalRef ?? existing?.internalRef,
        externalRef: data.externalRef ?? existing?.externalRef,
        severity: data.severity ?? existing?.severity,
        priority: data.priority ?? existing?.priority,
        ownerUserId: data.ownerUserId ?? existing?.ownerUserId,
        resolution: data.resolution ?? existing?.resolution,
        verificationState: data.verificationState ?? existing?.verificationState,
        summary: data.summary ?? existing?.summary,
        url: data.url ?? existing?.url,
        requirementIds: data.requirementIds ?? existing?.requirementIds ?? [],
        planIds: data.planIds ?? existing?.planIds ?? [],
        suiteIds: data.suiteIds ?? existing?.suiteIds ?? [],
        caseIds: data.caseIds ?? existing?.caseIds ?? [],
        manualExecutionIds:
          data.manualExecutionIds ?? existing?.manualExecutionIds ?? [],
        automationExecutionIds:
          data.automationExecutionIds ?? existing?.automationExecutionIds ?? [],
        evidenceIds: data.evidenceIds ?? existing?.evidenceIds ?? [],
        releaseLabel: data.releaseLabel ?? existing?.releaseLabel,
        riskIds: data.riskIds ?? existing?.riskIds ?? [],
        workItemRefs: data.workItemRefs ?? existing?.workItemRefs ?? [],
        target: data.target ?? existing?.target,
        externalId: data.externalId ?? existing?.externalId,
        resultId: data.resultId ?? existing?.resultId,
        runId: data.runId ?? existing?.runId,
      };
    },
    toRow: (record) => defectLinkToRow(record),
    rowToRecord: (row) => rowToDefectLink(row as never),
  });

  const qualitySnapshots = createPostgresCrudRepository<
    QualitySnapshotCreate,
    QualitySnapshotUpdate,
    QualitySnapshotRecord
  >({
    kind: "quality_snapshot",
    db,
    table: asTable(testingQualitySnapshot),
    searchFields: ["label"],
    validateCreate: (input) => {
      assertRequiredString(String(input.computedAt ?? ""), "computedAt");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<QualitySnapshotRecord>;
      return {
        ...meta,
        scope: data.scope ?? existing?.scope ?? {},
        metrics: data.metrics ?? existing?.metrics ?? {},
        computedAt: String(
          data.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
        ),
        label: data.label ?? existing?.label,
      };
    },
    toRow: (record) => qualitySnapshotToRow(record),
    rowToRecord: (row) => rowToQualitySnapshot(row as never),
  });

  const regressionAnalyses = createPostgresCrudRepository<
    RegressionAnalysisCreate,
    RegressionAnalysisUpdate,
    RegressionAnalysisRecord
  >({
    kind: "regression_analysis",
    db,
    table: asTable(testingRegressionAnalysis),
    searchFields: ["baselineLabel", "currentLabel"],
    validateCreate: (input) => {
      assertRequiredString(String(input.baselineLabel ?? ""), "baselineLabel");
      assertRequiredString(String(input.currentLabel ?? ""), "currentLabel");
      assertRequiredString(String(input.computedAt ?? ""), "computedAt");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<RegressionAnalysisRecord>;
      return {
        ...meta,
        baselineLabel: String(data.baselineLabel ?? existing?.baselineLabel ?? ""),
        currentLabel: String(data.currentLabel ?? existing?.currentLabel ?? ""),
        newFailures: data.newFailures ?? existing?.newFailures ?? [],
        resolvedFailures: data.resolvedFailures ?? existing?.resolvedFailures ?? [],
        reopenedFailures: data.reopenedFailures ?? existing?.reopenedFailures ?? [],
        coverageDelta: Number(data.coverageDelta ?? existing?.coverageDelta ?? 0),
        executionDelta: Number(data.executionDelta ?? existing?.executionDelta ?? 0),
        computedAt: String(
          data.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
        ),
        details: data.details ?? existing?.details,
      };
    },
    toRow: (record) => regressionAnalysisToRow(record),
    rowToRecord: (row) => rowToRegressionAnalysis(row as never),
  });

  const automationDefinitions = createPostgresCrudRepository<AutomationDefinitionCreate, AutomationDefinitionUpdate, AutomationDefinitionRecord>({
    kind: "automation_definition",
    db,
    table: asTable(testingAutomationDefinition),
    searchFields: ["key", "name", "description"],
    validateCreate: (input) => {
      assertRequiredString(input.key, "key");
      assertRequiredString(input.name, "name");
      validateAutomationType(String(input.automationType));
    },
    validateUpdate: (input) => {
      if (input.automationType !== undefined) {
        validateAutomationType(String(input.automationType));
      }
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<AutomationDefinitionRecord>;
      return {
        ...meta,
        key: String(existing?.key ?? data.key),
        name: String(data.name ?? existing?.name ?? ""),
        description: data.description ?? existing?.description,
        automationType: data.automationType ?? existing?.automationType ?? "other",
        adapterSourceId: data.adapterSourceId ?? existing?.adapterSourceId,
        caseId: data.caseId ?? existing?.caseId,
        suiteId: data.suiteId ?? existing?.suiteId,
        configJson: data.configJson ?? existing?.configJson ?? {},
        status: String(data.status ?? existing?.status ?? "active"),
      };
    },
    toRow: (record) => automationDefinitionToRow(record),
    rowToRecord: (row) => rowToAutomationDefinition(row as never),
  });

  const traceabilityLinks = createPostgresCrudRepository<TraceabilityLinkCreate, TraceabilityLinkUpdate, TraceabilityLinkRecord>({
    kind: "traceability_link",
    db,
    table: asTable(testingTraceabilityLink),
    searchFields: ["sourceKind", "targetKind", "notes"],
    validateCreate: (input) => {
      assertRequiredString(input.sourceKind, "sourceKind");
      assertRequiredString(input.sourceId, "sourceId");
      assertRequiredString(input.targetKind, "targetKind");
      assertRequiredString(input.targetId, "targetId");
      validateTraceabilityType(String(input.type));
    },
    validateUpdate: (input) => {
      if (input.type !== undefined) validateTraceabilityType(String(input.type));
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<TraceabilityLinkRecord>;
      return {
        ...meta,
        type: data.type ?? existing?.type ?? "related",
        sourceKind: String(data.sourceKind ?? existing?.sourceKind ?? ""),
        sourceId: String(data.sourceId ?? existing?.sourceId ?? ""),
        targetKind: String(data.targetKind ?? existing?.targetKind ?? ""),
        targetId: String(data.targetId ?? existing?.targetId ?? ""),
        notes: data.notes ?? existing?.notes,
      };
    },
    toRow: (record) => traceabilityLinkToRow(record),
    rowToRecord: (row) => rowToTraceabilityLink(row as never),
  });

  const configurations = createPostgresCrudRepository<ConfigurationCreate, ConfigurationUpdate, ConfigurationRecord>({
    kind: "configuration",
    db,
    table: asTable(testingConfiguration),
    searchFields: ["configKey"],
    validateCreate: (input) => {
      assertRequiredString(input.configKey, "configKey");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<ConfigurationRecord>;
      return {
        ...meta,
        configKey: String(existing?.configKey ?? data.configKey ?? "default"),
        configJson: data.configJson ?? existing?.configJson ?? {},
      };
    },
    toRow: (record) => configurationToRow(record),
    rowToRecord: (row) => rowToConfiguration(row as never),
  });

  const registryEntries = createPostgresCrudRepository<RegistryEntryCreate, RegistryEntryUpdate, RegistryEntryRecord>({
    kind: "registry_entry",
    db,
    table: asTable(testingRegistryEntry),
    searchFields: ["entryKey", "name", "description"],
    validateCreate: (input) => {
      assertRequiredString(input.registryKind, "registryKind");
      assertRequiredString(input.entryKey, "entryKey");
      assertRequiredString(input.name, "name");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<RegistryEntryRecord>;
      return {
        ...meta,
        registryKind: String(existing?.registryKind ?? data.registryKind),
        entryKey: String(existing?.entryKey ?? data.entryKey),
        name: String(data.name ?? existing?.name ?? ""),
        description: data.description ?? existing?.description,
        status: String(data.status ?? existing?.status ?? "enabled"),
        version: data.version ?? existing?.version,
        tags: data.tags ?? existing?.tags ?? [],
        metadata: data.metadata ?? existing?.metadata ?? {},
      };
    },
    toRow: (record) => registryEntryToRow(record),
    rowToRecord: (row) => rowToRegistryEntry(row as never),
  });

  return {
    requirements,
    workItems,
    risks,
    testPlans,
    testSuites,
    testCases,
    testSteps,
    ...versions,
    regressionSets,
    executionSessions,
    manualExecutions,
    executionHistory: {
      async append(ctx, input) {
        assertPermission(ctx, "execution_history", "append");
        const record = {
          id: input.id || randomUUID(),
          tenantId: ctx.tenantId,
          organisationId: input.organisationId ?? ctx.organisationId,
          sessionId: input.sessionId,
          eventType: input.eventType,
          occurredAt: input.occurredAt ?? new Date().toISOString(),
          actorUserId: input.actorUserId ?? ctx.actorUserId,
          correlationId: input.correlationId ?? ctx.correlationId,
          summary: input.summary,
          details: input.details ?? {},
        };
        await db.insert(testingExecutionHistory).values(executionHistoryToRow(record));
        return record;
      },
      async listBySession(ctx, sessionId, query?: ListQuery) {
        assertPermission(ctx, "execution_history", "list");
        const q = normalizeListQuery(query);
        const rows = await db
          .select()
          .from(testingExecutionHistory)
          .where(
            and(
              eq(testingExecutionHistory.tenantId, ctx.tenantId),
              eq(testingExecutionHistory.sessionId, sessionId),
            ),
          );
        return paginateItems(rows.map(rowToExecutionHistory), q.page, q.pageSize);
      },
      async get(ctx, id) {
        assertPermission(ctx, "execution_history", "get");
        const rows = await db
          .select()
          .from(testingExecutionHistory)
          .where(
            and(
              eq(testingExecutionHistory.tenantId, ctx.tenantId),
              eq(testingExecutionHistory.id, id),
            ),
          )
          .limit(1);
        const row = rows[0];
        return row ? rowToExecutionHistory(row) : undefined;
      },
    },
    evidence,
    approvals,
    approvalHistory: createApprovalHistoryRepo(db),
    certificationRecords,
    ...certificationEngine,
    releaseReadiness,
    ...createPostgresReleaseGovernanceRepos(db),
    coverageRecords,
    defectLinks,
    qualitySnapshots,
    regressionAnalyses,
    automationDefinitions,
    ...createPostgresAutomationRepos(db),
    ...createPostgresPipelineRepos(db),
    ...createPostgresEngineeringRepos(db),
    ...createPostgresReportingRepos(db),
    traceabilityLinks,
    auditRecords: {
      async append(ctx, input) {
        assertPermission(ctx, "audit_record", "append");
        const record = {
          id: input.id || randomUUID(),
          tenantId: ctx.tenantId,
          organisationId: input.organisationId ?? ctx.organisationId,
          occurredAt: input.occurredAt ?? new Date().toISOString(),
          actorUserId: input.actorUserId ?? ctx.actorUserId,
          action: input.action,
          entityKind: input.entityKind,
          entityId: input.entityId,
          correlationId: input.correlationId ?? ctx.correlationId,
          summary: input.summary,
          details: input.details ?? {},
        };
        await db.insert(testingAuditRecord).values(auditToRow(record));
        return record;
      },
      async list(ctx, query?: ListQuery) {
        assertPermission(ctx, "audit_record", "list");
        const q = normalizeListQuery(query);
        const rows = await db
          .select()
          .from(testingAuditRecord)
          .where(eq(testingAuditRecord.tenantId, ctx.tenantId));
        return paginateItems(rows.map(rowToAudit), q.page, q.pageSize);
      },
      async get(ctx, id) {
        assertPermission(ctx, "audit_record", "get");
        const rows = await db
          .select()
          .from(testingAuditRecord)
          .where(
            and(
              eq(testingAuditRecord.tenantId, ctx.tenantId),
              eq(testingAuditRecord.id, id),
            ),
          )
          .limit(1);
        const row = rows[0];
        return row ? rowToAudit(row) : undefined;
      },
    },
    configurations,
    registryEntries,
    async runInTransaction(fn) {
      if ("transaction" in db && typeof db.transaction === "function") {
        return db.transaction(async (tx) => {
          const txPersistence = createPostgresTestingPersistence(tx);
          return fn(txPersistence);
        });
      }
      return fn(createPostgresTestingPersistence(db));
    },
  };
}

// silence unused RepositoryContext import warning via type-only re-export
export type { RepositoryContext };
