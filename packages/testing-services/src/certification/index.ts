export {
  createCertificationEngineServices,
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
  type CertificationEngineServices,
  type CertificationEngineServiceDeps,
} from "./factory";

export {
  canTransitionCertificationStatus,
  assertCertificationTransition,
  isTerminalCertificationStatus,
  isApprovedLikeCertificationStatus,
  certificationTransitionsFrom,
} from "./state-machine";

export {
  evaluateCertificationGate,
  mapGateOutcomesToRecommendation,
  recommendFromGateOutcomes,
  type GateEvaluationInput,
  type GateEvaluationResult,
} from "./recommendation";

export {
  assertHasPermission,
  assertTenantOrganisationMatch,
  assertTransitionValidated,
  emptyEvidenceLinks,
  mergeEvidenceLinks,
  evidenceLinksFromJson,
  FORBIDDEN_CERTIFICATION_AUTOMATION_TOKENS,
} from "./validation";
