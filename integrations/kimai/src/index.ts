export { KimaiAdapter, KIMAI_ADAPTER_VERSION } from "./kimai-adapter";
export type { KimaiDiagnosticsExtension, KimaiAdapterOptions } from "./kimai-adapter";

export type {
  KimaiConfiguration,
  KimaiConfigurationInput,
  KimaiRetryConfiguration,
  KimaiSslOptions,
  KimaiAuthMode,
  KimaiConfigurationValidationResult,
} from "./kimai-config";
export {
  DEFAULT_KIMAI_RETRY,
  DEFAULT_KIMAI_SSL,
  DEFAULT_KIMAI_VERSION_MIN,
  DEFAULT_KIMAI_VERSION_MAX,
  normalizeKimaiConfiguration,
  validateKimaiConfiguration,
} from "./kimai-config";

export type {
  KimaiBootstrapConfiguration,
  CreateKimaiBootstrapInput,
  KimaiExtendedCapabilityId,
} from "./kimai-bootstrap";
export {
  createKimaiBootstrapConfiguration,
  KIMAI_SDK_CAPABILITIES,
  KIMAI_EXTENDED_CAPABILITIES,
  getKimaiExtendedCapabilities,
} from "./kimai-bootstrap";

export {
  createKimaiVendorErrorMapper,
  KimaiVendorErrorMapper,
  mapKimaiUnknownError,
  KIMAI_INTEGRATION_ID,
} from "./kimai-error-mapper";

export type {
  CreateKimaiAdapterInput,
  CreateKimaiAdapterResult,
} from "./kimai-factory";
export { createKimaiAdapter, disposeKimaiAdapter } from "./kimai-factory";

export {
  KIMAI_CORE_SERVICE_CAPABILITIES,
  KIMAI_UNSUPPORTED_OPERATIONS,
  discoverKimaiCoreServiceCapabilities,
  getKimaiCoreServiceCapability,
} from "./capabilities/service-capabilities";
export type {
  KimaiServiceCapability,
  KimaiCoreServiceId,
  KimaiServiceOperation,
} from "./capabilities/service-capabilities";

export {
  createKimaiCapabilityRegistration,
  listKimaiRegisteredCapabilityIds,
  isKimaiServiceImplemented,
} from "./capabilities/capability-registration";
export type { KimaiCapabilityRegistration } from "./capabilities/capability-registration";

export type {
  KimaiOperationalHealthLevel,
  KimaiCompatibilityMatrix,
  KimaiRuntimeDiagnosticsSnapshot,
  KimaiFeatureDetectionResult,
  KimaiCapabilityCertification,
  KimaiReadinessResult,
  KimaiOperationalReport,
} from "./operations";
export {
  classifyKimaiOperationalHealth,
  mapOperationalHealthToSdkStatus,
  buildKimaiCompatibilityMatrix,
  detectKimaiFeatures,
  evaluateKimaiReadiness,
  certifyKimaiCapabilities,
  createKimaiOperationsService,
  KIMAI_SUPPORTED_VERSION_RANGE,
  KIMAI_CERTIFICATION_CAPABILITY_IDS,
} from "./operations";

export {
  createMockKimaiFetch,
  DEFAULT_TEST_KIMAI_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  MOCK_KIMAI_VERSION,
} from "./testing/mock-kimai-api";
export type { MockKimaiApiOptions } from "./testing/mock-kimai-api";

export { KIMAI_ADAPTER_ID } from "./version";

export type { KimaiCoreServices } from "./services/kimai-domain-services";
export type {
  KimaiDomainActivity,
  KimaiDomainCustomer,
  KimaiDomainProject,
  KimaiDomainTag,
  KimaiDomainTimesheet,
  KimaiDomainPageResult,
  KimaiDomainListQuery,
} from "./models/domain";
