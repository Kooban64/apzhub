/** @apzhub/integration-meilisearch — APZSEARCH-005 Meilisearch Reference Adapter */

export {
  MEILISEARCH_ADAPTER_VERSION,
  MEILISEARCH_INTEGRATION_ID,
  MEILISEARCH_PROVIDER_KIND,
} from "./version";

export {
  MeilisearchAdapter,
} from "./meilisearch-adapter";
export type {
  MeilisearchAdapterOptions,
  MeilisearchDiagnosticsExtension,
} from "./meilisearch-adapter";

export {
  createMeilisearchAdapter,
  disposeMeilisearchAdapter,
  MeilisearchAdapterFactory,
  createMeilisearchAdapterFactory,
} from "./meilisearch-factory";
export type {
  CreateMeilisearchAdapterInput,
  CreateMeilisearchAdapterResult,
} from "./meilisearch-factory";

export type {
  MeilisearchAdapterContext,
  BuildMeilisearchAdapterContextInput,
} from "./meilisearch-context";
export {
  buildMeilisearchAdapterContext,
  MeilisearchAdapterContextBuilder,
  createMeilisearchAdapterContextBuilder,
} from "./meilisearch-context";

export { MeilisearchOperationRunner } from "./meilisearch-operation-runner";
export type {
  MeilisearchIndexActionInput,
  MeilisearchDocumentActionInput,
  MeilisearchOperationRunnerDeps,
} from "./meilisearch-operation-runner";

export { MeilisearchRestClient } from "./internal/meilisearch-rest-client";
export type {
  MeilisearchRestClientOptions,
  MeilisearchRestClientAuth,
  MeilisearchConnectionTestResult,
} from "./internal/meilisearch-rest-client";

export {
  MeilisearchErrorMapper,
  MeilisearchVendorErrorMapper,
  createMeilisearchErrorMapper,
  mapMeilisearchUnknownError,
} from "./meilisearch-error-mapper";

export {
  MeilisearchCapabilityProvider,
  createMeilisearchCapabilityProvider,
  MEILISEARCH_DECLARED_CAPABILITIES,
} from "./capabilities/meilisearch-capability-provider";

export {
  MeilisearchCompatibilityProvider,
  createMeilisearchCompatibilityProvider,
} from "./capabilities/meilisearch-compatibility-provider";
export type { MeilisearchCompatibilityMatrix } from "./capabilities/meilisearch-compatibility-provider";

export {
  MeilisearchHealthProvider,
  createMeilisearchHealthProvider,
} from "./health/meilisearch-health-provider";
export type { MeilisearchHealthSnapshot } from "./health/meilisearch-health-provider";

export {
  MeilisearchDiagnosticsProvider,
  createMeilisearchDiagnosticsProvider,
} from "./diagnostics/meilisearch-diagnostics-provider";
export type { MeilisearchDiagnosticsReport } from "./diagnostics/meilisearch-diagnostics-provider";

export {
  MeilisearchConfigurationValidator,
  createMeilisearchConfigurationValidator,
} from "./lifecycle/meilisearch-configuration-validator";

export {
  MeilisearchMetrics,
  MeilisearchLogger,
  createMeilisearchMetrics,
  createMeilisearchLogger,
  MEILISEARCH_METRIC_NAMES,
} from "./observability/meilisearch-observability";

export {
  createMeilisearchBootstrapConfiguration,
  MEILISEARCH_SDK_CAPABILITIES,
} from "./meilisearch-bootstrap";
export type {
  CreateMeilisearchBootstrapInput,
  MeilisearchBootstrapConfiguration,
} from "./meilisearch-bootstrap";

export type {
  MeilisearchConfiguration,
  MeilisearchConfigurationInput,
  MeilisearchConfigurationValidationResult,
  MeilisearchRetryConfiguration,
  MeilisearchSslOptions,
} from "./meilisearch-config";
export {
  DEFAULT_MEILISEARCH_BASE_URL,
  DEFAULT_MEILISEARCH_RETRY,
  DEFAULT_MEILISEARCH_SSL,
  normalizeMeilisearchConfiguration,
  validateMeilisearchConfiguration,
} from "./meilisearch-config";

export {
  NOT_SUPPORTED,
  MEILISEARCH_UNSUPPORTED_OPERATIONS,
  MEILISEARCH_UNSUPPORTED_FEATURES,
  isMeilisearchUnsupportedOperation,
} from "./results/unsupported";
export type { MeilisearchUnsupportedOperation, MeilisearchUnsupportedFeature } from "./results/unsupported";

export {
  SEARCH_OPERATION_STATUS_OK,
  SEARCH_OPERATION_STATUS_ERROR,
  createOkResult,
  createNotSupportedResult,
  createErrorResult,
} from "./results/search-operation-result";
export type {
  SearchOperationResult,
  SearchOkResult,
  SearchNotSupportedResult,
  SearchErrorResult,
  MeilisearchOperationName,
} from "./results/search-operation-result";

export {
  createMockMeilisearchFetch,
  DEFAULT_TEST_MEILISEARCH_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  MOCK_INDEX,
  MOCK_DOCUMENT,
} from "./testing/mock-meilisearch-api";
export type { MockMeilisearchApiOptions } from "./testing/mock-meilisearch-api";

export type { FetchFn } from "./internal/meilisearch-fetch";
