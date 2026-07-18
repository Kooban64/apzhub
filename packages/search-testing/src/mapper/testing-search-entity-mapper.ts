/**
 * TestingSearchEntityMapper — facade composing specialised domain mappers (APZSEARCH-013).
 *
 * Prefer specialised publishers for publication. This facade remains for
 * backwards-compatible tests / hooks that call `map()` or domain map methods.
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";
import type {
  Approval,
  AutomationCoverageSnapshot,
  AutomationImport,
  AutomationRun,
  Benchmark,
  CanonicalAutomationSuite,
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
import { AutomationSearchMapper } from "./automation";
import { CertificationSearchMapper } from "./certification";
import { EngineeringIntelligenceSearchMapper } from "./engineering-intelligence";
import { ManualTestingSearchMapper } from "./manual";
import { PipelineSearchMapper } from "./pipeline";
import { QualitySearchMapper } from "./quality";
import { ReleaseSearchMapper } from "./release";
import { ReportingMetadataSearchMapper } from "./reporting-metadata";
import type {
  AutomationSuiteSearchInput,
  CertificationDecisionSearchInput,
  CertificationEvidenceSearchInput,
  DefectSummarySearchInput,
  TestingSearchMappableEntity,
  TestingSearchMappingExtras,
} from "./shared";

export {
  mapTestingSeverityToClassification,
  mapTestingStatusToClassification,
  neverDowngradeClassification,
  resolveTestingClassification,
  type AutomationSuiteSearchInput,
  type CertificationDecisionSearchInput,
  type CertificationEvidenceSearchInput,
  type DefectSummarySearchInput,
  type TestingSearchMappableEntity,
  type TestingSearchMappingExtras,
} from "./shared";

export class TestingSearchEntityMapper {
  private readonly manual = new ManualTestingSearchMapper();
  private readonly automation = new AutomationSearchMapper();
  private readonly certification = new CertificationSearchMapper();
  private readonly release = new ReleaseSearchMapper();
  private readonly engineering = new EngineeringIntelligenceSearchMapper();
  private readonly quality = new QualitySearchMapper();
  private readonly reporting = new ReportingMetadataSearchMapper();
  private readonly pipeline = new PipelineSearchMapper();

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
      case "quality_summary":
        return this.mapQualitySummary(context, input.entity, input.extras);
      case "quality_coverage_summary":
        return this.mapQualityCoverageSummary(context, input.entity, input.extras);
      case "defect_summary":
        return this.mapDefectSummary(context, input.entity, input.extras);
      case "report_metadata":
        return this.mapReportMetadata(context, input.entity, input.extras);
      case "report_template":
        return this.mapReportTemplate(context, input.entity, input.extras);
      case "pipeline":
        return this.mapPipeline(context, input.entity, input.extras);
      case "pipeline_run":
        return this.mapPipelineRun(context, input.entity, input.extras);
      case "pipeline_import":
        return this.mapPipelineImport(context, input.entity, input.extras);
    }
  }

  getManualMapper(): ManualTestingSearchMapper {
    return this.manual;
  }

  getAutomationMapper(): AutomationSearchMapper {
    return this.automation;
  }

  getCertificationMapper(): CertificationSearchMapper {
    return this.certification;
  }

  getReleaseMapper(): ReleaseSearchMapper {
    return this.release;
  }

  getEngineeringMapper(): EngineeringIntelligenceSearchMapper {
    return this.engineering;
  }

  getQualityMapper(): QualitySearchMapper {
    return this.quality;
  }

  getReportingMapper(): ReportingMetadataSearchMapper {
    return this.reporting;
  }

  getPipelineMapper(): PipelineSearchMapper {
    return this.pipeline;
  }

  mapTestPlan(
    context: TestingSearchPublicationContext,
    plan: TestPlan,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.manual.mapTestPlan(context, plan, extras);
  }

  mapTestSuite(
    context: TestingSearchPublicationContext,
    suite: TestSuite,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.manual.mapTestSuite(context, suite, extras);
  }

  mapTestCase(
    context: TestingSearchPublicationContext,
    testCase: TestCase,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.manual.mapTestCase(context, testCase, extras);
  }

  mapTestExecution(
    context: TestingSearchPublicationContext,
    execution: ManualExecution,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.manual.mapTestExecution(context, execution, extras);
  }

  mapTestRun(
    context: TestingSearchPublicationContext,
    run: TestRun,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.manual.mapTestRun(context, run, extras);
  }

  mapExecutionStep(
    context: TestingSearchPublicationContext,
    step: TestStep,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.manual.mapExecutionStep(context, step, extras);
  }

  mapEvidence(
    context: TestingSearchPublicationContext,
    evidence: Evidence,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.manual.mapEvidence(context, evidence, extras);
  }

  mapApproval(
    context: TestingSearchPublicationContext,
    approval: Approval,
    entityType: "approval" | "certification_approval",
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    if (entityType === "certification_approval") {
      return this.certification.mapApproval(context, approval, entityType, extras);
    }
    return this.manual.mapApproval(context, approval, entityType, extras);
  }

  mapRequirement(
    context: TestingSearchPublicationContext,
    requirement: Requirement,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.manual.mapRequirement(context, requirement, extras);
  }

  mapDefect(
    context: TestingSearchPublicationContext,
    defect: DefectLink,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.manual.mapDefect(context, defect, extras);
  }

  mapAutomationRun(
    context: TestingSearchPublicationContext,
    run: AutomationRun,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.automation.mapAutomationRun(context, run, extras);
  }

  mapAutomationSuite(
    context: TestingSearchPublicationContext,
    suite: CanonicalAutomationSuite | AutomationSuiteSearchInput,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.automation.mapAutomationSuite(context, suite, extras);
  }

  mapImportedResult(
    context: TestingSearchPublicationContext,
    imported: AutomationImport,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.automation.mapImportedResult(context, imported, extras);
  }

  mapCoverageSummary(
    context: TestingSearchPublicationContext,
    snapshot: AutomationCoverageSnapshot,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.automation.mapCoverageSummary(context, snapshot, extras);
  }

  mapCertification(
    context: TestingSearchPublicationContext,
    record: CertificationRecord,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.certification.mapCertification(context, record, extras);
  }

  mapCertificationGate(
    context: TestingSearchPublicationContext,
    gate: QualityGate | CertificationGateDefinition,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.certification.mapCertificationGate(context, gate, extras);
  }

  mapCertificationEvidence(
    context: TestingSearchPublicationContext,
    input: CertificationEvidenceSearchInput,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.certification.mapCertificationEvidence(context, input, extras);
  }

  mapCertificationDecision(
    context: TestingSearchPublicationContext,
    entity: CertificationDecisionSearchInput | CertificationRecord,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.certification.mapCertificationDecision(context, entity, extras);
  }

  mapRelease(
    context: TestingSearchPublicationContext,
    release: Release,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.release.mapRelease(context, release, extras);
  }

  mapReleaseCandidate(
    context: TestingSearchPublicationContext,
    candidate: ReleaseCandidate,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.release.mapReleaseCandidate(context, candidate, extras);
  }

  mapReleasePackage(
    context: TestingSearchPublicationContext,
    pkg: ReleasePackage,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.release.mapReleasePackage(context, pkg, extras);
  }

  mapReleaseScope(
    context: TestingSearchPublicationContext,
    scope: ReleaseScope,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.release.mapReleaseScope(context, scope, extras);
  }

  mapReleaseApproval(
    context: TestingSearchPublicationContext,
    approval: ReleaseApproval,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.release.mapReleaseApproval(context, approval, extras);
  }

  mapReleaseDecision(
    context: TestingSearchPublicationContext,
    decision: ReleaseDecision,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.release.mapReleaseDecision(context, decision, extras);
  }

  mapReleaseManifest(
    context: TestingSearchPublicationContext,
    manifest: ReleaseManifest,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.release.mapReleaseManifest(context, manifest, extras);
  }

  mapReleaseSummary(
    context: TestingSearchPublicationContext,
    summary: ReleaseSummary,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.release.mapReleaseSummary(context, summary, extras);
  }

  /** Engineering Score maps as `engineering_snapshot` (EngineeringSnapshot). */
  mapEngineeringSnapshot(
    context: TestingSearchPublicationContext,
    snapshot: EngineeringSnapshot,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.engineering.mapEngineeringSnapshot(context, snapshot, extras);
  }

  mapEngineeringTrend(
    context: TestingSearchPublicationContext,
    series: TrendSeries,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.engineering.mapEngineeringTrend(context, series, extras);
  }

  mapBenchmark(
    context: TestingSearchPublicationContext,
    benchmark: Benchmark,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.engineering.mapBenchmark(context, benchmark, extras);
  }

  mapHistoricalSnapshot(
    context: TestingSearchPublicationContext,
    snapshot: HistoricalSnapshot,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.engineering.mapHistoricalSnapshot(context, snapshot, extras);
  }

  mapRiskSummary(
    context: TestingSearchPublicationContext,
    risk: EngineeringRiskSummary,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.engineering.mapRiskSummary(context, risk, extras);
  }

  mapQualitySummary(
    context: TestingSearchPublicationContext,
    summary: QualitySummary,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.quality.mapQualitySummary(context, summary, extras);
  }

  mapQualityCoverageSummary(
    context: TestingSearchPublicationContext,
    metric: CoverageMetric,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.quality.mapQualityCoverageSummary(context, metric, extras);
  }

  mapDefectSummary(
    context: TestingSearchPublicationContext,
    entity: DefectSummarySearchInput | DefectLink,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.quality.mapDefectSummary(context, entity, extras);
  }

  mapReportMetadata(
    context: TestingSearchPublicationContext,
    meta: ReportGenerationMetadata,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.reporting.mapReportMetadata(context, meta, extras);
  }

  mapReportTemplate(
    context: TestingSearchPublicationContext,
    template: ReportTemplate,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.reporting.mapReportTemplate(context, template, extras);
  }

  mapPipeline(
    context: TestingSearchPublicationContext,
    pipeline: Pipeline,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.pipeline.mapPipeline(context, pipeline, extras);
  }

  mapPipelineRun(
    context: TestingSearchPublicationContext,
    run: PipelineRun,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.pipeline.mapPipelineRun(context, run, extras);
  }

  mapPipelineImport(
    context: TestingSearchPublicationContext,
    imported: PipelineImport,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    return this.pipeline.mapPipelineImport(context, imported, extras);
  }
}
