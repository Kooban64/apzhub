import type {
  WorkbenchPermissionAdapter,
  WorkbenchPermissionContext,
} from "../interfaces/permission-adapter";
import type { PermissionDiagnostics } from "../interfaces/types";

export class AllowAllWorkbenchPermissionAdapter implements WorkbenchPermissionAdapter {
  readonly kind = "allow-all" as const;

  getContext(): WorkbenchPermissionContext {
    return {
      userId: "dev",
      roles: ["superadmin"],
      permissions: new Set(["*"]),
    };
  }

  can(_permission?: string): boolean {
    return true;
  }

  filter<T extends { permission?: string }>(items: readonly T[]): T[] {
    return [...items];
  }

  getDiagnostics(): PermissionDiagnostics {
    const context = this.getContext();
    return {
      adapterKind: this.kind,
      hasContext: true,
      userId: context.userId,
      roleCount: context.roles.length,
      permissionCount: context.permissions.size,
      deniedRequestCount: 0,
      filteredItemCount: 0,
    };
  }
}

export function createAllowAllWorkbenchPermissionAdapter(): WorkbenchPermissionAdapter {
  return new AllowAllWorkbenchPermissionAdapter();
}
