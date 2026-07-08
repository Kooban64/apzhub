import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";

export interface LawApiAuthDiagnostics {
  readonly authenticated: boolean;
  readonly tenantSource: string;
  readonly repositoryMode: string;
  readonly principal: {
    readonly userId?: string;
    readonly email?: string;
    readonly roleCount: number;
    readonly permissionCount: number;
    readonly permissionAdapter: string;
  };
}

/** Safe auth diagnostics — no secrets or tokens (LAW-014-02). */
export function buildLawApiAuthDiagnostics(
  context: LawApiAuthenticatedContext,
): LawApiAuthDiagnostics {
  return {
    authenticated: context.authenticated,
    tenantSource: context.tenantSource,
    repositoryMode: context.repositoryMode,
    principal: {
      userId: context.user?.userId,
      email: context.user?.email,
      roleCount: context.roles.length,
      permissionCount: context.permissions.length,
      permissionAdapter: context.permissionChecker.adapterKind,
    },
  };
}
