export {
  PLATFORM_API_VERSION,
  PLATFORM_API_BASE_PATH,
  PLATFORM_API_REQUEST_ID_HEADER,
  PLATFORM_API_CORRELATION_ID_HEADER,
  PLATFORM_API_IDEMPOTENCY_KEY_HEADER,
  PLATFORM_API_MAX_PAGE_LIMIT,
  PLATFORM_API_DEFAULT_PAGE_LIMIT,
} from "./constants";

export type {
  PlatformApiMeta,
  PlatformApiPage,
  PlatformApiSuccessEnvelope,
  PlatformApiCollectionEnvelope,
  PlatformApiErrorEnvelope,
  PlatformApiTracingContext,
} from "./types";

export {
  jsonDataResponse,
  jsonCollectionResponse,
  jsonErrorResponse,
  methodNotAllowedResponse,
} from "./response";

export {
  resolvePlatformApiTracing,
  createPlatformApiTracing,
  sanitizeCorrelationId,
  sanitizeIdempotencyKey,
} from "./request-context";

export { buildServiceRequestContext } from "./service-context";

export {
  mapPlatformErrorToHttpStatus,
  toPublicErrorBody,
  translatePlatformApiError,
  PlatformApiHttpError,
  validationError,
  authenticationRequiredError,
} from "./errors";

export { withPlatformApiAuth } from "./auth/with-platform-api-auth";
export type { PlatformApiRequestContext } from "./auth/with-platform-api-auth";

export {
  getPlatformServiceGateway,
  getPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
  resetPlatformApiGatewayBootstrap,
  createTestPlatformApiGatewayBootstrap,
} from "./gateway/bootstrap";

export { loadPlatformOpenApiSpecYaml, loadPlatformOpenApiSpecObject } from "./openapi";
