export type {
  DefaultCategoryMapping,
  ErrorTranslationContext,
  ErrorTranslator,
  IntegrationErrorSeverity,
  TranslatedIntegrationError,
  VendorErrorDiagnostics,
  VendorErrorInput,
  VendorErrorMapper,
} from "./types";
export {
  buildDefaultTranslatedError,
  buildVendorErrorDiagnostics,
  isRetryableCategory,
  normalizeUnknownError,
  resolveCategoryFromInput,
  sanitizeVendorMessageSummary,
  shouldTripCircuitBreaker,
} from "./default-mapping";
export { resolveErrorSeverity } from "./severity";
export {
  DefaultErrorTranslator,
  createDefaultErrorTranslator,
} from "./error-translator";
export type { DefaultErrorTranslatorOptions } from "./error-translator";
