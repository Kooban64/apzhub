export type {
  KimaiOperationalHealthLevel,
  KimaiCompatibilityMatrix,
  KimaiFeatureDetectionResult,
  KimaiCapabilityCertification,
  KimaiReadinessResult,
  KimaiReadinessCheckResult,
  KimaiRuntimeDiagnosticsSnapshot,
  KimaiOperationalReport,
  KimaiCapabilityAvailability,
} from "./types";

export {
  classifyKimaiOperationalHealth,
  mapOperationalHealthToSdkStatus,
} from "./health-classification";

export {
  buildKimaiCompatibilityMatrix,
  KIMAI_SUPPORTED_VERSION_RANGE,
  KIMAI_CE_NOTES,
} from "./compatibility-matrix";
export type { BuildKimaiCompatibilityMatrixInput } from "./compatibility-matrix";

export { detectKimaiFeatures } from "./feature-detection";
export type { DetectKimaiFeaturesInput } from "./feature-detection";

export { evaluateKimaiReadiness } from "./readiness";
export type { EvaluateKimaiReadinessInput } from "./readiness";

export {
  certifyKimaiCapabilities,
  KIMAI_CERTIFICATION_CAPABILITY_IDS,
} from "./capability-certification";
export type { CertifyKimaiCapabilitiesInput } from "./capability-certification";

export {
  createKimaiOperationsService,
  type KimaiOperationsService,
  type KimaiOperationsServiceDeps,
} from "./kimai-operations";
