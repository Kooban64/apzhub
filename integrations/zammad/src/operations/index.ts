export type {
  ZammadOperationalHealthLevel,
  ZammadCapabilityAvailability,
  ZammadEdition,
  ZammadCapabilityCertification,
  ZammadCompatibilityMatrix,
  ZammadReadinessCheckId,
  ZammadReadinessCheckResult,
  ZammadReadinessResult,
  ZammadFeatureDetectionResult,
  ZammadRuntimeDiagnosticsSnapshot,
  ZammadOperationalReport,
  ZammadCertificationCapabilityId,
  ZammadAdapterCertificationOutcome,
  ZammadReferenceAdapterComplianceResult,
} from "./types";

export { ZAMMAD_CERTIFICATION_CAPABILITY_IDS } from "./types";
export {
  certifyZammadCapabilities,
  certifyAttachmentPlaceholder,
} from "./capability-certification";
export {
  buildZammadCompatibilityMatrix,
  ZAMMAD_SUPPORTED_VERSION_RANGE,
  ZAMMAD_OPTIONAL_CAPABILITIES,
  ZAMMAD_CE_VS_EE_NOTES,
} from "./compatibility-matrix";
export {
  classifyZammadOperationalHealth,
  mapOperationalHealthToSdkStatus,
} from "./health-classification";
export { evaluateZammadReadiness } from "./readiness";
export { detectZammadFeatures } from "./feature-detection";
export {
  decideZammadCertificationOutcome,
  ZAMMAD_KNOWN_LIMITATIONS,
} from "./certification-outcome";
export {
  assessZammadReferenceAdapterCompliance,
  defaultZammadReferenceCompliance,
} from "./reference-compliance";
export {
  ZammadOperationsService,
  createZammadOperationsService,
  ZAMMAD_REFERENCE_ADAPTER_PATTERNS,
  ZAMMAD_OPERATIONS_ADAPTER_VERSION,
} from "./zammad-operations";
