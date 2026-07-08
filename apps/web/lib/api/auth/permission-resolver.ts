import { isDevRegistrationAllowed } from "@apzhub/config";
import { createWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { createAuthPermissionContextFromUser } from "@apzhub/workbench-framework/server";

import type { LawApiUser } from "./user-resolver";

export interface LawApiPermissionChecker {
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  readonly can: (permission?: string) => boolean;
  readonly adapterKind: string;
  readonly hasContext: boolean;
}

export interface ResolveLawApiPermissionsInput {
  readonly user?: LawApiUser;
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
}

/** Permission resolver hook — delegates to Workbench permission adapter (LAW-014-02). */
export function resolveLawApiPermissions(
  input: ResolveLawApiPermissionsInput = {},
): LawApiPermissionChecker {
  const permissions =
    input.permissions ??
    (isDevRegistrationAllowed() && input.user ? (["*"] as const) : ([] as const));

  const authContext = createAuthPermissionContextFromUser(
    input.user ? { id: input.user.userId } : null,
    {
      roles: input.roles ?? [],
      permissions: [...permissions],
    },
  );

  const adapter = createWorkbenchPermissionAdapter({
    authContext,
    nodeEnv: process.env.NODE_ENV,
    allowDevRegistration: isDevRegistrationAllowed(),
  });

  const diagnostics = adapter.getDiagnostics?.();

  return {
    roles: authContext?.roles ?? [],
    permissions: authContext?.permissions ? [...authContext.permissions] : [],
    can: (permission?: string) => adapter.can(permission),
    adapterKind: diagnostics?.adapterKind ?? adapter.kind ?? "unknown",
    hasContext: diagnostics?.hasContext ?? Boolean(authContext),
  };
}
