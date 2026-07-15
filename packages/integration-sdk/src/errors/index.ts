export type { IntegrationError, IntegrationErrorCategory } from "./types";
export { IntegrationSdkError } from "./types";
export {
  createIntegrationError,
  createNotImplementedIntegrationError,
} from "./factory";
export type { CreateIntegrationErrorInput } from "./factory";
export {
  isIntegrationError,
  isIntegrationErrorCategory,
} from "./guards";
export type { SdkResult } from "./result";
export { sdkErr, sdkOk } from "./result";
export type {
  DefaultCategoryMapping,
  ErrorTranslationContext,
  ErrorTranslator,
  IntegrationErrorSeverity,
  TranslatedIntegrationError,
  VendorErrorDiagnostics,
  VendorErrorInput,
  VendorErrorMapper,
} from "./translation";
export {
  DefaultErrorTranslator,
  buildDefaultTranslatedError,
  buildVendorErrorDiagnostics,
  createDefaultErrorTranslator,
  isRetryableCategory,
  normalizeUnknownError,
  resolveCategoryFromInput,
  resolveErrorSeverity,
  sanitizeVendorMessageSummary,
  shouldTripCircuitBreaker,
} from "./translation";
export type { DefaultErrorTranslatorOptions } from "./translation";
export {
  authenticationFailedError,
  connectionNotFoundError,
  duplicateConnectionError,
  integrationMismatchError,
  invalidConnectionConfigurationError,
  invalidCredentialsError,
  invalidIntegrationLifecycleTransitionError,
  invalidLifecycleTransitionError,
  missingCredentialsError,
  secretProviderUnavailableError,
  tenantMismatchError,
  unsupportedAuthenticationModeError,
} from "./codes";
