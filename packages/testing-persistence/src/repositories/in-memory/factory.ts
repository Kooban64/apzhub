import { randomUUID } from "node:crypto";

import { assertPermission } from "../../authorization/testing-authorization";
import {
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
  assertRequiredString,
} from "../../validation/persistence-validation";
import type { AggregateKind, RepositoryContext } from "../../types";
import {
  createEmptyCertificationInMemoryStores,
  createInMemoryCertificationRepos,
} from "../certification/in-memory";
import {
  createEmptyReleaseGovernanceInMemoryStores,
  createInMemoryReleaseGovernanceRepos,
} from "../release-governance/in-memory";
import type {
  ApprovalCreate,
  ApprovalUpdate,
  AuditRecordRepository,
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
  ExecutionHistoryRepository,
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
  TestPlanCreate,
  TestPlanUpdate,
  TestStepCreate,
  TestStepUpdate,
  TestSuiteCreate,
  TestSuiteUpdate,
  TestingPersistence,
  TraceabilityLinkCreate,
  TraceabilityLinkUpdate,
  WorkItemCreate,
  WorkItemUpdate,
} from "../interfaces";
import type {
  ApprovalHistoryRecord,
  ApprovalRecord,
  AuditRecord,
  AutomationCoverageSnapshotRecord,
  AutomationDefinitionRecord,
  AutomationImportHistoryRecord,
  AutomationImportRecord,
  AutomationResultItemRecord,
  AutomationRunRecord,
  AutomatedExecutionRecord,
  PipelineImportHistoryRecord,
  PipelineImportRecord,
  PipelineRecord,
  PipelineRunRecord,
  EngineeringBaselineRecord,
  EngineeringBenchmarkRecord,
  EngineeringHistoricalSnapshotRecord,
  EngineeringQualitySummaryRecord,
  EngineeringSnapshotRecord,
  EngineeringTrendSeriesRecord,
  ReportGenerationMetadataRecord,
  ReportTemplateRecord,
  CertificationRecordRecord,
  CertificationHistoryRecord,
  CertificationAuditRecord,
  CertificationRuleRecord,
  CertificationGateEvaluationRecord,
  CertificationGateDefinitionRecord,
  ConfigurationRecord,
  CoverageRecord,
  DefectLinkRecord,
  EvidenceRecord,
  ExecutionHistoryRecord,
  ExecutionSessionRecord,
  ManualExecutionRecord,
  QualitySnapshotRecord,
  RegistryEntryRecord,
  TestCaseVersionRecord,
  TestPlanVersionRecord,
  TestSuiteVersionRecord,
  RegressionAnalysisRecord,
  RegressionSetRecord,
  ReleaseApprovalRecord,
  ReleaseAuditRecord,
  ReleaseCandidateRecord,
  ReleaseDecisionRecord,
  ReleaseDependencyRecord,
  ReleaseEvidenceRecord,
  ReleaseNoteRecord,
  ReleasePackageRecord,
  ReleaseReadinessRecord,
  ReleaseReadinessSnapshotRecord,
  ReleaseRecord,
  ReleaseRiskAssessmentRecord,
  ReleaseScopeRecord,
  ReleaseSummarySnapshotRecord,
  RequirementRecord,
  RiskRecord,
  TestCaseRecord,
  TestPlanRecord,
  TestStepRecord,
  TestSuiteRecord,
  TraceabilityLinkRecord,
  WorkItemRecord,
} from "../records";
import {
  createEmptyAutomationInMemoryStores,
  createInMemoryAutomationRepos,
  type AutomationInMemoryStores,
} from "../automation/in-memory";
import {
  createEmptyPipelineInMemoryStores,
  createInMemoryPipelineRepos,
  type PipelineInMemoryStores,
} from "../pipelines/in-memory";
import {
  createEmptyEngineeringInMemoryStores,
  createInMemoryEngineeringRepos,
  type EngineeringInMemoryStores,
} from "../engineering-intelligence/in-memory";
import {
  createEmptyReportingInMemoryStores,
  createInMemoryReportingRepos,
  type ReportingInMemoryStores,
} from "../reporting/in-memory";
import {
  compareValues,
  matchesFilters,
  matchesSearch,
  normalizeListQuery,
  paginateItems,
  type ListQuery,
} from "../types";
import {
  baseMeta,
  cloneStoreMap,
  createInMemoryCrudRepository,
  type MutableRecord,
} from "./generic-crud";

export interface InMemoryStores {
  requirements: Map<string, RequirementRecord>;
  workItems: Map<string, WorkItemRecord>;
  risks: Map<string, RiskRecord>;
  testPlans: Map<string, TestPlanRecord>;
  testSuites: Map<string, TestSuiteRecord>;
  testCases: Map<string, TestCaseRecord>;
  testSteps: Map<string, TestStepRecord>;
  testCaseVersions: Map<string, TestCaseVersionRecord>;
  testPlanVersions: Map<string, TestPlanVersionRecord>;
  testSuiteVersions: Map<string, TestSuiteVersionRecord>;
  regressionSets: Map<string, RegressionSetRecord>;
  executionSessions: Map<string, ExecutionSessionRecord>;
  manualExecutions: Map<string, ManualExecutionRecord>;
  executionHistory: Map<string, ExecutionHistoryRecord>;
  evidence: Map<string, EvidenceRecord>;
  approvals: Map<string, ApprovalRecord>;
  approvalHistory: Map<string, ApprovalHistoryRecord>;
  certificationRecords: Map<string, CertificationRecordRecord>;
  certificationGateDefinitions: Map<string, CertificationGateDefinitionRecord>;
  certificationGateEvaluations: Map<string, CertificationGateEvaluationRecord>;
  certificationRules: Map<string, CertificationRuleRecord>;
  certificationAudits: Map<string, CertificationAuditRecord>;
  certificationHistory: Map<string, CertificationHistoryRecord>;
  releaseReadiness: Map<string, ReleaseReadinessRecord>;
  releases: Map<string, ReleaseRecord>;
  releaseScopes: Map<string, ReleaseScopeRecord>;
  releasePackages: Map<string, ReleasePackageRecord>;
  releaseCandidates: Map<string, ReleaseCandidateRecord>;
  releaseApprovals: Map<string, ReleaseApprovalRecord>;
  releaseDecisions: Map<string, ReleaseDecisionRecord>;
  releaseEvidence: Map<string, ReleaseEvidenceRecord>;
  releaseDependencies: Map<string, ReleaseDependencyRecord>;
  releaseNotes: Map<string, ReleaseNoteRecord>;
  releaseRiskAssessments: Map<string, ReleaseRiskAssessmentRecord>;
  releaseReadinessSnapshots: Map<string, ReleaseReadinessSnapshotRecord>;
  releaseSummarySnapshots: Map<string, ReleaseSummarySnapshotRecord>;
  releaseAudits: Map<string, ReleaseAuditRecord>;
  coverageRecords: Map<string, CoverageRecord>;
  defectLinks: Map<string, DefectLinkRecord>;
  qualitySnapshots: Map<string, QualitySnapshotRecord>;
  regressionAnalyses: Map<string, RegressionAnalysisRecord>;
  automationDefinitions: Map<string, AutomationDefinitionRecord>;
  automationImports: Map<string, AutomationImportRecord>;
  automatedExecutions: Map<string, AutomatedExecutionRecord>;
  automationRuns: Map<string, AutomationRunRecord>;
  automationResultItems: Map<string, AutomationResultItemRecord>;
  automationImportHistory: Map<string, AutomationImportHistoryRecord>;
  automationCoverageSnapshots: Map<string, AutomationCoverageSnapshotRecord>;
  pipelines: Map<string, PipelineRecord>;
  pipelineImports: Map<string, PipelineImportRecord>;
  pipelineRuns: Map<string, PipelineRunRecord>;
  pipelineImportHistory: Map<string, PipelineImportHistoryRecord>;
  engineeringSnapshots: Map<string, EngineeringSnapshotRecord>;
  engineeringHistoricalSnapshots: Map<string, EngineeringHistoricalSnapshotRecord>;
  engineeringTrendSeries: Map<string, EngineeringTrendSeriesRecord>;
  engineeringBenchmarks: Map<string, EngineeringBenchmarkRecord>;
  engineeringBaselines: Map<string, EngineeringBaselineRecord>;
  engineeringQualitySummaries: Map<string, EngineeringQualitySummaryRecord>;
  reportTemplates: Map<string, ReportTemplateRecord>;
  reportGenerationMetadata: Map<string, ReportGenerationMetadataRecord>;
  traceabilityLinks: Map<string, TraceabilityLinkRecord>;
  auditRecords: Map<string, AuditRecord>;
  configurations: Map<string, ConfigurationRecord>;
  registryEntries: Map<string, RegistryEntryRecord>;
}

export function createEmptyInMemoryStores(): InMemoryStores {
  return {
    requirements: new Map(),
    workItems: new Map(),
    risks: new Map(),
    testPlans: new Map(),
    testSuites: new Map(),
    testCases: new Map(),
    testSteps: new Map(),
    testCaseVersions: new Map(),
    testPlanVersions: new Map(),
    testSuiteVersions: new Map(),
    regressionSets: new Map(),
    executionSessions: new Map(),
    manualExecutions: new Map(),
    executionHistory: new Map(),
    evidence: new Map(),
    approvals: new Map(),
    approvalHistory: new Map(),
    certificationRecords: new Map(),
    ...createEmptyCertificationInMemoryStores(),
    releaseReadiness: new Map(),
    ...createEmptyReleaseGovernanceInMemoryStores(),
    coverageRecords: new Map(),
    defectLinks: new Map(),
    qualitySnapshots: new Map(),
    regressionAnalyses: new Map(),
    automationDefinitions: new Map(),
    ...createEmptyAutomationInMemoryStores(),
    ...createEmptyPipelineInMemoryStores(),
    ...createEmptyEngineeringInMemoryStores(),
    ...createEmptyReportingInMemoryStores(),
    traceabilityLinks: new Map(),
    auditRecords: new Map(),
    configurations: new Map(),
    registryEntries: new Map(),
  };
}

function createAppendOnlyHistory(
  store: Map<string, ExecutionHistoryRecord>,
): ExecutionHistoryRepository {
  return {
    async append(ctx, input) {
      assertPermission(ctx, "execution_history", "append");
      assertRequiredString(input.sessionId, "sessionId");
      assertRequiredString(input.eventType, "eventType");
      assertRequiredString(input.summary, "summary");
      const record: ExecutionHistoryRecord = {
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
      store.set(record.id, record);
      return record;
    },
    async listBySession(ctx, sessionId, query) {
      assertPermission(ctx, "execution_history", "list");
      const q = normalizeListQuery(query);
      let items = [...store.values()].filter(
        (row) => row.tenantId === ctx.tenantId && row.sessionId === sessionId,
      );
      items = items.filter((row) =>
        matchesSearch(row as unknown as Record<string, unknown>, q.search, [
          "summary",
          "eventType",
        ]),
      );
      items = [...items].sort((a, b) =>
        compareValues(a.occurredAt, b.occurredAt, q.sort?.direction ?? "asc"),
      );
      return paginateItems(items, q.page, q.pageSize);
    },
    async get(ctx, id) {
      assertPermission(ctx, "execution_history", "get");
      const row = store.get(id);
      if (!row || row.tenantId !== ctx.tenantId) return undefined;
      return row;
    },
  };
}

function createAppendOnlyAudit(store: Map<string, AuditRecord>): AuditRecordRepository {
  return {
    async append(ctx, input) {
      assertPermission(ctx, "audit_record", "append");
      assertRequiredString(input.action, "action");
      assertRequiredString(input.entityKind, "entityKind");
      assertRequiredString(input.entityId, "entityId");
      assertRequiredString(input.summary, "summary");
      const record: AuditRecord = {
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
      store.set(record.id, record);
      return record;
    },
    async list(ctx, query) {
      assertPermission(ctx, "audit_record", "list");
      const q = normalizeListQuery(query);
      let items = [...store.values()].filter((row) => row.tenantId === ctx.tenantId);
      items = items.filter((row) =>
        matchesSearch(row as unknown as Record<string, unknown>, q.search, [
          "summary",
          "action",
          "entityKind",
        ]),
      );
      items = items.filter((row) =>
        matchesFilters(row as unknown as Record<string, unknown>, q.filters),
      );
      return paginateItems(items, q.page, q.pageSize);
    },
    async get(ctx, id) {
      assertPermission(ctx, "audit_record", "get");
      const row = store.get(id);
      if (!row || row.tenantId !== ctx.tenantId) return undefined;
      return row;
    },
  };
}

function buildFromStores(stores: InMemoryStores): TestingPersistence {
  const automationRepos = createInMemoryAutomationRepos(
    stores as AutomationInMemoryStores,
  );
  const pipelineRepos = createInMemoryPipelineRepos(
    stores as PipelineInMemoryStores,
  );
  const engineeringRepos = createInMemoryEngineeringRepos(
    stores as EngineeringInMemoryStores,
  );
  const reportingRepos = createInMemoryReportingRepos(
    stores as ReportingInMemoryStores,
  );
  const persistence: TestingPersistence = {
    requirements: createInMemoryCrudRepository<
      RequirementCreate,
      RequirementUpdate,
      RequirementRecord
    >({
      kind: "requirement",
      store: stores.requirements,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          key: String(existing?.key ?? input.key),
          title: String(input.title ?? existing?.title ?? ""),
          description:
            (input.description as string | undefined) ?? existing?.description,
          priority:
            (input.priority as RequirementRecord["priority"]) ??
            existing?.priority ??
            "medium",
          tags: (input.tags as readonly string[]) ?? existing?.tags ?? [],
          workItemRefs:
            (input.workItemRefs as RequirementRecord["workItemRefs"]) ??
            existing?.workItemRefs ??
            [],
          riskIds: (input.riskIds as readonly string[]) ?? existing?.riskIds ?? [],
          ownerId: (input.ownerId as string | undefined) ?? existing?.ownerId,
        };
      },
    }),

    workItems: createInMemoryCrudRepository<
      WorkItemCreate,
      WorkItemUpdate,
      WorkItemRecord
    >({
      kind: "work_item",
      store: stores.workItems,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          kind: (input.kind as WorkItemRecord["kind"]) ?? existing?.kind ?? "task",
          key: String(existing?.key ?? input.key),
          title: String(input.title ?? existing?.title ?? ""),
          description:
            (input.description as string | undefined) ?? existing?.description,
          projectRefId:
            (input.projectRefId as string | undefined) ?? existing?.projectRefId,
          externalWorkItemId:
            (input.externalWorkItemId as string | undefined) ??
            existing?.externalWorkItemId,
          status: String(input.status ?? existing?.status ?? "active"),
        };
      },
    }),

    risks: createInMemoryCrudRepository<RiskCreate, RiskUpdate, RiskRecord>({
      kind: "risk",
      store: stores.risks,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          key: String(existing?.key ?? input.key),
          title: String(input.title ?? existing?.title ?? ""),
          description:
            (input.description as string | undefined) ?? existing?.description,
          level: (input.level as RiskRecord["level"]) ?? existing?.level ?? "medium",
          mitigationSummary:
            (input.mitigationSummary as string | undefined) ??
            existing?.mitigationSummary,
          requirementIds:
            (input.requirementIds as readonly string[]) ??
            existing?.requirementIds ??
            [],
          severity: (input.severity as RiskRecord["severity"]) ?? existing?.severity,
          likelihood:
            (input.likelihood as RiskRecord["likelihood"]) ?? existing?.likelihood,
          impact: (input.impact as RiskRecord["impact"]) ?? existing?.impact,
          businessCriticality:
            (input.businessCriticality as RiskRecord["businessCriticality"]) ??
            existing?.businessCriticality,
          regressionImportance:
            (input.regressionImportance as RiskRecord["regressionImportance"]) ??
            existing?.regressionImportance,
          ownerId: (input.ownerId as string | undefined) ?? existing?.ownerId,
        };
      },
    }),

    testPlans: createInMemoryCrudRepository<
      TestPlanCreate,
      TestPlanUpdate,
      TestPlanRecord
    >({
      kind: "test_plan",
      store: stores.testPlans,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          key: String(existing?.key ?? input.key),
          name: String(input.name ?? existing?.name ?? ""),
          description:
            (input.description as string | undefined) ?? existing?.description,
          status:
            (input.status as TestPlanRecord["status"]) ?? existing?.status ?? "draft",
          releaseLabel:
            (input.releaseLabel as string | undefined) ?? existing?.releaseLabel,
          milestoneLabel:
            (input.milestoneLabel as string | undefined) ?? existing?.milestoneLabel,
          suiteIds: (input.suiteIds as readonly string[]) ?? existing?.suiteIds ?? [],
          requirementIds:
            (input.requirementIds as readonly string[]) ??
            existing?.requirementIds ??
            [],
          riskIds: (input.riskIds as readonly string[]) ?? existing?.riskIds ?? [],
          ownerId: (input.ownerId as string | undefined) ?? existing?.ownerId,
          assigneeId: (input.assigneeId as string | undefined) ?? existing?.assigneeId,
          versionNumber:
            (input.versionNumber as number | undefined) ?? existing?.versionNumber ?? 1,
          parentPlanId:
            (input.parentPlanId as string | undefined) ?? existing?.parentPlanId,
        };
      },
    }),

    testSuites: createInMemoryCrudRepository<
      TestSuiteCreate,
      TestSuiteUpdate,
      TestSuiteRecord
    >({
      kind: "test_suite",
      store: stores.testSuites,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          key: String(existing?.key ?? input.key),
          name: String(input.name ?? existing?.name ?? ""),
          description:
            (input.description as string | undefined) ?? existing?.description,
          status:
            (input.status as TestSuiteRecord["status"]) ?? existing?.status ?? "draft",
          isRegression: Boolean(input.isRegression ?? existing?.isRegression ?? false),
          planIds: (input.planIds as readonly string[]) ?? existing?.planIds ?? [],
          caseIds: (input.caseIds as readonly string[]) ?? existing?.caseIds ?? [],
          ownerId: (input.ownerId as string | undefined) ?? existing?.ownerId,
          parentSuiteId:
            (input.parentSuiteId as string | undefined) ?? existing?.parentSuiteId,
          sortOrder: (input.sortOrder as number | undefined) ?? existing?.sortOrder ?? 0,
          versionNumber:
            (input.versionNumber as number | undefined) ?? existing?.versionNumber ?? 1,
          groupKey: (input.groupKey as string | undefined) ?? existing?.groupKey,
        };
      },
    }),

    testCases: createInMemoryCrudRepository<
      TestCaseCreate,
      TestCaseUpdate,
      TestCaseRecord
    >({
      kind: "test_case",
      store: stores.testCases,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          key: String(existing?.key ?? input.key),
          title: String(input.title ?? existing?.title ?? ""),
          description:
            (input.description as string | undefined) ?? existing?.description,
          status:
            (input.status as TestCaseRecord["status"]) ?? existing?.status ?? "draft",
          priority:
            (input.priority as TestCaseRecord["priority"]) ??
            existing?.priority ??
            "medium",
          tags: (input.tags as readonly string[]) ?? existing?.tags ?? [],
          estimatedMinutes:
            (input.estimatedMinutes as number | undefined) ??
            existing?.estimatedMinutes,
          suiteIds: (input.suiteIds as readonly string[]) ?? existing?.suiteIds ?? [],
          requirementIds:
            (input.requirementIds as readonly string[]) ??
            existing?.requirementIds ??
            [],
          stepIds: (input.stepIds as readonly string[]) ?? existing?.stepIds ?? [],
          preconditions:
            (input.preconditions as string | undefined) ?? existing?.preconditions,
          postconditions:
            (input.postconditions as string | undefined) ?? existing?.postconditions,
          expectedResultsSummary:
            (input.expectedResultsSummary as string | undefined) ??
            existing?.expectedResultsSummary,
          templateKey:
            (input.templateKey as string | undefined) ?? existing?.templateKey,
          parameters:
            (input.parameters as TestCaseRecord["parameters"]) ??
            existing?.parameters ??
            [],
          components:
            (input.components as readonly string[]) ?? existing?.components ?? [],
          ownerId: (input.ownerId as string | undefined) ?? existing?.ownerId,
          reviewerId: (input.reviewerId as string | undefined) ?? existing?.reviewerId,
          versionNumber:
            (input.versionNumber as number | undefined) ?? existing?.versionNumber ?? 1,
          parentCaseId:
            (input.parentCaseId as string | undefined) ?? existing?.parentCaseId,
          riskLevel:
            (input.riskLevel as TestCaseRecord["riskLevel"]) ?? existing?.riskLevel,
        };
      },
    }),

    testSteps: createInMemoryCrudRepository<
      TestStepCreate,
      TestStepUpdate,
      TestStepRecord
    >({
      kind: "test_step",
      store: stores.testSteps,
      searchFields: ["action", "expectedResult"],
      validateCreate: (input) => {
        assertRequiredString(input.caseId, "caseId");
        assertRequiredString(input.action, "action");
        assertRequiredString(input.expectedResult, "expectedResult");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          caseId: String(existing?.caseId ?? input.caseId),
          ordinal: Number(input.ordinal ?? existing?.ordinal ?? 0),
          action: String(input.action ?? existing?.action ?? ""),
          expectedResult: String(
            input.expectedResult ?? existing?.expectedResult ?? "",
          ),
          dataHint: (input.dataHint as string | undefined) ?? existing?.dataHint,
        };
      },
    }),

    testCaseVersions: {
      async create(ctx, input) {
        assertPermission(ctx, "test_case_version", "create");
        assertRequiredString(input.caseId, "caseId");
        validateCaseVersionReason(String(input.reason));
        const id =
          typeof input.id === "string" && input.id.length > 0
            ? input.id
            : randomUUID();
        const meta = baseMeta(ctx, { id, organisationId: input.organisationId });
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
        stores.testCaseVersions.set(id, record);
        return record;
      },
      async get(ctx, id) {
        assertPermission(ctx, "test_case_version", "get");
        const row = stores.testCaseVersions.get(id);
        if (!row || row.tenantId !== ctx.tenantId) return undefined;
        return row;
      },
      async listByCase(ctx, caseId, query) {
        assertPermission(ctx, "test_case_version", "list");
        const q = normalizeListQuery(query);
        let items = [...stores.testCaseVersions.values()].filter(
          (row) => row.tenantId === ctx.tenantId && row.caseId === caseId,
        );
        items = [...items].sort((a, b) =>
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
        const id =
          typeof input.id === "string" && input.id.length > 0
            ? input.id
            : randomUUID();
        const meta = baseMeta(ctx, { id, organisationId: input.organisationId });
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
        stores.testPlanVersions.set(id, record);
        return record;
      },
      async get(ctx, id) {
        assertPermission(ctx, "test_plan_version", "get");
        const row = stores.testPlanVersions.get(id);
        if (!row || row.tenantId !== ctx.tenantId) return undefined;
        return row;
      },
      async listByPlan(ctx, planId, query) {
        assertPermission(ctx, "test_plan_version", "list");
        const q = normalizeListQuery(query);
        let items = [...stores.testPlanVersions.values()].filter(
          (row) => row.tenantId === ctx.tenantId && row.planId === planId,
        );
        items = [...items].sort((a, b) =>
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
        const id =
          typeof input.id === "string" && input.id.length > 0
            ? input.id
            : randomUUID();
        const meta = baseMeta(ctx, { id, organisationId: input.organisationId });
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
        stores.testSuiteVersions.set(id, record);
        return record;
      },
      async get(ctx, id) {
        assertPermission(ctx, "test_suite_version", "get");
        const row = stores.testSuiteVersions.get(id);
        if (!row || row.tenantId !== ctx.tenantId) return undefined;
        return row;
      },
      async listBySuite(ctx, suiteId, query) {
        assertPermission(ctx, "test_suite_version", "list");
        const q = normalizeListQuery(query);
        let items = [...stores.testSuiteVersions.values()].filter(
          (row) => row.tenantId === ctx.tenantId && row.suiteId === suiteId,
        );
        items = [...items].sort((a, b) =>
          compareValues(a.versionNumber, b.versionNumber, q.sort?.direction ?? "asc"),
        );
        return paginateItems(items, q.page, q.pageSize);
      },
    },

    regressionSets: createInMemoryCrudRepository<
      RegressionSetCreate,
      RegressionSetUpdate,
      RegressionSetRecord
    >({
      kind: "regression_set",
      store: stores.regressionSets,
      searchFields: ["key", "name", "description"],
      validateCreate: (input) => {
        assertRequiredString(input.key, "key");
        assertRequiredString(input.name, "name");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          key: String(existing?.key ?? input.key),
          name: String(input.name ?? existing?.name ?? ""),
          description:
            (input.description as string | undefined) ?? existing?.description,
          planId: (input.planId as string | undefined) ?? existing?.planId,
          suiteIds: (input.suiteIds as readonly string[]) ?? existing?.suiteIds ?? [],
          ownerId: (input.ownerId as string | undefined) ?? existing?.ownerId,
        };
      },
    }),

    executionSessions: createInMemoryCrudRepository<
      ExecutionSessionCreate,
      ExecutionSessionUpdate,
      ExecutionSessionRecord
    >({
      kind: "execution_session",
      store: stores.executionSessions,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          planId: (input.planId as string | undefined) ?? existing?.planId,
          suiteId: (input.suiteId as string | undefined) ?? existing?.suiteId,
          executionType:
            (input.executionType as ExecutionSessionRecord["executionType"]) ??
            existing?.executionType ??
            "manual",
          status:
            (input.status as ExecutionSessionRecord["status"]) ??
            existing?.status ??
            "planned",
          startedAt: (input.startedAt as string | undefined) ?? existing?.startedAt,
          completedAt:
            (input.completedAt as string | undefined) ?? existing?.completedAt,
          assigneeId: (input.assigneeId as string | undefined) ?? existing?.assigneeId,
          notes: (input.notes as string | undefined) ?? existing?.notes,
        };
      },
    }),

    manualExecutions: createInMemoryCrudRepository<
      ManualExecutionCreate,
      ManualExecutionUpdate,
      ManualExecutionRecord
    >({
      kind: "manual_execution",
      store: stores.manualExecutions,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          sessionId: String(existing?.sessionId ?? input.sessionId),
          caseId: String(existing?.caseId ?? input.caseId),
          status:
            (input.status as ManualExecutionRecord["status"]) ??
            existing?.status ??
            "draft",
          assigneeId: (input.assigneeId as string | undefined) ?? existing?.assigneeId,
          testerId: (input.testerId as string | undefined) ?? existing?.testerId,
          reviewerId: (input.reviewerId as string | undefined) ?? existing?.reviewerId,
          startedAt: (input.startedAt as string | undefined) ?? existing?.startedAt,
          pausedAt: (input.pausedAt as string | undefined) ?? existing?.pausedAt,
          resumedAt: (input.resumedAt as string | undefined) ?? existing?.resumedAt,
          completedAt:
            (input.completedAt as string | undefined) ?? existing?.completedAt,
          approvalState:
            (input.approvalState as ManualExecutionRecord["approvalState"]) ??
            existing?.approvalState ??
            "none",
          comments:
            (input.comments as ManualExecutionRecord["comments"]) ??
            existing?.comments ??
            [],
          stepActuals:
            (input.stepActuals as ManualExecutionRecord["stepActuals"]) ??
            existing?.stepActuals ??
            [],
          overallResult:
            (input.overallResult as ManualExecutionRecord["overallResult"]) ??
            existing?.overallResult,
          restartOfId:
            (input.restartOfId as string | undefined) ?? existing?.restartOfId,
          parameterOverrides:
            (input.parameterOverrides as ManualExecutionRecord["parameterOverrides"]) ??
            existing?.parameterOverrides,
          blockReason:
            (input.blockReason as string | undefined) ?? existing?.blockReason,
        };
      },
    }),

    executionHistory: createAppendOnlyHistory(stores.executionHistory),

    evidence: createInMemoryCrudRepository<
      EvidenceCreate,
      EvidenceUpdate,
      EvidenceRecord
    >({
      kind: "evidence",
      store: stores.evidence,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          type: (input.type as EvidenceRecord["type"]) ?? existing?.type ?? "other",
          title: String(input.title ?? existing?.title ?? ""),
          description:
            (input.description as string | undefined) ?? existing?.description,
          storageRef: String(input.storageRef ?? existing?.storageRef ?? ""),
          contentType:
            (input.contentType as string | undefined) ?? existing?.contentType,
          contentHash:
            (input.contentHash as string | undefined) ?? existing?.contentHash,
          sizeBytes: (input.sizeBytes as number | undefined) ?? existing?.sizeBytes,
          sessionId: (input.sessionId as string | undefined) ?? existing?.sessionId,
          caseId: (input.caseId as string | undefined) ?? existing?.caseId,
          stepId: (input.stepId as string | undefined) ?? existing?.stepId,
          url: (input.url as string | undefined) ?? existing?.url,
          checksum: (input.checksum as string | undefined) ?? existing?.checksum,
          mimeType: (input.mimeType as string | undefined) ?? existing?.mimeType,
          relationships:
            (input.relationships as EvidenceRecord["relationships"]) ??
            existing?.relationships ??
            [],
          executionId:
            (input.executionId as string | undefined) ?? existing?.executionId,
          lifecycleStatus:
            (input.lifecycleStatus as EvidenceRecord["lifecycleStatus"]) ??
            existing?.lifecycleStatus ??
            "pending",
          verificationState:
            (input.verificationState as string | undefined) ??
            existing?.verificationState,
          evidenceApprovalState:
            (input.evidenceApprovalState as string | undefined) ??
            existing?.evidenceApprovalState,
          captureTime:
            (input.captureTime as string | undefined) ?? existing?.captureTime,
          authorUserId:
            (input.authorUserId as string | undefined) ?? existing?.authorUserId,
        };
      },
    }),

    approvals: createInMemoryCrudRepository<
      ApprovalCreate,
      ApprovalUpdate,
      ApprovalRecord
    >({
      kind: "approval",
      store: stores.approvals,
      searchFields: ["comments", "status"],
      validateCreate: (input) => {
        assertRequiredString(input.certificationRecordId, "certificationRecordId");
        validateApprovalStatus(String(input.status));
      },
      validateUpdate: (input) => {
        if (input.status !== undefined) validateApprovalStatus(String(input.status));
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          certificationRecordId: String(
            existing?.certificationRecordId ?? input.certificationRecordId,
          ),
          gateId: (input.gateId as string | undefined) ?? existing?.gateId,
          status:
            (input.status as ApprovalRecord["status"]) ?? existing?.status ?? "pending",
          requestedFromUserId:
            (input.requestedFromUserId as string | undefined) ??
            existing?.requestedFromUserId,
          decidedByUserId:
            (input.decidedByUserId as string | undefined) ?? existing?.decidedByUserId,
          decidedAt: (input.decidedAt as string | undefined) ?? existing?.decidedAt,
          comments: (input.comments as string | undefined) ?? existing?.comments,
          conditions: (input.conditions as string | undefined) ?? existing?.conditions,
          signatureJson:
            (input.signatureJson as ApprovalRecord["signatureJson"]) ??
            existing?.signatureJson,
          witnessesJson:
            (input.witnessesJson as ApprovalRecord["witnessesJson"]) ??
            existing?.witnessesJson,
          authorUserId:
            (input.authorUserId as string | undefined) ?? existing?.authorUserId,
          reviewerUserId:
            (input.reviewerUserId as string | undefined) ?? existing?.reviewerUserId,
          approverUserId:
            (input.approverUserId as string | undefined) ?? existing?.approverUserId,
          historyJson:
            (input.historyJson as ApprovalRecord["historyJson"]) ??
            existing?.historyJson ??
            [],
          subjectKind:
            (input.subjectKind as string | undefined) ?? existing?.subjectKind,
          subjectId: (input.subjectId as string | undefined) ?? existing?.subjectId,
          stagesJson:
            (input.stagesJson as ApprovalRecord["stagesJson"]) ?? existing?.stagesJson,
          currentStageOrdinal:
            (input.currentStageOrdinal as number | undefined) ??
            existing?.currentStageOrdinal,
          stageDecisionsJson:
            (input.stageDecisionsJson as ApprovalRecord["stageDecisionsJson"]) ??
            existing?.stageDecisionsJson,
        };
      },
    }),

    approvalHistory: {
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
        stores.approvalHistory.set(record.id, record);
        return record;
      },
      async listByApproval(ctx, approvalId, query) {
        assertPermission(ctx, "approval_history", "list");
        const q = normalizeListQuery(query);
        let items = [...stores.approvalHistory.values()].filter(
          (row) => row.tenantId === ctx.tenantId && row.approvalId === approvalId,
        );
        items = [...items].sort((a, b) =>
          compareValues(a.occurredAt, b.occurredAt, q.sort?.direction ?? "asc"),
        );
        return paginateItems(items, q.page, q.pageSize);
      },
      async get(ctx, id) {
        assertPermission(ctx, "approval_history", "get");
        const row = stores.approvalHistory.get(id);
        if (!row || row.tenantId !== ctx.tenantId) return undefined;
        return row;
      },
    },

    certificationRecords: createInMemoryCrudRepository<
      CertificationCreate,
      CertificationUpdate,
      CertificationRecordRecord
    >({
      kind: "certification_record",
      store: stores.certificationRecords,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          key: String(existing?.key ?? input.key),
          name: String(input.name ?? existing?.name ?? ""),
          status:
            (input.status as CertificationRecordRecord["status"]) ??
            existing?.status ??
            "draft",
          planId: (input.planId as string | undefined) ?? existing?.planId,
          productLabel:
            (input.productLabel as string | undefined) ?? existing?.productLabel,
          releaseLabel:
            (input.releaseLabel as string | undefined) ?? existing?.releaseLabel,
          gateIds: (input.gateIds as readonly string[]) ?? existing?.gateIds ?? [],
          approvalIds:
            (input.approvalIds as readonly string[]) ?? existing?.approvalIds ?? [],
          conditions: (input.conditions as string | undefined) ?? existing?.conditions,
          certifiedAt:
            (input.certifiedAt as string | undefined) ?? existing?.certifiedAt,
          expiresAt: (input.expiresAt as string | undefined) ?? existing?.expiresAt,
          gateEvaluationIds:
            (input.gateEvaluationIds as readonly string[]) ??
            existing?.gateEvaluationIds ??
            [],
          currentRecommendation:
            (input.currentRecommendation as string | undefined) ??
            existing?.currentRecommendation,
          recommendationJson:
            (input.recommendationJson as
              | Readonly<Record<string, unknown>>
              | undefined) ?? existing?.recommendationJson,
          evidenceLinksJson:
            (input.evidenceLinksJson as
              | Readonly<Record<string, unknown>>
              | undefined) ?? existing?.evidenceLinksJson,
          ruleId: (input.ruleId as string | undefined) ?? existing?.ruleId,
        };
      },
    }),

    ...createInMemoryCertificationRepos(stores),

    releaseReadiness: createInMemoryCrudRepository<
      ReleaseReadinessCreate,
      ReleaseReadinessUpdate,
      ReleaseReadinessRecord
    >({
      kind: "release_readiness",
      store: stores.releaseReadiness,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          certificationRecordId: String(
            existing?.certificationRecordId ?? input.certificationRecordId,
          ),
          status:
            (input.status as ReleaseReadinessRecord["status"]) ??
            existing?.status ??
            "not_ready",
          summary: String(input.summary ?? existing?.summary ?? ""),
          blockingGateIds:
            (input.blockingGateIds as readonly string[]) ??
            existing?.blockingGateIds ??
            [],
          assessedAt: String(
            input.assessedAt ?? existing?.assessedAt ?? new Date().toISOString(),
          ),
        };
      },
    }),

    ...createInMemoryReleaseGovernanceRepos(stores),

    coverageRecords: createInMemoryCrudRepository<
      CoverageCreate,
      CoverageUpdate,
      CoverageRecord
    >({
      kind: "coverage_record",
      store: stores.coverageRecords,
      searchFields: ["subjectId", "kind"],
      validateCreate: (input) => {
        assertRequiredString(input.subjectId, "subjectId");
        validateCoverageKind(String(input.kind));
      },
      validateUpdate: (input) => {
        if (input.kind !== undefined) validateCoverageKind(String(input.kind));
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          kind:
            (input.kind as CoverageRecord["kind"]) ?? existing?.kind ?? "requirement",
          subjectId: String(input.subjectId ?? existing?.subjectId ?? ""),
          coveredCount: Number(input.coveredCount ?? existing?.coveredCount ?? 0),
          totalCount: Number(input.totalCount ?? existing?.totalCount ?? 0),
          percentage: Number(input.percentage ?? existing?.percentage ?? 0),
          computedAt: String(
            input.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
          planId: (input.planId as string | undefined) ?? existing?.planId,
          suiteId: (input.suiteId as string | undefined) ?? existing?.suiteId,
          requirementId:
            (input.requirementId as string | undefined) ?? existing?.requirementId,
          riskId: (input.riskId as string | undefined) ?? existing?.riskId,
        };
      },
    }),

    defectLinks: createInMemoryCrudRepository<
      DefectLinkCreate,
      DefectLinkUpdate,
      DefectLinkRecord
    >({
      kind: "defect_link",
      store: stores.defectLinks,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          providerKind: String(
            input.providerKind ?? existing?.providerKind ?? "internal",
          ),
          providerKey:
            (input.providerKey as string | undefined) ?? existing?.providerKey,
          status: String(input.status ?? existing?.status ?? "open"),
          internalRef:
            (input.internalRef as string | undefined) ?? existing?.internalRef,
          externalRef:
            (input.externalRef as string | undefined) ?? existing?.externalRef,
          severity: (input.severity as string | undefined) ?? existing?.severity,
          priority: (input.priority as string | undefined) ?? existing?.priority,
          ownerUserId:
            (input.ownerUserId as string | undefined) ?? existing?.ownerUserId,
          resolution:
            (input.resolution as string | undefined) ?? existing?.resolution,
          verificationState:
            (input.verificationState as string | undefined) ??
            existing?.verificationState,
          summary: (input.summary as string | undefined) ?? existing?.summary,
          url: (input.url as string | undefined) ?? existing?.url,
          requirementIds:
            (input.requirementIds as readonly string[]) ??
            existing?.requirementIds ??
            [],
          planIds: (input.planIds as readonly string[]) ?? existing?.planIds ?? [],
          suiteIds:
            (input.suiteIds as readonly string[]) ?? existing?.suiteIds ?? [],
          caseIds: (input.caseIds as readonly string[]) ?? existing?.caseIds ?? [],
          manualExecutionIds:
            (input.manualExecutionIds as readonly string[]) ??
            existing?.manualExecutionIds ??
            [],
          automationExecutionIds:
            (input.automationExecutionIds as readonly string[]) ??
            existing?.automationExecutionIds ??
            [],
          evidenceIds:
            (input.evidenceIds as readonly string[]) ??
            existing?.evidenceIds ??
            [],
          releaseLabel:
            (input.releaseLabel as string | undefined) ?? existing?.releaseLabel,
          riskIds: (input.riskIds as readonly string[]) ?? existing?.riskIds ?? [],
          workItemRefs:
            (input.workItemRefs as readonly Readonly<Record<string, unknown>>[]) ??
            existing?.workItemRefs ??
            [],
          target: (input.target as string | undefined) ?? existing?.target,
          externalId:
            (input.externalId as string | undefined) ?? existing?.externalId,
          resultId: (input.resultId as string | undefined) ?? existing?.resultId,
          runId: (input.runId as string | undefined) ?? existing?.runId,
        };
      },
    }),

    qualitySnapshots: createInMemoryCrudRepository<
      QualitySnapshotCreate,
      QualitySnapshotUpdate,
      QualitySnapshotRecord
    >({
      kind: "quality_snapshot",
      store: stores.qualitySnapshots,
      searchFields: ["label"],
      validateCreate: (input) => {
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          scope:
            (input.scope as Readonly<Record<string, unknown>>) ??
            existing?.scope ??
            {},
          metrics:
            (input.metrics as Readonly<Record<string, unknown>>) ??
            existing?.metrics ??
            {},
          computedAt: String(
            input.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
          label: (input.label as string | undefined) ?? existing?.label,
        };
      },
    }),

    regressionAnalyses: createInMemoryCrudRepository<
      RegressionAnalysisCreate,
      RegressionAnalysisUpdate,
      RegressionAnalysisRecord
    >({
      kind: "regression_analysis",
      store: stores.regressionAnalyses,
      searchFields: ["baselineLabel", "currentLabel"],
      validateCreate: (input) => {
        assertRequiredString(String(input.baselineLabel ?? ""), "baselineLabel");
        assertRequiredString(String(input.currentLabel ?? ""), "currentLabel");
        assertRequiredString(String(input.computedAt ?? ""), "computedAt");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          baselineLabel: String(
            input.baselineLabel ?? existing?.baselineLabel ?? "",
          ),
          currentLabel: String(input.currentLabel ?? existing?.currentLabel ?? ""),
          newFailures:
            (input.newFailures as readonly string[]) ??
            existing?.newFailures ??
            [],
          resolvedFailures:
            (input.resolvedFailures as readonly string[]) ??
            existing?.resolvedFailures ??
            [],
          reopenedFailures:
            (input.reopenedFailures as readonly string[]) ??
            existing?.reopenedFailures ??
            [],
          coverageDelta: Number(
            input.coverageDelta ?? existing?.coverageDelta ?? 0,
          ),
          executionDelta: Number(
            input.executionDelta ?? existing?.executionDelta ?? 0,
          ),
          computedAt: String(
            input.computedAt ?? existing?.computedAt ?? new Date().toISOString(),
          ),
          details:
            (input.details as Readonly<Record<string, unknown>> | undefined) ??
            existing?.details,
        };
      },
    }),

    automationDefinitions: createInMemoryCrudRepository<
      AutomationDefinitionCreate,
      AutomationDefinitionUpdate,
      AutomationDefinitionRecord
    >({
      kind: "automation_definition",
      store: stores.automationDefinitions,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          key: String(existing?.key ?? input.key),
          name: String(input.name ?? existing?.name ?? ""),
          description:
            (input.description as string | undefined) ?? existing?.description,
          automationType:
            (input.automationType as AutomationDefinitionRecord["automationType"]) ??
            existing?.automationType ??
            "other",
          adapterSourceId:
            (input.adapterSourceId as string | undefined) ?? existing?.adapterSourceId,
          caseId: (input.caseId as string | undefined) ?? existing?.caseId,
          suiteId: (input.suiteId as string | undefined) ?? existing?.suiteId,
          configJson:
            (input.configJson as Readonly<Record<string, unknown>>) ??
            existing?.configJson ??
            {},
          status: String(input.status ?? existing?.status ?? "active"),
        };
      },
    }),

    ...automationRepos,

    ...pipelineRepos,

    ...engineeringRepos,

    ...reportingRepos,

    traceabilityLinks: createInMemoryCrudRepository<
      TraceabilityLinkCreate,
      TraceabilityLinkUpdate,
      TraceabilityLinkRecord
    >({
      kind: "traceability_link",
      store: stores.traceabilityLinks,
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          type:
            (input.type as TraceabilityLinkRecord["type"]) ??
            existing?.type ??
            "related",
          sourceKind: String(input.sourceKind ?? existing?.sourceKind ?? ""),
          sourceId: String(input.sourceId ?? existing?.sourceId ?? ""),
          targetKind: String(input.targetKind ?? existing?.targetKind ?? ""),
          targetId: String(input.targetId ?? existing?.targetId ?? ""),
          notes: (input.notes as string | undefined) ?? existing?.notes,
        };
      },
    }),

    auditRecords: createAppendOnlyAudit(stores.auditRecords),

    configurations: createInMemoryCrudRepository<
      ConfigurationCreate,
      ConfigurationUpdate,
      ConfigurationRecord
    >({
      kind: "configuration",
      store: stores.configurations,
      searchFields: ["configKey"],
      validateCreate: (input) => {
        assertRequiredString(input.configKey, "configKey");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          configKey: String(existing?.configKey ?? input.configKey ?? "default"),
          configJson:
            (input.configJson as Readonly<Record<string, unknown>>) ??
            existing?.configJson ??
            {},
        };
      },
    }),

    registryEntries: createInMemoryCrudRepository<
      RegistryEntryCreate,
      RegistryEntryUpdate,
      RegistryEntryRecord
    >({
      kind: "registry_entry",
      store: stores.registryEntries,
      searchFields: ["entryKey", "name", "description"],
      validateCreate: (input) => {
        assertRequiredString(input.registryKind, "registryKind");
        assertRequiredString(input.entryKey, "entryKey");
        assertRequiredString(input.name, "name");
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          registryKind: String(existing?.registryKind ?? input.registryKind),
          entryKey: String(existing?.entryKey ?? input.entryKey),
          name: String(input.name ?? existing?.name ?? ""),
          description:
            (input.description as string | undefined) ?? existing?.description,
          status: String(input.status ?? existing?.status ?? "enabled"),
          version: (input.version as string | undefined) ?? existing?.version,
          tags: (input.tags as readonly string[]) ?? existing?.tags ?? [],
          metadata:
            (input.metadata as Readonly<Record<string, string>>) ??
            existing?.metadata ??
            {},
        };
      },
    }),

    async runInTransaction(fn) {
      const snapshot: InMemoryStores = {
        requirements: cloneStoreMap(stores.requirements),
        workItems: cloneStoreMap(stores.workItems),
        risks: cloneStoreMap(stores.risks),
        testPlans: cloneStoreMap(stores.testPlans),
        testSuites: cloneStoreMap(stores.testSuites),
        testCases: cloneStoreMap(stores.testCases),
        testSteps: cloneStoreMap(stores.testSteps),
        testCaseVersions: cloneStoreMap(stores.testCaseVersions),
        testPlanVersions: cloneStoreMap(stores.testPlanVersions),
        testSuiteVersions: cloneStoreMap(stores.testSuiteVersions),
        regressionSets: cloneStoreMap(stores.regressionSets),
        executionSessions: cloneStoreMap(stores.executionSessions),
        manualExecutions: cloneStoreMap(stores.manualExecutions),
        executionHistory: cloneStoreMap(stores.executionHistory),
        evidence: cloneStoreMap(stores.evidence),
        approvals: cloneStoreMap(stores.approvals),
        approvalHistory: cloneStoreMap(stores.approvalHistory),
        certificationRecords: cloneStoreMap(stores.certificationRecords),
        certificationGateDefinitions: cloneStoreMap(stores.certificationGateDefinitions),
        certificationGateEvaluations: cloneStoreMap(stores.certificationGateEvaluations),
        certificationRules: cloneStoreMap(stores.certificationRules),
        certificationAudits: cloneStoreMap(stores.certificationAudits),
        certificationHistory: cloneStoreMap(stores.certificationHistory),
        releaseReadiness: cloneStoreMap(stores.releaseReadiness),
        releases: cloneStoreMap(stores.releases),
        releaseScopes: cloneStoreMap(stores.releaseScopes),
        releasePackages: cloneStoreMap(stores.releasePackages),
        releaseCandidates: cloneStoreMap(stores.releaseCandidates),
        releaseApprovals: cloneStoreMap(stores.releaseApprovals),
        releaseDecisions: cloneStoreMap(stores.releaseDecisions),
        releaseEvidence: cloneStoreMap(stores.releaseEvidence),
        releaseDependencies: cloneStoreMap(stores.releaseDependencies),
        releaseNotes: cloneStoreMap(stores.releaseNotes),
        releaseRiskAssessments: cloneStoreMap(stores.releaseRiskAssessments),
        releaseReadinessSnapshots: cloneStoreMap(stores.releaseReadinessSnapshots),
        releaseSummarySnapshots: cloneStoreMap(stores.releaseSummarySnapshots),
        releaseAudits: cloneStoreMap(stores.releaseAudits),
        coverageRecords: cloneStoreMap(stores.coverageRecords),
        defectLinks: cloneStoreMap(stores.defectLinks),
        qualitySnapshots: cloneStoreMap(stores.qualitySnapshots),
        regressionAnalyses: cloneStoreMap(stores.regressionAnalyses),
        automationDefinitions: cloneStoreMap(stores.automationDefinitions),
        automationImports: cloneStoreMap(stores.automationImports),
        automatedExecutions: cloneStoreMap(stores.automatedExecutions),
        automationRuns: cloneStoreMap(stores.automationRuns),
        automationResultItems: cloneStoreMap(stores.automationResultItems),
        automationImportHistory: cloneStoreMap(stores.automationImportHistory),
        automationCoverageSnapshots: cloneStoreMap(
          stores.automationCoverageSnapshots,
        ),
        pipelines: cloneStoreMap(stores.pipelines),
        pipelineImports: cloneStoreMap(stores.pipelineImports),
        pipelineRuns: cloneStoreMap(stores.pipelineRuns),
        pipelineImportHistory: cloneStoreMap(stores.pipelineImportHistory),
        engineeringSnapshots: cloneStoreMap(stores.engineeringSnapshots),
        engineeringHistoricalSnapshots: cloneStoreMap(
          stores.engineeringHistoricalSnapshots,
        ),
        engineeringTrendSeries: cloneStoreMap(stores.engineeringTrendSeries),
        engineeringBenchmarks: cloneStoreMap(stores.engineeringBenchmarks),
        engineeringBaselines: cloneStoreMap(stores.engineeringBaselines),
        engineeringQualitySummaries: cloneStoreMap(
          stores.engineeringQualitySummaries,
        ),
        reportTemplates: cloneStoreMap(stores.reportTemplates),
        reportGenerationMetadata: cloneStoreMap(stores.reportGenerationMetadata),
        traceabilityLinks: cloneStoreMap(stores.traceabilityLinks),
        auditRecords: cloneStoreMap(stores.auditRecords),
        configurations: cloneStoreMap(stores.configurations),
        registryEntries: cloneStoreMap(stores.registryEntries),
      };
      const tx = buildFromStores(snapshot);
      const result = await fn(tx);
      for (const key of Object.keys(stores) as (keyof InMemoryStores)[]) {
        stores[key].clear();
        for (const [id, value] of snapshot[key].entries()) {
          (stores[key] as Map<string, unknown>).set(id, value);
        }
      }
      return result;
    },
  };

  return persistence;
}

/** In-memory TCMS persistence factory for unit tests and local development. */
export function createInMemoryTestingPersistence(
  seed?: Partial<InMemoryStores>,
): TestingPersistence {
  const stores = createEmptyInMemoryStores();
  if (seed) {
    for (const key of Object.keys(seed) as (keyof InMemoryStores)[]) {
      const map = seed[key];
      if (map) {
        for (const [id, value] of map.entries()) {
          (stores[key] as Map<string, unknown>).set(id, value);
        }
      }
    }
  }
  return buildFromStores(stores);
}

// Silence unused AggregateKind import if tree-shaken differently
export type { AggregateKind, MutableRecord, RepositoryContext, ListQuery };
