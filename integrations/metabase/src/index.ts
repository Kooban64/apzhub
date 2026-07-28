export { MetabaseAdapter, METABASE_ADAPTER_VERSION } from "./metabase-adapter";
export type {
  MetabaseDiagnosticsExtension,
  MetabaseAdapterOptions,
} from "./metabase-adapter";

export type {
  MetabaseConfiguration,
  MetabaseConfigurationInput,
  MetabaseRetryConfiguration,
  MetabaseSslOptions,
  MetabaseAuthMode,
  MetabaseConfigurationValidationResult,
} from "./metabase-config";
export {
  DEFAULT_METABASE_RETRY,
  DEFAULT_METABASE_SSL,
  normalizeMetabaseConfiguration,
  validateMetabaseConfiguration,
} from "./metabase-config";

export type {
  MetabaseBootstrapConfiguration,
  CreateMetabaseBootstrapInput,
  MetabaseExtendedCapabilityId,
} from "./metabase-bootstrap";
export {
  createMetabaseBootstrapConfiguration,
  METABASE_SDK_CAPABILITIES,
  METABASE_EXTENDED_CAPABILITIES,
  getMetabaseExtendedCapabilities,
} from "./metabase-bootstrap";

export {
  createMetabaseVendorErrorMapper,
  MetabaseVendorErrorMapper,
  mapMetabaseUnknownError,
  METABASE_INTEGRATION_ID,
} from "./metabase-error-mapper";

export type {
  CreateMetabaseAdapterInput,
  CreateMetabaseAdapterResult,
} from "./metabase-factory";
export { createMetabaseAdapter, disposeMetabaseAdapter } from "./metabase-factory";

export { MetabaseClient } from "./metabase-client";
export type { CanonicalCollectionMetadata } from "./metabase-client";

export {
  METABASE_CORE_SERVICE_CAPABILITIES,
  METABASE_UNSUPPORTED_OPERATIONS,
  discoverMetabaseCoreServiceCapabilities,
  getMetabaseCoreServiceCapability,
} from "./capabilities/service-capabilities";
export type {
  MetabaseServiceCapability,
  MetabaseCoreServiceId,
  MetabaseServiceOperation,
} from "./capabilities/service-capabilities";

export {
  createMetabaseCapabilityRegistration,
  listMetabaseRegisteredCapabilityIds,
  isMetabaseServiceImplemented,
} from "./capabilities/capability-registration";
export type { MetabaseCapabilityRegistration } from "./capabilities/capability-registration";

export type {
  MetabaseOperationalHealthLevel,
  MetabaseCompatibilityMatrix,
  MetabaseRuntimeDiagnosticsSnapshot,
  MetabaseReadinessClassification,
} from "./operations";
export {
  classifyMetabaseOperationalHealth,
  classifyMetabaseReadiness,
  mapOperationalHealthToSdkStatus,
  buildMetabaseCompatibilityMatrix,
  createMetabaseOperationsService,
} from "./operations";

export {
  createMockMetabaseFetch,
  DEFAULT_TEST_METABASE_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  MOCK_HEALTH,
  MOCK_SESSION,
  MOCK_SESSION_PROPERTIES,
  MOCK_COLLECTION,
} from "./testing/mock-metabase-api";
export type { MockMetabaseApiOptions } from "./testing/mock-metabase-api";

export {
  METABASE_ADAPTER_ID,
  METABASE_ADAPTER_VERSION as METABASE_PACKAGE_VERSION,
} from "./version";
