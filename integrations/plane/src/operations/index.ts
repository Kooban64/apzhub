export type {
  PlaneOperationalHealthLevel,
  PlaneCapabilityAvailability,
  PlaneEdition,
  PlaneCapabilityCertification,
  PlaneCompatibilityMatrix,
  PlaneReadinessCheckId,
  PlaneReadinessCheckResult,
  PlaneReadinessResult,
  PlaneFeatureDetectionResult,
  PlaneRuntimeDiagnosticsSnapshot,
  PlaneOperationalReport,
  PlaneCertificationCapabilityId,
} from "./types";

export { PLANE_CERTIFICATION_CAPABILITY_IDS } from "./types";
export { certifyPlaneCapabilities } from "./capability-certification";
export {
  buildPlaneCompatibilityMatrix,
  PLANE_SUPPORTED_VERSION_RANGE,
  PLANE_OPTIONAL_CAPABILITIES,
  PLANE_CE_VS_EE_NOTES,
} from "./compatibility-matrix";
export {
  classifyPlaneOperationalHealth,
  mapOperationalHealthToSdkStatus,
} from "./health-classification";
export { evaluatePlaneReadiness } from "./readiness";
export { detectPlaneFeatures } from "./feature-detection";
export {
  PlaneOperationsService,
  createPlaneOperationsService,
  PLANE_REFERENCE_ADAPTER_PATTERNS,
  PLANE_OPERATIONS_ADAPTER_VERSION,
} from "./plane-operations";
