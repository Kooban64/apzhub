import type { AuthorizationRepositoryBundle } from "./repositories/repository-interfaces";
import { createInMemoryAuthorizationRepositories } from "./repositories/in-memory-repositories";
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
  DEFAULT_QEP_OPERATOR_ROLE_ID,
  DEFAULT_QEP_READER_ROLE_ID,
  DEFAULT_KNOWLEDGE_STEWARD_ROLE_ID,
  KNOWLEDGE_STEWARD_PERMISSIONS,
  isKnowledgeStewardAutoAssignEnabled,
} from "./authorization-seed";
export {
  QEP_CORE_QE_PERMISSIONS,
  QEP_OPERATOR_PERMISSIONS,
  QEP_READER_PERMISSIONS,
  isQepOperatorAutoAssignEnabled,
} from "./qep-core-qe-permissions";
export {
  IAM_PLATFORM_PERMISSIONS,
  PERSONA_ROLE_DEFINITIONS,
  PLATFORM_OPERATOR_PERSONAS,
  listPersonaRoles,
  DEFAULT_ORG_ADMIN_ROLE_ID,
  DEFAULT_MANAGER_ROLE_ID,
  DEFAULT_SUPERVISOR_ROLE_ID,
  DEFAULT_EMPLOYEE_ROLE_ID,
  DEFAULT_SUPPORT_AGENT_ROLE_ID,
  DEFAULT_AUDITOR_ROLE_ID,
  DEFAULT_COMPLIANCE_OFFICER_ROLE_ID,
  DEFAULT_EXECUTIVE_ROLE_ID,
  DEFAULT_SUPERADMIN_ROLE_ID,
  DEFAULT_PLATFORM_FINANCE_ROLE_ID,
  DEFAULT_PLATFORM_SUPPORT_ROLE_ID,
  DEFAULT_PLATFORM_COMPLIANCE_ROLE_ID,
  DEFAULT_INDIVIDUAL_ROLE_ID,
} from "./persona-roles";

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

export {
  PermissionService,
  AuthorizationDiagnosticsTracker,
} from "./permission-service";
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
