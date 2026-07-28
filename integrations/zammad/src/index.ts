export { ZammadAdapter, ZAMMAD_ADAPTER_VERSION } from "./zammad-adapter";
export type {
  ZammadDiagnosticsExtension,
  ZammadAdapterOptions,
} from "./zammad-adapter";

export type {
  ZammadConfiguration,
  ZammadConfigurationInput,
  ZammadRetryConfiguration,
  ZammadSslOptions,
  ZammadOAuthConfigurationPlaceholder,
  ZammadConfigurationValidationResult,
} from "./zammad-config";
export {
  DEFAULT_ZAMMAD_RETRY,
  DEFAULT_ZAMMAD_SSL,
  DEFAULT_ZAMMAD_OAUTH_PLACEHOLDER,
  normalizeZammadConfiguration,
  validateZammadConfiguration,
} from "./zammad-config";

export type {
  ZammadBootstrapConfiguration,
  CreateZammadBootstrapInput,
  ZammadExtendedCapabilityId,
} from "./zammad-bootstrap";
export {
  createZammadBootstrapConfiguration,
  ZAMMAD_SDK_CAPABILITIES,
  ZAMMAD_EXTENDED_CAPABILITIES,
  getZammadExtendedCapabilities,
} from "./zammad-bootstrap";

export {
  createZammadVendorErrorMapper,
  ZammadVendorErrorMapper,
  mapZammadUnknownError,
  ZAMMAD_INTEGRATION_ID,
} from "./zammad-error-mapper";

export type {
  CreateZammadAdapterInput,
  CreateZammadAdapterResult,
} from "./zammad-factory";
export { createZammadAdapter, disposeZammadAdapter } from "./zammad-factory";

export {
  ZAMMAD_PLACEHOLDER_CAPABILITIES,
  getZammadPlaceholderCapability,
  listRegisteredPlaceholderCapabilityIds,
} from "./capabilities/placeholder-capabilities";
export type { ZammadPlaceholderCapability } from "./capabilities/placeholder-capabilities";

export {
  ZAMMAD_CORE_SERVICE_CAPABILITIES,
  discoverZammadCoreServiceCapabilities,
  getZammadCoreServiceCapability,
} from "./capabilities/service-capabilities";
export type {
  ZammadServiceCapability,
  ZammadCoreServiceId,
  ZammadServiceOperation,
} from "./capabilities/service-capabilities";

export type { ZammadCoreServices } from "./services/zammad-core-services";
export { createZammadCoreServices } from "./services/zammad-core-services";

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
} from "./operations";
export {
  ZAMMAD_CERTIFICATION_CAPABILITY_IDS,
  certifyZammadCapabilities,
  certifyAttachmentPlaceholder,
  buildZammadCompatibilityMatrix,
  ZAMMAD_SUPPORTED_VERSION_RANGE,
  ZAMMAD_OPTIONAL_CAPABILITIES,
  ZAMMAD_CE_VS_EE_NOTES,
  classifyZammadOperationalHealth,
  mapOperationalHealthToSdkStatus,
  evaluateZammadReadiness,
  detectZammadFeatures,
  decideZammadCertificationOutcome,
  ZAMMAD_KNOWN_LIMITATIONS,
  assessZammadReferenceAdapterCompliance,
  defaultZammadReferenceCompliance,
  ZammadOperationsService,
  createZammadOperationsService,
  ZAMMAD_REFERENCE_ADAPTER_PATTERNS,
  ZAMMAD_OPERATIONS_ADAPTER_VERSION,
} from "./operations";

export {
  createMockZammadFetch,
  DEFAULT_TEST_ZAMMAD_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-zammad-api";
export type { MockZammadApiOptions } from "./testing/mock-zammad-api";

export type {
  SupportTicket,
  SupportOrganization,
  SupportGroup,
  SupportUser,
  SupportArticle,
  SupportArticleAttachment,
  SupportSearchHit,
  SupportSearchResult,
  SupportHistoryEvent,
  SupportTimeline,
  SupportIntelligenceSnapshot,
} from "./models/canonical";

export {
  buildInternalNotePayloadForTest,
  buildCustomerReplyPayloadForTest,
} from "./services/article-service";

export {
  translateZammadWebhookPayload,
  ZAMMAD_SUPPORTED_WEBHOOK_EVENT_TYPES,
} from "./events/event-translator";
export type { ZammadWebhookEventType } from "./events/event-translator";

export {
  asZammadWebhookManager,
  translateZammadWebhookToSourceEvent,
  ZAMMAD_PROVIDER_ID,
} from "./events/sdk-events";
export type { ZammadWebhookManagerAdapter } from "./events/sdk-events";

export {
  ZAMMAD_WEBHOOK_SIGNATURE_HEADER,
  ZAMMAD_WEBHOOK_DELIVERY_HEADER,
  ZAMMAD_WEBHOOK_SECRET_CREDENTIAL_REF,
  createZammadWebhookVerifier,
  computeZammadWebhookSignature,
} from "./events/zammad-webhook-verifier";
export type { ZammadWebhookVerifierOptions } from "./events/zammad-webhook-verifier";
export { createZammadWebhookTranslator } from "./events/zammad-webhook-translator";
export {
  createZammadJsonWebhookDecoder,
  createZammadWebhookIngressPipeline,
} from "./events/zammad-webhook-ingress-pipeline";

export {
  createZammadPollingSource,
  toZammadPollingCursor,
  ZAMMAD_POLLING_SOURCE_DEFINITION,
} from "./events/polling-source";

export type {
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookRegistration,
  WebhookValidationResult,
  EventTranslationResult,
  IntegrationEventEnvelope,
  SyncStatus,
  SyncRunOptions,
  SyncRunResult,
} from "@apzhub/platform-service-contracts";

export {
  createZammadMappingProvider,
  createZammadMappingRegistry,
  createZammadMappingPipeline,
  ZAMMAD_MAPPING_PROVIDER_ID,
} from "./mappers/zammad-mapping-registry";

export {
  createZammadAdapterHarness,
  certifyZammadWithSdkHarness,
  getZammadHarnessMetadata,
} from "./harness/zammad-harness";
export type {
  ZammadHarnessMetadata,
  CertifyZammadWithSdkHarnessInput,
  CertifyZammadWithSdkHarnessResult,
} from "./harness/zammad-harness";
