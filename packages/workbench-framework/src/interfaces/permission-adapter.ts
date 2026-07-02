import type { PermissionDiagnostics, WorkbenchPermissionAdapterKind } from "./types";

export interface WorkbenchPermissionContext {
  userId: string;
  roles: readonly string[];
  permissions: ReadonlySet<string>;
}

export interface WorkbenchPermissionAdapter {
  readonly kind?: WorkbenchPermissionAdapterKind;
  getContext(): WorkbenchPermissionContext | null;
  can(permission: string | undefined, ctx?: WorkbenchPermissionContext): boolean;
  filter<T extends { permission?: string }>(
    items: readonly T[],
    ctx?: WorkbenchPermissionContext,
  ): T[];
  getDiagnostics?(): PermissionDiagnostics;
  recordDeniedRequest?(): void;
}

export interface PermissionAwareRequest {
  permission?: string;
}
