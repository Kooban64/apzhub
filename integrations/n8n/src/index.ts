export { N8nAdapter, N8N_ADAPTER_VERSION } from "./n8n-adapter";
export type { N8nDiagnosticsExtension, N8nAdapterOptions } from "./n8n-adapter";

export { N8nClient } from "./n8n-client";
export type { N8nClientOptions } from "./n8n-client";

export type {
  N8nConfiguration,
  N8nConfigurationInput,
  N8nRetryConfiguration,
  N8nSslOptions,
  N8nOAuthConfigurationPlaceholder,
  N8nAuthMode,
  N8nConfigurationValidationResult,
} from "./n8n-config";
export {
  DEFAULT_N8N_RETRY,
  DEFAULT_N8N_SSL,
  DEFAULT_N8N_OAUTH_PLACEHOLDER,
  normalizeN8nConfiguration,
  validateN8nConfiguration,
} from "./n8n-config";

export type {
  N8nBootstrapConfiguration,
  CreateN8nBootstrapInput,
  N8nExtendedCapabilityId,
} from "./n8n-bootstrap";
export {
  createN8nBootstrapConfiguration,
  N8N_SDK_CAPABILITIES,
  N8N_EXTENDED_CAPABILITIES,
  getN8nExtendedCapabilities,
} from "./n8n-bootstrap";

export {
  createN8nVendorErrorMapper,
  N8nVendorErrorMapper,
  mapN8nUnknownError,
  N8N_INTEGRATION_ID,
} from "./n8n-error-mapper";

export type { CreateN8nAdapterInput, CreateN8nAdapterResult } from "./n8n-factory";
export { createN8nAdapter, disposeN8nAdapter } from "./n8n-factory";

export {
  N8N_CORE_SERVICE_CAPABILITIES,
  N8N_UNSUPPORTED_OPERATIONS,
  discoverN8nCoreServiceCapabilities,
  getN8nCoreServiceCapability,
} from "./capabilities/service-capabilities";
export type {
  N8nServiceCapability,
  N8nCoreServiceId,
  N8nServiceOperation,
} from "./capabilities/service-capabilities";

export {
  createN8nCapabilityRegistration,
  listN8nRegisteredCapabilityIds,
  isN8nServiceImplemented,
} from "./capabilities/capability-registration";
export type { N8nCapabilityRegistration } from "./capabilities/capability-registration";

export type { N8nCoreServices } from "./services/n8n-core-services";
export {
  createN8nCoreServices,
  N8nNotSupportedError,
} from "./services/n8n-core-services";

export type {
  N8nOperationalHealthLevel,
  N8nCompatibilityMatrix,
  N8nRuntimeDiagnosticsSnapshot,
} from "./operations";
export {
  classifyN8nOperationalHealth,
  mapOperationalHealthToSdkStatus,
  buildN8nCompatibilityMatrix,
  createN8nOperationsService,
} from "./operations";

export {
  createMockN8nFetch,
  DEFAULT_TEST_N8N_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  MOCK_WORKFLOW,
  MOCK_TAG,
  MOCK_CREDENTIAL,
  MOCK_EXECUTION,
  MOCK_VARIABLE,
  MOCK_USER,
  MOCK_PROJECT,
} from "./testing/mock-n8n-api";
export type { MockN8nApiOptions } from "./testing/mock-n8n-api";

export type {
  CanonicalWorkflowMetadata,
  CanonicalWorkflowTemplateMetadata,
  CanonicalCredentialMetadata,
  CanonicalVariableMetadata,
  CanonicalExecutionMetadata,
  CanonicalTagMetadata,
  CanonicalUserMetadata,
  CanonicalProjectMetadata,
  CanonicalSupport,
} from "./models/canonical";

export {
  mapN8nWorkflowToCanonical,
  mapN8nWorkflowAsTemplateMetadata,
  mapN8nCredentialMetadata,
  mapN8nVariableMetadata,
  mapN8nExecutionMetadata,
  mapN8nTagMetadata,
  mapN8nUserMetadata,
  mapN8nProjectMetadata,
} from "./mappers/workflow-mapper";

export { N8N_ADAPTER_ID } from "./version";
