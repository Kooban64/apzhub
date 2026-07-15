import type {
  AuthorizationDiagnostics,
  AuthorizationOutcome,
  CreatePlatformPermissionInput,
  PlatformPermission,
} from "./authorization-types";
import { CANONICAL_PERMISSION_NAMESPACES, parsePermissionNamespace } from "./permission-model";
import type { PermissionRepository } from "./repositories/repository-interfaces";

export class PermissionService {
  constructor(
    private readonly permissions: PermissionRepository,
    private readonly diagnostics: AuthorizationDiagnosticsTracker,
  ) {}

  registerPermission(input: CreatePlatformPermissionInput): PlatformPermission {
    if (this.permissions.exists(input.permissionKey)) {
      const existing = this.permissions.get(input.permissionKey);
      if (existing) {
        return existing;
      }
    }
    return this.permissions.create(input);
  }

  getPermission(permissionKey: string): PlatformPermission | undefined {
    return this.permissions.get(permissionKey);
  }

  listPermissions(): readonly PlatformPermission[] {
    return this.permissions.list();
  }

  permissionExists(permissionKey: string): boolean {
    if (permissionKey === "*") {
      return true;
    }
    if (this.permissions.exists(permissionKey)) {
      return true;
    }
    const namespace = parsePermissionNamespace(permissionKey);
    return (CANONICAL_PERMISSION_NAMESPACES as readonly string[]).includes(namespace);
  }

  ensurePermissions(keys: readonly string[]): readonly PlatformPermission[] {
    return keys.map((permissionKey) =>
      this.registerPermission({ permissionKey, description: `Manifest permission ${permissionKey}` }),
    );
  }
}

export class AuthorizationDiagnosticsTracker {
  private readonly outcomeCounts: Record<AuthorizationOutcome, number> = {
    allow: 0,
    deny: 0,
    not_applicable: 0,
    unknown_permission: 0,
    unknown_role: 0,
    tenant_mismatch: 0,
  };

  cacheHits = 0;

  cacheMisses = 0;

  effectivePermissionGenerations = 0;

  evaluationFailureCount = 0;

  recordOutcome(outcome: AuthorizationOutcome): void {
    this.outcomeCounts[outcome] += 1;
    if (outcome === "deny" || outcome === "unknown_permission" || outcome === "tenant_mismatch") {
      this.evaluationFailureCount += 1;
    }
  }

  recordCacheHit(): void {
    this.cacheHits += 1;
  }

  recordCacheMiss(): void {
    this.cacheMisses += 1;
  }

  recordEffectiveGeneration(): void {
    this.effectivePermissionGenerations += 1;
  }

  snapshot(input: {
    roleCount: number;
    permissionCount: number;
    assignmentCount: number;
  }): AuthorizationDiagnostics {
    return {
      evaluationCount: Object.values(this.outcomeCounts).reduce((sum, value) => sum + value, 0),
      allowCount: this.outcomeCounts.allow,
      denyCount: this.outcomeCounts.deny,
      notApplicableCount: this.outcomeCounts.not_applicable,
      unknownPermissionCount: this.outcomeCounts.unknown_permission,
      unknownRoleCount: this.outcomeCounts.unknown_role,
      tenantMismatchCount: this.outcomeCounts.tenant_mismatch,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      effectivePermissionGenerations: this.effectivePermissionGenerations,
      roleCount: input.roleCount,
      permissionCount: input.permissionCount,
      assignmentCount: input.assignmentCount,
      evaluationFailureCount: this.evaluationFailureCount,
    };
  }
}
