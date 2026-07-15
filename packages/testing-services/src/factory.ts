import { randomUUID } from "node:crypto";

import type {
  ApprovalService,
  CertificationPreparationService,
  EvidenceService,
  ManualExecutionService,
  PlatformQualityDomainServices,
  RegressionService,
  ReleaseReadinessService,
  RequirementService,
  RiskService,
  TestCaseService,
  TestPlanService,
  TestSuiteService,
  TraceabilityService,
} from "@apzhub/testing-contracts";

import {
  createAutomationIngestionServices,
  type AutomationIngestionServices,
} from "./automation";
import {
  createCertificationEngineServices,
  type CertificationEngineServices,
} from "./certification";
import { DomainEventCollector } from "./events/domain-event-collector";
import {
  createPlatformQualityDomainServices,
  type PlatformQualityServiceDeps,
} from "./platform-quality";
import {
  createEngineeringIntelligenceServices,
  type EngineeringIntelligenceServices,
} from "./engineering-intelligence";
import {
  createPipelineIngestionServices,
  type PipelineIngestionServices,
} from "./pipelines";
import {
  createQualityIntelligenceServices,
  type QualityIntelligenceServices,
} from "./quality";
import {
  createReleaseGovernanceServices,
  type ReleaseGovernanceServices,
} from "./release-governance";
import {
  createReportingFrameworkServices,
  type ReportingFrameworkServices,
} from "./reporting";
import { createApprovalService } from "./services/approval-service";
import { createCertificationPreparationService } from "./services/certification-preparation-service";
import { createEvidenceService } from "./services/evidence-service";
import { createManualExecutionService } from "./services/manual-execution-service";
import { createRegressionService } from "./services/regression-service";
import { createReleaseReadinessService } from "./services/release-readiness-service";
import { createRequirementService } from "./services/requirement-service";
import { createRiskService } from "./services/risk-service";
import { createTestCaseService } from "./services/test-case-service";
import { createTestPlanService } from "./services/test-plan-service";
import { createTestSuiteService } from "./services/test-suite-service";
import { createTraceabilityService } from "./services/traceability-service";
import type { ManualTestingServiceDeps, ServiceRuntime } from "./services/types";
import { createInMemoryEvidenceStorageProvider } from "./storage";

export interface ManualTestingServices {
  readonly requirements: RequirementService;
  readonly testPlans: TestPlanService;
  readonly testSuites: TestSuiteService;
  readonly testCases: TestCaseService;
  readonly manualExecutions: ManualExecutionService;
  readonly evidence: EvidenceService;
  readonly approvals: ApprovalService;
  readonly traceability: TraceabilityService;
  readonly regression: RegressionService;
  readonly risks: RiskService;
  readonly certificationPreparation: CertificationPreparationService;
  readonly releaseReadiness: ReleaseReadinessService;
  readonly events: DomainEventCollector;
}

export interface TestingDomainServices extends ManualTestingServices {
  readonly automation: AutomationIngestionServices;
  readonly quality: QualityIntelligenceServices;
  readonly certification: CertificationEngineServices;
  readonly platformQuality: PlatformQualityDomainServices;
  readonly releaseGovernance: ReleaseGovernanceServices;
  readonly pipelines: PipelineIngestionServices;
  readonly engineeringIntelligence: EngineeringIntelligenceServices;
  readonly reporting: ReportingFrameworkServices;
}

export function createManualTestingServices(
  deps: ManualTestingServiceDeps,
): ManualTestingServices {
  const rt: ServiceRuntime = {
    persistence: deps.persistence,
    events: deps.events ?? new DomainEventCollector(),
    now: deps.now ?? (() => new Date().toISOString()),
    id: deps.id ?? (() => randomUUID()),
    storage: deps.storage ?? createInMemoryEvidenceStorageProvider(),
    configuration: deps.configuration,
  };

  return {
    requirements: createRequirementService(rt),
    testPlans: createTestPlanService(rt),
    testSuites: createTestSuiteService(rt),
    testCases: createTestCaseService(rt),
    manualExecutions: createManualExecutionService(rt),
    evidence: createEvidenceService(rt),
    approvals: createApprovalService(rt),
    traceability: createTraceabilityService(rt),
    regression: createRegressionService(rt),
    risks: createRiskService(rt),
    certificationPreparation: createCertificationPreparationService(rt),
    releaseReadiness: createReleaseReadinessService(rt),
    events: rt.events,
  };
}

/** Combined manual + automation + quality + certification + platform quality domain services. */
export function createTestingDomainServices(
  deps: ManualTestingServiceDeps & {
    readonly platformQuality?: PlatformQualityServiceDeps;
  },
): TestingDomainServices {
  const events = deps.events ?? new DomainEventCollector();
  const shared = { ...deps, events };
  const manual = createManualTestingServices(shared);
  const automation = createAutomationIngestionServices(shared);
  const quality = createQualityIntelligenceServices(shared);
  const certification = createCertificationEngineServices(shared);
  const platformQuality = createPlatformQualityDomainServices({
    now: deps.now,
    id: deps.id,
    ...deps.platformQuality,
  });
  const releaseGovernance = createReleaseGovernanceServices(shared);
  const pipelines = createPipelineIngestionServices(shared);
  const engineeringIntelligence = createEngineeringIntelligenceServices(shared);
  const reporting = createReportingFrameworkServices(shared);
  return {
    ...manual,
    automation,
    quality,
    certification,
    platformQuality,
    releaseGovernance,
    pipelines,
    engineeringIntelligence,
    reporting,
    events,
  };
}

export {
  createAutomationIngestionServices,
  createQualityIntelligenceServices,
  createCertificationEngineServices,
  createPlatformQualityDomainServices,
  createReleaseGovernanceServices,
  createPipelineIngestionServices,
  createEngineeringIntelligenceServices,
  createReportingFrameworkServices,
};
export type {
  AutomationIngestionServices,
  QualityIntelligenceServices,
  CertificationEngineServices,
  PlatformQualityDomainServices,
  PlatformQualityServiceDeps,
  ReleaseGovernanceServices,
  PipelineIngestionServices,
  EngineeringIntelligenceServices,
  ReportingFrameworkServices,
};
