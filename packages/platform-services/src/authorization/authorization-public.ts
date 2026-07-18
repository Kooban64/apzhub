/** Public authorization surface for @apzhub/platform-services (OSS-110-06). */

export { AllowAllAuthorizationProvider } from "./authorization-provider";
export type {
  PermissionKey,
  AuthorizationResource,
  AuthorizationAction,
  AuthorizationDecisionEffect,
  AuthorizationDecision,
  AuthorizeRequest,
  AuthorizationProvider,
} from "./authorization-provider";

export { InMemoryAuthorizationAccessResolver } from "./authorization-access-resolver";
export type {
  AuthorizationAccessResolver,
  AuthorizationAccessSnapshot,
  ActorAccessStatus,
  MembershipAccessStatus,
  AuthorizationSubject,
  TenantMembershipFact,
  OrganisationMembershipFact,
  ResourceMembershipFact,
  ResolveAuthorizationAccessInput,
} from "./authorization-access-resolver";

export {
  ProductionAuthorizationProvider,
  DenyAllAuthorizationProvider,
} from "./production-authorization-provider";
export type {
  ProductionAuthorizationDecision,
  AuthorizationDenialCode,
  ProductionAuthorizationProviderOptions,
} from "./production-authorization-provider";

export { PlatformAuthorizationAccessResolver } from "./platform-authorization-access-resolver";
export type { PlatformAuthorizationAccessResolverOptions } from "./platform-authorization-access-resolver";

export {
  createAuthorizationProvider,
  createAuthorizationRuntime,
  resolveAuthorizationProviderMode,
  assertAuthorizationProviderModeAllowed,
} from "./create-authorization-provider";
export type {
  AuthorizationProviderMode,
  AuthorizationBootstrapEnv,
  AuthorizationRuntime,
  CreateAuthorizationProviderOptions,
  CreateAuthorizationRuntimeOptions,
  ResolveAuthorizationProviderModeResult,
} from "./create-authorization-provider";

export {
  createDefaultProductionPolicies,
  createAuthenticatedActorPolicy,
  createActiveAccountPolicy,
  createActiveTenantMembershipPolicy,
  createOrganisationScopePolicy,
  createImpersonationRestrictionPolicy,
  createMappingTenantIsolationPolicy,
  createMaintenanceModePolicy,
  POLICY_PRIORITY,
} from "./production-policies";

export {
  InMemoryAuthorizationAuditSink,
  noopAuthorizationAuditSink,
} from "./authorization-audit";
export type {
  AuthorizationAuditEvent,
  AuthorizationAuditSink,
  AuthorizationAuditDecision,
} from "./authorization-audit";

export {
  PLATFORM_SERVICE_PERMISSION_CATALOGUE,
  PLATFORM_CAPABILITIES,
  PLATFORM_PERMISSION_ACTIONS,
  permissionKey,
  isCataloguedPermission,
} from "./permission-catalogue";
export type {
  PlatformCapability,
  PlatformPermissionAction,
  PlatformPermissionKey,
  CataloguedPlatformPermission,
} from "./permission-catalogue";

export {
  resolveOperationAuthorization,
  extractResourceId,
  OPERATION_AUTHORIZATION_MAPPINGS,
} from "./operation-authorization-map";
export type {
  OperationAuthorizationMapping,
  AuthorizationResourceType,
  AuthorizationActionName,
} from "./operation-authorization-map";

export { permissionPatternMatches, anyPermissionMatches } from "./permission-match";
