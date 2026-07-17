/**
 * Shared Testing search mapping helpers (APZSEARCH-013).
 * Classification, navigation, permission tokens, draft builders.
 * Metadata-only — never storageRef, checksum hex, payload fingerprints,
 * report bodies, evidence binaries, CI secrets, or pipeline credentials.
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
  CoverageMetric,
  DefectLink,
  EngineeringRiskSummary,
  EngineeringSnapshot,
  Evidence,
  HistoricalSnapshot,
  ManualExecution,
  Pipeline,
  PipelineImport,
  PipelineRun,
  QualityGate,
  QualitySummary,
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

/** Thin defect aggregate for quality `defect_summary` (never provider payload). */
export type DefectSummarySearchInput = {
  readonly id: string;
  readonly title?: string;
  readonly summary?: string;
  readonly tenantId?: string;
  readonly status?: string;
  readonly openCount?: number;
  readonly totalCount?: number;
  readonly byStatus?: Readonly<Record<string, number>>;
  readonly byPriority?: Readonly<Record<string, number>>;
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
  /** Stable id when domain model lacks one (risk_summary, quality_summary, automation_suite). */
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
  /** Engineering Score / EI snapshot — same canonical type as EngineeringSnapshot. */
  | { readonly entityType: "engineering_snapshot"; readonly entity: EngineeringSnapshot; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "engineering_trend"; readonly entity: TrendSeries; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "benchmark"; readonly entity: Benchmark; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "historical_snapshot"; readonly entity: HistoricalSnapshot; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "risk_summary"; readonly entity: EngineeringRiskSummary; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "quality_summary"; readonly entity: QualitySummary; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "quality_coverage_summary"; readonly entity: CoverageMetric; readonly extras?: TestingSearchMappingExtras }
  | {
      readonly entityType: "defect_summary";
      readonly entity: DefectSummarySearchInput | DefectLink;
      readonly extras?: TestingSearchMappingExtras;
    }
  | { readonly entityType: "report_metadata"; readonly entity: ReportGenerationMetadata; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "report_template"; readonly entity: ReportTemplate; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "pipeline"; readonly entity: Pipeline; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "pipeline_run"; readonly entity: PipelineRun; readonly extras?: TestingSearchMappingExtras }
  | { readonly entityType: "pipeline_import"; readonly entity: PipelineImport; readonly extras?: TestingSearchMappingExtras };

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

export function navigationTarget(
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
    case "quality_summary":
      return `/workspace/testing/quality/summaries/${id}`;
    case "quality_coverage_summary":
      return `/workspace/testing/quality/coverage/${id}`;
    case "defect_summary":
      return `/workspace/testing/quality/defects/${id}`;
    case "report_metadata":
      return `/workspace/testing/reports/${id}`;
    case "report_template":
      return `/workspace/testing/reports/templates/${id}`;
    case "pipeline":
      return `/workspace/testing/pipelines/${id}`;
    case "pipeline_run":
      return `/workspace/testing/pipelines/runs/${id}`;
    case "pipeline_import":
      return `/workspace/testing/pipelines/imports/${id}`;
  }
}

export function permissionTokens(
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

export function isAutomationSuiteSearchInput(
  entity: CanonicalAutomationSuite | AutomationSuiteSearchInput,
): entity is AutomationSuiteSearchInput {
  return "id" in entity && typeof (entity as AutomationSuiteSearchInput).id === "string";
}

export function isCertificationRecord(
  entity: CertificationDecisionSearchInput | CertificationRecord,
): entity is CertificationRecord {
  return "key" in entity && "gateIds" in entity;
}

export function isQualityGate(
  entity: QualityGate | CertificationGateDefinition,
): entity is QualityGate {
  return "status" in entity && !("gateKey" in entity && "enabled" in entity);
}

export function isDefectLink(
  entity: DefectSummarySearchInput | DefectLink,
): entity is DefectLink {
  return "providerKind" in entity && "tenantId" in entity;
}

export function assertTenant(
  entityTenantId: string,
  context: TestingSearchPublicationContext,
): void {
  if (entityTenantId !== context.tenantId) {
    throw new Error(
      "tenant mismatch between Testing entity and publication context",
    );
  }
}

export type { SearchEntityDraft };
export { assertPlatformEntityId };
