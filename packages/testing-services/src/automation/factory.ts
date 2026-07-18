import { randomUUID } from "node:crypto";

import type {
  AutomationAdapterRegistry,
  AutomationCertificationPreparationService,
  AutomationCoverageService,
  AutomationEvidenceService,
  AutomationHistoryService,
  AutomationImportService,
  AutomationNormalizationService,
  AutomationResultService,
  AutomationTraceabilityService,
  AutomationValidationService,
} from "@apzhub/testing-contracts";

import { DomainEventCollector } from "../events/domain-event-collector";
import type { ManualTestingServiceDeps, ServiceRuntime } from "../services/types";
import { createInMemoryEvidenceStorageProvider } from "../storage";
import {
  createAllureMetadataAdapter,
  createAutomationAdapterRegistry,
  createGenericJsonAdapter,
  createGenericTapAdapter,
  createJunitXmlAdapter,
  createPlaywrightReportAdapter,
  createVitestAdapter,
} from "./adapters/registry";
import { createAutomationCertificationPreparationService } from "./certification-preparation-service";
import { createAutomationCoverageService } from "./coverage-service";
import { createAutomationEvidenceService } from "./evidence-service";
import { createAutomationHistoryService } from "./history-service";
import { createAutomationImportService } from "./import-service";
import { createAutomationNormalizationService } from "./normalization";
import { createAutomationResultService } from "./result-service";
import { createAutomationTraceabilityService } from "./traceability-service";
import { createAutomationValidationService } from "./validation";

export interface AutomationIngestionServices {
  readonly registry: AutomationAdapterRegistry;
  readonly normalization: AutomationNormalizationService;
  readonly validation: AutomationValidationService;
  readonly imports: AutomationImportService;
  readonly results: AutomationResultService;
  readonly evidence: AutomationEvidenceService;
  readonly traceability: AutomationTraceabilityService;
  readonly history: AutomationHistoryService;
  readonly coverage: AutomationCoverageService;
  readonly certificationPreparation: AutomationCertificationPreparationService;
  readonly events: DomainEventCollector;
}

export type AutomationIngestionServiceDeps = ManualTestingServiceDeps;

function buildRuntime(deps: AutomationIngestionServiceDeps): ServiceRuntime {
  return {
    persistence: deps.persistence,
    events: deps.events ?? new DomainEventCollector(),
    now: deps.now ?? (() => new Date().toISOString()),
    id: deps.id ?? (() => randomUUID()),
    storage: deps.storage ?? createInMemoryEvidenceStorageProvider(),
    configuration: deps.configuration,
  };
}

export function createAutomationIngestionServices(
  deps: AutomationIngestionServiceDeps,
): AutomationIngestionServices {
  const rt = buildRuntime(deps);
  const registry = createAutomationAdapterRegistry();
  const normalization = createAutomationNormalizationService();
  const validation = createAutomationValidationService(rt);
  const evidence = createAutomationEvidenceService(rt);
  const traceability = createAutomationTraceabilityService(rt);
  const coverage = createAutomationCoverageService(rt);
  const history = createAutomationHistoryService(rt);
  const results = createAutomationResultService(rt);
  const certificationPreparation = createAutomationCertificationPreparationService(rt);
  const imports = createAutomationImportService({
    runtime: rt,
    registry,
    normalization,
    validation,
    evidence,
    traceability,
    coverage,
  });

  return {
    registry,
    normalization,
    validation,
    imports,
    results,
    evidence,
    traceability,
    history,
    coverage,
    certificationPreparation,
    events: rt.events,
  };
}

export {
  createAutomationAdapterRegistry,
  createVitestAdapter,
  createPlaywrightReportAdapter,
  createJunitXmlAdapter,
  createGenericJsonAdapter,
  createGenericTapAdapter,
  createAllureMetadataAdapter,
  createAutomationNormalizationService,
  createAutomationValidationService,
};
