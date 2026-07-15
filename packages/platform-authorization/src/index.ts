import type { AuthorizationRepositoryBundle } from "./repositories/repository-interfaces";
import {
  createInMemoryAuthorizationRepositories,
} from "./repositories/in-memory-repositories";
import { AuthorizationService } from "./authorization-service";
import { InMemoryAuthorizationEventPublisher } from "./authorization-events";
import {
  provisionDefaultAuthorizationForUser as provisionDefaultAuthorizationForUserOnService,
  seedDefaultAuthorizationCatalog,
} from "./authorization-seed";

export {
  DEFAULT_PLATFORM_ADMIN_ROLE_ID,
  DEFAULT_LAW_OPERATOR_ROLE_ID,
  DEFAULT_TENANT_MEMBER_ROLE_ID,
} from "./authorization-seed";

let sharedAuthorizationService: AuthorizationService | undefined;
let sharedRepositories: AuthorizationRepositoryBundle | undefined;
let sharedEvents: InMemoryAuthorizationEventPublisher | undefined;

export function createInMemoryAuthorizationService(): {
  readonly service: AuthorizationService;
  readonly repositories: AuthorizationRepositoryBundle;
  readonly events: InMemoryAuthorizationEventPublisher;
} {
  const repositories = createInMemoryAuthorizationRepositories();
  const events = new InMemoryAuthorizationEventPublisher();
  const service = new AuthorizationService({ repositories, events });
  seedDefaultAuthorizationCatalog(service);
  return { service, repositories, events };
}

export function getSharedAuthorizationService(): AuthorizationService {
  if (!sharedAuthorizationService) {
    const bundle = createInMemoryAuthorizationService();
    sharedAuthorizationService = bundle.service;
    sharedRepositories = bundle.repositories;
    sharedEvents = bundle.events;
  }
  return sharedAuthorizationService;
}

export function getSharedAuthorizationRepositories(): AuthorizationRepositoryBundle {
  getSharedAuthorizationService();
  return sharedRepositories!;
}

export function getSharedAuthorizationEvents(): InMemoryAuthorizationEventPublisher {
  getSharedAuthorizationService();
  return sharedEvents!;
}

export function resetSharedAuthorizationService(): void {
  sharedAuthorizationService = undefined;
  sharedRepositories = undefined;
  sharedEvents = undefined;
}

export function provisionDefaultAuthorizationForUser(input: {
  readonly userId: string;
  readonly tenantId?: string;
}): void {
  provisionDefaultAuthorizationForUserOnService(getSharedAuthorizationService(), input);
}

export {
  AuthorizationService,
  type AuthorizationServiceOptions,
} from "./authorization-service";

export { PermissionService, AuthorizationDiagnosticsTracker } from "./permission-service";
export { RoleService } from "./role-service";
export { RoleAssignmentService } from "./role-assignment-service";
export { EffectivePermissionService } from "./effective-permission-service";

export type {
  AuthorizationContext,
  AuthorizationDiagnostics,
  AuthorizationEvaluationResult,
  AuthorizationOutcome,
  AuthorizationRoleScope,
  EffectivePermissions,
  PlatformPermission,
  PlatformRole,
  RoleAssignment,
} from "./authorization-types";

export { PLATFORM_AUTHORIZATION_EVENTS } from "./authorization-types";

export {
  permissionPatternMatches,
  parsePermissionNamespace,
  CANONICAL_PERMISSION_NAMESPACES,
} from "./permission-model";

export type { AuthorizationRepositoryBundle } from "./repositories/repository-interfaces";

export {
  createInMemoryAuthorizationRepositories,
  InMemoryPermissionRepository,
  InMemoryRoleRepository,
} from "./repositories/in-memory-repositories";

export {
  InMemoryAuthorizationEventPublisher,
  createNoopAuthorizationEventPublisher,
} from "./authorization-events";
