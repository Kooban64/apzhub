import { randomUUID } from "node:crypto";

import type {
  CertificationReadinessService,
  CoverageService,
  DefectLinkService,
  QualityIntelligenceService,
  QualitySummaryService,
  QualityTrendService,
  RegressionAnalysisService,
  ReleaseReadinessService,
  RiskAggregationService,
} from "@apzhub/testing-contracts";

import { DomainEventCollector } from "../events/domain-event-collector";
import type { ManualTestingServiceDeps, ServiceRuntime } from "../services/types";
import { createInMemoryEvidenceStorageProvider } from "../storage";
import { createCertificationReadinessService } from "./certification-readiness-service";
import { createCoverageService } from "./coverage-service";
import { createDefectLinkService } from "./defect-link-service";
import { createQualityIntelligenceService } from "./quality-intelligence-service";
import { createQualitySummaryService } from "./quality-summary-service";
import { createQualityTrendService } from "./quality-trend-service";
import { createRegressionAnalysisService } from "./regression-analysis-service";
import { createQualityReleaseReadinessService } from "./release-readiness-service";
import { createRiskAggregationService } from "./risk-aggregation-service";

export interface QualityIntelligenceServices {
  readonly defects: DefectLinkService;
  readonly coverage: CoverageService;
  readonly intelligence: QualityIntelligenceService;
  readonly trends: QualityTrendService;
  readonly regressionAnalysis: RegressionAnalysisService;
  readonly releaseReadiness: ReleaseReadinessService;
  readonly certificationReadiness: CertificationReadinessService;
  readonly riskAggregation: RiskAggregationService;
  readonly summary: QualitySummaryService;
  readonly events: DomainEventCollector;
}

export type QualityIntelligenceServiceDeps = ManualTestingServiceDeps;

function buildRuntime(deps: QualityIntelligenceServiceDeps): ServiceRuntime {
  return {
    persistence: deps.persistence,
    events: deps.events ?? new DomainEventCollector(),
    now: deps.now ?? (() => new Date().toISOString()),
    id: deps.id ?? (() => randomUUID()),
    storage: deps.storage ?? createInMemoryEvidenceStorageProvider(),
    configuration: deps.configuration,
  };
}

export function createQualityIntelligenceServices(
  deps: QualityIntelligenceServiceDeps,
): QualityIntelligenceServices {
  const rt = buildRuntime(deps);
  return {
    defects: createDefectLinkService(rt),
    coverage: createCoverageService(rt),
    intelligence: createQualityIntelligenceService(rt),
    trends: createQualityTrendService(rt),
    regressionAnalysis: createRegressionAnalysisService(rt),
    releaseReadiness: createQualityReleaseReadinessService(rt),
    certificationReadiness: createCertificationReadinessService(rt),
    riskAggregation: createRiskAggregationService(rt),
    summary: createQualitySummaryService(rt),
    events: rt.events,
  };
}

export {
  createDefectLinkService,
  createCoverageService,
  createQualityIntelligenceService,
  createQualityTrendService,
  createRegressionAnalysisService,
  createQualityReleaseReadinessService,
  createCertificationReadinessService,
  createRiskAggregationService,
  createQualitySummaryService,
};
