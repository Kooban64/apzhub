/**
 * TestingSearchEntityMapper — canonical Testing models → SearchEntityDraft (APZSEARCH-013).
 *
 * Metadata-only — never storageRef, checksum hex, payload fingerprints, report bodies,
 * evidence binaries, CI secrets, or pipeline credentials.
 */

import type { SearchClassification } from "@apzhub/search-contracts";
import type { SearchEntityDraft } from "@apzhub/search-integration";
import type {
  Approval,
  AutomationCoverageSnapshot,
  AutomationImport,
  AutomationRun,
  Benchmark,
  CanonicalAutomationSuite,
  CertificationEvidenceLinks,
  CertificationGateDefinition,
  CertificationRecord,
  DefectLink,
  EngineeringRiskSummary,
  EngineeringSnapshot,
  Evidence,
  HistoricalSnapshot,
  ManualExecution,
  QualityGate,
  Release,
  ReleaseApproval,
  ReleaseCandidate,
  ReleaseDecision,
  ReleaseManifest,
  ReleasePackage,
  ReleaseScope,
  ReleaseSummary,
  ReportGenerationMetadata,
  ReportTemplate,
  Requirement,
  TestCase,
  TestPlan,
  TestRun,
  TestStep,
  TestSuite,
  TrendSeries,
} from "@apzhub/testing-contracts";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  assertPlatformEntityId,
  type TestingSearchEntityType,
} from "../types/entity-types";

const CLASSIFICATION_RANK: Readonly<Record<SearchClassification, number>> = {
  public: 0,
  internal: 1,
  confidential: 2,
  restricted: 3,
};

/** Thin suite input when CanonicalAutomationSuite is not SoR-backed. */
export type AutomationSuiteSearchInput = {
  readonly id: string;
  readonly title: string;
  readonly status?: string;
  readonly tenantId?: string;
  readonly caseCount?: number;
  readonly key?: string;
};

/** Evidence-link bag for certification_evidence (ids + labels only). */
export type CertificationEvidenceSearchInput = {
  readonly id: string;
  readonly title: string;
  readonly tenantId?: string;
  readonly certificationRecordId?: string;
  readonly labels?: readonly string[];
  readonly links?: CertificationEvidenceLinks;
};

/** Decision-shaped input, or map from CertificationRecord status fields. */
export type CertificationDecisionSearchInput = {
  readonly id: string;
  readonly title?: string;
  readonly tenantId?: string;
  readonly certificationRecordId: string;
  readonly status: string;
  readonly decidedAt?: string;
  readonly decidedByUserId?: string;
  readonly summary?: string;
};

export type TestingSearchMappingExtras = {
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly title?: string;
  readonly classification?: SearchClassification;
  readonly parentRelease?: Release;
  readonly parentCase?: TestCase;
  readonly parentExecution?: ManualExecution;
  readonly parentCertification?: CertificationRecord;
  /** Stable id when domain model lacks one (risk_summary, automation_suite). */
  readonly entityId?: string;
  readonly permissions?: readonly string[];
};

export type TestingSearchMappableEntity =
  | { readonly entityType: "test_plan"; readonly entity: TestPlan; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "test_suite"; readonly entity: TestSuite; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "test_case"; readonly entity: TestCase; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "test_execution"; readonly entity: ManualExecution; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "test_run"; readonly entity: TestRun; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "execution_step"; readonly entity: TestStep; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "evidence"; readonly entity: Evidence; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "approval"; readonly entity: Approval; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "requirement"; readonly entity: Requirement; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "defect"; readonly entity: DefectLink; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "automation_run"; readonly entity: AutomationRun; readonly extras?: TestingSearchMappingExtras }
  | {
      readonly entityType: "automation_suite";
      readonly entity: CanonicalAutomationSuite | AutomationSuiteSearchInput;
      readonly extras?: TestingSearchMappingExtras;
    }
  | { readonly entityType: "imported_result"; readonly entity: AutomationImport; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "coverage_summary"; readonly entity: AutomationCoverageSnapshot; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "certification"; readonly entity: CertificationRecord; readonly extras?: TestingSearchMappingExtras }
  | {
      readonly entityType: "certification_gate";
      readonly entity: QualityGate | CertificationGateDefinition;
      readonly extras?: TestingSearchMappingExtras;
    }
  | { readonly entityType: "certification_approval"; readonly entity: Approval; readonly extras?: TestingSearchMappingExtras }
  | {
      readonly entityType: "certification_evidence";
      readonly entity: CertificationEvidenceSearchInput;
      readonly extras?: TestingSearchMappingExtras;
    }
  | {
      readonly entityType: "certification_decision";
      readonly entity: CertificationDecisionSearchInput | CertificationRecord;
      readonly extras?: TestingSearchMappingExtras;
    }
  | { readonly entityType: "release"; readonly entity: Release; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "release_candidate"; readonly entity: ReleaseCandidate; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "release_package"; readonly entity: ReleasePackage; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "release_scope"; readonly entity: ReleaseScope; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "release_approval"; readonly entity: ReleaseApproval; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "release_decision"; readonly entity: ReleaseDecision; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "release_manifest"; readonly entity: ReleaseManifest; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "release_summary"; readonly entity: ReleaseSummary; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "engineering_snapshot"; readonly entity: EngineeringSnapshot; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "engineering_trend"; readonly entity: TrendSeries; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "benchmark"; readonly entity: Benchmark; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "historical_snapshot"; readonly entity: HistoricalSnapshot; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "risk_summary"; readonly entity: EngineeringRiskSummary; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "report_metadata"; readonly entity: ReportGenerationMetadata; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "report_template"; readonly entity: ReportTemplate; readonly extras?: TestingSearchMappingExtras };

export function mapTestingSeverityToClassification(
  severity: string | undefined,
): SearchClassification | undefined {
  if (!severity) return undefined;
  switch (severity.toLowerCase()) {
    case "critical":
    case "blocker":
      return "restricted";
    case "high":
    case "major":
      return "confidential";
    case "medium":
    case "normal":
      return "internal";
    case "low":
    case "minor":
    case "trivial":
      return "internal";
    default:
      return "confidential";
  }
}

export function mapTestingStatusToClassification(
  status: string | undefined,
): SearchClassification | undefined {
  if (!status) return undefined;
  switch (status.toLowerCase()) {
    case "certified":
    case "restricted":
    case "confidential":
      return "confidential";
    case "approved":
    case "released":
    case "passed":
    case "active":
      return "internal";
    case "public":
      return "public";
    case "draft":
    case "pending":
      return "internal";
    default:
      return undefined;
  }
}

/** Never downgrade — pick the stricter of candidate and floor. */
export function neverDowngradeClassification(
  candidate: SearchClassification,
  floor?: SearchClassification,
): SearchClassification {
  if (!floor) return candidate;
  return CLASSIFICATION_RANK[candidate] >= CLASSIFICATION_RANK[floor]
    ? candidate
    : floor;
}

/**
 * Resolve classification: explicit → severity/status map → context → confidential.
 * Never downgrades relative to context classification.
 */
export function resolveTestingClassification(
  context: TestingSearchPublicationContext,
  options?: {
    readonly explicit?: SearchClassification;
    readonly severity?: string;
    readonly status?: string;
  },
): SearchClassification {
  const fromSeverity = mapTestingSeverityToClassification(options?.severity);
  const fromStatus = mapTestingStatusToClassification(options?.status);
  const candidate =
    options?.explicit ??
    fromSeverity ??
    fromStatus ??
    context.classification ??
    "confidential";
  return neverDowngradeClassification(
    candidate,
    context.classification ?? "confidential",
  );
}

function navigationTarget(
  entityType: TestingSearchEntityType,
  id: string,
): string {
  switch (entityType) {
    case "test_plan":
      return `/workspace/testing/plans/${id}`;
    case "test_suite":
      return `/workspace/testing/suites/${id}`;
    case "test_case":
      return `/workspace/testing/cases/${id}`;
    case "test_execution":
      return `/workspace/testing/executions/${id}`;
    case "test_run":
      return `/workspace/testing/runs/${id}`;
    case "execution_step":
      return `/workspace/testing/steps/${id}`;
    case "evidence":
      return `/workspace/testing/evidence/${id}`;
    case "approval":
      return `/workspace/testing/approvals/${id}`;
    case "requirement":
      return `/workspace/testing/requirements/${id}`;
    case "defect":
      return `/workspace/testing/defects/${id}`;
    case "automation_run":
      return `/workspace/testing/automation/runs/${id}`;
    case "automation_suite":
      return `/workspace/testing/automation/suites/${id}`;
    case "imported_result":
      return `/workspace/testing/automation/imports/${id}`;
    case "coverage_summary":
      return `/workspace/testing/automation/coverage/${id}`;
    case "certification":
      return `/workspace/testing/certifications/${id}`;
    case "certification_gate":
      return `/workspace/testing/certifications/gates/${id}`;
    case "certification_approval":
      return `/workspace/testing/certifications/approvals/${id}`;
    case "certification_evidence":
      return `/workspace/testing/certifications/evidence/${id}`;
    case "certification_decision":
      return `/workspace/testing/certifications/decisions/${id}`;
    case "release":
      return `/workspace/testing/releases/${id}`;
    case "release_candidate":
      return `/workspace/testing/releases/candidates/${id}`;
    case "release_package":
      return `/workspace/testing/releases/packages/${id}`;
    case "release_scope":
      return `/workspace/testing/releases/scopes/${id}`;
    case "release_approval":
      return `/workspace/testing/releases/approvals/${id}`;
    case "release_decision":
      return `/workspace/testing/releases/decisions/${id}`;
    case "release_manifest":
      return `/workspace/testing/releases/${id}/manifest`;
    case "release_summary":
      return `/workspace/testing/releases/summaries/${id}`;
    case "engineering_snapshot":
      return `/workspace/testing/engineering/snapshots/${id}`;
    case "engineering_trend":
      return `/workspace/testing/engineering/trends/${id}`;
    case "benchmark":
      return `/workspace/testing/engineering/benchmarks/${id}`;
    case "historical_snapshot":
      return `/workspace/testing/engineering/history/${id}`;
    case "risk_summary":
      return `/workspace/testing/engineering/risks/${id}`;
    case "report_metadata":
      return `/workspace/testing/reports/${id}`;
    case "report_template":
      return `/workspace/testing/reports/templates/${id}`;
  }
}

function permissionTokens(
  context: TestingSearchPublicationContext,
  extras?: TestingSearchMappingExtras,
  status?: string,
  classification?: string,
): string[] {
  const tokens = [
    ...context.permissions,
    ...(extras?.permissions ?? []),
  ];
  if (status) tokens.push(`status:${status}`);
  if (classification) tokens.push(`classification:${classification}`);
  return tokens;
}

function isAutomationSuiteSearchInput(
  entity: CanonicalAutomationSuite | AutomationSuiteSearchInput,
): entity is AutomationSuiteSearchInput {
  return "id" in entity && typeof (entity as AutomationSuiteSearchInput).id === "string";
}

function isCertificationRecord(
  entity: CertificationDecisionSearchInput | CertificationRecord,
): entity is CertificationRecord {
  return "key" in entity && "gateIds" in entity;
}

function isQualityGate(
  entity: QualityGate | CertificationGateDefinition,
): entity is QualityGate {
  return "status" in entity && !("gateKey" in entity && "enabled" in entity);
}

export class TestingSearchEntityMapper {
  map(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "test_plan":
        return this.mapTestPlan(context, input.entity, input.extras);
      case "test_suite":
        return this.mapTestSuite(context, input.entity, input.extras);
      case "test_case":
        return this.mapTestCase(context, input.entity, input.extras);
      case "test_execution":
        return this.mapTestExecution(context, input.entity, input.extras);
      case "test_run":
        return this.mapTestRun(context, input.entity, input.extras);
      case "execution_step":
        return this.mapExecutionStep(context, input.entity, input.extras);
      case "evidence":
        return this.mapEvidence(context, input.entity, input.extras);
      case "approval":
        return this.mapApproval(context, input.entity, "approval", input.extras);
      case "requirement":
        return this.mapRequirement(context, input.entity, input.extras);
      case "defect":
        return this.mapDefect(context, input.entity, input.extras);
      case "automation_run":
        return this.mapAutomationRun(context, input.entity, input.extras);
      case "automation_suite":
        return this.mapAutomationSuite(context, input.entity, input.extras);
      case "imported_result":
        return this.mapImportedResult(context, input.entity, input.extras);
      case "coverage_summary":
        return this.mapCoverageSummary(context, input.entity, input.extras);
      case "certification":
        return this.mapCertification(context, input.entity, input.extras);
      case "certification_gate":
        return this.mapCertificationGate(context, input.entity, input.extras);
      case "certification_approval":
        return this.mapApproval(
          context,
          input.entity,
          "certification_approval",
          input.extras,
        );
      case "certification_evidence":
        return this.mapCertificationEvidence(context, input.entity, input.extras);
      case "certification_decision":
        return this.mapCertificationDecision(context, input.entity, input.extras);
      case "release":
        return this.mapRelease(context, input.entity, input.extras);
      case "release_candidate":
        return this.mapReleaseCandidate(context, input.entity, input.extras);
      case "release_package":
        return this.mapReleasePackage(context, input.entity, input.extras);
      case "release_scope":
        return this.mapReleaseScope(context, input.entity, input.extras);
      case "release_approval":
        return this.mapReleaseApproval(context, input.entity, input.extras);
      case "release_decision":
        return this.mapReleaseDecision(context, input.entity, input.extras);
      case "release_manifest":
        return this.mapReleaseManifest(context, input.entity, input.extras);
      case "release_summary":
        return this.mapReleaseSummary(context, input.entity, input.extras);
      case "engineering_snapshot":
        return this.mapEngineeringSnapshot(context, input.entity, input.extras);
      case "engineering_trend":
        return this.mapEngineeringTrend(context, input.entity, input.extras);
      case "benchmark":
        return this.mapBenchmark(context, input.entity, input.extras);
      case "historical_snapshot":
        return this.mapHistoricalSnapshot(context, input.entity, input.extras);
      case "risk_summary":
        return this.mapRiskSummary(context, input.entity, input.extras);
      case "report_metadata":
        return this.mapReportMetadata(context, input.entity, input.extras);
      case "report_template":
        return this.mapReportTemplate(context, input.entity, input.extras);
    }
  }

  mapTestPlan(
    context: TestingSearchPublicationContext,
    plan: TestPlan,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(plan.id, "test_plan.id");
    this.assertTenant(plan.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: plan.status,
    });
    return {
      entityId: plan.id,
      entityType: "test_plan",
      title: plan.name,
      summary: plan.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, plan.status, classification),
      metadata: {
        key: plan.key,
        status: plan.status,
        ...(plan.releaseLabel ? { releaseLabel: plan.releaseLabel } : {}),
        ...(plan.ownerId ? { ownerUserId: plan.ownerId } : {}),
        ...(plan.versionNumber !== undefined
          ? { versionNumber: String(plan.versionNumber) }
          : {}),
        suiteCount: String(plan.suiteIds.length),
        requirementCount: String(plan.requirementIds.length),
      },
      keywords: [plan.name, plan.key, plan.status],
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      navigationTarget: navigationTarget("test_plan", plan.id),
      sourceId: "testing:test_plan",
      ownerUserId: plan.ownerId ?? plan.createdBy ?? context.actorUserId,
      version:
        plan.versionNumber !== undefined
          ? String(plan.versionNumber)
          : undefined,
    };
  }

  mapTestSuite(
    context: TestingSearchPublicationContext,
    suite: TestSuite,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(suite.id, "test_suite.id");
    this.assertTenant(suite.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: suite.status,
    });
    return {
      entityId: suite.id,
      entityType: "test_suite",
      title: suite.name,
      summary: suite.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, suite.status, classification),
      metadata: {
        key: suite.key,
        status: suite.status,
        caseCount: String(suite.caseIds.length),
        ...(suite.ownerId ? { ownerUserId: suite.ownerId } : {}),
        ...(suite.versionNumber !== undefined
          ? { versionNumber: String(suite.versionNumber) }
          : {}),
      },
      keywords: [suite.name, suite.key, suite.status],
      createdAt: suite.createdAt,
      updatedAt: suite.updatedAt,
      navigationTarget: navigationTarget("test_suite", suite.id),
      sourceId: "testing:test_suite",
      ownerUserId: suite.ownerId ?? suite.createdBy ?? context.actorUserId,
      version:
        suite.versionNumber !== undefined
          ? String(suite.versionNumber)
          : undefined,
    };
  }

  mapTestCase(
    context: TestingSearchPublicationContext,
    testCase: TestCase,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(testCase.id, "test_case.id");
    this.assertTenant(testCase.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      severity: testCase.riskLevel,
      status: testCase.status,
    });
    return {
      entityId: testCase.id,
      entityType: "test_case",
      title: testCase.title,
      summary: testCase.description ?? testCase.expectedResultsSummary,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        testCase.status,
        classification,
      ),
      metadata: {
        key: testCase.key,
        status: testCase.status,
        priority: testCase.priority,
        ...(testCase.riskLevel ? { severity: testCase.riskLevel } : {}),
        ...(testCase.ownerId ? { ownerUserId: testCase.ownerId } : {}),
        ...(testCase.versionNumber !== undefined
          ? { versionNumber: String(testCase.versionNumber) }
          : {}),
      },
      keywords: [
        testCase.title,
        testCase.key,
        testCase.status,
        testCase.priority,
        ...(testCase.tags ?? []),
      ],
      createdAt: testCase.createdAt,
      updatedAt: testCase.updatedAt,
      navigationTarget: navigationTarget("test_case", testCase.id),
      sourceId: "testing:test_case",
      ownerUserId: testCase.ownerId ?? testCase.createdBy ?? context.actorUserId,
      version:
        testCase.versionNumber !== undefined
          ? String(testCase.versionNumber)
          : undefined,
    };
  }

  mapTestExecution(
    context: TestingSearchPublicationContext,
    execution: ManualExecution,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(execution.id, "test_execution.id");
    this.assertTenant(execution.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: execution.status,
    });
    const title =
      extras?.title ??
      `Execution ${execution.id.slice(0, 12)}`;
    return {
      entityId: execution.id,
      entityType: "test_execution",
      title,
      summary: execution.blockReason,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        execution.status,
        classification,
      ),
      metadata: {
        status: execution.status,
        caseId: execution.caseId,
        sessionId: execution.sessionId,
        ...(execution.overallResult
          ? { overallResult: execution.overallResult }
          : {}),
        ...(execution.approvalState
          ? { approvalState: execution.approvalState }
          : {}),
        ...(execution.assigneeId ? { assigneeId: execution.assigneeId } : {}),
      },
      keywords: [title, execution.status, execution.caseId],
      createdAt: execution.createdAt,
      updatedAt: execution.updatedAt,
      navigationTarget: navigationTarget("test_execution", execution.id),
      sourceId: "testing:test_execution",
      ownerUserId:
        execution.assigneeId ?? execution.testerId ?? context.actorUserId,
    };
  }

  mapTestRun(
    context: TestingSearchPublicationContext,
    run: TestRun,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(run.id, "test_run.id");
    this.assertTenant(run.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: run.status,
    });
    const title = extras?.title ?? `Run ${run.id.slice(0, 12)}`;
    return {
      entityId: run.id,
      entityType: "test_run",
      title,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, run.status, classification),
      metadata: {
        status: run.status,
        kind: run.executionType,
        sessionId: run.sessionId,
        ...(run.caseId ? { caseId: run.caseId } : {}),
        ...(run.suiteId ? { suiteId: run.suiteId } : {}),
        evidenceCount: String(run.evidenceIds.length),
      },
      keywords: [title, run.status, run.executionType],
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
      navigationTarget: navigationTarget("test_run", run.id),
      sourceId: "testing:test_run",
      ownerUserId: run.createdBy ?? context.actorUserId,
    };
  }

  mapExecutionStep(
    context: TestingSearchPublicationContext,
    step: TestStep,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(step.id, "execution_step.id");
    const tenantId = extras?.tenantId ?? extras?.parentCase?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required via extras when mapping execution_step",
      );
    }
    this.assertTenant(tenantId, context);
    if (!extras?.classification && !context.classification) {
      throw new Error(
        "classification is required on context or extras for execution_step — fail-closed",
      );
    }
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title =
      extras?.title ??
      `Step ${step.ordinal}: ${step.action.slice(0, 80)}`;
    return {
      entityId: step.id,
      entityType: "execution_step",
      title,
      summary: step.expectedResult?.slice(0, 280),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        caseId: step.caseId,
        ordinal: String(step.ordinal),
        ...(extras?.parentExecution
          ? { executionId: extras.parentExecution.id }
          : {}),
      },
      keywords: [title, step.caseId],
      createdAt: extras?.parentCase?.createdAt ?? new Date(0).toISOString(),
      updatedAt: extras?.parentCase?.updatedAt ?? new Date(0).toISOString(),
      navigationTarget: navigationTarget("execution_step", step.id),
      sourceId: "testing:execution_step",
      ownerUserId: context.actorUserId,
    };
  }

  mapEvidence(
    context: TestingSearchPublicationContext,
    evidence: Evidence,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(evidence.id, "evidence.id");
    this.assertTenant(evidence.tenantId, context);
    // NEVER storageRef, checksum, contentHash, url, bytes
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: evidence.lifecycleStatus,
    });
    return {
      entityId: evidence.id,
      entityType: "evidence",
      title: evidence.title,
      summary: evidence.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        evidence.lifecycleStatus,
        classification,
      ),
      metadata: {
        type: evidence.type,
        ...(evidence.mimeType || evidence.contentType
          ? { mimeType: evidence.mimeType ?? evidence.contentType ?? "" }
          : {}),
        checksumPresent:
          evidence.checksum || evidence.contentHash ? "true" : "false",
        sizePresent:
          evidence.sizeBytes !== undefined ? "true" : "false",
        ...(evidence.lifecycleStatus
          ? { lifecycleStatus: evidence.lifecycleStatus }
          : {}),
        ...(evidence.verificationState
          ? { verificationState: evidence.verificationState }
          : {}),
        ...(evidence.runId ? { runId: evidence.runId } : {}),
        ...(evidence.executionId ? { executionId: evidence.executionId } : {}),
        ...(evidence.stepId ? { stepId: evidence.stepId } : {}),
      },
      keywords: [evidence.title, evidence.type],
      createdAt: evidence.createdAt,
      updatedAt: evidence.updatedAt,
      navigationTarget: navigationTarget("evidence", evidence.id),
      sourceId: "testing:evidence",
      ownerUserId: evidence.authorUserId ?? evidence.createdBy ?? context.actorUserId,
    };
  }

  mapApproval(
    context: TestingSearchPublicationContext,
    approval: Approval,
    entityType: "approval" | "certification_approval",
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(approval.id, `${entityType}.id`);
    this.assertTenant(approval.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: approval.status,
    });
    const title =
      extras?.title ??
      `Approval ${approval.status} (${approval.id.slice(0, 12)})`;
    return {
      entityId: approval.id,
      entityType,
      title,
      summary: approval.comments?.slice(0, 280),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        approval.status,
        classification,
      ),
      metadata: {
        status: approval.status,
        certificationRecordId: approval.certificationRecordId,
        ...(approval.gateId ? { gateId: approval.gateId } : {}),
        ...(approval.subjectKind ? { subjectKind: approval.subjectKind } : {}),
        ...(approval.subjectId ? { subjectId: approval.subjectId } : {}),
        ...(approval.decidedAt ? { decidedAt: approval.decidedAt } : {}),
        ...(approval.decidedByUserId
          ? { decidedByUserId: approval.decidedByUserId }
          : {}),
      },
      keywords: [title, approval.status],
      createdAt: approval.createdAt,
      updatedAt: approval.updatedAt,
      navigationTarget: navigationTarget(entityType, approval.id),
      sourceId: `testing:${entityType}`,
      ownerUserId:
        approval.approverUserId ??
        approval.authorUserId ??
        context.actorUserId,
    };
  }

  mapRequirement(
    context: TestingSearchPublicationContext,
    requirement: Requirement,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(requirement.id, "requirement.id");
    this.assertTenant(requirement.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: requirement.priority,
    });
    return {
      entityId: requirement.id,
      entityType: "requirement",
      title: requirement.title,
      summary: requirement.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        requirement.priority,
        classification,
      ),
      metadata: {
        key: requirement.key,
        priority: requirement.priority,
        ...(requirement.ownerId ? { ownerUserId: requirement.ownerId } : {}),
      },
      keywords: [
        requirement.title,
        requirement.key,
        requirement.priority,
        ...(requirement.tags ?? []),
      ],
      createdAt: requirement.createdAt,
      updatedAt: requirement.updatedAt,
      navigationTarget: navigationTarget("requirement", requirement.id),
      sourceId: "testing:requirement",
      ownerUserId: requirement.ownerId ?? requirement.createdBy ?? context.actorUserId,
    };
  }

  mapDefect(
    context: TestingSearchPublicationContext,
    defect: DefectLink,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(defect.id, "defect.id");
    this.assertTenant(defect.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      severity: defect.severity,
      status: defect.status,
    });
    const title =
      defect.summary?.trim() ||
      extras?.title ||
      `Defect ${defect.internalRef ?? defect.externalRef ?? defect.id.slice(0, 12)}`;
    return {
      entityId: defect.id,
      entityType: "defect",
      title,
      summary: defect.summary,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, defect.status, classification),
      metadata: {
        status: defect.status,
        providerKind: defect.providerKind,
        ...(defect.severity ? { severity: defect.severity } : {}),
        ...(defect.priority ? { priority: defect.priority } : {}),
        ...(defect.internalRef ? { internalRef: defect.internalRef } : {}),
        ...(defect.externalRef ? { externalRef: defect.externalRef } : {}),
        ...(defect.ownerUserId ? { ownerUserId: defect.ownerUserId } : {}),
        ...(defect.releaseLabel ? { releaseLabel: defect.releaseLabel } : {}),
      },
      keywords: [title, defect.status, defect.providerKind],
      createdAt: defect.createdAt,
      updatedAt: defect.updatedAt,
      navigationTarget: navigationTarget("defect", defect.id),
      sourceId: "testing:defect",
      ownerUserId: defect.ownerUserId ?? defect.createdBy ?? context.actorUserId,
    };
  }

  mapAutomationRun(
    context: TestingSearchPublicationContext,
    run: AutomationRun,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(run.id, "automation_run.id");
    this.assertTenant(run.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: run.status,
    });
    return {
      entityId: run.id,
      entityType: "automation_run",
      title: run.title,
      summary: run.message?.slice(0, 280),
      organisationId:
        run.organisationId ?? extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, run.status, classification),
      metadata: {
        status: run.status,
        executionId: run.executionId,
        ...(run.suiteKey ? { key: run.suiteKey } : {}),
        ...(run.caseKey ? { caseId: run.caseKey } : {}),
      },
      keywords: [run.title, run.status, ...(run.tags ?? [])],
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
      navigationTarget: navigationTarget("automation_run", run.id),
      sourceId: "testing:automation_run",
      ownerUserId: run.createdBy ?? context.actorUserId,
      version: run.revision !== undefined ? String(run.revision) : undefined,
    };
  }

  mapAutomationSuite(
    context: TestingSearchPublicationContext,
    suite: CanonicalAutomationSuite | AutomationSuiteSearchInput,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    const id =
      (isAutomationSuiteSearchInput(suite) ? suite.id : undefined) ??
      extras?.entityId;
    if (!id) {
      throw new Error(
        "automation_suite requires id on entity or extras.entityId",
      );
    }
    assertPlatformEntityId(id, "automation_suite.id");
    const tenantId =
      (isAutomationSuiteSearchInput(suite) ? suite.tenantId : undefined) ??
      extras?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required via entity or extras when mapping automation_suite",
      );
    }
    this.assertTenant(tenantId, context);
    const title = isAutomationSuiteSearchInput(suite)
      ? suite.title
      : suite.name;
    const status = isAutomationSuiteSearchInput(suite)
      ? suite.status
      : suite.status;
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status,
    });
    const caseCount = isAutomationSuiteSearchInput(suite)
      ? suite.caseCount
      : suite.cases.length;
    return {
      entityId: id,
      entityType: "automation_suite",
      title,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, status, classification),
      metadata: {
        ...(status ? { status } : {}),
        ...(caseCount !== undefined ? { caseCount: String(caseCount) } : {}),
        ...(isAutomationSuiteSearchInput(suite) && suite.key
          ? { key: suite.key }
          : !isAutomationSuiteSearchInput(suite) && suite.key
            ? { key: suite.key }
            : {}),
      },
      keywords: [title, ...(status ? [status] : [])],
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
      navigationTarget: navigationTarget("automation_suite", id),
      sourceId: "testing:automation_suite",
      ownerUserId: context.actorUserId,
    };
  }

  mapImportedResult(
    context: TestingSearchPublicationContext,
    imported: AutomationImport,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(imported.id, "imported_result.id");
    this.assertTenant(imported.tenantId, context);
    // NEVER checksum, payloadFingerprint
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: imported.status,
    });
    const title =
      extras?.title ??
      `Import ${imported.adapterKind} ${imported.externalRunRef}`.slice(0, 120);
    return {
      entityId: imported.id,
      entityType: "imported_result",
      title,
      summary: imported.errorSummary?.slice(0, 280),
      organisationId:
        imported.organisationId ??
        extras?.organisationId ??
        context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        imported.status,
        classification,
      ),
      metadata: {
        status: imported.status,
        adapterKind: imported.adapterKind,
        externalRunRef: imported.externalRunRef,
        checksumPresent: imported.checksum ? "true" : "false",
        ...(imported.revision !== undefined
          ? { revision: String(imported.revision) }
          : {}),
      },
      keywords: [title, imported.status, imported.adapterKind],
      createdAt: imported.createdAt,
      updatedAt: imported.updatedAt,
      navigationTarget: navigationTarget("imported_result", imported.id),
      sourceId: "testing:imported_result",
      ownerUserId: imported.createdBy ?? context.actorUserId,
      version:
        imported.revision !== undefined ? String(imported.revision) : undefined,
    };
  }

  mapCoverageSummary(
    context: TestingSearchPublicationContext,
    snapshot: AutomationCoverageSnapshot,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(snapshot.id, "coverage_summary.id");
    this.assertTenant(snapshot.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const pct =
      snapshot.percentage ??
      snapshot.summary.percentage ??
      undefined;
    const title =
      extras?.title ??
      `Coverage ${pct !== undefined ? `${pct}%` : snapshot.id.slice(0, 12)}`;
    return {
      entityId: snapshot.id,
      entityType: "coverage_summary",
      title,
      organisationId:
        snapshot.organisationId ??
        extras?.organisationId ??
        context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        ...(snapshot.importId ? { importId: snapshot.importId } : {}),
        ...(snapshot.executionId ? { executionId: snapshot.executionId } : {}),
        coveredCount: String(
          snapshot.coveredCount ?? snapshot.summary.covered ?? 0,
        ),
        totalCount: String(snapshot.totalCount ?? snapshot.summary.total ?? 0),
        ...(pct !== undefined ? { percentage: String(pct) } : {}),
        ...(snapshot.summary.kind ? { kind: snapshot.summary.kind } : {}),
      },
      keywords: [title],
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      navigationTarget: navigationTarget("coverage_summary", snapshot.id),
      sourceId: "testing:coverage_summary",
      ownerUserId: snapshot.createdBy ?? context.actorUserId,
    };
  }

  mapCertification(
    context: TestingSearchPublicationContext,
    record: CertificationRecord,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(record.id, "certification.id");
    this.assertTenant(record.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: record.status,
    });
    return {
      entityId: record.id,
      entityType: "certification",
      title: record.name,
      summary: record.conditions?.slice(0, 280),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        record.status,
        classification,
      ),
      metadata: {
        key: record.key,
        status: record.status,
        ...(record.planId ? { planId: record.planId } : {}),
        ...(record.productLabel ? { productLabel: record.productLabel } : {}),
        ...(record.releaseLabel ? { releaseLabel: record.releaseLabel } : {}),
        ...(record.currentRecommendation
          ? { recommendationCode: record.currentRecommendation }
          : {}),
      },
      keywords: [record.name, record.key, record.status],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      navigationTarget: navigationTarget("certification", record.id),
      sourceId: "testing:certification",
      ownerUserId: record.createdBy ?? context.actorUserId,
    };
  }

  mapCertificationGate(
    context: TestingSearchPublicationContext,
    gate: QualityGate | CertificationGateDefinition,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(gate.id, "certification_gate.id");
    this.assertTenant(gate.tenantId, context);
    if (isQualityGate(gate)) {
      const classification = resolveTestingClassification(context, {
        explicit: extras?.classification,
        status: gate.status,
      });
      return {
        entityId: gate.id,
        entityType: "certification_gate",
        title: gate.name,
        summary: gate.description,
        organisationId: extras?.organisationId ?? context.organisationId,
        classification,
        permissions: permissionTokens(
          context,
          extras,
          gate.status,
          classification,
        ),
        metadata: {
          key: gate.key,
          status: gate.status,
          kind: "quality_gate",
          ...(gate.certificationRecordId
            ? { certificationRecordId: gate.certificationRecordId }
            : {}),
        },
        keywords: [gate.name, gate.key, gate.status],
        createdAt: gate.createdAt,
        updatedAt: gate.updatedAt,
        navigationTarget: navigationTarget("certification_gate", gate.id),
        sourceId: "testing:certification_gate",
        ownerUserId: gate.createdBy ?? context.actorUserId,
      };
    }
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    return {
      entityId: gate.id,
      entityType: "certification_gate",
      title: gate.name,
      summary: gate.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        gateKey: gate.gateKey,
        kind: gate.kind,
        required: gate.required ? "true" : "false",
        enabled: gate.enabled ? "true" : "false",
      },
      keywords: [gate.name, gate.gateKey, gate.kind],
      createdAt: gate.createdAt,
      updatedAt: gate.updatedAt,
      navigationTarget: navigationTarget("certification_gate", gate.id),
      sourceId: "testing:certification_gate",
      ownerUserId: gate.createdBy ?? context.actorUserId,
    };
  }

  mapCertificationEvidence(
    context: TestingSearchPublicationContext,
    input: CertificationEvidenceSearchInput,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(input.id, "certification_evidence.id");
    const tenantId = input.tenantId ?? extras?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required when mapping certification_evidence",
      );
    }
    this.assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const links = input.links;
    const linkCount = links
      ? links.requirementIds.length +
        links.planIds.length +
        links.suiteIds.length +
        links.caseIds.length +
        links.executionIds.length +
        links.evidenceIds.length +
        links.coverageIds.length +
        links.defectIds.length +
        links.riskIds.length
      : 0;
    return {
      entityId: input.id,
      entityType: "certification_evidence",
      title: input.title,
      summary: input.labels?.join(", "),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        linkCount: String(linkCount),
        ...(input.certificationRecordId
          ? { certificationRecordId: input.certificationRecordId }
          : {}),
        ...(links ? { evidenceCount: String(links.evidenceIds.length) } : {}),
        ...(links
          ? { requirementCount: String(links.requirementIds.length) }
          : {}),
      },
      keywords: [input.title, ...(input.labels ?? [])],
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
      navigationTarget: navigationTarget("certification_evidence", input.id),
      sourceId: "testing:certification_evidence",
      ownerUserId: context.actorUserId,
    };
  }

  mapCertificationDecision(
    context: TestingSearchPublicationContext,
    entity: CertificationDecisionSearchInput | CertificationRecord,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    if (isCertificationRecord(entity)) {
      assertPlatformEntityId(entity.id, "certification_decision.id");
      this.assertTenant(entity.tenantId, context);
      const classification = resolveTestingClassification(context, {
        explicit: extras?.classification,
        status: entity.status,
      });
      return {
        entityId: entity.id,
        entityType: "certification_decision",
        title: extras?.title ?? `${entity.name} decision`,
        organisationId: extras?.organisationId ?? context.organisationId,
        classification,
        permissions: permissionTokens(
          context,
          extras,
          entity.status,
          classification,
        ),
        metadata: {
          decisionStatus: entity.status,
          certificationRecordId: entity.id,
          status: entity.status,
          ...(entity.certifiedAt ? { decidedAt: entity.certifiedAt } : {}),
          ...(entity.currentRecommendation
            ? { recommendationCode: entity.currentRecommendation }
            : {}),
        },
        keywords: [entity.name, entity.status],
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        navigationTarget: navigationTarget("certification_decision", entity.id),
        sourceId: "testing:certification_decision",
        ownerUserId: entity.createdBy ?? context.actorUserId,
      };
    }
    assertPlatformEntityId(entity.id, "certification_decision.id");
    const tenantId = entity.tenantId ?? extras?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required when mapping certification_decision",
      );
    }
    this.assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: entity.status,
    });
    const title =
      entity.title ?? extras?.title ?? `Decision ${entity.status}`;
    return {
      entityId: entity.id,
      entityType: "certification_decision",
      title,
      summary: entity.summary,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        entity.status,
        classification,
      ),
      metadata: {
        decisionStatus: entity.status,
        status: entity.status,
        certificationRecordId: entity.certificationRecordId,
        ...(entity.decidedAt ? { decidedAt: entity.decidedAt } : {}),
        ...(entity.decidedByUserId
          ? { decidedByUserId: entity.decidedByUserId }
          : {}),
      },
      keywords: [title, entity.status],
      createdAt: entity.decidedAt ?? new Date(0).toISOString(),
      updatedAt: entity.decidedAt ?? new Date(0).toISOString(),
      navigationTarget: navigationTarget("certification_decision", entity.id),
      sourceId: "testing:certification_decision",
      ownerUserId: entity.decidedByUserId ?? context.actorUserId,
    };
  }

  mapRelease(
    context: TestingSearchPublicationContext,
    release: Release,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(release.id, "release.id");
    this.assertTenant(release.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: release.status,
    });
    return {
      entityId: release.id,
      entityType: "release",
      title: release.name,
      summary: release.description,
      organisationId:
        release.organisationId ??
        extras?.organisationId ??
        context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        release.status,
        classification,
      ),
      metadata: {
        key: release.key,
        status: release.status,
      },
      keywords: [release.name, release.key, release.status],
      createdAt: release.createdAt,
      updatedAt: release.updatedAt,
      navigationTarget: navigationTarget("release", release.id),
      sourceId: "testing:release",
      ownerUserId: release.createdBy ?? context.actorUserId,
    };
  }

  mapReleaseCandidate(
    context: TestingSearchPublicationContext,
    candidate: ReleaseCandidate,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(candidate.id, "release_candidate.id");
    this.assertTenant(candidate.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: candidate.status,
    });
    return {
      entityId: candidate.id,
      entityType: "release_candidate",
      title: candidate.label,
      summary: candidate.notes?.slice(0, 280),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        candidate.status,
        classification,
      ),
      metadata: {
        status: candidate.status,
        releaseId: candidate.releaseId,
        label: candidate.label,
      },
      keywords: [candidate.label, candidate.status],
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      navigationTarget: navigationTarget("release_candidate", candidate.id),
      sourceId: "testing:release_candidate",
      ownerUserId: candidate.createdBy ?? context.actorUserId,
    };
  }

  mapReleasePackage(
    context: TestingSearchPublicationContext,
    pkg: ReleasePackage,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(pkg.id, "release_package.id");
    this.assertTenant(pkg.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    return {
      entityId: pkg.id,
      entityType: "release_package",
      title: pkg.name,
      summary: pkg.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        releaseId: pkg.releaseId,
        versionLabel: pkg.versionLabel,
        name: pkg.name,
      },
      keywords: [pkg.name, pkg.versionLabel],
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
      navigationTarget: navigationTarget("release_package", pkg.id),
      sourceId: "testing:release_package",
      ownerUserId: pkg.createdBy ?? context.actorUserId,
      version: pkg.versionLabel,
    };
  }

  mapReleaseScope(
    context: TestingSearchPublicationContext,
    scope: ReleaseScope,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(scope.id, "release_scope.id");
    this.assertTenant(scope.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title =
      scope.label?.trim() ||
      extras?.title ||
      `${scope.kind}:${scope.refId}`;
    return {
      entityId: scope.id,
      entityType: "release_scope",
      title,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        releaseId: scope.releaseId,
        scopeKind: scope.kind,
        refId: scope.refId,
        ...(scope.label ? { label: scope.label } : {}),
      },
      keywords: [title, scope.kind, scope.refId],
      createdAt: scope.createdAt,
      updatedAt: scope.updatedAt,
      navigationTarget: navigationTarget("release_scope", scope.id),
      sourceId: "testing:release_scope",
      ownerUserId: scope.createdBy ?? context.actorUserId,
    };
  }

  mapReleaseApproval(
    context: TestingSearchPublicationContext,
    approval: ReleaseApproval,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(approval.id, "release_approval.id");
    this.assertTenant(approval.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: approval.status,
    });
    const title =
      extras?.title ??
      `Release approval ${approval.stageKind} (${approval.status})`;
    return {
      entityId: approval.id,
      entityType: "release_approval",
      title,
      summary: approval.comments?.slice(0, 280),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        approval.status,
        classification,
      ),
      metadata: {
        status: approval.status,
        releaseId: approval.releaseId,
        stageKind: approval.stageKind,
        ...(approval.decidedAt ? { decidedAt: approval.decidedAt } : {}),
        ...(approval.decidedByUserId
          ? { decidedByUserId: approval.decidedByUserId }
          : {}),
      },
      keywords: [title, approval.status, approval.stageKind],
      createdAt: approval.createdAt,
      updatedAt: approval.updatedAt,
      navigationTarget: navigationTarget("release_approval", approval.id),
      sourceId: "testing:release_approval",
      ownerUserId: approval.decidedByUserId ?? context.actorUserId,
    };
  }

  mapReleaseDecision(
    context: TestingSearchPublicationContext,
    decision: ReleaseDecision,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(decision.id, "release_decision.id");
    this.assertTenant(decision.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: decision.verdict,
    });
    const title =
      extras?.title ?? `Release decision ${decision.verdict}`;
    return {
      entityId: decision.id,
      entityType: "release_decision",
      title,
      summary: decision.rationale.slice(0, 280),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        decision.verdict,
        classification,
      ),
      metadata: {
        verdict: decision.verdict,
        releaseId: decision.releaseId,
        decidedAt: decision.decidedAt,
        decidedByUserId: decision.decidedByUserId,
        isAutomatic: "false",
        isDecision: "true",
      },
      keywords: [title, decision.verdict],
      createdAt: decision.createdAt,
      updatedAt: decision.updatedAt,
      navigationTarget: navigationTarget("release_decision", decision.id),
      sourceId: "testing:release_decision",
      ownerUserId: decision.decidedByUserId,
    };
  }

  mapReleaseManifest(
    context: TestingSearchPublicationContext,
    manifest: ReleaseManifest,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    const id = extras?.entityId ?? `manifest:${manifest.releaseId}`;
    assertPlatformEntityId(id, "release_manifest.id");
    const tenantId =
      extras?.tenantId ?? extras?.parentRelease?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required via extras when mapping release_manifest",
      );
    }
    this.assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title =
      extras?.title ??
      extras?.parentRelease?.name ??
      `Manifest ${manifest.releaseId}`;
    return {
      entityId: id,
      entityType: "release_manifest",
      title,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        releaseId: manifest.releaseId,
        isDecision: "false",
        caseCount: String(manifest.packageIds.length),
        immutable: "true",
      },
      keywords: [title, manifest.releaseId],
      createdAt: manifest.generatedAt,
      updatedAt: manifest.generatedAt,
      navigationTarget: navigationTarget(
        "release_manifest",
        manifest.releaseId,
      ),
      sourceId: "testing:release_manifest",
      ownerUserId: context.actorUserId,
    };
  }

  mapReleaseSummary(
    context: TestingSearchPublicationContext,
    summary: ReleaseSummary,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(summary.id, "release_summary.id");
    const tenantId =
      extras?.tenantId ?? extras?.parentRelease?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required via extras when mapping release_summary",
      );
    }
    this.assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: summary.recommendationCode,
    });
    const title =
      extras?.title ??
      `Release summary ${summary.recommendationCode}`;
    return {
      entityId: summary.id,
      entityType: "release_summary",
      title,
      summary: summary.recommendationReasons.slice(0, 3).join("; "),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        summary.recommendationCode,
        classification,
      ),
      metadata: {
        releaseId: summary.releaseId,
        recommendationCode: summary.recommendationCode,
        isDecision: "false",
      },
      keywords: [title, summary.recommendationCode],
      createdAt: summary.computedAt,
      updatedAt: summary.computedAt,
      navigationTarget: navigationTarget("release_summary", summary.id),
      sourceId: "testing:release_summary",
      ownerUserId: context.actorUserId,
    };
  }

  mapEngineeringSnapshot(
    context: TestingSearchPublicationContext,
    snapshot: EngineeringSnapshot,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(snapshot.id, "engineering_snapshot.id");
    this.assertTenant(snapshot.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: snapshot.health.status,
    });
    const title =
      snapshot.label?.trim() ||
      extras?.title ||
      `Engineering snapshot ${snapshot.id.slice(0, 12)}`;
    return {
      entityId: snapshot.id,
      entityType: "engineering_snapshot",
      title,
      organisationId:
        snapshot.scope.organisationId ??
        extras?.organisationId ??
        context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        snapshot.health.status,
        classification,
      ),
      metadata: {
        status: snapshot.health.status,
        overallScore: String(snapshot.health.overallScore),
        overallLevel: snapshot.risk.overallLevel,
      },
      keywords: [title, snapshot.health.status],
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      navigationTarget: navigationTarget("engineering_snapshot", snapshot.id),
      sourceId: "testing:engineering_snapshot",
      ownerUserId: snapshot.createdBy ?? context.actorUserId,
    };
  }

  mapEngineeringTrend(
    context: TestingSearchPublicationContext,
    series: TrendSeries,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(String(series.id), "engineering_trend.id");
    const tenantId = series.scope.tenantId ?? extras?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required via scope or extras when mapping engineering_trend",
      );
    }
    this.assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title =
      extras?.title ?? `Trend ${series.kind} (${series.direction})`;
    return {
      entityId: String(series.id),
      entityType: "engineering_trend",
      title,
      organisationId:
        series.scope.organisationId ??
        extras?.organisationId ??
        context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        trendKind: series.kind,
        periodKind: series.periodKind,
        direction: series.direction,
      },
      keywords: [title, series.kind, series.direction],
      createdAt: series.computedAt,
      updatedAt: series.computedAt,
      navigationTarget: navigationTarget(
        "engineering_trend",
        String(series.id),
      ),
      sourceId: "testing:engineering_trend",
      ownerUserId: context.actorUserId,
    };
  }

  mapBenchmark(
    context: TestingSearchPublicationContext,
    benchmark: Benchmark,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(benchmark.id, "benchmark.id");
    this.assertTenant(benchmark.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title =
      benchmark.label?.trim() ||
      extras?.title ||
      `Benchmark ${benchmark.metricKey}`;
    return {
      entityId: benchmark.id,
      entityType: "benchmark",
      title,
      organisationId:
        benchmark.scope.organisationId ??
        extras?.organisationId ??
        context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        metricKey: benchmark.metricKey,
        direction: benchmark.comparison.direction,
      },
      keywords: [title, benchmark.metricKey],
      createdAt: benchmark.createdAt,
      updatedAt: benchmark.updatedAt,
      navigationTarget: navigationTarget("benchmark", benchmark.id),
      sourceId: "testing:benchmark",
      ownerUserId: benchmark.createdBy ?? context.actorUserId,
    };
  }

  mapHistoricalSnapshot(
    context: TestingSearchPublicationContext,
    snapshot: HistoricalSnapshot,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(snapshot.id, "historical_snapshot.id");
    this.assertTenant(snapshot.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title =
      snapshot.period.label?.trim() ||
      extras?.title ||
      `Historical ${snapshot.period.kind}`;
    return {
      entityId: snapshot.id,
      entityType: "historical_snapshot",
      title,
      organisationId:
        snapshot.scope.organisationId ??
        extras?.organisationId ??
        context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        periodKind: snapshot.period.kind,
        overallScore: String(snapshot.engineeringHealthScore),
        immutable: "true",
      },
      keywords: [title, snapshot.period.kind],
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      navigationTarget: navigationTarget("historical_snapshot", snapshot.id),
      sourceId: "testing:historical_snapshot",
      ownerUserId: snapshot.createdBy ?? context.actorUserId,
      lifecycleState: "validated",
    };
  }

  mapRiskSummary(
    context: TestingSearchPublicationContext,
    risk: EngineeringRiskSummary,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    const id = extras?.entityId;
    if (!id) {
      throw new Error("extras.entityId is required when mapping risk_summary");
    }
    assertPlatformEntityId(id, "risk_summary.id");
    const tenantId = extras?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required via extras when mapping risk_summary",
      );
    }
    this.assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      severity: risk.overallLevel,
    });
    const title =
      extras?.title ?? `Risk ${risk.overallLevel} (${risk.overallScore})`;
    return {
      entityId: id,
      entityType: "risk_summary",
      title,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        risk.overallLevel,
        classification,
      ),
      metadata: {
        overallLevel: risk.overallLevel,
        overallScore: String(risk.overallScore),
      },
      keywords: [title, risk.overallLevel],
      createdAt: risk.computedAt,
      updatedAt: risk.computedAt,
      navigationTarget: navigationTarget("risk_summary", id),
      sourceId: "testing:risk_summary",
      ownerUserId: context.actorUserId,
    };
  }

  mapReportMetadata(
    context: TestingSearchPublicationContext,
    meta: ReportGenerationMetadata,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(meta.id, "report_metadata.id");
    this.assertTenant(meta.tenantId, context);
    // NEVER body; NEVER checksumSha256 hex — presence only
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title =
      extras?.title ?? `${meta.reportType} report (${meta.outputFormat})`;
    return {
      entityId: meta.id,
      entityType: "report_metadata",
      title,
      organisationId:
        meta.organisationId ?? extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        reportType: String(meta.reportType),
        outputFormat: meta.outputFormat,
        templateId: meta.templateId,
        requestId: meta.requestId,
        preview: meta.preview ? "true" : "false",
        revision: String(meta.revision),
        versionNumber: meta.version,
        generatedAt: meta.generatedAt,
        generatedBy: meta.generatedBy,
        checksumPresent: meta.checksumSha256 ? "true" : "false",
        byteLength: String(meta.byteLength),
      },
      keywords: [title, String(meta.reportType), meta.outputFormat],
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
      navigationTarget: navigationTarget("report_metadata", meta.id),
      sourceId: "testing:report_metadata",
      ownerUserId: meta.generatedBy ?? meta.createdBy ?? context.actorUserId,
      version: meta.version,
    };
  }

  mapReportTemplate(
    context: TestingSearchPublicationContext,
    template: ReportTemplate,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(template.id, "report_template.id");
    const tenantId = extras?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required via extras when mapping report_template",
      );
    }
    this.assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    return {
      entityId: template.id,
      entityType: "report_template",
      title: template.title || template.name,
      summary: template.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        reportType: String(template.reportType),
        name: template.name,
        revision: String(template.revision),
        versionNumber: template.version,
      },
      keywords: [template.name, template.title, String(template.reportType)],
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      navigationTarget: navigationTarget("report_template", template.id),
      sourceId: "testing:report_template",
      ownerUserId: context.actorUserId,
      version: template.version,
    };
  }

  private assertTenant(
    entityTenantId: string,
    context: TestingSearchPublicationContext,
  ): void {
    if (entityTenantId !== context.tenantId) {
      throw new Error(
        "tenant mismatch between Testing entity and publication context",
      );
    }
  }
}
