import { randomUUID } from "node:crypto";

import type {
  CertificationApprovalService,
  CertificationAuditService,
  CertificationEngineRecordService,
  CertificationEvidenceService,
  CertificationGateService,
  CertificationHistoryService,
  CertificationRecommendationService,
  CertificationRuleService,
  CertificationValidationService,
  CertificationWorkflowService,
} from "@apzhub/testing-contracts";

import { DomainEventCollector } from "../events/domain-event-collector";
import type { ManualTestingServiceDeps, ServiceRuntime } from "../services/types";
import { createInMemoryEvidenceStorageProvider } from "../storage";
import { createCertificationApprovalService } from "./approval-service";
import { createCertificationAuditService } from "./audit-service";
import { createCertificationService } from "./certification-service";
import { createCertificationEvidenceService } from "./evidence-service";
import { createCertificationGateService } from "./gate-service";
import { createCertificationHistoryService } from "./history-service";
import { createCertificationRecommendationService } from "./recommendation-service";
import { createCertificationRuleService } from "./rule-service";
import { createCertificationValidationService } from "./validation-service";
import { createCertificationWorkflowService } from "./workflow-service";

export interface CertificationEngineServices {
  readonly records: CertificationEngineRecordService;
  readonly workflow: CertificationWorkflowService;
  readonly rules: CertificationRuleService;
  readonly gates: CertificationGateService;
  readonly evidence: CertificationEvidenceService;
  readonly approvals: CertificationApprovalService;
  readonly audit: CertificationAuditService;
  readonly history: CertificationHistoryService;
  readonly validation: CertificationValidationService;
  readonly recommendations: CertificationRecommendationService;
  readonly events: DomainEventCollector;
}

export type CertificationEngineServiceDeps = ManualTestingServiceDeps;

function buildRuntime(deps: CertificationEngineServiceDeps): ServiceRuntime {
  return {
    persistence: deps.persistence,
    events: deps.events ?? new DomainEventCollector(),
    now: deps.now ?? (() => new Date().toISOString()),
    id: deps.id ?? (() => randomUUID()),
    storage: deps.storage ?? createInMemoryEvidenceStorageProvider(),
    configuration: deps.configuration,
  };
}

export function createCertificationEngineServices(
  deps: CertificationEngineServiceDeps,
): CertificationEngineServices {
  const rt = buildRuntime(deps);
  return {
    records: createCertificationService(rt),
    workflow: createCertificationWorkflowService(rt),
    rules: createCertificationRuleService(rt),
    gates: createCertificationGateService(rt),
    evidence: createCertificationEvidenceService(rt),
    approvals: createCertificationApprovalService(rt),
    audit: createCertificationAuditService(rt),
    history: createCertificationHistoryService(rt),
    validation: createCertificationValidationService(rt),
    recommendations: createCertificationRecommendationService(rt),
    events: rt.events,
  };
}

export {
  createCertificationService,
  createCertificationWorkflowService,
  createCertificationRuleService,
  createCertificationGateService,
  createCertificationEvidenceService,
  createCertificationApprovalService,
  createCertificationAuditService,
  createCertificationHistoryService,
  createCertificationValidationService,
  createCertificationRecommendationService,
};
