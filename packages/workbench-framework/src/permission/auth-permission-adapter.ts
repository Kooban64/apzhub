import type {
  WorkbenchPermissionAdapter,
  WorkbenchPermissionContext,
} from "../interfaces/permission-adapter";
import type { PermissionDiagnostics } from "../interfaces/types";

/** Auth session input for Workbench permission context (Milestone 8 RBAC extension point). */
export interface AuthSessionPermissionInput {
  readonly userId: string;
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
}

/**
 * Session-backed permission adapter (ADR-0023 Phase 7).
 * Deny-by-default for manifest-declared permission keys until RBAC is populated.
 */
export class AuthWorkbenchPermissionAdapter implements WorkbenchPermissionAdapter {
  readonly kind = "auth" as const;

  private context: WorkbenchPermissionContext | null;

  private deniedRequestCount = 0;

  private filteredItemCount = 0;

  constructor(initialContext: AuthSessionPermissionInput | null = null) {
    this.context = initialContext ? mapAuthSessionToContext(initialContext) : null;
  }

  setSessionContext(input: AuthSessionPermissionInput | null): void {
    this.context = input ? mapAuthSessionToContext(input) : null;
  }

  getContext(): WorkbenchPermissionContext | null {
    return this.context;
  }

  can(permission?: string, ctx?: WorkbenchPermissionContext): boolean {
    if (!permission) {
      return true;
    }

    const active = ctx ?? this.context;
    if (!active) {
      return false;
    }

    if (active.permissions.has("*")) {
      return true;
    }

    return active.permissions.has(permission);
  }

  filter<T extends { permission?: string }>(
    items: readonly T[],
    ctx?: WorkbenchPermissionContext,
  ): T[] {
    const filtered = items.filter((item) => this.can(item.permission, ctx));
    this.filteredItemCount += items.length - filtered.length;
    return filtered;
  }

  recordDeniedRequest(): void {
    this.deniedRequestCount += 1;
  }

  getDiagnostics(): PermissionDiagnostics {
    return {
      adapterKind: this.kind,
      hasContext: this.context !== null,
      userId: this.context?.userId,
      roleCount: this.context?.roles.length ?? 0,
      permissionCount: this.context?.permissions.size ?? 0,
      deniedRequestCount: this.deniedRequestCount,
      filteredItemCount: this.filteredItemCount,
    };
  }
}

export function createAuthWorkbenchPermissionAdapter(
  initialContext?: AuthSessionPermissionInput | null,
): AuthWorkbenchPermissionAdapter {
  return new AuthWorkbenchPermissionAdapter(initialContext ?? null);
}

export function mapAuthSessionToContext(
  input: AuthSessionPermissionInput,
): WorkbenchPermissionContext {
  return {
    userId: input.userId,
    roles: input.roles ?? [],
    permissions: new Set(input.permissions ?? []),
  };
}
