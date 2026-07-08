export {
  LAW_API_BASE_PATH,
  LAW_API_CORRELATION_ID_HEADER,
  LAW_API_DIAGNOSTICS_PERMISSION,
  LAW_API_REQUEST_ID_HEADER,
  LAW_API_SCAFFOLD_VERSION,
  LAW_API_SERVICE_NAME,
  LAW_API_VERSION,
} from "./constants";

export type {
  LawApiEnvelope,
  LawApiErrorBody,
  LawApiErrorEnvelope,
  LawApiMeta,
  LawApiRequestContext,
  LawApiSuccessEnvelope,
} from "./types";

export type { LawApiAuthenticatedContext } from "./context/build-authenticated-context";
export type { LawApiUser } from "./auth/user-resolver";
export type { LawApiTenantSource } from "./tenant/tenant-resolver";
export type { LawApiPermissionChecker } from "./auth/permission-resolver";
export type { LawApiPersistenceContext } from "./persistence/law-api-persistence-context";
export type { LawApiRepositoryMode } from "./persistence/repository-mode";

export {
  createRequestContext,
  resolveRequestContext,
  sanitizeCorrelationId,
} from "./request-context";

export {
  jsonErrorResponse,
  jsonListSuccessResponse,
  jsonSuccessResponse,
} from "./response";

export {
  parseJsonBody,
  validateHttpMethod,
  validateJsonContentType,
  type LawApiValidationFailure,
  type LawApiValidationResult,
} from "./validation";

export {
  methodNotAllowedResponse,
  resolveContextForMethodGuard,
} from "./method-not-allowed";

export { buildLawApiHealthData, type LawApiHealthData } from "./law-api-health";
export {
  buildLawApiDiagnosticsData,
  type LawApiDiagnosticsData,
  type LawApiRouteDescriptor,
} from "./law-api-diagnostics";

export { authenticateLawApiRequest } from "./auth/authenticate";
export { resolveLawApiUser } from "./auth/user-resolver";
export { resolveLawApiPermissions } from "./auth/permission-resolver";
export {
  forbiddenResponse,
  tenantRequiredResponse,
  unauthorizedResponse,
} from "./auth/auth-errors";
export { buildLawApiAuthDiagnostics } from "./auth/auth-diagnostics";

export {
  buildLawApiAuthenticatedContext,
  type BuildLawApiAuthenticatedContextOptions,
} from "./context/build-authenticated-context";

export { withLawApiAuth } from "./middleware/with-law-api-auth";

export { resolveLawApiTenant } from "./tenant/tenant-resolver";
export {
  sanitizeTenantId,
  DEFAULT_LAW_TENANT_ID,
  LAW_API_TENANT_ID_HEADER,
} from "./tenant/law-tenant-ids";

export { createLawApiPersistenceContext } from "./persistence/law-api-persistence-context";
export {
  getActiveLawApiPersistenceContext,
  runWithLawApiPersistenceScope,
  runWithLawApiPersistenceScopeAsync,
} from "./persistence/law-api-persistence-scope";
export { getLawApiRepositoryMode } from "./persistence/repository-mode";

export * from "./framework";
