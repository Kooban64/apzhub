import type {
  WorkbenchPermissionAdapter,
  WorkbenchPermissionContext,
} from "../interfaces/permission-adapter";
import type { PermissionDiagnostics } from "../interfaces/types";

export interface ScaffoldWorkbenchPermissionAdapterOptions {
  readonly context?: WorkbenchPermissionContext | null;
}

/**
 * Production-oriented permission scaffold (ADR-0023).
 * Allows items without a permission key; denies undeclared keys by default.
 */
export class ScaffoldWorkbenchPermissionAdapter implements WorkbenchPermissionAdapter {
  readonly kind = "scaffold-deny-by-default" as const;

  private context: WorkbenchPermissionContext | null;

  private deniedRequestCount = 0;

  private filteredItemCount = 0;

  constructor(options: ScaffoldWorkbenchPermissionAdapterOptions = {}) {
    this.context = options.context ?? null;
  }

  setContext(context: WorkbenchPermissionContext | null): void {
    this.context = context;
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

export function createScaffoldWorkbenchPermissionAdapter(
  options?: ScaffoldWorkbenchPermissionAdapterOptions,
): WorkbenchPermissionAdapter {
  return new ScaffoldWorkbenchPermissionAdapter(options);
}
