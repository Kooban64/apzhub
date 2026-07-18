import { isDevRegistrationAllowed } from "@apzhub/config";
import { resolveSessionAuthorization } from "@apzhub/platform-authorization/server";
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
  readonly tenantId?: string;
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
}

/** Permission resolver — delegates to Platform AuthorizationService (M8-02). */
export async function resolveLawApiPermissions(
  input: ResolveLawApiPermissionsInput = {},
): Promise<LawApiPermissionChecker> {
  let roles = input.roles ?? [];
  let permissions = input.permissions;

  if (input.user && permissions === undefined) {
    const authz = await resolveSessionAuthorization({
      userId: input.user.userId,
      tenantId: input.tenantId,
      productKey: "law-platform",
    });
    roles = authz.roles;
    permissions = [...authz.permissions];
  }

  if ((permissions?.length ?? 0) === 0 && isDevRegistrationAllowed() && input.user) {
    permissions = ["*"];
  }

  const authContext = createAuthPermissionContextFromUser(
    input.user ? { id: input.user.userId } : null,
    {
      roles,
      permissions: permissions ?? [],
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
