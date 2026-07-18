import type {
  AssignRoleInput,
  AuthorizationContext,
  AuthorizationDiagnostics,
  AuthorizationEvaluationResult,
  CreatePlatformPermissionInput,
  CreatePlatformRoleInput,
  EffectivePermissions,
  PlatformPermission,
  PlatformRole,
  RoleAssignment,
} from "./authorization-types";
import { evaluatePermissionAgainstEffective } from "./authorization-evaluation";
import { permissionPatternMatches } from "./permission-model";
import type { AuthorizationEventPublisher } from "./authorization-events";
import { createNoopAuthorizationEventPublisher } from "./authorization-events";
import { EffectivePermissionService } from "./effective-permission-service";
import {
  AuthorizationDiagnosticsTracker,
  PermissionService,
} from "./permission-service";
import type { AuthorizationRepositoryBundle } from "./repositories/repository-interfaces";
import { RoleAssignmentService } from "./role-assignment-service";
import { RoleService } from "./role-service";

export interface AuthorizationServiceOptions {
  readonly repositories: AuthorizationRepositoryBundle;
  readonly events?: AuthorizationEventPublisher;
}

export class AuthorizationService {
  readonly permissionService: PermissionService;

  readonly roleService: RoleService;

  readonly roleAssignmentService: RoleAssignmentService;

  readonly effectivePermissionService: EffectivePermissionService;

  private readonly diagnosticsTracker: AuthorizationDiagnosticsTracker;

  private readonly events: AuthorizationEventPublisher;

  private readonly repositories: AuthorizationRepositoryBundle;

  constructor(options: AuthorizationServiceOptions) {
    this.repositories = options.repositories;
    this.diagnosticsTracker = new AuthorizationDiagnosticsTracker();
    this.events = options.events ?? createNoopAuthorizationEventPublisher();
    this.permissionService = new PermissionService(
      options.repositories.permissions,
      this.diagnosticsTracker,
    );
    this.roleService = new RoleService(
      options.repositories.roles,
      options.repositories.permissions,
      options.repositories.rolePermissions,
      this.events,
    );
    this.roleAssignmentService = new RoleAssignmentService(
      options.repositories.assignments,
      options.repositories.roles,
      this.events,
    );
    this.effectivePermissionService = new EffectivePermissionService(
      options.repositories,
      this.roleService,
      this.diagnosticsTracker,
    );
  }

  evaluatePermission(
    context: AuthorizationContext,
    permissionKey?: string,
  ): AuthorizationEvaluationResult {
    const effective = context.userId
      ? this.effectivePermissionService.computeEffectivePermissions(context)
      : null;

    const assignments = this.roleAssignmentService.listAssignmentsForUser(
      context.userId,
      {
        status: "active",
      },
    );
    const roles = this.roleService.listRoles({ status: "active" });

    const result = evaluatePermissionAgainstEffective(permissionKey, effective, {
      permissionExists: (key) => this.permissionService.permissionExists(key),
      roleExists: (roleId) => Boolean(this.roleService.getRole(roleId)),
      assignments,
      roles,
      context,
    });

    this.diagnosticsTracker.recordOutcome(result.outcome);
    return result;
  }

  hasPermission(context: AuthorizationContext, permissionKey?: string): boolean {
    return this.evaluatePermission(context, permissionKey).outcome === "allow";
  }

  getEffectivePermissions(context: AuthorizationContext): EffectivePermissions {
    return this.effectivePermissionService.computeEffectivePermissions(context);
  }

  registerPermission(input: CreatePlatformPermissionInput): PlatformPermission {
    return this.permissionService.registerPermission(input);
  }

  createRole(
    input: CreatePlatformRoleInput,
    permissionKeys?: readonly string[],
  ): PlatformRole {
    return this.roleService.createRole(
      input,
      permissionKeys ? [...permissionKeys] : [],
    );
  }

  assignRole(input: AssignRoleInput): RoleAssignment {
    const assignment = this.roleAssignmentService.assignRole(input);
    this.effectivePermissionService.invalidateCache(input.userId);
    return assignment;
  }

  removeAssignment(assignmentId: string): RoleAssignment | undefined {
    const removed = this.roleAssignmentService.removeAssignment(assignmentId);
    if (removed) {
      this.effectivePermissionService.invalidateCache(removed.userId);
    }
    return removed;
  }

  listPermissions(): readonly PlatformPermission[] {
    return this.permissionService.listPermissions();
  }

  listRoles(filter?: Parameters<RoleService["listRoles"]>[0]): readonly PlatformRole[] {
    return this.roleService.listRoles(filter);
  }

  listAssignmentsForUser(userId: string): readonly RoleAssignment[] {
    return this.roleAssignmentService.listAssignmentsForUser(userId, {
      status: "active",
    });
  }

  getDiagnostics(): AuthorizationDiagnostics {
    return this.diagnosticsTracker.snapshot({
      roleCount: this.repositories.roles.count(),
      permissionCount: this.repositories.permissions.count(),
      assignmentCount: this.repositories.assignments.count(),
    });
  }

  /** Workbench-compatible permission list for session adapters. */
  resolveSessionPermissions(context: AuthorizationContext): {
    readonly roles: readonly string[];
    readonly permissions: readonly string[];
  } {
    const effective = this.getEffectivePermissions(context);
    return {
      roles: effective.roleSlugs,
      permissions: effective.effectivePermissions,
    };
  }

  can(context: AuthorizationContext, permissionKey?: string): boolean {
    if (!permissionKey) {
      return true;
    }

    const effective = this.getEffectivePermissions(context);
    if (effective.effectivePermissions.includes("*")) {
      return true;
    }

    return effective.effectivePermissions.some((granted) =>
      permissionPatternMatches(granted, permissionKey),
    );
  }
}

export { AuthorizationDiagnosticsTracker as AuthorizationDiagnostics };
